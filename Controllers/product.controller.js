const Product = require("../Models/product.model"); // Import the Product model
const path = require("path");
const uploadToCloudinary = require("../Middlewares/cloudinaryUploader.middleware");
const cloudinary = require("cloudinary").v2;
const { extractPublicId } = require("cloudinary-build-url");

// Helper function to validate product fields
const validateProduct = async (data) => {
  const errors = [];

  if (!data.title || typeof data.title !== "string") {
    errors.push("Title is required and must be a string.");
  }
  if (!data.description || typeof data.description !== "string") {
    errors.push("Description is required and must be a string.");
  }
  if (!data.category || typeof data.category !== "string") {
    errors.push("Category is required and must be a string.");
  }
  if (!data.productCode || typeof data.productCode !== "string") {
    errors.push("Product Code is required and must be a string.");
  }
  const duplicateProduct = await Product.find({
    productCode: data.productCode,
  });
  if (duplicateProduct) {
    errors.push("This product is Already exists");
  }

  return errors;
};

// Create a new product
exports.createProduct = async (req, res) => {
  const validationErrors = validateProduct(req.body);
  if (validationErrors.length > 0) {
    return res.status(400).json({ success: false, errors: validationErrors });
  }

  try {
    const product = new Product(req.body);

    const folderName = "Cappah_International";
    // Handle gallery images upload
    let images = req.files.images;
    // Convert to array if single file
    if (!Array.isArray(images)) {
      images = [images];
    }

    const uploadedImages = await Promise.all(
      images.map(async (file) => {
        const cloudinaryUrl = await uploadToCloudinary(file, folderName);
        return cloudinaryUrl;
      })
    );
    product.images = uploadedImages;

    await product.save();
    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a single product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id); // Retrieve product by ID
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a product by ID
exports.updateProduct = async (req, res) => {
  const validationErrors = validateProduct(req.body); // Assuming you have a validation function
  if (validationErrors.length > 0) {
    return res.status(400).json({ success: false, errors: validationErrors });
  }

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const {
      title,
      description,
      category,
      subCategory,
      productCode,
      colors,
      size,
      isActive,
    } = req.body;

    // Update fields
    if (title) product.title = title;
    if (description) product.description = description;
    if (category) product.category = category;
    if (subCategory) product.subCategory = subCategory;
    if (productCode) product.productCode = productCode;
    if (colors) product.colors = colors;
    if (size) product.size = size;
    if (isActive !== undefined) product.isActive = isActive;

    const folderName = "Cappah_International";

    // Handle gallery images upload
    if (req.files && req.files["images"]) {
      // Check if images array already has maximum allowed images
      if (product.images.length >= 4) {
        return res.status(400).json({
          success: false,
          message: "Maximum 4 images are allowed.",
        });
      }

      const uploadedImages = [];

      // Check if it's a single image or multiple images
      if (!Array.isArray(req.files["images"])) {
        // Single image
        const cloudinaryUrl = await uploadToCloudinary(
          req.files["images"],
          folderName
        );
        uploadedImages.push(cloudinaryUrl);
      } else {
        // Multiple images
        for (const file of req.files["images"]) {
          const cloudinaryUrl = await uploadToCloudinary(file, folderName);
          uploadedImages.push(cloudinaryUrl);
        }
      }

      // Add uploaded images to the existing images array (max 4 images)
      if (product.images.length + uploadedImages.length <= 4) {
        product.images = [...product.images, ...uploadedImages];
      } else {
        return res.status(400).json({
          success: false,
          message: "Only 4 images are allowed.",
        });
      }
    }

    await product.save();
    res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating product.",
      error: error.message,
    });
  }
};

// // Delete a product by ID

// Delete the product by ID
exports.deleteProduct = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required.",
      });
    }

    // Find the product first to get image URLs
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "No product found to delete." });
    }

    // Delete main image from Cloudinary if exists
    if (product.image) {
      try {
        const publicId = extractPublicId(product.image);
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error("Error deleting main image from Cloudinary:", error);
      }
    }

    // Delete gallery images from Cloudinary if they exist
    if (product.images && product.images.length > 0) {
      const deletePromises = product.images.map((imageUrl) => {
        const publicId = extractPublicId(imageUrl);
        return cloudinary.uploader.destroy(publicId);
      });

      try {
        await Promise.all(deletePromises);
      } catch (error) {
        console.error("Error deleting gallery images from Cloudinary:", error);
      }
    }

    // Delete the product from the database
    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Product and associated images deleted successfully.",
    });
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting product.",
      error: error.message,
    });
  }
};

// Get products by catagory ID
exports.getProductByCategoryId = async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.id });
    if (!products) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found", products: [] });
    }
    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get products by sub-catagory ID
exports.getProductBySubCategoryId = async (req, res) => {
  try {
    const products = await Product.find({ subCategory: req.params.id });
    if (!products) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found", products: [] });
    }
    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get related products by category or sub-category ID
exports.getAllRelatedProducts = async (req, res) => {
  try {
    const { id } = req.params; // Single id passed in the request

    // Query to match category or subCategory with the provided id
    const products = await Product.find({
      $or: [{ category: id }, { subCategory: id }],
    });

    if (!products || products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No products found",
        products: [],
      });
    }

    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadImage = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const folderName = "Cappah_International";

    // Handle gallery images upload
    if (req.files && req.files["images"]) {
      // Check if images array already has maximum allowed images
      if (product.images.length >= 4) {
        return res.status(400).json({
          success: false,
          message: "Maximum 4 images are allowed.",
        });
      }

      const uploadedImages = [];

      // Check if it's a single image or multiple images
      if (!Array.isArray(req.files["images"])) {
        // Single image
        const cloudinaryUrl = await uploadToCloudinary(
          req.files["images"],
          folderName
        );
        uploadedImages.push(cloudinaryUrl);
      } else {
        // Multiple images
        for (const file of req.files["images"]) {
          const cloudinaryUrl = await uploadToCloudinary(file, folderName);
          uploadedImages.push(cloudinaryUrl);
        }
      }

      // Add uploaded images to the existing images array (max 4 images)
      if (product.images.length + uploadedImages.length <= 4) {
        product.images = [...product.images, ...uploadedImages];
        await product.save();
        return res.status(201).json({
          success: true,
          message: "Images uploaded successfully",
          data: product,
        });
      }
      return res.status(400).json({
        success: false,
        message: "Only 4 images are allowed.",
      });
    }

    return res.status(400).json({
      success: false,
      message: "No images uploaded",
    });
  } catch (error) {
    console.error("Error in uploadImage:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server error",
    });
  }
};

// Delete Product image
exports.deleteProductImage = async (req, res) => {
  try {
    const { imagePath } = req.body;

    // Find product by ID
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Check if the image exists in the product
    if (!product.images.includes(imagePath)) {
      return res
        .status(400)
        .json({ success: false, message: "Image not found in product" });
    }

    // Delete the image from Cloudinary
    try {
      const publicId = extractPublicId(imagePath); // Extract public_id from the image URL
      await cloudinary.uploader.destroy(publicId); // Delete image from Cloudinary
    } catch (error) {
      console.error("Error deleting image from Cloudinary:", error);
      return res.status(500).json({
        success: false,
        message: "Error deleting image from Cloudinary",
      });
    }

    // Filter the image array to remove the specified link
    product.images = product.images.filter((image) => image !== imagePath);

    // Save the updated product
    await product.save();

    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error("Error in deleteImagePath:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
