import express from "express";
import { getAddresses, addOrUpdateAddress } from "../controllers/addressController.js";
import { protectedRoute  } from "../middleware/productMiddleware.js"; // whatever auth middleware you use

const router = express.Router();
router.get("/", protectedRoute, getAddresses);
router.post("/", protectedRoute, addOrUpdateAddress);

export default router;