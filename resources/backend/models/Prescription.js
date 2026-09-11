// models/Prescription.js
import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fileUrl: { type: String, required: true },
    publicId: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    notes: String,
  },
  { timestamps: true }
);

export default mongoose.model("Prescription", prescriptionSchema);
