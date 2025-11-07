const Logo = require("../Models/logo.model");
const path = require("path");
const uploadToCloudinary = require("../Middlewares/cloudinaryUploader.middleware"); // Assuming you have this middleware

// Create a new logo
exports.createLogo = async (req, res) => {
  try {
    const { name } = req.body;

    if (
      !name ||
      !req.files ||
      !req.files["image"] ||
      req.files["image"].length === 0
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Name and Image are required." });
    }

    const imageFile = req.files["image"][0];
    const localFilePath = path.resolve(imageFile.path);
    const folderName = "Cappah_International";
    const cloudinaryUrl = await uploadToCloudinary(localFilePath, folderName);

    const logo = new Logo({ name, image: cloudinaryUrl });

    await logo.save();
    res.status(201).json({
      success: true,
      message: "Logo created successfully.",
      data: logo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating logo: " + error.message,
    });
  }
};

// Get all logos
exports.getAllLogos = async (req, res) => {
  try {
    const logos = await Logo.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: "Logos retrieved successfully.",
      data: logos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving logos: " + error.message,
    });
  }
};

// Get a single logo by ID
exports.getLogoById = async (req, res) => {
  try {
    const logo = await Logo.findById(req.params.id);

    if (!logo) {
      return res
        .status(404)
        .json({ success: false, message: "Logo not found." });
    }

    res.status(200).json({
      success: true,
      message: "Logo retrieved successfully.",
      data: logo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving logo: " + error.message,
    });
  }
};

// Update a logo by ID
exports.updateLogo = async (req, res) => {
  try {
    const { name, isActive } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (isActive !== undefined) updateData.isActive = isActive;

    const logo = await Logo.findById(req.params.id);
    if (!logo) {
      return res
        .status(404)
        .json({ success: false, message: "Logo not found." });
    }

    const folderName = "Cappah_International";

    // Handle image update
    if (req.files && req.files["image"] && req.files["image"][0]) {
      const imageFile = req.files["image"][0];
      const localFilePath = path.resolve(imageFile.path);
      const cloudinaryUrl = await uploadToCloudinary(
        localFilePath,
        folderName,
        logo.image
      );
      updateData.image = cloudinaryUrl;
    }

    const updatedLogo = await Logo.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Logo updated successfully.",
      data: updatedLogo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating logo: " + error.message,
    });
  }
};

// Soft delete a logo by ID
exports.deleteLogo = async (req, res) => {
  try {
    const logo = await Logo.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!logo) {
      return res
        .status(404)
        .json({ success: false, message: "Logo not found." });
    }

    res.status(200).json({
      success: true,
      message: "Logo deleted successfully.",
      data: logo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting logo: " + error.message,
    });
  }
};
