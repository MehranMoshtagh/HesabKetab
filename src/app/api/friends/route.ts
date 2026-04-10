import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/api-utils";
import { z } from "zod";

// GET /api/friends — list all friends with balances
export async function GET() {
  const result = await getAuthUserId();
  if (result.error) return result.error;
  const { userId } = result;

  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [{ user1Id: userId }, { user2Id: userId }],
    },
    include: {
      user1: { select: { id: true, name: true, email: true, avatar: true } },
      user2: { select: { id: true, name: true, email: true, avatar: true } },
    },
  });

  const friends = friendships.map((f) => {
    const friend = f.user1Id === userId ? f.user2 : f.user1;
    return {
      friendshipId: f.id,
      ...friend,
    };
  });

  return NextResponse.json(friends);
}

const addFriendSchema = z.object({
  email: z.string().email(),
});

// POST /api/friends — add friend by email
export async function POST(req: Request) {
  const result = await getAuthUserId();
  if (result.error) return result.error;
  const { userId } = result;

  const body = await req.json();
  const { email } = addFriendSchema.parse(body);

  // Find the user by email
  const friendUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, avatar: true },
  });

  if (!friendUser) {
    return NextResponse.json(
      { error: "User not found", code: "USER_NOT_FOUND" },
      { status: 404 }
    );
  }

  if (friendUser.id === userId) {
    return NextResponse.json({ error: "Cannot add yourself" }, { status: 400 });
  }

  // Normalize order for unique constraint
  const [user1Id, user2Id] =
    userId < friendUser.id ? [userId, friendUser.id] : [friendUser.id, userId];

  // Check if already friends
  const existing = await prisma.friendship.findUnique({
    where: { user1Id_user2Id: { user1Id, user2Id } },
  });

  if (existing) {
    return NextResponse.json({ error: "Already friends" }, { status: 409 });
  }

  const friendship = await prisma.friendship.create({
    data: { user1Id, user2Id },
  });

  // Create activity
  await prisma.activity.create({
    data: {
      userId,
      type: "FRIEND_ADDED",
      metadata: { friendId: friendUser.id, friendName: friendUser.name },
    },
  });

  return NextResponse.json(
    { friendshipId: friendship.id, ...friendUser },
    { status: 201 }
  );
}
