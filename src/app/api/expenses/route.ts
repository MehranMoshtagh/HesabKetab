import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/api-utils";
import { z } from "zod";
import { Decimal } from "@prisma/client/runtime/library";

const payerSchema = z.object({
  userId: z.string().uuid(),
  amount: z.number().positive(),
});

const shareSchema = z.object({
  userId: z.string().uuid(),
  amount: z.number().min(0),
  shareValue: z.number().optional(),
});

const createExpenseSchema = z.object({
  description: z.string().min(1).max(255),
  amount: z.number().positive(),
  currency: z.string().length(3).default("USD"),
  category: z.string().default("general"),
  date: z.string().optional(),
  groupId: z.string().uuid().nullable().optional(),
  notes: z.string().optional(),
  splitType: z.enum(["EQUAL", "EXACT", "PERCENTAGE", "SHARES", "ADJUSTMENT"]).default("EQUAL"),
  payers: z.array(payerSchema).min(1),
  shares: z.array(shareSchema).min(1),
  isRecurring: z.boolean().default(false),
  recurringInterval: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY", "YEARLY"]).nullable().optional(),
});

// GET /api/expenses — list expenses with pagination and filters
export async function GET(req: NextRequest) {
  const result = await getAuthUserId();
  if (result.error) return result.error;
  const { userId } = result;

  const searchParams = req.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);
  const groupId = searchParams.get("groupId");
  const friendId = searchParams.get("friendId");
  const category = searchParams.get("category");
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {
    deletedAt: null,
    OR: [
      { payers: { some: { userId } } },
      { shares: { some: { userId } } },
    ],
  };

  if (groupId) where.groupId = groupId;
  if (category) where.category = category;

  if (friendId) {
    where.AND = [
      {
        OR: [
          { payers: { some: { userId } } },
          { shares: { some: { userId } } },
        ],
      },
      {
        OR: [
          { payers: { some: { userId: friendId } } },
          { shares: { some: { userId: friendId } } },
        ],
      },
    ];
    delete where.OR;
  }

  const [expenses, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      include: {
        payers: { include: { user: { select: { id: true, name: true } } } },
        shares: { include: { user: { select: { id: true, name: true } } } },
        createdBy: { select: { id: true, name: true } },
        group: { select: { id: true, name: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { date: "desc" },
      skip,
      take: limit,
    }),
    prisma.expense.count({ where }),
  ]);

  return NextResponse.json(
    { expenses, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } },
    { headers: { "Cache-Control": "private, max-age=10, stale-while-revalidate=30" } }
  );
}

// POST /api/expenses — create an expense
export async function POST(req: Request) {
  const result = await getAuthUserId();
  if (result.error) return result.error;
  const { userId } = result;

  const body = await req.json();
  const data = createExpenseSchema.parse(body);

  // Validate: total payer amounts must equal expense amount
  const totalPaid = data.payers.reduce((sum, p) => sum + p.amount, 0);
  if (Math.abs(totalPaid - data.amount) > 0.01) {
    return NextResponse.json(
      { error: "Payer amounts must equal expense amount" },
      { status: 400 }
    );
  }

  // Validate: total share amounts must equal expense amount
  const totalShares = data.shares.reduce((sum, s) => sum + s.amount, 0);
  if (Math.abs(totalShares - data.amount) > 0.01) {
    return NextResponse.json(
      { error: "Share amounts must equal expense amount" },
      { status: 400 }
    );
  }

  const expense = await prisma.$transaction(async (tx) => {
    const exp = await tx.expense.create({
      data: {
        description: data.description,
        amount: new Decimal(data.amount.toFixed(2)),
        currency: data.currency,
        category: data.category,
        date: data.date ? new Date(data.date) : new Date(),
        groupId: data.groupId ?? null,
        createdById: userId,
        notes: data.notes,
        splitType: data.splitType,
        isRecurring: data.isRecurring,
        recurringInterval: data.recurringInterval,
        payers: {
          create: data.payers.map((p) => ({
            userId: p.userId,
            amount: new Decimal(p.amount.toFixed(2)),
          })),
        },
        shares: {
          create: data.shares.map((s) => ({
            userId: s.userId,
            amount: new Decimal(s.amount.toFixed(2)),
            shareValue: s.shareValue
              ? new Decimal(s.shareValue.toFixed(4))
              : null,
          })),
        },
      },
      include: {
        payers: { include: { user: { select: { id: true, name: true } } } },
        shares: { include: { user: { select: { id: true, name: true } } } },
      },
    });

    // Auto-create friendships between payers and sharers
    const allUserIds = new Set([
      ...data.payers.map((p) => p.userId),
      ...data.shares.map((s) => s.userId),
    ]);

    for (const uid of allUserIds) {
      if (uid === userId) continue;
      const [u1, u2] = userId < uid ? [userId, uid] : [uid, userId];
      await tx.friendship.upsert({
        where: { user1Id_user2Id: { user1Id: u1, user2Id: u2 } },
        update: {},
        create: { user1Id: u1, user2Id: u2 },
      });
    }

    await tx.activity.create({
      data: {
        userId,
        type: "EXPENSE_ADDED",
        expenseId: exp.id,
        groupId: data.groupId ?? null,
        metadata: {
          description: data.description,
          amount: data.amount,
          currency: data.currency,
        },
      },
    });

    return exp;
  });

  return NextResponse.json(expense, { status: 201 });
}
