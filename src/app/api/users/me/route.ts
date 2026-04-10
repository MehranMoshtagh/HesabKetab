import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/api-utils";
import { z } from "zod";

// GET /api/users/me
export async function GET() {
  const result = await getAuthUserId();
  if (result.error) return result.error;

  const user = await prisma.user.findUnique({
    where: { id: result.userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      defaultCurrency: true,
      timezone: true,
      language: true,
      notificationPreferences: true,
      createdAt: true,
    },
  });

  return NextResponse.json(user);
}

const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().nullable().optional(),
  defaultCurrency: z.string().length(3).optional(),
  timezone: z.string().optional(),
  language: z.enum(["en", "fa"]).optional(),
  notificationPreferences: z.record(z.string(), z.unknown()).optional(),
});

// PUT /api/users/me
export async function PUT(req: Request) {
  const result = await getAuthUserId();
  if (result.error) return result.error;

  const body = await req.json();
  const data = updateUserSchema.parse(body);

  const { notificationPreferences, ...rest } = data;
  const updateData: Record<string, unknown> = { ...rest };
  if (notificationPreferences !== undefined) {
    updateData.notificationPreferences = JSON.parse(
      JSON.stringify(notificationPreferences)
    );
  }

  const user = await prisma.user.update({
    where: { id: result.userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      defaultCurrency: true,
      timezone: true,
      language: true,
      notificationPreferences: true,
    },
  });

  return NextResponse.json(user);
}
