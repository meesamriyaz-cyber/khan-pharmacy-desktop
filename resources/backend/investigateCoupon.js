import mongoose from "mongoose";
import Coupon from "./models/Coupon.js";
import User from "./models/User.js"; // You'll need to import your User model
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/haleem_medicose"
    );
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

// Deep investigation of coupon system
const investigateCouponSystem = async () => {
  try {
    console.log("\n🔍 DEEP COUPON SYSTEM INVESTIGATION");
    console.log("=".repeat(60));

    // 1. Check database connection
    console.log("\n1. 📊 DATABASE STATUS");
    const dbStatus = mongoose.connection.readyState;
    console.log(
      `   Database Status: ${dbStatus === 1 ? "Connected" : "Disconnected"}`
    );
    console.log(`   Database Name: ${mongoose.connection.db.databaseName}`);

    // 2. Check if collections exist
    console.log("\n2. 🗃️ COLLECTIONS CHECK");
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    const collectionNames = collections.map((c) => c.name);
    console.log(`   Available collections: ${collectionNames.join(", ")}`);

    // Drop indexes if needed
    console.log("\n2.5. 🔧 FIXING INDEXES");
    try {
      const indexes = await mongoose.connection.db
        .collection("coupons")
        .indexes();
      console.log(
        "Current indexes on coupons:",
        indexes.map((i) => i.name)
      );
      // Drop unique index on userID
      await mongoose.connection.db.collection("coupons").dropIndex("userID_1");
      console.log("Dropped userID_1 index");
    } catch (error) {
      console.log("Error dropping index:", error.message);
    }

    // 3. Check coupon collection
    console.log("\n3. 🎫 COUPON COLLECTION ANALYSIS");
    const totalCoupons = await Coupon.countDocuments();
    console.log(`   Total coupons in database: ${totalCoupons}`);

    if (totalCoupons > 0) {
      const allCoupons = await Coupon.find({}).limit(10);
      console.log("\n   Sample coupons:");
      allCoupons.forEach((coupon, index) => {
        console.log(`   ${index + 1}. Code: ${coupon.code}`);
        console.log(`      Discount: ${coupon.discount}%`);
        console.log(`      Active: ${coupon.isActive}`);
        console.log(`      Expiration: ${coupon.expirationDate}`);
        console.log(`      UserID: ${coupon.userID}`);
        console.log(`      Created: ${coupon.createdAt}`);
        console.log("");
      });
    }

    // 4. Check users collection
    console.log("4. 👤 USER COLLECTION ANALYSIS");
    const totalUsers = await User.countDocuments();
    console.log(`   Total users in database: ${totalUsers}`);

    if (totalUsers > 0) {
      const allUsers = await User.find({}).limit(5);
      console.log("\n   Sample users:");
      allUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. Email: ${user.email}`);
        console.log(`      Name: ${user.fullName}`);
        console.log(`      ID: ${user._id}`);
        console.log("");
      });
    }

    // 5. Check for specific test data
    console.log("5. 🧪 TEST DATA VERIFICATION");

    // Look for test user
    const testUser = await User.findOne({ email: "test@example.com" });
    if (testUser) {
      console.log(
        `   ✅ Test user found: ${testUser.email} (ID: ${testUser._id})`
      );

      // Check coupons for test user
      const testUserCoupons = await Coupon.find({ userID: testUser._id });
      console.log(`   ✅ Coupons for test user: ${testUserCoupons.length}`);

      if (testUserCoupons.length > 0) {
        testUserCoupons.forEach((coupon) => {
          const now = new Date();
          const expiration = new Date(coupon.expirationDate);
          const isExpired = expiration <= now;

          console.log(`      - ${coupon.code}: ${coupon.discount}% off`);
          console.log(
            `        Expires: ${expiration.toDateString()} (${
              isExpired ? "EXPIRED" : "VALID"
            })`
          );
          console.log(`        Active: ${coupon.isActive}`);
        });
      } else {
        console.log("   ❌ No coupons found for test user");
      }
    } else {
      console.log("   ❌ Test user not found");
    }

    // 6. Simulate the exact query from the controller
    console.log("\n6. 🔍 QUERY SIMULATION");
    console.log("   Simulating the coupon validation query...");

    if (testUser) {
      const testCode = "WELCOME10";
      console.log(
        `   Querying for code: "${testCode}", userID: ${testUser._id}`
      );

      const query = {
        code: testCode,
        isActive: true,
        userID: testUser._id,
        expirationDate: { $gt: new Date() },
      };

      console.log("   Query object:", JSON.stringify(query, null, 2));

      const result = await Coupon.findOne(query);

      if (result) {
        console.log("   ✅ Query successful! Coupon found:");
        console.log(`      ${result.code}: ${result.discount}% off`);
        console.log(`      Expires: ${result.expirationDate}`);
      } else {
        console.log("   ❌ Query failed! No coupon found");

        // Let's debug why it failed
        console.log("\n   🔍 DEBUGGING QUERY FAILURE:");

        // Check each condition separately
        const debugTests = [
          { name: "Code match", query: { code: testCode } },
          { name: "Active status", query: { isActive: true } },
          { name: "User match", query: { userID: testUser._id } },
          {
            name: "Not expired",
            query: { expirationDate: { $gt: new Date() } },
          },
          { name: "Code + Active", query: { code: testCode, isActive: true } },
          {
            name: "User + Active",
            query: { userID: testUser._id, isActive: true },
          },
        ];

        for (const test of debugTests) {
          const count = await Coupon.countDocuments(test.query);
          console.log(`      ${test.name}: ${count} results`);
        }
      }
    }

    // 7. JWT Token Analysis (if available)
    console.log("\n7. 🔐 JWT TOKEN ANALYSIS");
    console.log("   Checking for JWT token in environment...");

    const jwtSecret = process.env.JWT_SECRET;
    if (jwtSecret) {
      console.log("   ✅ JWT_SECRET found in environment");

      // You would need to provide a test token to analyze it
      console.log("   💡 To analyze JWT tokens, provide one in the script");
    } else {
      console.log("   ❌ JWT_SECRET not found in environment");
    }

    console.log("\n" + "=".repeat(60));
    console.log("🎯 INVESTIGATION COMPLETE");
    console.log("\n📋 NEXT STEPS:");
    console.log("1. If no test data exists, run: node testCoupon.js");
    console.log("2. If test user exists but no coupons, check userID matching");
    console.log(
      "3. If query simulation fails, check each condition individually"
    );
    console.log("4. Verify JWT token contains correct user ID");
    console.log("5. Check authentication middleware is working correctly");
  } catch (error) {
    console.error("❌ Investigation failed:", error);
  }
};

// Run the investigation
const runInvestigation = async () => {
  await connectDB();
  await investigateCouponSystem();
  await mongoose.connection.close();
  console.log("\n🔚 Investigation complete. Database connection closed.");
};

// Export for use in other scripts
export { investigateCouponSystem, runInvestigation };

// Run if executed directly
if (require.main === module) {
  runInvestigation().catch(console.error);
}
