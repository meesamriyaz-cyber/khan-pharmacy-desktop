// routes/prescriptionRoutes.js
import express from "express";
import {
  uploadPrescription,
  getUserPrescriptions,
  getPrescriptionById,
  getAllPrescriptions,
  updatePrescriptionStatus

} from "../controllers/prescriptionController.js";
import { protectedRoute, adminRoute } from "../middleware/productMiddleware.js";

const router = express.Router();

router.post("/uploads", protectedRoute, uploadPrescription);
router.get("/", protectedRoute, getUserPrescriptions);

// admin routes

router.get(
  "/all",
  protectedRoute,
  adminRoute,
  getAllPrescriptions,
);

router.get("/:id", protectedRoute, getPrescriptionById);

router.put(
  "/:id/status",
  protectedRoute,
  adminRoute,
  updatePrescriptionStatus
);

router.put("/:id/status", protectedRoute, adminRoute, updatePrescriptionStatus);

export default router;
