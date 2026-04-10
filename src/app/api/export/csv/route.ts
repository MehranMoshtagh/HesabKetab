import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/api-utils";

// GET /api/export/csv — export all expenses as CSV
export async function GET() {
  const result = await getAuthUserId();
  if (result.error) return result.error;
  const { userId } = result;

  const expenses = await prisma.expense.findMany({
    where: {
      deletedAt: null,
      OR: [
        { payers: { some: { userId } } },
        { shares: { some: { userId } } },
      ],
    },
    include: {
      payers: { include: { user: { select: { name: true } } } },
      shares: { include: { user: { select: { name: true } } } },
      group: { select: { name: true } },
    },
    orderBy: { date: "desc" },
  });

  const header = "Date,Description,Category,Amount,Currency,Paid By,Split With,Group,Type\n";
  const rows = expenses.map((e) => {
    const paidBy = e.payers.map((p) => `${p.user.name}($${Number(p.amount).toFixed(2)})`).join("; ");
    const splitWith = e.shares.map((s) => `${s.user.name}($${Number(s.amount).toFixed(2)})`).join("; ");
    const date = new Date(e.date).toISOString().split("T")[0];
    const desc = e.description.replace(/,/g, " ");
    const group = e.group?.name?.replace(/,/g, " ") ?? "";
    const type = e.isPayment ? "Payment" : "Expense";

    return `${date},"${desc}",${e.category},${Number(e.amount).toFixed(2)},${e.currency},"${paidBy}","${splitWith}","${group}",${type}`;
  });

  const csv = header + rows.join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="hesabketab-expenses-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
