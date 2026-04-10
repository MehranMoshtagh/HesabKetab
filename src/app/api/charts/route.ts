import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/api-utils";

// GET /api/charts — spending data for charts (by category + monthly)
export async function GET() {
  const result = await getAuthUserId();
  if (result.error) return result.error;
  const { userId } = result;

  // Get all non-deleted, non-payment expenses involving the user (as payer)
  const expenses = await prisma.expense.findMany({
    where: {
      deletedAt: null,
      isPayment: false,
      payers: { some: { userId } },
    },
    select: {
      category: true,
      date: true,
      payers: {
        where: { userId },
        select: { amount: true },
      },
    },
    orderBy: { date: "asc" },
  });

  // Spending by category
  const byCategoryMap = new Map<string, number>();
  for (const exp of expenses) {
    const paid = exp.payers.reduce((s, p) => s + Number(p.amount), 0);
    byCategoryMap.set(
      exp.category,
      (byCategoryMap.get(exp.category) ?? 0) + paid
    );
  }
  const byCategory = [...byCategoryMap.entries()]
    .map(([category, total]) => ({ category, total: Math.round(total * 100) / 100 }))
    .sort((a, b) => b.total - a.total);

  // Monthly spending (last 12 months)
  const now = new Date();
  const monthlyMap = new Map<string, number>();

  // Initialize last 12 months
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyMap.set(key, 0);
  }

  for (const exp of expenses) {
    const d = new Date(exp.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (monthlyMap.has(key)) {
      const paid = exp.payers.reduce((s, p) => s + Number(p.amount), 0);
      monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + paid);
    }
  }

  const monthly = [...monthlyMap.entries()].map(([month, total]) => ({
    month,
    total: Math.round(total * 100) / 100,
  }));

  return NextResponse.json({ byCategory, monthly });
}
