// controllers/prescriptionController.js
import Prescription from "../models/Prescription.js";
import cloudinary from "../lib/cloudinary.js"; // your existing config

export const uploadPrescription = async (req, res) => {
  try {
    const { image } = req.body; // base64 string

    if (!image) {
      return res.status(400).json({ success: false, message: "No image provided" });
    }

    // Upload to Cloudinary
    const uploadRes = await cloudinary.uploader.upload(image, {
      folder: "prescriptions",
      resource_type: "auto", // handles both images and pdfs
    });

    // Save in MongoDB
    const newPrescription = new Prescription({
      user: req.user._id,
      fileUrl: uploadRes.secure_url,
      publicId: uploadRes.public_id,
      status: "pending",
    });

    await newPrescription.save();

    res.json({ success: true, data: newPrescription });
  } catch (error) {
    console.error("Prescription upload failed:", error);
    res.status(500).json({ success: false, message: "Upload failed" });
  }
};

export const getUserPrescriptions = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const prescriptions = await Prescription.find(filter)
      .sort({ createdAt: -1 });

    res.json({ success: true, prescriptions });
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;

    const prescription = await Prescription.findById(id);

    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    // Ensure the logged-in user is the owner
    if (prescription.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(prescription);
  } catch (error) {
    console.error("Error fetching prescription:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//admin controllers

export const getAllPrescriptions = async (req, res) => {
  try {
    const { page = 1, status } = req.query;
    const limit = 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) filter.status = status;

    const total = await Prescription.countDocuments(filter);
    const prescriptions = await Prescription.find(filter)
      .populate("user", "fullName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      prescriptions,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
      },
    });
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



export const updatePrescriptionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const updated = await Prescription.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Prescription not found" });
    }

    res.json({ success: true, message: "Status updated", prescription: updated });
  } catch (error) {
    console.error("Error updating prescription status:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
