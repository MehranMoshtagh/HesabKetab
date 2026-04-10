import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/api-utils";

// GET /api/friends/[id] — get friend detail with shared expenses
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await getAuthUserId();
  if (result.error) return result.error;
  const { userId } = result;
  const { id: friendId } = await params;

  const friend = await prisma.user.findUnique({
    where: { id: friendId },
    select: { id: true, name: true, email: true, avatar: true },
  });

  if (!friend) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Get shared expenses (where both users are involved as payer or sharer)
  const expenses = await prisma.expense.findMany({
    where: {
      deletedAt: null,
      AND: [
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
      ],
    },
    include: {
      payers: { include: { user: { select: { id: true, name: true } } } },
      shares: { include: { user: { select: { id: true, name: true } } } },
      createdBy: { select: { id: true, name: true } },
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json({ friend, expenses });
}

// DELETE /api/friends/[id] — remove friendship
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await getAuthUserId();
  if (result.error) return result.error;
  const { userId } = result;
  const { id: friendId } = await params;

  const [user1Id, user2Id] =
    userId < friendId ? [userId, friendId] : [friendId, userId];

  const friendship = await prisma.friendship.findUnique({
    where: { user1Id_user2Id: { user1Id, user2Id } },
  });

  if (!friendship) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.friendship.delete({ where: { id: friendship.id } });

  return NextResponse.json({ success: true });
}
