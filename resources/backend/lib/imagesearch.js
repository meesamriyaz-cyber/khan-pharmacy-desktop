// server.js
const express = require("express");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const app = express();

app.post("/api/image-search", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No image" });

  // 👉 Replace this with Google Vision / AWS Rekognition / custom ML
  // For now, just return dummy keywords
  const keywords = ["paracetamol", "tablet"];

  res.json({ keywords });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));