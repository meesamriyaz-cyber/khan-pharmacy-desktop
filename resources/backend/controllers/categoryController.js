import Category from "../models/Category.js";

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to fetch categories",
    });
  }
};

export const addCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        error: "Invalid name",
        message: "Category name is required",
      });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });

    if (existingCategory) {
      return res.status(400).json({
        error: "Category exists",
        message: "A category with this name already exists",
      });
    }

    const newCategory = new Category({
      name: name.trim(),
      description: description?.trim() || "",
    });

    await newCategory.save();

    res.status(201).json({
      message: "Category added successfully",
      category: newCategory,
      success: true,
    });
  } catch (error) {
    console.error("Error adding category:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        error: "Validation failed",
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      error: "Internal server error",
      message: "An unexpected error occurred while creating the category",
    });
  }
};
