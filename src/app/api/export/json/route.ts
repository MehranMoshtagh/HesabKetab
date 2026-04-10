import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/api-utils";

// GET /api/export/json — download full JSON backup
export async function GET() {
  const result = await getAuthUserId();
  if (result.error) return result.error;
  const { userId } = result;

  const [user, friendships, groups, expenses, activities] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        defaultCurrency: true,
        timezone: true,
        language: true,
        createdAt: true,
      },
    }),
    prisma.friendship.findMany({
      where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
      include: {
        user1: { select: { id: true, name: true, email: true } },
        user2: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.groupMember.findMany({
      where: { userId },
      include: {
        group: {
          include: {
            members: {
              include: { user: { select: { id: true, name: true, email: true } } },
            },
          },
        },
      },
    }),
    prisma.expense.findMany({
      where: {
        OR: [
          { payers: { some: { userId } } },
          { shares: { some: { userId } } },
        ],
      },
      include: {
        payers: { include: { user: { select: { id: true, name: true } } } },
        shares: { include: { user: { select: { id: true, name: true } } } },
        comments: {
          include: { user: { select: { id: true, name: true } } },
        },
        group: { select: { id: true, name: true } },
      },
      orderBy: { date: "desc" },
    }),
    prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
  ]);

  const backup = {
    exportedAt: new Date().toISOString(),
    user,
    friends: friendships.map((f) => (f.user1Id === userId ? f.user2 : f.user1)),
    groups: groups
      .filter((g) => !g.group.deletedAt)
      .map((g) => ({
        ...g.group,
        myRole: g.role,
      })),
    expenses,
    activities,
  };

  const json = JSON.stringify(backup, null, 2);

  return new NextResponse(json, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="hesabketab-backup-${new Date().toISOString().split("T")[0]}.json"`,
    },
  });
}
