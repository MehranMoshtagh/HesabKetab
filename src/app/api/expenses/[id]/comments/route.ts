import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/api-utils";
import { z } from "zod";

// GET /api/expenses/[id]/comments
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await getAuthUserId();
  if (result.error) return result.error;
  const { id } = await params;

  const comments = await prisma.comment.findMany({
    where: { expenseId: id },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(comments);
}

const addCommentSchema = z.object({
  content: z.string().min(1).max(2000),
});

// POST /api/expenses/[id]/comments
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await getAuthUserId();
  if (result.error) return result.error;
  const { userId } = result;
  const { id: expenseId } = await params;

  const body = await req.json();
  const { content } = addCommentSchema.parse(body);

  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    select: { description: true, groupId: true },
  });

  if (!expense) {
    return NextResponse.json({ error: "Expense not found" }, { status: 404 });
  }

  const comment = await prisma.$transaction(async (tx) => {
    const c = await tx.comment.create({
      data: { expenseId, userId, content },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    await tx.activity.create({
      data: {
        userId,
        type: "COMMENT_ADDED",
        expenseId,
        groupId: expense.groupId,
        metadata: { expenseDescription: expense.description },
      },
    });

    return c;
  });

  return NextResponse.json(comment, { status: 201 });
}
