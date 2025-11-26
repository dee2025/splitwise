import { verifyToken } from "./auth";

export const protect = async (req) => {
  const token = req.headers.get("authorization")?.split(" ")[1];

  if (!token) return null;

  const decoded = verifyToken(token);
  return decoded;
};
