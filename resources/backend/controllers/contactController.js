// controllers/contactController.js
import Contact from "../models/Contact.js";

/**
 * POST /api/contact
 * Save incoming contact message
 */
export const createContact = async (req, res) => {
  try {
    const { name, email, subject = "", message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "Name, email and message are required." });
    }

    // basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Invalid email address." });
    }

    const ip = req.ip || req.headers["x-forwarded-for"] || null;
    const user = req.user?.id || null; // if you set req.user in protectedRoute

    const contact = await Contact.create({
      name,
      email,
      subject,
      message,
      ip,
      user
    });

    // OPTIONAL: send notification email to admin here (e.g., nodemailer)
    // await sendAdminNotification(contact);

    return res.status(201).json({ message: "Contact saved.", contactId: contact._id });
  } catch (err) {
    console.error("createContact error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

/**
 * GET /api/contact
 * (Optional) Admin: list messages
 * Protect this route with admin middleware
 */
export const listContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 }).limit(200); // limit to recent 200
    return res.json({ contacts });
  } catch (err) {
    console.error("listContacts error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};
