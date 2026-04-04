import User from "@/models/User";

export async function generateUniqueUsername(input) {
  const rawBase = (input || "")
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 15);

  const baseUsername = rawBase || `user_${Date.now().toString().slice(-6)}`;

  let candidate = baseUsername;
  let counter = 1;

  while (await User.findOne({ username: candidate }).select("_id")) {
    candidate = `${baseUsername}_${counter}`;
    counter += 1;
  }

  return candidate;
}
