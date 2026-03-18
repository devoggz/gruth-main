import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://gruth.ke";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@gruth.ke";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  country: z.string().optional(),
  projectLocation: z.string().min(3),
  serviceType: z.string().min(2),
  description: z.string().min(20),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }

    const request = await prisma.verificationRequest.create({
      data: { ...parsed.data },
    });

    // Notify admin — non-blocking
    try {
      await resend.emails.send({
        from: "GRUTH <no-reply@gruth.it.com>",
        to: ADMIN_EMAIL,
        subject: `New verification request — ${parsed.data.serviceType} · ${parsed.data.projectLocation}`,
        html: adminNotificationHtml(parsed.data, request.id),
      });
    } catch (emailErr) {
      console.error("Admin notification email failed:", emailErr);
    }

    return NextResponse.json(
      { success: true, id: request.id },
      { status: 201 },
    );
  } catch (error) {
    console.error("Verification request error:", error);
    return NextResponse.json(
      { error: "Failed to submit request." },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status") ?? undefined;
  const take = parseInt(searchParams.get("take") ?? "50");

  const requests = await prisma.verificationRequest.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    take,
  });

  return NextResponse.json({ requests });
}

function adminNotificationHtml(data: z.infer<typeof schema>, id: string) {
  const reviewUrl = `${APP_URL}/admin?tab=requests&id=${id}`;
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f0;font-family:'DM Sans',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">

        <tr>
          <td style="background:#121210;padding:20px 32px;">
            <span style="color:#f97316;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">GRUTH Admin</span>
            <h2 style="margin:4px 0 0;color:#fff;font-size:18px;font-weight:700;">New Verification Request</h2>
          </td>
        </tr>

        <tr>
          <td style="padding:28px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              ${[
                ["Name", data.name],
                ["Email", data.email],
                ["Phone", data.phone ?? "—"],
                ["Country", data.country ?? "—"],
                ["Location", data.projectLocation],
                ["Service", data.serviceType],
              ]
                .map(
                  ([label, value]) => `
              <tr>
                <td style="padding:6px 0;color:#9ca3af;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;width:110px;vertical-align:top;">${label}</td>
                <td style="padding:6px 0;color:#3d3b36;font-size:14px;">${value}</td>
              </tr>`,
                )
                .join("")}
            </table>

            <div style="margin:20px 0;padding:16px;background:#f9f9f7;border-radius:8px;border-left:3px solid #f97316;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">Description</p>
              <p style="margin:0;font-size:14px;color:#3d3b36;line-height:1.6;">${data.description}</p>
            </div>

            <table cellpadding="0" cellspacing="0" style="margin-top:20px;">
              <tr>
                <td style="background:#f97316;border-radius:8px;">
                  <a href="${reviewUrl}" style="display:inline-block;padding:12px 24px;color:#fff;font-size:14px;font-weight:600;text-decoration:none;">
                    Review in Admin Dashboard →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="background:#f9f9f7;padding:16px 32px;border-top:1px solid #f3f4f6;">
            <p style="margin:0;font-size:11px;color:#9ca3af;text-align:center;">GRUTH Operations · <a href="${APP_URL}/admin" style="color:#f97316;text-decoration:none;">Open Dashboard</a></p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
