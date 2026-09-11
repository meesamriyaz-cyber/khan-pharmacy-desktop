// controllers/imageSearchController.js
// Handles the logic for image search

// For now, just return dummy keywords.
// Later you can plug in Google Vision, AWS Rekognition, etc.
exports.handleImageSearch = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    // Access the uploaded file buffer
    const imageBuffer = req.file.buffer;

    // TODO: Replace with actual image recognition logic
    const keywords = ["paracetamol", "tablet"];

    return res.json({ keywords });
  } catch (err) {
    console.error("Image search error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};