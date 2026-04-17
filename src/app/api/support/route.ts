import { NextResponse } from "next/server";
import { sendSupportTicketEmail } from "@/lib/email";
import { z } from "zod";

const supportSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  category: z.enum(["bug", "account", "feedback", "other"]),
  subject: z.string().trim().min(1).max(200),
  message: z.string().trim().min(20).max(5000),
});

const CATEGORY_LABELS: Record<string, string> = {
  bug: "Something isn't working",
  account: "Account or billing",
  feedback: "Feedback or feature request",
  other: "Something else",
};

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = supportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name, email, category, subject, message } = parsed.data;

  const { error } = await sendSupportTicketEmail({
    name,
    email,
    category: CATEGORY_LABELS[category] ?? category,
    subject,
    message,
  });

  if (error) {
    console.error("Failed to send support ticket email:", error);
    return NextResponse.json(
      { error: "Failed to send ticket" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
