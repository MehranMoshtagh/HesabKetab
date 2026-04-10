import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/api-utils";

// GET /api/activity — get recent activity feed
export async function GET(req: NextRequest) {
  const result = await getAuthUserId();
  if (result.error) return result.error;
  const { userId } = result;

  const searchParams = req.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "30"), 100);
  const skip = (page - 1) * limit;

  // Get activities involving the user (either they performed it, or it involves their groups/friends)
  const userGroupIds = (
    await prisma.groupMember.findMany({
      where: { userId },
      select: { groupId: true },
    })
  ).map((m) => m.groupId);

  const activities = await prisma.activity.findMany({
    where: {
      OR: [
        { userId },
        { groupId: { in: userGroupIds } },
      ],
    },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      expense: {
        select: {
          id: true,
          description: true,
          amount: true,
          currency: true,
          isPayment: true,
          deletedAt: true,
        },
      },
      group: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
  });

  return NextResponse.json(activities);
}
