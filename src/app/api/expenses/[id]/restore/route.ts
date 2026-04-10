import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/api-utils";

// POST /api/expenses/[id]/restore — restore soft-deleted expense
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await getAuthUserId();
  if (result.error) return result.error;
  const { userId } = result;
  const { id } = await params;

  const expense = await prisma.expense.findUnique({ where: { id } });

  if (!expense || !expense.deletedAt) {
    return NextResponse.json({ error: "Not found or not deleted" }, { status: 404 });
  }

  const restored = await prisma.expense.update({
    where: { id },
    data: { deletedAt: null, deletedById: null },
  });

  await prisma.activity.create({
    data: {
      userId,
      type: "EXPENSE_RESTORED",
      expenseId: id,
      groupId: restored.groupId,
      metadata: { description: restored.description },
    },
  });

  return NextResponse.json({ success: true });
}
