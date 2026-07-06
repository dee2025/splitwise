import crypto from "crypto";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI. Run with --env-file=.env.local or set env vars.");
  process.exit(1);
}

const DRY_RUN = process.argv.includes("--dry-run");

function generateInviteToken() {
  return crypto.randomBytes(32).toString("hex");
}

async function run() {
  await mongoose.connect(MONGODB_URI, {
    dbName: MONGODB_DB,
  });

  const collection = mongoose.connection.collection("groups");
  const query = {
    $or: [
      { inviteToken: { $exists: false } },
      { inviteToken: null },
      { inviteToken: "" },
      { inviteEnabled: { $exists: false } },
      { inviteUpdatedAt: { $exists: false } },
    ],
  };

  const groups = await collection.find(query).project({ _id: 1 }).toArray();

  if (groups.length === 0) {
    console.log("All groups already have invite link fields.");
    await mongoose.disconnect();
    return;
  }

  if (DRY_RUN) {
    console.log("Dry run enabled. No writes performed.");
    console.log(`Would backfill invite link fields for ${groups.length} groups.`);
    await mongoose.disconnect();
    return;
  }

  const now = new Date();
  const operations = groups.map((group) => ({
    updateOne: {
      filter: { _id: group._id },
      update: {
        $set: {
          inviteToken: generateInviteToken(),
          inviteEnabled: true,
          inviteUpdatedAt: now,
          updatedAt: now,
        },
      },
    },
  }));

  const result = await collection.bulkWrite(operations, { ordered: false });

  console.log("Group invite backfill completed.");
  console.log(`Matched: ${result.matchedCount}`);
  console.log(`Modified: ${result.modifiedCount}`);

  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error("Group invite backfill failed:", error);
  await mongoose.disconnect();
  process.exit(1);
});
