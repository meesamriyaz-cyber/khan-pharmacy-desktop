import express from "express";
import User from "../models/User.js";
export const getAddresses = async (req, res) => {
  try {
    if (!req.user || !req.user._id) return res.status(401).json({ success: false, message: "Auth required" });
    const user = await User.findById(req.user._id).select("addresses");
    return res.status(200).json({ success: true, addresses: user?.addresses || [] });
  } catch (err) {
    console.error("getAddresses error", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const addOrUpdateAddress = async (req, res) => {
  try {
    const userId = req.user && req.user._id;
    if (!userId) return res.status(401).json({ success: false, message: "Auth required" });

    const addr = req.body;
    // Validate fields server-side: addressLine1, city, pincode, phone, lat/lon etc.

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Simple push; you can detect duplicates or update an existing address by id.
    user.addresses = user.addresses || [];
    const isFirst = user.addresses.length === 0;
    user.addresses.push({ ...addr, primary: isFirst }); // mark primary if first

    await user.save();
    return res.status(200).json({ success: true, addresses: user.addresses });
  } catch (err) {
    console.error("addOrUpdateAddress", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};