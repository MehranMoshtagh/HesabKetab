import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/api-utils";
import { z } from "zod";

const addMemberSchema = z.object({
  email: z.string().email(),
});

// POST /api/groups/[id]/members — add member to group
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await getAuthUserId();
  if (result.error) return result.error;
  const { userId } = result;
  const { id: groupId } = await params;

  // Verify caller is group member
  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  });

  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { email } = addMemberSchema.parse(body);

  const userToAdd = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, avatar: true },
  });

  if (!userToAdd) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Check if already a member
  const existing = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: userToAdd.id } },
  });

  if (existing) {
    return NextResponse.json({ error: "Already a member" }, { status: 409 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.groupMember.create({
      data: { groupId, userId: userToAdd.id, role: "MEMBER" },
    });

    await tx.activity.create({
      data: {
        userId,
        type: "GROUP_MEMBER_ADDED",
        groupId,
        metadata: { addedUserId: userToAdd.id, addedUserName: userToAdd.name },
      },
    });

    // Auto-create friendship if not exists
    const [u1, u2] =
      userId < userToAdd.id
        ? [userId, userToAdd.id]
        : [userToAdd.id, userId];

    await tx.friendship.upsert({
      where: { user1Id_user2Id: { user1Id: u1, user2Id: u2 } },
      update: {},
      create: { user1Id: u1, user2Id: u2 },
    });
  });

  return NextResponse.json(userToAdd, { status: 201 });
}
