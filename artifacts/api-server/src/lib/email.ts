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

export function onboardPortalUrl(): string {
  return `${appBaseUrl()}/onboard`;
}

/** Send onboarding portal credentials to a shortlisted applicant. */
export async function sendOnboardingEmail(opts: {
  name: string;
  email: string;
  refId: string;
  tempPassword: string;
}): Promise<{ ok: boolean; error?: string }> {
  const portalUrl = onboardPortalUrl();
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
              You have been <strong>shortlisted</strong> for the VERJ Solar BDO programme. Your next step is to complete our pre-onboarding training and competency assessment.
            </p>

            <!-- Step description -->
            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:20px 24px;margin:0 0 24px;">
              <p style="margin:0 0 14px;font-size:14px;font-weight:700;color:#111;">What happens next:</p>
              <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
                <tr>
                  <td style="padding:8px 0;font-size:13px;color:#444;line-height:1.6;border-bottom:1px solid #e5e7eb;">
                    📖 &nbsp;<strong>Step 1:</strong> Read the BDO Training Handbook (available in the portal)
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:13px;color:#444;line-height:1.6;border-bottom:1px solid #e5e7eb;">
                    ✅ &nbsp;<strong>Step 2:</strong> Take and pass the competency assessment (minimum 70%)
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:13px;color:#444;line-height:1.6;">
                    🎓 &nbsp;<strong>Step 3:</strong> Await your VBDO ID and full account activation
                  </td>
                </tr>
              </table>
            </div>

            <!-- Credentials box -->
            <div style="background:#fffbeb;border:1px solid #f59e0b;border-radius:10px;padding:20px 24px;margin:0 0 24px;">
              <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:0.5px;">Your Portal Login Details</p>
              <table cellpadding="0" cellspacing="0" style="width:100%;">
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#78350f;width:100px;">Username:</td>
                  <td style="padding:6px 0;font-size:15px;color:#111;font-weight:800;font-family:monospace;letter-spacing:1px;">${opts.refId}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#78350f;">Password:</td>
                  <td style="padding:6px 0;font-size:16px;color:#111;font-weight:800;font-family:monospace;letter-spacing:2px;">${opts.tempPassword}</td>
                </tr>
              </table>
            </div>

            <!-- CTA -->
            <p style="margin:0 0 10px;font-size:14px;color:#555;">Click the button below to access your onboarding portal:</p>
            <table cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
              <tr>
                <td style="background:#f5c518;border-radius:8px;">
                  <a href="${portalUrl}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#0a0a0a;text-decoration:none;letter-spacing:0.3px;">Access Onboarding Portal →</a>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 6px;font-size:13px;color:#888;">Or copy and paste this link into your browser:</p>
            <p style="margin:0 0 24px;font-size:12px;color:#555;word-break:break-all;background:#f9f9f9;padding:10px 14px;border-radius:6px;border:1px solid #e5e5e5;">${portalUrl}</p>

            <p style="margin:0;font-size:12px;color:#aaa;line-height:1.5;">Keep your password safe. Do not share it with anyone. You have a maximum of 2 attempts at the assessment.</p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:18px 36px;border-top:1px solid #f0f0f0;">
            <p style="margin:0;font-size:11px;color:#aaa;line-height:1.5;">
              This email was sent by VERJ Solar Energy Solutions via the EnBO platform. Do not reply to this email. For support, contact mails.verj@gmail.com.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `Congratulations ${opts.name}!\n\nYou have been shortlisted for the VERJ Solar BDO programme.\n\nYour onboarding portal login details:\nEmail: ${opts.email}\nPassword: ${opts.tempPassword}\nReference: ${opts.refId}\n\nPortal: ${portalUrl}\n\nSteps:\n1. Read the BDO Training Handbook\n2. Take and pass the competency assessment (70%+)\n3. Await your VBDO ID and full account activation\n\n— VERJ Solar Energy Solutions`;

  try {
    const { error } = await getResend().emails.send({
      from: FROM,
      to: [opts.email],
      subject: `🎉 You've been shortlisted — access your VERJ onboarding portal (${opts.refId})`,
      html,
      text,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/** Send congratulatory activation email with BDO credentials. */
export async function sendActivationEmail(opts: {
  name: string;
  email: string;
  vbdoId: string;
  defaultPassword: string;
}): Promise<{ ok: boolean; error?: string }> {
  const loginUrl = `${appBaseUrl()}/login`;
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

        <!-- Hero banner -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a1a1a 0%,#2a2a2a 100%);padding:32px 36px;text-align:center;">
            <div style="font-size:48px;margin-bottom:12px;">🎓</div>
            <h1 style="margin:0 0 8px;color:#f5c518;font-size:26px;font-weight:900;letter-spacing:-0.5px;">Welcome to VERJ Solar!</h1>
            <p style="margin:0;color:#aaa;font-size:14px;">Your BDO account is now active, ${firstName}.</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 36px 28px;">
            <p style="margin:0 0 20px;font-size:15px;color:#444;line-height:1.7;">
              Congratulations! You have successfully completed the VERJ BDO onboarding programme and your account has been <strong>activated</strong>. You are now an official VERJ Business Development Officer.
            </p>

            <!-- Credentials box -->
            <div style="background:#fffbeb;border:1px solid #f59e0b;border-radius:10px;padding:20px 24px;margin:0 0 24px;">
              <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:0.5px;">Your EnBO Login Credentials</p>
              <table cellpadding="0" cellspacing="0" style="width:100%;">
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#78350f;width:100px;">Username:</td>
                  <td style="padding:6px 0;font-size:17px;color:#111;font-weight:900;font-family:monospace;letter-spacing:2px;">${opts.vbdoId}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#78350f;">Password:</td>
                  <td style="padding:6px 0;font-size:16px;color:#111;font-weight:800;font-family:monospace;letter-spacing:2px;">${opts.defaultPassword}</td>
                </tr>
              </table>
            </div>

            <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;padding:14px 18px;margin:0 0 24px;font-size:13px;color:#991b1b;line-height:1.6;">
              ⚠️ <strong>Important:</strong> Please change your password immediately after your first login. Do not share your credentials with anyone.
            </div>

            <!-- CTA -->
            <p style="margin:0 0 10px;font-size:14px;color:#555;">Log in to the EnBO platform to get started:</p>
            <table cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
              <tr>
                <td style="background:#f5c518;border-radius:8px;">
                  <a href="${loginUrl}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#0a0a0a;text-decoration:none;letter-spacing:0.3px;">Open EnBO Dashboard →</a>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 6px;font-size:13px;color:#888;">Or visit:</p>
            <p style="margin:0 0 24px;font-size:12px;color:#555;word-break:break-all;background:#f9f9f9;padding:10px 14px;border-radius:6px;border:1px solid #e5e5e5;">${loginUrl}</p>

            <p style="margin:0;font-size:13px;color:#888;line-height:1.6;">
              Your VBDO ID is <strong style="color:#333;font-family:monospace;">${opts.vbdoId}</strong>. This is your unique VERJ identity — it appears on every lead, commission, and record linked to you. Keep it safe.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:18px 36px;border-top:1px solid #f0f0f0;">
            <p style="margin:0;font-size:11px;color:#aaa;line-height:1.5;">
              Sent by VERJ Solar Energy Solutions via the EnBO platform. For support, contact your team lead or mails.verj@gmail.com.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `Congratulations ${opts.name}!\n\nYour VERJ BDO account is now active.\n\nYour EnBO login credentials:\nUsername: ${opts.vbdoId}\nPassword: ${opts.defaultPassword}\n\nPlease change your password immediately after your first login.\n\nLogin at: ${loginUrl}\n\nYour VBDO ID: ${opts.vbdoId}\n\n— VERJ Solar Energy Solutions`;

  try {
    const { error } = await getResend().emails.send({
      from: FROM,
      to: [opts.email],
      subject: `🎓 Welcome to VERJ Solar, ${firstName}! Your BDO account is active (${opts.vbdoId})`,
      html,
      text,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
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
