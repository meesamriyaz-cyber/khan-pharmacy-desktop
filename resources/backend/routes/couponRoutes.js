import express from "express";
const router = express.Router();
import mongoose from "mongoose";
import {
  getCoupon,
  validateCoupon,
  createCouponIfEligible,
  markAsUsed,
  reactivateCoupon,
} from "../controllers/couponController.js";
import { protectedRoute, adminRoute } from "../middleware/productMiddleware.js";

router.get("/", protectedRoute, getCoupon);

router.post("/validate", protectedRoute, validateCoupon);

router.post("/create-if-eligible", protectedRoute, createCouponIfEligible);

router.post("/mark-as-used", protectedRoute, markAsUsed);

router.post("/reactivate", protectedRoute, reactivateCoupon);

router.get("/drop-index", async (req, res) => {
  try {
    await mongoose.connection.db.collection("coupons").dropIndex("userId_1");
    res.json({ message: "Index dropped" });
  } catch (error) {
    res.json({ error: error.message });
  }
});

export default router;
