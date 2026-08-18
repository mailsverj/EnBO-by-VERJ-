import { Resend } from "resend";

// Lazy initialisation — instantiated on first send so a missing key
// doesn't crash the server at startup.
let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const FROM = process.env.EMAIL_FROM ?? "VERJ Solar <onboarding@resend.dev>";

/** Base URL of the EnBO frontend (no trailing slash). */
function appBaseUrl(): string {
  const domain = process.env.APP_URL ?? process.env.REPLIT_DEV_DOMAIN ?? "localhost:3000";
  return domain.startsWith("http") ? domain.replace(/\/$/, "") : `https://${domain}`;
}

export function assessmentUrl(refId: string): string {
  return `${appBaseUrl()}/assessment?ref=${refId}`;
}

/** Send the assessment link to a shortlisted applicant. */
export async function sendAssessmentEmail(opts: {
  name: string;
  email: string;
  refId: string;
}): Promise<{ ok: boolean; error?: string }> {
  const link = assessmentUrl(opts.refId);
  const firstName = opts.name.split(" ")[0];

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#0a0a0a;padding:28px 36px;">
            <p style="margin:0;color:#f5c518;font-size:22px;font-weight:900;letter-spacing:-0.5px;">EnBO <span style="font-size:11px;font-weight:600;color:#888;letter-spacing:2px;vertical-align:middle;">by VERJ</span></p>
            <p style="margin:4px 0 0;color:#555;font-size:10px;letter-spacing:2px;text-transform:uppercase;">VERJ Solar Energy Solutions</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 36px 28px;">
            <p style="margin:0 0 8px;font-size:20px;font-weight:700;color:#111;">Congratulations, ${firstName}! 🎉</p>
            <p style="margin:0 0 20px;font-size:15px;color:#444;line-height:1.6;">
              You have been <strong>shortlisted</strong> for the VERJ Solar BDO programme. Your next step is to complete a short online assessment so our team can evaluate your fit.
            </p>
            <p style="margin:0 0 10px;font-size:14px;color:#555;">Click the button below to start your assessment:</p>

            <!-- CTA -->
            <table cellpadding="0" cellspacing="0" style="margin:20px 0;">
              <tr>
                <td style="background:#f5c518;border-radius:8px;">
                  <a href="${link}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#0a0a0a;text-decoration:none;letter-spacing:0.3px;">Take the Assessment →</a>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 6px;font-size:13px;color:#888;">Or copy and paste this link into your browser:</p>
            <p style="margin:0 0 24px;font-size:12px;color:#555;word-break:break-all;background:#f9f9f9;padding:10px 14px;border-radius:6px;border:1px solid #e5e5e5;">${link}</p>

            <p style="margin:0;font-size:13px;color:#888;line-height:1.5;">
              Your reference number is <strong style="color:#333;">${opts.refId}</strong>. If you have any questions, please contact the VERJ recruitment team.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:18px 36px;border-top:1px solid #f0f0f0;">
            <p style="margin:0;font-size:11px;color:#aaa;line-height:1.5;">
              This email was sent by VERJ Solar Energy Solutions via the EnBO platform. Do not reply to this email.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `Congratulations ${opts.name}!\n\nYou have been shortlisted for the VERJ Solar BDO programme.\n\nPlease complete your assessment at the link below:\n${link}\n\nYour reference number is ${opts.refId}.\n\n— VERJ Solar Energy Solutions`;

  try {
    const { error } = await getResend().emails.send({
      from: FROM,
      to: [opts.email],
      subject: `🎉 You've been shortlisted — take your VERJ assessment (${opts.refId})`,
      html,
      text,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
