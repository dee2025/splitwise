import nodemailer from "nodemailer";

// Zoho SMTP transporter
const transporter = nodemailer.createTransport({
  host: "smtp.zoho.in",
  port: 465,
  secure: true, // SSL
  auth: {
    user: process.env.ZOHO_EMAIL,    // deepaksingh@moneysplit.in
    pass: process.env.ZOHO_PASSWORD, // Zoho app password
  },
});

// ── Welcome Email ─────────────────────────────────────────────────────────────
export async function sendWelcomeEmail({ to, fullName, username }) {
  const firstName = fullName?.split(" ")[0] || "there";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Money Split</title>
</head>
<body style="margin:0; padding:0; background:#0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px; width:100%;">

          <!-- Logo / Brand -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#4f46e5; border-radius:10px; width:36px; height:36px; text-align:center; vertical-align:middle;">
                    <span style="color:#fff; font-weight:700; font-size:16px; line-height:36px; display:block;">M</span>
                  </td>
                  <td style="padding-left:10px;">
                    <span style="color:#f1f5f9; font-size:20px; font-weight:700; letter-spacing:-0.5px;">Money<span style="color:#818cf8;">Split</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#1e293b; border-radius:20px; border:1px solid rgba(255,255,255,0.07); padding:40px 40px 36px; overflow:hidden;">

              <!-- Greeting -->
              <p style="margin:0 0 8px; font-size:26px; font-weight:700; color:#f1f5f9; letter-spacing:-0.5px;">
                Welcome, ${firstName}! 🎉
              </p>
              <p style="margin:0 0 28px; font-size:15px; color:#94a3b8; line-height:1.6;">
                Your Money Split account is ready. Split bills, track shared expenses, and settle up with friends — without the math or the drama.
              </p>

              <!-- Account details box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a; border-radius:12px; border:1px solid rgba(255,255,255,0.05); margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 22px;">
                    <p style="margin:0 0 14px; font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.12em;">Your Account</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:6px 0; border-bottom:1px solid rgba(255,255,255,0.04);">
                          <span style="font-size:13px; color:#64748b;">Name</span>
                        </td>
                        <td style="padding:6px 0; border-bottom:1px solid rgba(255,255,255,0.04); text-align:right;">
                          <span style="font-size:13px; font-weight:600; color:#e2e8f0;">${fullName}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;">
                          <span style="font-size:13px; color:#64748b;">Username</span>
                        </td>
                        <td style="padding:6px 0; text-align:right;">
                          <span style="font-size:13px; font-weight:600; color:#818cf8;">@${username}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Features list -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                ${[
                  ["💸", "Split any expense equally or custom"],
                  ["📊", "Track balances in real-time"],
                  ["✅", "Settle with minimum transactions"],
                ].map(([icon, text]) => `
                <tr>
                  <td style="padding:7px 0; vertical-align:top; width:28px;">
                    <span style="font-size:16px;">${icon}</span>
                  </td>
                  <td style="padding:7px 0; vertical-align:middle;">
                    <span style="font-size:14px; color:#cbd5e1;">${text}</span>
                  </td>
                </tr>`).join("")}
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://moneysplit.in"}/dashboard"
                       style="display:inline-block; background:#4f46e5; color:#ffffff; font-size:15px; font-weight:600; padding:14px 36px; border-radius:12px; text-decoration:none; letter-spacing:0.01em; box-shadow: 0 4px 20px rgba(79,70,229,0.4);">
                      Go to Dashboard →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Tip -->
          <tr>
            <td style="padding:24px 8px 0;">
              <p style="margin:0; font-size:13px; color:#334155; text-align:center; line-height:1.6;">
                Tip: Visit your <strong style="color:#475569;">Profile</strong> to set your username and mobile number whenever you're ready.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:28px 8px 0; border-top:1px solid rgba(255,255,255,0.04); margin-top:28px;">
              <p style="margin:0; font-size:12px; color:#1e293b; text-align:center; line-height:1.7;">
                &copy; ${new Date().getFullYear()} Money Split &bull; moneysplit.in<br/>
                This email was sent to ${to} because you registered an account.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from: `"Money Split" <${process.env.ZOHO_EMAIL}>`,
    to,
    subject: `Welcome to Money Split, ${firstName}! 🎉`,
    html,
    text: `Welcome to Money Split, ${firstName}!\n\nYour account has been created successfully.\nUsername: @${username}\n\nGet started: ${process.env.NEXT_PUBLIC_APP_URL || "https://moneysplit.in"}/dashboard\n\n© ${new Date().getFullYear()} Money Split`,
  });
}
