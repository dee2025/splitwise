import crypto from "crypto";

const PASSWORD_RESET_OTP_EXPIRY_MS = 10 * 60 * 1000;
export const PASSWORD_RESET_RESEND_COOLDOWN_MS = 60 * 1000;
export const PASSWORD_RESET_MAX_ATTEMPTS = 5;

export function normalizePasswordResetOtp(otp) {
  return String(otp || "").replace(/\D/g, "").slice(0, 6);
}

export function hashPasswordResetOtp(email, otp) {
  const normalizedEmail = String(email || "").toLowerCase().trim();
  const normalizedOtp = normalizePasswordResetOtp(otp);
  const secret = process.env.JWT_SECRET || process.env.PASSWORD_RESET_SECRET || "moneysplit";

  return crypto
    .createHmac("sha256", secret)
    .update(`${normalizedEmail}:${normalizedOtp}`)
    .digest("hex");
}

export function canSendPasswordResetOtp(user) {
  const lastSent = user?.passwordResetLastSentAt?.getTime?.() || 0;
  return Date.now() - lastSent >= PASSWORD_RESET_RESEND_COOLDOWN_MS;
}

export function applyPasswordResetOtp(user) {
  const otp = String(crypto.randomInt(0, 1000000)).padStart(6, "0");
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_OTP_EXPIRY_MS);

  user.passwordResetOtpHash = hashPasswordResetOtp(user.email, otp);
  user.passwordResetExpiresAt = expiresAt;
  user.passwordResetLastSentAt = new Date();
  user.passwordResetOtpAttempts = 0;

  return { otp, expiresAt };
}
