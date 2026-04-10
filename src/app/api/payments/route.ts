import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/api-utils";
import { z } from "zod";
import { Decimal } from "@prisma/client/runtime/library";

const paymentSchema = z.object({
  payerId: z.string().uuid(),
  payeeId: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().length(3).default("USD"),
  groupId: z.string().uuid().nullable().optional(),
  date: z.string().optional(),
  notes: z.string().optional(),
});

// POST /api/payments — record a settle-up payment
export async function POST(req: Request) {
  const result = await getAuthUserId();
  if (result.error) return result.error;
  const { userId } = result;

  const body = await req.json();
  const data = paymentSchema.parse(body);

  if (data.payerId === data.payeeId) {
    return NextResponse.json(
      { error: "Payer and payee must be different" },
      { status: 400 }
    );
  }

  const payerUser = await prisma.user.findUnique({
    where: { id: data.payerId },
    select: { name: true },
  });
  const payeeUser = await prisma.user.findUnique({
    where: { id: data.payeeId },
    select: { name: true },
  });

  const expense = await prisma.$transaction(async (tx) => {
    const payment = await tx.expense.create({
      data: {
        description: `Payment: ${payerUser?.name} → ${payeeUser?.name}`,
        amount: new Decimal(data.amount.toFixed(2)),
        currency: data.currency,
        category: "general",
        date: data.date ? new Date(data.date) : new Date(),
        groupId: data.groupId ?? null,
        createdById: userId,
        notes: data.notes,
        isPayment: true,
        splitType: "EXACT",
        payers: {
          create: {
            userId: data.payerId,
            amount: new Decimal(data.amount.toFixed(2)),
          },
        },
        shares: {
          create: {
            userId: data.payeeId,
            amount: new Decimal(data.amount.toFixed(2)),
          },
        },
      },
      include: {
        payers: { include: { user: { select: { id: true, name: true } } } },
        shares: { include: { user: { select: { id: true, name: true } } } },
      },
    });

    await tx.activity.create({
      data: {
        userId,
        type: "PAYMENT_ADDED",
        expenseId: payment.id,
        groupId: data.groupId ?? null,
        metadata: {
          payerName: payerUser?.name,
          payeeName: payeeUser?.name,
          amount: data.amount,
          currency: data.currency,
        },
      },
    });

    return payment;
  });

  return NextResponse.json(expense, { status: 201 });
}
