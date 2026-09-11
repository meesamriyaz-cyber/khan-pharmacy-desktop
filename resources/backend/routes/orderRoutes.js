import express from "express";
import { adminRoute, protectedRoute } from "../middleware/productMiddleware.js";
import {
  listUserOrders,
  getOrderById,
  downloadInvoice,
  getAllOrders,
  updateOrderStatus,
  downloadInvoiceAdmin
} from "../controllers/orderController.js";

const router = express.Router();

// List with pagination & filters
router.get("/", protectedRoute, listUserOrders);
router.get("/allorders", protectedRoute, adminRoute, getAllOrders);

// Get one order
router.get("/:id", protectedRoute, getOrderById);

// Download invoice as PDF
router.get("/:id/invoice", protectedRoute, downloadInvoice);
router.get("/admin/:id/invoice", protectedRoute, adminRoute, downloadInvoiceAdmin);

router.put("/:id/status", protectedRoute, adminRoute, updateOrderStatus);




export default router;
