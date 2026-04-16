import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/api-utils";
import { getUserBalances } from "@/lib/balance-service";

// GET /api/balances — get all balances for current user
export async function GET() {
  const result = await getAuthUserId();
  if (result.error) return result.error;

  const balances = await getUserBalances(result.userId);
  return NextResponse.json(balances, {
    headers: { "Cache-Control": "private, max-age=10, stale-while-revalidate=30" },
  });
}
