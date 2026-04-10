import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/api-utils";

// DELETE /api/groups/[id]/members/[userId] — remove member from group
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const result = await getAuthUserId();
  if (result.error) return result.error;
  const { userId: callerId } = result;
  const { id: groupId, userId: targetUserId } = await params;

  // Caller must be admin or removing themselves
  const callerMembership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: callerId } },
  });

  if (!callerMembership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (callerMembership.role !== "ADMIN" && callerId !== targetUserId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const targetMembership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: targetUserId } },
  });

  if (!targetMembership) {
    return NextResponse.json({ error: "Not a member" }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.groupMember.delete({
      where: { id: targetMembership.id },
    });

    const targetUser = await tx.user.findUnique({
      where: { id: targetUserId },
      select: { name: true },
    });

    await tx.activity.create({
      data: {
        userId: callerId,
        type: "GROUP_MEMBER_REMOVED",
        groupId,
        metadata: {
          removedUserId: targetUserId,
          removedUserName: targetUser?.name,
        },
      },
    });
  });

  return NextResponse.json({ success: true });
}
