import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { sendFriendInviteEmail } from "@/lib/email";
import { z } from "zod";

const inviteSchema = z.object({
  email: z.string().email(),
});

// POST /api/friends/invite — send email invitation to join HesabKetab
export async function POST(req: Request) {
  const result = await getAuthUserId();
  if (result.error) return result.error;
  const { userId } = result;

  const body = await req.json();
  const { email } = inviteSchema.parse(body);

  // Get the inviter's info
  const inviter = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  });

  if (!inviter) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if the person already has an account
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return NextResponse.json(
      { error: "User already has an account. Add them as a friend directly.", code: "USER_EXISTS" },
      { status: 409 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://hesabketab.vercel.app";
  const signUpUrl = `${appUrl}/en/signup`;

  const { error } = await sendFriendInviteEmail({
    to: email,
    inviterName: inviter.name,
    signUpUrl,
  });

  if (error) {
    console.error("Failed to send invite email:", error);
    return NextResponse.json(
      { error: "Failed to send invitation email" },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "Invitation sent", email }, { status: 200 });
}
