// controllers/productController.js
const Category = require("../Models/category.model");
const SubCategory = require("../Models/subCategory.model");
const Product = require("../Models/product.model");
const path = require("path");
const uploadToCloudinary = require("../Middlewares/cloudinaryUploader.middleware");
const { v2: cloudinary } = require("cloudinary");
const { extractPublicId } = require("cloudinary-build-url");

// Create a new product
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res
        .status(400)
        .json({ succes: false, message: "All fields are required" });
    }

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        succes: false,
        message: "Category with this name already exists",
      });
    }

    const category = new Category({
      name,
      description,
    });

    const folderName = "Cappah_International";

    if (req.files && req.files.image) {
      const imageFile = req.files.image;
      const cloudinaryUrl = await uploadToCloudinary(imageFile, folderName);
      category.image = cloudinaryUrl;
    } else {
      return res.status(400).json({
        success: false,
        message: "No file uploaded.",
      });
    }

    if (req.files && req.files.icon) {
      const iconFile = req.files.icon;
      const cloudinaryUrl = await uploadToCloudinary(iconFile, folderName);
      category.icon = cloudinaryUrl;
    }

    await category.save();
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({ succes: false, message: error.message });
  }
};

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get a single category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update Category
exports.updateCategory = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    const folderName = "Cappah_International";

    // Handle image update
    if (req.files && req.files.image) {
      const bannerFile = req.files.image;
      const cloudinaryUrl = await uploadToCloudinary(
        bannerFile,
        folderName,
        category.image
      );
      updateData.image = cloudinaryUrl;
    }

    // Handle icon update
    if (req.files && req.files.icon) {
      const iconFile = req.files.icon;
      const cloudinaryUrl = await uploadToCloudinary(
        iconFile,
        folderName,
        category.icon
      );
      updateData.icon = cloudinaryUrl;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required to update",
      });
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    res.status(200).json({ success: true, data: updatedCategory });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete a category by ID
exports.deleteCategory = async (req, res) => {
  try {
    // Check if the category has any subcategories
    const subCategory = await SubCategory.find({ category: req.params.id });
    if (subCategory.length > 0) {
      return res.status(400).json({
        status: false,
        message: "Can't Delete!!! This category is already in use.",
      });
    }

    // Check if the category has any associated products
    const products = await Product.find({ category: req.params.id });
    if (products.length > 0) {
      return res.status(400).json({
        status: false,
        message: "Can't Delete!!! This Category is already in use.",
      });
    }

    // Find the category to access its image before deletion
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    // Delete the category's image if it exists
    if (category.image) {
      // Delete the image from Cloudinary
      try {
        const publicId = extractPublicId(category.image); // Extract public_id from the image URL
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
      }
    }
    // Delete the category's image if it exists
    if (category.icon) {
      // Delete the image from Cloudinary
      try {
        const publicId = extractPublicId(category.icon); // Extract public_id from the image URL
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error("Error deleting icon from Cloudinary:", error);
      }
    }

    // Delete the category document
    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Category and image deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
