import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/api-utils";
import { z } from "zod";

// GET /api/groups/[id] — get group detail with expenses and balances
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await getAuthUserId();
  if (result.error) return result.error;
  const { userId } = result;
  const { id } = await params;

  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true } },
        },
      },
      createdBy: { select: { id: true, name: true } },
    },
  });

  if (!group || group.deletedAt) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Verify membership
  const isMember = group.members.some((m) => m.userId === userId);
  if (!isMember) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get group expenses
  const expenses = await prisma.expense.findMany({
    where: { groupId: id, deletedAt: null },
    include: {
      payers: { include: { user: { select: { id: true, name: true } } } },
      shares: { include: { user: { select: { id: true, name: true } } } },
      createdBy: { select: { id: true, name: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json({
    ...group,
    expenses,
  });
}

const updateGroupSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum(["HOME", "TRIP", "COUPLE", "OTHER"]).optional(),
  simplifyDebts: z.boolean().optional(),
  coverPhoto: z.string().nullable().optional(),
});

// PUT /api/groups/[id] — update group settings
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await getAuthUserId();
  if (result.error) return result.error;
  const { userId } = result;
  const { id } = await params;

  // Check admin role
  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: id, userId } },
  });

  if (!membership || membership.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const data = updateGroupSchema.parse(body);

  const group = await prisma.group.update({
    where: { id },
    data,
  });

  await prisma.activity.create({
    data: {
      userId,
      type: "GROUP_EDITED",
      groupId: id,
      metadata: { changes: Object.keys(data) },
    },
  });

  return NextResponse.json(group);
}

// DELETE /api/groups/[id] — soft delete group
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await getAuthUserId();
  if (result.error) return result.error;
  const { userId } = result;
  const { id } = await params;

  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: id, userId } },
  });

  if (!membership || membership.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.group.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
