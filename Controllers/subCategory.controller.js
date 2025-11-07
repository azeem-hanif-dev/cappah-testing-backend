const SubCategory = require("../Models/subCategory.model");
const Product = require("../Models/product.model");
const path = require("path");
const uploadToCloudinary = require("../Middlewares/cloudinaryUploader.middleware");
const { v2: cloudinary } = require("cloudinary");
const { extractPublicId } = require("cloudinary-build-url");

const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create a new Sub Category
exports.createSubCategory = async (req, res) => {
  try {
    const { name, category } = req.body;

    if (!name || !category) {
      return res
        .status(400)
        .json({ succes: false, message: "All fields are required" });
    }

    const existingSubCategory = await SubCategory.findOne({ name });
    if (existingSubCategory) {
      return res.status(400).json({
        succes: false,
        message: "Sub Category already exists",
      });
    }

    const subCategory = new SubCategory({
      name,
      category,
    });

    const folderName = "Cappah_International";

    // Handle banner image upload
    // if (req.files && req.files.image) {
    //   const imageFile = req.files.image;

    //   // Upload to Cloudinary
    //   const cloudinaryUrl = await uploadToCloudinary(imageFile, folderName);
    //   subCategory.image = cloudinaryUrl;
    // } else {
    //   return res.status(400).json({
    //     success: false,
    //     message: "No file uploaded.",
    //   });
    // }

    await subCategory.save();
    res.status(201).json({ success: true, data: subCategory });
  } catch (error) {
    res.status(400).json({ succes: false, message: error.message });
  }
};

// Get all Sub categories
exports.getAllSubCategories = async (req, res) => {
  try {
    const subCategory = await SubCategory.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: subCategory });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server error" });
  }
};

// Get a single Sub category by ID
exports.getSubCategoryById = async (req, res) => {
  try {
    const subCategory = await SubCategory.find({ category: req.params.id });

    if (!subCategory) {
      return res
        .status(404)
        .json({ success: false, message: "Sub Category not found" });
    }

    res.status(200).json({ success: true, data: subCategory });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Update an existing Sub category by ID
exports.updateSubCategory = async (req, res) => {
  try {
    const { name, category, isActive } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (category) updateData.description = category;
    if (isActive !== undefined) updateData.isActive = isActive;
    console.log(updateData);

    const subCategory = await SubCategory.findById(req.params.id);
    if (!subCategory) {
      return res
        .status(404)
        .json({ success: false, message: "Sub Category not found" });
    }
    //Image Uploading to Cloudinary

    const folderName = "Cappah_International";

    // Handle banner image upload
    // if (req.files && req.files.image) {
    //   const bannerFile = req.files.image;
    //   const cloudinaryUrl = await uploadToCloudinary(
    //     bannerFile,
    //     folderName,
    //     subCategory.image // Pass the existing image URL to delete it
    //   );
    //   updateData.image = cloudinaryUrl;
    // }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required to update",
      });
    }

    const updatedSubCategory = await SubCategory.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedSubCategory) {
      return res
        .status(404)
        .json({ success: false, message: "Sub Category not found" });
    }

    res.status(200).json({ success: true, data: updatedSubCategory });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server error" });
  }
};

// Delete a subcategory by ID
exports.deleteSubCategory = async (req, res) => {
  try {
    // Check if the subcategory has any associated products
    const products = await Product.find({ subCategory: req.params.id });
    if (products.length > 0) {
      return res.status(400).json({
        status: false,
        message: "Can't delete!!! This subcategory is already in use.",
      });
    }

    // Find the subcategory to access its image before deletion
    const subCategory = await SubCategory.findById(req.params.id);
    if (!subCategory) {
      return res
        .status(404)
        .json({ success: false, message: "Subcategory not found" });
    }

    // Delete the subcategory's image if it exists
    if (subCategory.image) {
      // Delete the image from Cloudinary
      try {
        const publicId = extractPublicId(subCategory.image); // Extract public_id from the image URL
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
      }
    }

    // Delete the subcategory document
    await SubCategory.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Subcategory and image deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Get all sub categories by cat_id
exports.getSubCatByCatId = async (req, res) => {
  try {
    const subCatbyCatId = await SubCategory.find({ category: req.params.id });

    if (!subCatbyCatId) {
      return res.status(404).json({
        success: false,
        message: "Sub-Category/Categories by Category not found",
      });
    }

    res.status(200).json({ success: true, data: subCatbyCatId });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server error" });
  }
};
