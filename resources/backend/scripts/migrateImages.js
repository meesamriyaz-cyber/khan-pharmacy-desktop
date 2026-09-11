import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product.js";

dotenv.config();

const generatePublicId = (url) => {
  // Cloudinary URLs usually contain /upload/...
  // We generate a deterministic fallback public_id
  try {
    const parts = url.split("/");
    const filename = parts[parts.length - 1];
    return `legacy/${filename.split(".")[0]}`;
  } catch {
    return `legacy/${new mongoose.Types.ObjectId()}`;
  }
};

async function migrateImages() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.HALEEM_MEDICOSE_MONGO_URI);
    console.log("✅ MongoDB connected");

    const cursor = Product.collection.find({});
    let migrated = 0;
    let skipped = 0;

    while (await cursor.hasNext()) {
      const product = await cursor.next();

      // ✅ Already migrated
      if (Array.isArray(product.images) && product.images.length > 0) {
        skipped++;
        continue;
      }

      // ✅ Legacy image exists
      if (typeof product.image === "string" && product.image.trim()) {
        const publicId = generatePublicId(product.image);

        await Product.collection.updateOne(
          { _id: product._id },
          {
            $set: {
              images: [
                {
                  url: product.image,
                  public_id: publicId,
                  altText: "",
                  isPrimary: true,
                },
              ],
            },
            $unset: { image: "" },
          }
        );

        migrated++;
        console.log(`🟢 Migrated: ${product.name} (${product._id})`);
      } else {
        skipped++;
      }
    }

    console.log("\n🎉 MIGRATION COMPLETE");
    console.log(`✅ Migrated: ${migrated}`);
    console.log(`⏭️ Skipped: ${skipped}`);
  } catch (err) {
    console.error("❌ Migration failed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected");
    process.exit(0);
  }
}

migrateImages();
