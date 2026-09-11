import express from "express";
import {
  getAllCategories,
  addCategory,
} from "../controllers/categoryController.js";
import { protectedRoute, adminRoute } from "../middleware/productMiddleware.js";

const router = express.Router();

router.get("/", getAllCategories);
router.post("/add", protectedRoute, adminRoute, addCategory);

export default router;
