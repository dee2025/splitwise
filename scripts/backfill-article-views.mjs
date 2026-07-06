import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI. Run with --env-file=.env.local or set env vars.");
  process.exit(1);
}

const DRY_RUN = process.argv.includes("--dry-run");

async function run() {
  await mongoose.connect(MONGODB_URI, {
    dbName: MONGODB_DB,
  });

  const collection = mongoose.connection.collection("articles");
  const query = {
    $or: [
      { views: { $exists: false } },
      { views: null },
      { views: { $type: "string" } },
    ],
  };

  const count = await collection.countDocuments(query);

  if (count === 0) {
    console.log("All articles already have numeric view counts.");
    await mongoose.disconnect();
    return;
  }

  if (DRY_RUN) {
    console.log("Dry run enabled. No writes performed.");
    console.log(`Would normalize ${count} articles to views: 0.`);
    await mongoose.disconnect();
    return;
  }

  const result = await collection.updateMany(query, {
    $set: {
      views: 0,
      updatedAt: new Date(),
    },
  });

  console.log("Article view backfill completed.");
  console.log(`Matched: ${result.matchedCount}`);
  console.log(`Modified: ${result.modifiedCount}`);

  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error("Article view backfill failed:", error);
  await mongoose.disconnect();
  process.exit(1);
});
