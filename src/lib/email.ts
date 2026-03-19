// src/lib/email.ts
// Resend email client + transactional email helpers for GRUTH
// Requires: npm install resend
// Env vars: RESEND_API_KEY, NEXT_PUBLIC_APP_URL

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "GRUTH <kennygovoga@gmail.com>";
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://gruth-p78v.vercel.app";

// ─── Verification email ───────────────────────────────────────────────────────

export async function sendVerificationEmail({
  to,
  name,
  token,
}: {
  to: string;
  name: string;
  token: string;
}) {
  const url = `${APP_URL}/verify-email?token=${token}`;

  await resend.emails.send({
    from: FROM,
    to,
    subject: "Verify your GRUTH account",
    html: verificationHtml({ name, url }),
  });
}

// ─── HTML template ────────────────────────────────────────────────────────────

function verificationHtml({ name, url }: { name: string; url: string }) {
  const firstName = name.split(" ")[0];
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verify your GRUTH account</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f0;font-family:'DM Sans',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f0;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">

        <!-- Header -->
        <tr>
          <td style="background:#121210;padding:28px 40px;text-align:left;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#f97316;border-radius:8px;width:32px;height:32px;text-align:center;vertical-align:middle;">
                  <span style="color:#fff;font-size:18px;font-weight:700;line-height:32px;">G</span>
                </td>
                <td style="padding-left:10px;">
                  <span style="color:#ffffff;font-size:16px;font-weight:600;letter-spacing:-0.3px;">GRUTH</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px;">
            <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#121210;letter-spacing:-0.4px;">
              Hi ${firstName}, verify your email
            </p>
            <p style="margin:0 0 28px;font-size:15px;color:#6b7280;line-height:1.6;">
              Thanks for creating a GRUTH account. Click the button below to confirm your email address and activate your account.
            </p>

            <!-- CTA button -->
            <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td style="background:#f97316;border-radius:8px;">
                  <a href="${url}" target="_blank"
                    style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;letter-spacing:-0.2px;">
                    Verify my email →
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 8px;font-size:13px;color:#9ca3af;line-height:1.5;">
              Or paste this link into your browser:
            </p>
            <p style="margin:0 0 28px;font-size:12px;color:#f97316;word-break:break-all;">
              ${url}
            </p>

            <hr style="border:none;border-top:1px solid #f3f4f6;margin:0 0 24px;"/>

            <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
              This link expires in <strong style="color:#6b7280;">24 hours</strong>. If you didn't create a GRUTH account, you can safely ignore this email.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9f9f7;padding:20px 40px;border-top:1px solid #f3f4f6;">
            <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
              GRUTH · Nairobi, Kenya · <a href="${APP_URL}" style="color:#f97316;text-decoration:none;">gruth.ke</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
