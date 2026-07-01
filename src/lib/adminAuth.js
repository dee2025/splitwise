import { verifyToken } from "@/lib/auth";

export const ADMIN_EMAIL = "deepaksingh@moneysplit.in";
export const ADMIN_PASSWORD = "D-m@n0551";
export const ADMIN_COOKIE_NAME = "admin_token";

export async function requireAdmin(req) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;

  if (!token) {
    return { error: "Unauthenticated", status: 401 };
  }

  let decoded;
  try {
    decoded = await verifyToken(token);
  } catch {
    return { error: "Session expired", status: 401 };
  }

  if (decoded.type !== "admin" || decoded.email !== ADMIN_EMAIL) {
    return { error: "Admin access required", status: 403 };
  }

  return {
    user: {
      _id: null,
      email: decoded.email,
      role: "admin",
    },
  };
}
