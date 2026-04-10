import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "HesabKetab <onboarding@resend.dev>";

interface InviteEmailParams {
  to: string;
  inviterName: string;
  signUpUrl: string;
}

export async function sendFriendInviteEmail({
  to,
  inviterName,
  signUpUrl,
}: InviteEmailParams) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `${inviterName} invited you to HesabKetab`,
    html: buildInviteHtml({ inviterName, signUpUrl }),
  });
}

function buildInviteHtml({
  inviterName,
  signUpUrl,
}: {
  inviterName: string;
  signUpUrl: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background-color:#F5F5F7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.04),0 0 1px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 0;text-align:center;">
              <div style="font-size:28px;margin-bottom:8px;">💰</div>
              <h1 style="margin:0;font-size:20px;font-weight:600;color:#1D1D1F;letter-spacing:-0.02em;">
                HesabKetab
              </h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:24px 32px 32px;">
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#1D1D1F;">
                <strong>${inviterName}</strong> wants to split expenses with you on HesabKetab — the easy way to track shared bills, balances, and payments.
              </p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#86868B;">
                Create a free account to get started and connect with ${inviterName}.
              </p>
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${signUpUrl}" style="display:inline-block;background:#0071E3;color:#FFFFFF;font-size:15px;font-weight:600;text-decoration:none;padding:12px 32px;border-radius:12px;">
                      Join HesabKetab
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:0 32px 24px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#AEAEB2;line-height:1.5;">
                If you didn't expect this invitation, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
