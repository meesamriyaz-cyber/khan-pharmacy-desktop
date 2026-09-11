import Product from "../models/Product.js";
import redis from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";
import dotenv from "dotenv";
dotenv.config();



/* ==================================================
   HELPERS
================================================== */

const uploadToCloudinary = async (file, folder = "products") => {
  const result = await cloudinary.uploader.upload(
    file.path || file,
    { folder }
  );

  return {
    url: result.secure_url,
    public_id: result.public_id,
  };
};

const deleteFromCloudinary = async (public_id) => {
  if (!public_id) return;
  try {
    await cloudinary.uploader.destroy(public_id);
  } catch (err) {
    console.error("Cloudinary delete failed:", err.message);
  }
};

/* ==================================================
   CREATE PRODUCT (MULTIPLE IMAGES)
================================================== */
export const addProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, images } = req.body;

    if (!name || !description || !price || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ message: "At least one image required" });
    }

    const productImages = [];

    for (let i = 0; i < images.length; i++) {
      const img = images[i];

      if (!img.data) {
        return res.status(400).json({ message: "Invalid image data" });
      }

      // 🔥 Upload base64 to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(img.data, {
        folder: "products",
      });

      productImages.push({
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
        altText: img.altText || "",
        isPrimary: img.isPrimary === true,
      });
    }

    // Ensure exactly one primary image
    if (!productImages.some((i) => i.isPrimary)) {
      productImages[0].isPrimary = true;
    } else {
      let primaryFound = false;
      productImages.forEach((img) => {
        if (img.isPrimary && !primaryFound) {
          primaryFound = true;
        } else {
          img.isPrimary = false;
        }
      });
    }

    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price,
      category,
      stock: Number(stock) || 0,
      images: productImages,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });

  } catch (error) {
    console.error("Add product error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/* ==================================================
   UPDATE PRODUCT
================================================== */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      description,
      price,
      category,
      stock,
      images,            // new images (base64)
      removeImageIds,    // cloudinary public_ids to delete
    } = req.body;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    /* ---------------- BASIC FIELDS ---------------- */
    if (name !== undefined) product.name = name.trim();
    if (description !== undefined) product.description = description.trim();
    if (price !== undefined) product.price = price;
    if (category !== undefined) product.category = category;
    if (stock !== undefined) product.stock = Number(stock);

    /* ---------------- REMOVE IMAGES ---------------- */
    if (Array.isArray(removeImageIds) && removeImageIds.length > 0) {
      for (const publicId of removeImageIds) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.warn("Cloudinary delete failed:", publicId);
        }
      }

      product.images = product.images.filter(
        (img) => !removeImageIds.includes(img.public_id)
      );
    }

    /* ---------------- ADD NEW IMAGES ---------------- */
    if (Array.isArray(images) && images.length > 0) {
      for (const img of images) {
        if (!img.data) continue;

        const uploaded = await cloudinary.uploader.upload(img.data, {
          folder: "products",
        });

        product.images.push({
          url: uploaded.secure_url,
          public_id: uploaded.public_id,
          altText: img.altText || "",
          isPrimary: img.isPrimary === true,
        });
      }
    }
    if (product.images.length === 0) {
  return res.status(400).json({ message: "Product must have at least one image" });
}

    /* ---------------- PRIMARY IMAGE SAFETY ---------------- */
    if (product.images.length > 0) {
      let primaryFound = false;

      product.images = product.images.map((img) => {
        if (img.isPrimary && !primaryFound) {
          primaryFound = true;
          return img;
        }
        return { ...img.toObject(), isPrimary: false };
      });

      if (!primaryFound) {
        product.images[0].isPrimary = true;
      }
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
/* ==================================================
   DELETE PRODUCT
================================================== */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    for (const img of product.images) {
      await deleteFromCloudinary(img.public_id);
    }

    await product.deleteOne();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ==================================================
   GETTERS (USED BY ROUTES)
================================================== */

export const getAllProducts = async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
};

export const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Not found" });
  res.json(product);
};

export const getProductsByCategory = async (req, res) => {
  const products = await Product.find({ category: req.params.category });
  res.json(products);
};

export const getFeaturedProducts = async (req, res) => {
  const products = await Product.find({ isFeatured: true });
  res.json(products);
};

export const getRecommendedProducts = async (req, res) => {
  const products = await Product.find().limit(6);
  res.json(products);
};

/* ==================================================
   FEATURED PRODUCT
================================================== */
export const setFeaturedProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  product.isFeatured = !product.isFeatured;
  await product.save();

  res.json({ success: true, product });
};

/* ==================================================
   STOCK (USED IN ORDER FLOW)
================================================== */
export const decreaseStock = async (req, res) => {
  try {
    const { quantity } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.stock -= quantity;
    if (product.stock < 0) product.stock = 0;

    await product.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
