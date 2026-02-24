import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI. Run with --env-file=.env.local or set env vars.");
  process.exit(1);
}

const DRY_RUN = process.argv.includes("--dry-run");

function normalizeType(type) {
  if (type === "settlement") return "settlement_request";
  if (type === "payment_received") return "settlement_completed";
  return type;
}

async function run() {
  await mongoose.connect(MONGODB_URI, {
    dbName: MONGODB_DB,
  });

  const collection = mongoose.connection.collection("notifications");

  const query = {
    $or: [
      { type: { $in: ["settlement", "payment_received"] } },
      { metadata: { $exists: true } },
    ],
  };

  const docs = await collection.find(query).toArray();

  if (docs.length === 0) {
    console.log("No legacy notifications found. Nothing to normalize.");
    await mongoose.disconnect();
    return;
  }

  console.log(`Found ${docs.length} legacy notifications.`);

  const operations = docs.map((doc) => {
    const mergedData = {
      ...(doc.metadata || {}),
      ...(doc.data || {}),
    };

    const nextType = normalizeType(doc.type);

    return {
      updateOne: {
        filter: { _id: doc._id },
        update: {
          $set: {
            data: mergedData,
            type: nextType,
            updatedAt: new Date(),
          },
          $unset: {
            metadata: "",
          },
        },
      },
    };
  });

  if (DRY_RUN) {
    console.log("Dry run enabled. No writes performed.");
    console.log(`Would update ${operations.length} notifications.`);
    await mongoose.disconnect();
    return;
  }

  const result = await collection.bulkWrite(operations, { ordered: false });

  console.log("Migration completed.");
  console.log(`Matched: ${result.matchedCount}`);
  console.log(`Modified: ${result.modifiedCount}`);

  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error("Migration failed:", error);
  await mongoose.disconnect();
  process.exit(1);
});
