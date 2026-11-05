export const EMAIL_MAX_LENGTH = 254;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;

const COMMON_PASSWORDS = new Set([
  "password", "password1", "password123", "12345678", "123456789",
  "qwerty123", "admin123", "moneysplit",
]);

export function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

export function getEmailValidationError(value) {
  const email = normalizeEmail(value);
  if (!email) return "Email is required";
  if (email.length > EMAIL_MAX_LENGTH) return "Email address is too long";
  if (email.includes("..")) return "Enter a valid email address";

  const parts = email.split("@");
  if (parts.length !== 2) return "Enter a valid email address";
  const [local, domain] = parts;
  if (!local || local.length > 64 || local.startsWith(".") || local.endsWith(".")) {
    return "Enter a valid email address";
  }
  if (!/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/i.test(local)) {
    return "Enter a valid email address";
  }

  const labels = domain.split(".");
  if (
    labels.length < 2 ||
    labels.some((label) => !label || label.length > 63 || !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label)) ||
    labels.at(-1).length < 2
  ) {
    return "Enter a valid email address";
  }
  return null;
}

export function getPasswordValidationError(value, { requiredLabel = "Password" } = {}) {
  const password = String(value || "");
  if (!password) return `${requiredLabel} is required`;
  if (password.length < PASSWORD_MIN_LENGTH) return `Use at least ${PASSWORD_MIN_LENGTH} characters`;
  if (password.length > PASSWORD_MAX_LENGTH) return `Use no more than ${PASSWORD_MAX_LENGTH} characters`;
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return "Include at least one letter and one number";
  }
  if (COMMON_PASSWORDS.has(password.toLowerCase())) return "Choose a less common password";
  return null;
}

export function isMobileClientRequest(request, body = {}) {
  const clients = [request.headers.get("x-moneysplit-client"), body?.client]
    .map((value) => String(value || "").trim().toLowerCase());
  return clients.some((client) => ["flutter", "android", "ios", "mobile-app"].includes(client));
}
