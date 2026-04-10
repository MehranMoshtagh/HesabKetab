import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/api-utils";
import { z } from "zod";

// GET /api/groups — list all groups the user belongs to
export async function GET() {
  const result = await getAuthUserId();
  if (result.error) return result.error;
  const { userId } = result;

  const memberships = await prisma.groupMember.findMany({
    where: { userId },
    include: {
      group: {
        include: {
          members: {
            include: {
              user: { select: { id: true, name: true, avatar: true } },
            },
          },
          _count: { select: { members: true } },
        },
      },
    },
  });

  const groups = memberships
    .filter((m) => m.group.deletedAt === null)
    .map((m) => ({
      id: m.group.id,
      name: m.group.name,
      type: m.group.type,
      coverPhoto: m.group.coverPhoto,
      simplifyDebts: m.group.simplifyDebts,
      memberCount: m.group._count.members,
      members: m.group.members.map((gm) => ({
        ...gm.user,
        role: gm.role,
      })),
      myRole: m.role,
    }));

  return NextResponse.json(groups);
}

const createGroupSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(["HOME", "TRIP", "COUPLE", "OTHER"]).default("OTHER"),
  memberEmails: z.array(z.string().email()).optional(),
});

// POST /api/groups — create a new group
export async function POST(req: Request) {
  const result = await getAuthUserId();
  if (result.error) return result.error;
  const { userId } = result;

  const body = await req.json();
  const { name, type, memberEmails } = createGroupSchema.parse(body);

  const group = await prisma.$transaction(async (tx) => {
    const g = await tx.group.create({
      data: {
        name,
        type,
        createdById: userId,
        members: {
          create: { userId, role: "ADMIN" },
        },
      },
    });

    // Add members by email if provided
    if (memberEmails?.length) {
      const users = await tx.user.findMany({
        where: { email: { in: memberEmails } },
        select: { id: true },
      });

      if (users.length > 0) {
        await tx.groupMember.createMany({
          data: users
            .filter((u) => u.id !== userId)
            .map((u) => ({
              groupId: g.id,
              userId: u.id,
              role: "MEMBER" as const,
            })),
          skipDuplicates: true,
        });
      }
    }

    // Activity
    await tx.activity.create({
      data: {
        userId,
        type: "GROUP_CREATED",
        groupId: g.id,
        metadata: { groupName: name },
      },
    });

    return g;
  });

  return NextResponse.json(group, { status: 201 });
}
