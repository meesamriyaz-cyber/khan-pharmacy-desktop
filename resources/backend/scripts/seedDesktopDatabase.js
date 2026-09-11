import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { BSON, EJSON } from "bson";

const mongoUri =
  process.env.DESKTOP_MONGO_URI || "mongodb://127.0.0.1:27018/haleem_medicose";
const seedPath = process.env.SEED_DATA_PATH;
const configPath = process.env.CONFIG_PATH;

function readBsonDocuments(filePath) {
  const buffer = fs.readFileSync(filePath);
  const documents = [];
  let offset = 0;

  while (offset < buffer.length) {
    const remaining = buffer.length - offset;
    if (remaining < 4) {
      break;
    }

    const size = buffer.readInt32LE(offset);
    if (size <= 0 || size > remaining) {
      throw new Error(`Invalid BSON document size in ${filePath} at byte ${offset}`);
    }

    documents.push(BSON.deserialize(buffer.subarray(offset, offset + size)));
    offset += size;
  }

  return documents;
}

function readJsonDocuments(filePath) {
  const text = fs.readFileSync(filePath, "utf8").trim();
  if (!text) {
    return [];
  }

  try {
    const parsed = EJSON.parse(text, { relaxed: false });
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => EJSON.parse(line, { relaxed: false }));
  }
}

function collectionNameFor(fileName) {
  return path.basename(fileName).replace(/\.(bson|json)$/i, "");
}

async function importFile(db, filePath) {
  const fileName = path.basename(filePath);
  const collectionName = collectionNameFor(fileName);
  const collection = db.collection(collectionName);
  const existingCount = await collection.estimatedDocumentCount();

  if (existingCount > 0) {
    console.log(`Seed skipped for ${collectionName}: collection already has data.`);
    return { collectionName, imported: 0, skipped: true };
  }

  const documents = fileName.toLowerCase().endsWith(".bson")
    ? readBsonDocuments(filePath)
    : readJsonDocuments(filePath);

  if (documents.length === 0) {
    console.log(`Seed skipped for ${collectionName}: file has no documents.`);
    return { collectionName, imported: 0, skipped: true };
  }

  await collection.insertMany(documents, { ordered: false });
  console.log(`Seed imported ${documents.length} documents into ${collectionName}.`);
  return { collectionName, imported: documents.length, skipped: false };
}

async function main() {
  if (!seedPath || !fs.existsSync(seedPath)) {
    console.log("No desktop seed data path found.");
    return;
  }

  const files = fs
    .readdirSync(seedPath)
    .filter((file) => /\.(bson|json)$/i.test(file))
    .filter((file) => !file.endsWith(".metadata.json"))
    .map((file) => path.join(seedPath, file));

  if (files.length === 0) {
    console.log("No desktop seed files found.");
    return;
  }

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    family: 4,
  });

  try {
    const db = mongoose.connection.db;
    const results = [];

    for (const file of files) {
      results.push(await importFile(db, file));
    }

    if (configPath) {
      fs.mkdirSync(configPath, { recursive: true });
      fs.writeFileSync(
        path.join(configPath, "seed-state.json"),
        JSON.stringify(
          {
            seededAt: new Date().toISOString(),
            seedPath,
            results,
          },
          null,
          2
        )
      );
    }
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error("Desktop database seed failed:", error);
  process.exit(1);
});
