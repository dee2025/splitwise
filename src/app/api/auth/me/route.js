import User from "@/models/User";
import { connectDB } from "@/lib/db";
import { verifyRequestToken } from "@/lib/apiAuth";

export async function GET(req) {
  await connectDB();
  const auth = await verifyRequestToken(req);

  if (auth.error) return auth.error;

  const user = await User.findById(auth.decoded.userId || auth.decoded.id).select(
    "-password -emailVerificationTokenHash -emailVerificationOtpHash -emailVerificationExpiresAt -emailVerificationLastSentAt",
  );

  return Response.json({ user });
}
