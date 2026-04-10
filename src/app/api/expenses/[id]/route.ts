import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/api-utils";
import { z } from "zod";
import { Decimal } from "@prisma/client/runtime/library";

// GET /api/expenses/[id] — get expense detail
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await getAuthUserId();
  if (result.error) return result.error;
  const { id } = await params;

  const expense = await prisma.expense.findUnique({
    where: { id },
    include: {
      payers: { include: { user: { select: { id: true, name: true, avatar: true } } } },
      shares: { include: { user: { select: { id: true, name: true, avatar: true } } } },
      createdBy: { select: { id: true, name: true } },
      group: { select: { id: true, name: true } },
      comments: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!expense) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(expense);
}

const updateExpenseSchema = z.object({
  description: z.string().min(1).max(255).optional(),
  amount: z.number().positive().optional(),
  currency: z.string().length(3).optional(),
  category: z.string().optional(),
  date: z.string().optional(),
  notes: z.string().nullable().optional(),
  splitType: z.enum(["EQUAL", "EXACT", "PERCENTAGE", "SHARES", "ADJUSTMENT"]).optional(),
  payers: z
    .array(z.object({ userId: z.string().uuid(), amount: z.number().positive() }))
    .optional(),
  shares: z
    .array(
      z.object({
        userId: z.string().uuid(),
        amount: z.number().min(0),
        shareValue: z.number().optional(),
      })
    )
    .optional(),
});

// PUT /api/expenses/[id] — update expense
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await getAuthUserId();
  if (result.error) return result.error;
  const { userId } = result;
  const { id } = await params;

  const body = await req.json();
  const data = updateExpenseSchema.parse(body);

  const expense = await prisma.$transaction(async (tx) => {
    const updateData: Record<string, unknown> = {};
    if (data.description !== undefined) updateData.description = data.description;
    if (data.amount !== undefined) updateData.amount = new Decimal(data.amount.toFixed(2));
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.splitType !== undefined) updateData.splitType = data.splitType;

    // If payers/shares are updated, replace them
    if (data.payers) {
      await tx.expensePayer.deleteMany({ where: { expenseId: id } });
      await tx.expensePayer.createMany({
        data: data.payers.map((p) => ({
          expenseId: id,
          userId: p.userId,
          amount: new Decimal(p.amount.toFixed(2)),
        })),
      });
    }

    if (data.shares) {
      await tx.expenseShare.deleteMany({ where: { expenseId: id } });
      await tx.expenseShare.createMany({
        data: data.shares.map((s) => ({
          expenseId: id,
          userId: s.userId,
          amount: new Decimal(s.amount.toFixed(2)),
          shareValue: s.shareValue ? new Decimal(s.shareValue.toFixed(4)) : null,
        })),
      });
    }

    const updated = await tx.expense.update({
      where: { id },
      data: updateData,
      include: {
        payers: { include: { user: { select: { id: true, name: true } } } },
        shares: { include: { user: { select: { id: true, name: true } } } },
      },
    });

    await tx.activity.create({
      data: {
        userId,
        type: "EXPENSE_EDITED",
        expenseId: id,
        groupId: updated.groupId,
        metadata: { changes: Object.keys(data) },
      },
    });

    return updated;
  });

  return NextResponse.json(expense);
}

// DELETE /api/expenses/[id] — soft delete expense
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await getAuthUserId();
  if (result.error) return result.error;
  const { userId } = result;
  const { id } = await params;

  const expense = await prisma.expense.update({
    where: { id },
    data: { deletedAt: new Date(), deletedById: userId },
  });

  await prisma.activity.create({
    data: {
      userId,
      type: "EXPENSE_DELETED",
      expenseId: id,
      groupId: expense.groupId,
      metadata: { description: expense.description, amount: expense.amount.toString() },
    },
  });

  return NextResponse.json({ success: true });
}
