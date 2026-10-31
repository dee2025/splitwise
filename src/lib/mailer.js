import nodemailer from "nodemailer";

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.zoho.in",
      port: Number(process.env.SMTP_PORT || 465),
      secure: String(process.env.SMTP_SECURE || "true") !== "false",
      auth: {
        user: process.env.ZOHO_EMAIL,
        pass: process.env.ZOHO_PASSWORD,
      },
    });
  }

  return transporter;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "https://www.moneysplit.in";
}

function getFirstName(fullName) {
  return String(fullName || "there").trim().split(/\s+/)[0] || "there";
}

function brandHeader(appUrl) {     
  return `
    <tr>
      <td align="center" style="padding-bottom: 28px;">
        <table cellpadding="0" cellspacing="0">
          <tr>
            <td style="width:42px; height:42px;">
              <img src="${appUrl}/logo.png" width="42" height="42" alt="MoneySplit" style="display:block; width:42px; height:42px; border-radius:10px;" />
            </td>
            <td style="padding-left:10px;">
              <span style="color:#f1f5f9; font-size:20px; font-weight:700;">Money<span style="color:#818cf8;">Split</span></span>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

function emailShell(content, footer) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MoneySplit</title>
</head>
<body style="margin:0; padding:0; background:#0f172a; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a; padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px; width:100%;">
          ${brandHeader(getAppUrl())}
          <tr>
            <td style="background:#1e293b; border-radius:20px; border:1px solid rgba(255,255,255,0.07); padding:40px 40px 36px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:28px 8px 0;">
              <p style="margin:0; font-size:12px; color:#64748b; text-align:center; line-height:1.7;">
                ${footer}
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

export async function sendVerificationEmail({ to, fullName, otp }) {
  const firstName = escapeHtml(getFirstName(fullName));
  const safeOtp = escapeHtml(otp);
  const appUrl = getAppUrl();

  const html = emailShell(
    `
      <p style="margin:0 0 8px; font-size:26px; font-weight:700; color:#f1f5f9;">
        Your MoneySplit code, ${firstName}
      </p>
      <p style="margin:0 0 24px; font-size:15px; color:#94a3b8; line-height:1.6;">
        Enter this one-time code in MoneySplit to activate your account. The code expires in 10 minutes.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        <tr>
          <td align="center">
            <div style="display:inline-block; background:#0f172a; border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:18px 24px;">
              <span style="font-size:32px; line-height:1; letter-spacing:0.22em; font-weight:800; color:#f8fafc;">${safeOtp}</span>
            </div>
          </td>
        </tr>
      </table>
      <p style="margin:0; font-size:13px; color:#94a3b8; line-height:1.6;">
        Do not share this code with anyone. MoneySplit will never ask for it outside the verification screen.
      </p>
    `,
    `MoneySplit account security<br />This email was sent to ${escapeHtml(to)}. If you did not sign up, ignore this message.`,
  );

  await getTransporter().sendMail({
    from: `"Money Split" <${process.env.ZOHO_EMAIL}>`,
    to,
    subject: `${otp} is your MoneySplit verification code`,
    html,
    text: `Your MoneySplit verification code is ${otp}.\n\nEnter this code in MoneySplit within 10 minutes. Do not share it with anyone.\n\nIf you did not sign up, ignore this email.\n\n${appUrl}`,
  });
}

export async function sendPasswordResetEmail({ to, fullName, otp }) {
  const firstName = escapeHtml(getFirstName(fullName));
  const safeOtp = escapeHtml(otp);
  const appUrl = getAppUrl();

  const html = emailShell(
    `
      <p style="margin:0 0 8px; font-size:26px; font-weight:700; color:#f1f5f9;">
        Reset your password, ${firstName}
      </p>
      <p style="margin:0 0 24px; font-size:15px; color:#94a3b8; line-height:1.6;">
        Enter this one-time code in MoneySplit to choose a new password. The code expires in 10 minutes.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        <tr>
          <td align="center">
            <div style="display:inline-block; background:#0f172a; border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:18px 24px;">
              <span style="font-size:32px; line-height:1; letter-spacing:0.22em; font-weight:800; color:#f8fafc;">${safeOtp}</span>
            </div>
          </td>
        </tr>
      </table>
      <p style="margin:0; font-size:13px; color:#94a3b8; line-height:1.6;">
        If you did not request a password reset, you can safely ignore this email. Do not share this code.
      </p>
    `,
    `MoneySplit account security<br />This password reset was requested for ${escapeHtml(to)}.`,
  );

  await getTransporter().sendMail({
    from: `"Money Split" <${process.env.ZOHO_EMAIL}>`,
    to,
    subject: `${otp} is your MoneySplit password reset code`,
    html,
    text: `Your MoneySplit password reset code is ${otp}.\n\nEnter it within 10 minutes. If you did not request this, ignore this email.\n\n${appUrl}`,
  });
}

export async function sendWelcomeEmail({ to, fullName, username }) {
  const firstName = escapeHtml(getFirstName(fullName));
  const appUrl = getAppUrl();
  const safeFullName = escapeHtml(fullName);
  const safeUsername = escapeHtml(username);

  const html = emailShell(
    `
      <p style="margin:0 0 8px; font-size:26px; font-weight:700; color:#f1f5f9;">
        Welcome, ${firstName}
      </p>
      <p style="margin:0 0 28px; font-size:15px; color:#94a3b8; line-height:1.6;">
        Your MoneySplit account is ready. Split bills, track shared expenses, and settle up with clear records.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a; border-radius:12px; border:1px solid rgba(255,255,255,0.05); margin-bottom:28px;">
        <tr>
          <td style="padding:20px 22px;">
            <p style="margin:0 0 14px; font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.12em;">Your account</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:6px 0; border-bottom:1px solid rgba(255,255,255,0.04);"><span style="font-size:13px; color:#64748b;">Name</span></td>
                <td style="padding:6px 0; border-bottom:1px solid rgba(255,255,255,0.04); text-align:right;"><span style="font-size:13px; font-weight:600; color:#e2e8f0;">${safeFullName}</span></td>
              </tr>
              <tr>
                <td style="padding:6px 0;"><span style="font-size:13px; color:#64748b;">Username</span></td>
                <td style="padding:6px 0; text-align:right;"><span style="font-size:13px; font-weight:600; color:#818cf8;">@${safeUsername}</span></td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center">
            <a href="${appUrl}/dashboard" style="display:inline-block; background:#4f46e5; color:#ffffff; font-size:15px; font-weight:700; padding:14px 36px; border-radius:12px; text-decoration:none;">
              Go to dashboard
            </a>
          </td>
        </tr>
      </table>
    `,
    `MoneySplit<br />This email was sent to ${escapeHtml(to)} because you registered an account.`,
  );

  await getTransporter().sendMail({
    from: `"Money Split" <${process.env.ZOHO_EMAIL}>`,
    to,
    subject: `Welcome to MoneySplit, ${getFirstName(fullName)}!`,
    html,
    text: `Welcome to MoneySplit, ${getFirstName(fullName)}!\n\nYour account has been created successfully.\nUsername: @${username}\n\nGet started: ${appUrl}/dashboard`,
  });
}

export async function sendAndroidTestingInvite({ to }) {
  const appUrl = getAppUrl();
  const playStoreUrl = "https://play.google.com/store/apps/details?id=in.moneysplit.app";
  const supportEmail = "deepaksingh@moneysplit.in";
  const supportPhone = "+91 8112260346";

  const html = emailShell(
    `
      <div style="display:inline-block; margin-bottom:18px; padding:7px 12px; border-radius:999px; background:#d9f946; color:#0f2f28; font-size:11px; font-weight:800; letter-spacing:.1em; text-transform:uppercase;">
        Android early access
      </div>
      <p style="margin:0 0 10px; font-size:28px; font-weight:800; color:#f1f5f9; line-height:1.2;">
        You are invited to test MoneySplit!
      </p>
      <p style="margin:0 0 26px; font-size:15px; color:#cbd5e1; line-height:1.7;">
        Be among the first to try the official MoneySplit Android app on Google Play. Your real-world feedback over the next 15 days will help us improve the experience and prepare the app for its public Play Store release.
      </p>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:26px; background:#0f172a; border:1px solid rgba(255,255,255,.07); border-radius:14px;">
        <tr>
          <td style="padding:22px;">
            <p style="margin:0 0 14px; color:#f1f5f9; font-size:14px; font-weight:800;">What to test</p>
            <p style="margin:0 0 10px; color:#cbd5e1; font-size:14px; line-height:1.55;">✓ Create a group for friends, roommates, or a trip</p>
            <p style="margin:0 0 10px; color:#cbd5e1; font-size:14px; line-height:1.55;">✓ Add expenses and try different group splits</p>
            <p style="margin:0 0 10px; color:#cbd5e1; font-size:14px; line-height:1.55;">✓ Check balances, settlements, and expense calculations</p>
            <p style="margin:0; color:#cbd5e1; font-size:14px; line-height:1.55;">✓ Report bugs, confusing screens, or features that could work better</p>
          </td>
        </tr>
      </table>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        <tr>
          <td align="center">
            <a href="${playStoreUrl}" style="display:inline-block; background:#22c55e; color:#052e16; font-size:15px; font-weight:800; padding:15px 30px; border-radius:12px; text-decoration:none;">
              Install MoneySplit on Android
            </a>
          </td>
        </tr>
      </table>

      <p style="margin:0 0 22px; padding:14px 16px; border-left:3px solid #818cf8; background:rgba(129,140,248,.08); color:#cbd5e1; font-size:13px; line-height:1.6;">
        Please open Google Play with the same Google account that was added to the test. If the install option does not appear, reply to this email and we will help.
      </p>
      <p style="margin:0 0 6px; color:#f1f5f9; font-size:14px; font-weight:700;">Android is available for testing now.</p>
      <p style="margin:0 0 24px; color:#94a3b8; font-size:13px; line-height:1.6;">The MoneySplit iOS app is coming soon.</p>
      <p style="margin:0; color:#94a3b8; font-size:13px; line-height:1.7;">
        Questions or feedback?<br />
        <a href="mailto:${supportEmail}" style="color:#a5b4fc; text-decoration:none;">${supportEmail}</a><br />
        <a href="tel:+918112260346" style="color:#a5b4fc; text-decoration:none;">${supportPhone}</a>
      </p>
    `,
    `Thank you for helping improve MoneySplit.<br />Official website: <a href="${appUrl}" style="color:#818cf8; text-decoration:none;">moneysplit.in</a><br />This testing invitation was sent to ${escapeHtml(to)}.`,
  );

  await getTransporter().sendMail({
    from: `"Money Split" <${process.env.ZOHO_EMAIL}>`,
    to,
    replyTo: supportEmail,
    subject: "You're invited: Test the MoneySplit Android app for 15 days",
    html,
    text: [
      "You're invited to test MoneySplit on Android!",
      "",
      "Be among the first to try the official MoneySplit Android app on Google Play. Please install it and use it over the next 15 days to help us find bugs and prepare for public release.",
      "",
      "Try creating groups, adding expenses, splitting costs, checking balances, and recording settlements. Please report any bugs, confusing screens, or suggestions.",
      "",
      `Install from Google Play: ${playStoreUrl}`,
      "",
      "Open Google Play with the same Google account that was added to the test. Android is available now; iOS is coming soon.",
      "",
      `Feedback and support: ${supportEmail} | ${supportPhone}`,
      `Official website: ${appUrl}`,
    ].join("\n"),
  });
}

export async function sendContactEnquiryEmail({
  name,
  email,
  phone,
  enquiryType,
  subject,
  message,
}) {
  const to = process.env.CONTACT_TO_EMAIL || process.env.ZOHO_EMAIL;
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safePhone = escapeHtml(phone || "Not provided");
  const safeType = escapeHtml(enquiryType);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replaceAll("\n", "<br />");

  const html = emailShell(
    `
      <p style="margin:0 0 8px; font-size:24px; font-weight:700; color:#f1f5f9;">
        New contact enquiry
      </p>
      <p style="margin:0 0 24px; font-size:14px; color:#94a3b8; line-height:1.6;">
        A visitor submitted the MoneySplit contact form.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a; border-radius:12px; border:1px solid rgba(255,255,255,0.05); margin-bottom:22px;">
        <tr><td style="padding:18px 20px;">
          <p style="margin:0 0 10px; font-size:12px; color:#64748b; text-transform:uppercase; letter-spacing:0.12em; font-weight:700;">Contact details</p>
          <p style="margin:0 0 8px; color:#e2e8f0; font-size:14px;"><strong>Name:</strong> ${safeName}</p>
          <p style="margin:0 0 8px; color:#e2e8f0; font-size:14px;"><strong>Email:</strong> ${safeEmail}</p>
          <p style="margin:0 0 8px; color:#e2e8f0; font-size:14px;"><strong>Phone:</strong> ${safePhone}</p>
          <p style="margin:0; color:#e2e8f0; font-size:14px;"><strong>Type:</strong> ${safeType}</p>
        </td></tr>
      </table>
      <p style="margin:0 0 8px; color:#f1f5f9; font-size:16px; font-weight:700;">${safeSubject}</p>
      <p style="margin:0; color:#cbd5e1; font-size:14px; line-height:1.7;">${safeMessage}</p>
    `,
    `MoneySplit contact form<br />Reply directly to ${safeEmail} from this email thread.`,
  );

  await getTransporter().sendMail({
    from: `"Money Split Contact" <${process.env.ZOHO_EMAIL}>`,
    to,
    replyTo: `"${name}" <${email}>`,
    subject: `[MoneySplit ${enquiryType}] ${subject}`,
    html,
    text: [
      "New MoneySplit contact enquiry",
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone || "Not provided"}`,
      `Type: ${enquiryType}`,
      `Subject: ${subject}`,
      "",
      message,
    ].join("\n"),
  });
}
