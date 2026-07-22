import crypto from "crypto";

const EMAIL_VERIFICATION_TOKEN_BYTES = 32;
const EMAIL_VERIFICATION_EXPIRY_MS = 24 * 60 * 60 * 1000;

export function hashEmailVerificationToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function createEmailVerificationToken() {
  const token = crypto.randomBytes(EMAIL_VERIFICATION_TOKEN_BYTES).toString("base64url");

  return {
    token,
    tokenHash: hashEmailVerificationToken(token),
    expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_EXPIRY_MS),
  };
}

export function buildEmailVerificationUrl(token) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.moneysplit.in";
  return `${appUrl}/verify-email?token=${encodeURIComponent(token)}`;
}
