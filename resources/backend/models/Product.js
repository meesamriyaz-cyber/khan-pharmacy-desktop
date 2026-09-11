// models/Product.js
import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  public_id: { type: String, required: true }, // for safe deletion in Cloudinary
  altText: { type: String, default: "" },
  isPrimary: { type: Boolean, default: false }
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, min: 0, required: true },
    category: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
    // replaced single image with images array
    images: { type: [imageSchema], required: true, validate: v => v.length > 0 },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
