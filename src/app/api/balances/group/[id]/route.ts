import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/api-utils";
import { getGroupBalances } from "@/lib/balance-service";

// GET /api/balances/group/[id]
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await getAuthUserId();
  if (result.error) return result.error;
  const { id: groupId } = await params;

  const balances = await getGroupBalances(groupId);
  return NextResponse.json(balances);
}
