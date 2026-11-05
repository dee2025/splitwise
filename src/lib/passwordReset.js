import crypto from "crypto";

const PASSWORD_RESET_OTP_EXPIRY_MS = 10 * 60 * 1000;
export const PASSWORD_RESET_RESEND_COOLDOWN_MS = 60 * 1000;
export const PASSWORD_RESET_MAX_ATTEMPTS = 5;

function getResetSecret() {
  const secret = process.env.PASSWORD_RESET_SECRET || process.env.JWT_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("PASSWORD_RESET_SECRET or JWT_SECRET is required in production");
  }
  return "development-only-password-reset-secret";
}

export function normalizePasswordResetOtp(otp) {
  return String(otp || "").replace(/\D/g, "").slice(0, 6);
}

export function hashPasswordResetOtp(email, otp) {
  const normalizedEmail = String(email || "").toLowerCase().trim();
  const normalizedOtp = normalizePasswordResetOtp(otp);
  return crypto
    .createHmac("sha256", getResetSecret())
    .update(`${normalizedEmail}:${normalizedOtp}`)
    .digest("hex");
}

export function matchesPasswordResetOtp(email, otp, storedHash) {
  if (!storedHash) return false;
  const normalizedEmail = String(email || "").toLowerCase().trim();
  const normalizedOtp = normalizePasswordResetOtp(otp);
  const candidates = [
    hashPasswordResetOtp(normalizedEmail, normalizedOtp),
    crypto.createHmac("sha256", process.env.JWT_SECRET || process.env.PASSWORD_RESET_SECRET || "moneysplit").update(`${normalizedEmail}:${normalizedOtp}`).digest("hex"),
  ];
  return candidates.some((candidate) => {
    const left = Buffer.from(candidate, "hex");
    const right = Buffer.from(String(storedHash), "hex");
    return left.length === right.length && crypto.timingSafeEqual(left, right);
  });
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
