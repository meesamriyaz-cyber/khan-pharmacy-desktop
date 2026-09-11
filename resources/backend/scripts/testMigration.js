import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product.js";

dotenv.config();

async function testMigration() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.HALEEM_MEDICOSE_MONGO_URI);
    console.log("✅ MongoDB connected");

    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products`);

    let migrated = 0;
    let notMigrated = 0;

    for (const product of products) {
      if (
        Array.isArray(product.images) &&
        product.images.length > 0 &&
        !product.image
      ) {
        migrated++;
      } else {
        notMigrated++;
        console.log(
          `Not migrated: ${product.name}, images: ${JSON.stringify(
            product.images
          )}, image: ${product.image}`
        );
      }
    }

    console.log(`✅ Migrated: ${migrated}`);
    console.log(`❌ Not migrated: ${notMigrated}`);
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected");
    process.exit();
  }
}

testMigration();
