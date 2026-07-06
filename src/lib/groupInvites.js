import crypto from "crypto";

export function generateGroupInviteToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function getSafeAuthRedirect(value) {
  if (!value || typeof value !== "string") return "/groups";
  if (!value.startsWith("/") || value.startsWith("//")) return "/groups";
  if (value.startsWith("/api/")) return "/groups";
  return value;
}
