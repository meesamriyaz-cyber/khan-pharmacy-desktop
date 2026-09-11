import mongoose from "mongoose";

const PendingPaymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  razorpayOrderId: { type: String, index: true },
  razorpayPaymentId: { type: String, index: true },
  signature: { type: String },
  cartSnapshot: { type: Array, default: [] }, // store items so server can recompute totals if needed
  totalAmount: { type: Number },
  couponApplied: { type: mongoose.Schema.Types.Mixed },
  status: { type: String, enum: ["pending", "completed", "cancelled"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date } // optional cleanup TTL
});

const PendingPayment =  mongoose.model("PendingPayment", PendingPaymentSchema);
export default PendingPayment;
