// routes/imageSearchRoutes.js
const express = require("express");
const multer = require("multer");
const { handleImageSearch } = require("../controllers/imageSearchController");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/image-search
router.post("/", upload.single("image"), handleImageSearch);

module.exports = router;