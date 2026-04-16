import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/api-utils";
import { getUserBalances } from "@/lib/balance-service";

/**
 * GET /api/init — single endpoint that returns everything the app needs
 * on first load: friends, groups, balances, and chart data.
 *
 * This eliminates 4 separate cold starts by combining into 1 request.
 */
export async function GET() {
  const result = await getAuthUserId();
  if (result.error) return result.error;
  const { userId } = result;

  // Fire ALL queries in parallel — one DB round-trip each but no sequential waits
  const [friendships, memberships, balances, chartExpenses] = await Promise.all([
    // Friends
    prisma.friendship.findMany({
      where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
      include: {
        user1: { select: { id: true, name: true, email: true, avatar: true } },
        user2: { select: { id: true, name: true, email: true, avatar: true } },
      },
    }),
    // Groups
    prisma.groupMember.findMany({
      where: { userId },
      include: {
        group: {
          include: {
            _count: { select: { members: true } },
          },
        },
      },
    }),
    // Balances
    getUserBalances(userId),
    // Chart data — expenses where user is a payer
    prisma.expense.findMany({
      where: {
        deletedAt: null,
        isPayment: false,
        payers: { some: { userId } },
      },
      select: {
        category: true,
        date: true,
        payers: { where: { userId }, select: { amount: true } },
      },
      orderBy: { date: "asc" },
    }),
  ]);

  // Format friends
  const friends = friendships.map((f) => {
    const friend = f.user1Id === userId ? f.user2 : f.user1;
    return { friendshipId: f.id, ...friend };
  });

  // Format groups
  const groups = memberships
    .filter((m) => m.group.deletedAt === null)
    .map((m) => ({
      id: m.group.id,
      name: m.group.name,
      type: m.group.type,
      memberCount: m.group._count.members,
    }));

  // Format chart data
  const byCategoryMap = new Map<string, number>();
  const now = new Date();
  const monthlyMap = new Map<string, number>();

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyMap.set(key, 0);
  }

  for (const exp of chartExpenses) {
    const paid = exp.payers.reduce((s, p) => s + Number(p.amount), 0);
    byCategoryMap.set(exp.category, (byCategoryMap.get(exp.category) ?? 0) + paid);

    const d = new Date(exp.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (monthlyMap.has(key)) {
      monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + paid);
    }
  }

  const charts = {
    byCategory: [...byCategoryMap.entries()]
      .map(([category, total]) => ({ category, total: Math.round(total * 100) / 100 }))
      .sort((a, b) => b.total - a.total),
    monthly: [...monthlyMap.entries()].map(([month, total]) => ({
      month,
      total: Math.round(total * 100) / 100,
    })),
  };

  return NextResponse.json(
    { friends, groups, balances, charts },
    { headers: { "Cache-Control": "private, max-age=10, stale-while-revalidate=30" } }
  );
}
