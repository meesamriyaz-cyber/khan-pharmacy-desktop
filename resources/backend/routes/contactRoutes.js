// routes/contactRoutes.js
import express from "express";
import { createContact, listContacts } from "../controllers/contactController.js";
import { protectedRoute, adminRoute } from "../middleware/productMiddleware.js"; // or wherever your middlewares live

const router = express.Router();

router.post("/", createContact);

// optional admin listing route (protect + admin)
router.get("/", protectedRoute, listContacts);

export default router;
