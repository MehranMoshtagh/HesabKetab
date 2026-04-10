import { auth } from "./auth";
import { NextResponse } from "next/server";

/** Get authenticated user ID or return a 401 response. */
export async function getAuthUserId(): Promise<
  | { userId: string; error?: never }
  | { userId?: never; error: NextResponse }
> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { userId: session.user.id };
}
