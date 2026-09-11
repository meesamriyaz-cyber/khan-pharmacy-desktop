// models/Contact.js
import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    subject: { type: String, trim: true, default: "" },
    message: { type: String, required: true, trim: true },
    ip: { type: String }, // optional: store sender IP
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // optional
    status: { type: String, enum: ["new", "in_progress", "resolved"], default: "new" }
  },
  { timestamps: true }
);

const Contact = mongoose.models.Contact || mongoose.model("Contact", contactSchema);
export default Contact;
