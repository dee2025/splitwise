import crypto from "crypto";

const EMAIL_VERIFICATION_OTP_EXPIRY_MS = 10 * 60 * 1000;
export const EMAIL_VERIFICATION_RESEND_COOLDOWN_MS = 60 * 1000;
export const EMAIL_VERIFICATION_MAX_ATTEMPTS = 5;

export function normalizeEmailVerificationOtp(otp) {
  return String(otp || "").replace(/\D/g, "").slice(0, 6);
}

export function hashEmailVerificationOtp(email, otp) {
  const normalizedEmail = String(email || "").toLowerCase().trim();
  const normalizedOtp = normalizeEmailVerificationOtp(otp);
  return crypto.createHash("sha256").update(`${normalizedEmail}:${normalizedOtp}`).digest("hex");
}

export function createEmailVerificationOtp(email) {
  const otp = String(crypto.randomInt(0, 1000000)).padStart(6, "0");

  return {
    otp,
    otpHash: hashEmailVerificationOtp(email, otp),
    expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_OTP_EXPIRY_MS),
  };
}

export function canSendEmailVerificationOtp(user) {
  const lastSent = user?.emailVerificationLastSentAt?.getTime?.() || 0;
  return Date.now() - lastSent >= EMAIL_VERIFICATION_RESEND_COOLDOWN_MS;
}

export function applyEmailVerificationOtp(user) {
  const verification = createEmailVerificationOtp(user.email);
  user.emailVerificationOtpHash = verification.otpHash;
  user.emailVerificationExpiresAt = verification.expiresAt;
  user.emailVerificationLastSentAt = new Date();
  user.emailVerificationOtpAttempts = 0;
  user.emailVerificationTokenHash = null;
  return verification;
}
