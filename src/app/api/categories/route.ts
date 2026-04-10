import { NextResponse } from "next/server";
import { categories } from "@/lib/categories";

// GET /api/categories — get all categories and subcategories
export async function GET() {
  return NextResponse.json(categories);
}
