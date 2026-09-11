  import express from "express";
  import {
    getAllProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct,
    setFeaturedProduct,
    getProductsByCategory,
    getRecommendedProducts,
    getFeaturedProducts,
    decreaseStock,
  } from "../controllers/productController.js";
  import { protectedRoute, adminRoute } from "../middleware/productMiddleware.js";
  const router = express.Router();
  router.get("/", getAllProducts);
  router.get("/featured", getFeaturedProducts);
  router.get("/category/:category", getProductsByCategory);
  router.get("/recommendations", getRecommendedProducts);
  router.post("/addproduct", addProduct);
  router.get("/:id", getProductById);
  router.put("/:id", updateProduct);
  router.put("/:id/decrease-stock", decreaseStock);
  router.patch("/:id", protectedRoute, adminRoute, setFeaturedProduct);
  router.delete("/:id", deleteProduct);
  export default router;
