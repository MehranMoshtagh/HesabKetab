import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/api-utils";
import { getFriendBalance } from "@/lib/balance-service";

// GET /api/balances/friend/[id]
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await getAuthUserId();
  if (result.error) return result.error;
  const { id: friendId } = await params;

  const balance = await getFriendBalance(result.userId, friendId);
  return NextResponse.json({ balance });
}
