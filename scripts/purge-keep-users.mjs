import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI. Run with --env-file=.env.local or set env vars.");
  process.exit(1);
}

const DRY_RUN = process.argv.includes("--dry-run");
const APPLY = process.argv.includes("--apply");

if (!DRY_RUN && !APPLY) {
  console.error("Specify one mode: --dry-run or --apply");
  process.exit(1);
}

const KEEP_COLLECTIONS = new Set(["users"]);

async function run() {
  await mongoose.connect(MONGODB_URI, {
    dbName: MONGODB_DB,
  });

  const db = mongoose.connection.db;
  const allCollections = await db.listCollections({}, { nameOnly: true }).toArray();
  const collectionNames = allCollections.map((c) => c.name);

  const protectedCollections = collectionNames.filter(
    (name) => name.startsWith("system.") || KEEP_COLLECTIONS.has(name),
  );

  const targetCollections = collectionNames.filter(
    (name) => !name.startsWith("system.") && !KEEP_COLLECTIONS.has(name),
  );

  console.log(`Database: ${MONGODB_DB || "(default)"}`);
  console.log(`Keeping collections: ${protectedCollections.join(", ") || "none"}`);

  if (targetCollections.length === 0) {
    console.log("No collections to purge. Nothing to do.");
    await mongoose.disconnect();
    return;
  }

  console.log(`Target collections (${targetCollections.length}): ${targetCollections.join(", ")}`);

  let totalDeleted = 0;

  for (const collectionName of targetCollections) {
    const collection = db.collection(collectionName);

    if (DRY_RUN) {
      const count = await collection.countDocuments();
      totalDeleted += count;
      console.log(`[dry-run] ${collectionName}: would delete ${count} documents`);
      continue;
    }

    const result = await collection.deleteMany({});
    totalDeleted += result.deletedCount || 0;
    console.log(`[apply] ${collectionName}: deleted ${result.deletedCount || 0} documents`);
  }

  if (DRY_RUN) {
    console.log(`Dry run complete. Total documents that would be deleted: ${totalDeleted}`);
  } else {
    console.log(`Purge complete. Total deleted documents: ${totalDeleted}`);
  }

  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error("Purge failed:", error);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
