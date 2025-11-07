const { v2: cloudinary } = require("cloudinary");
const { extractPublicId } = require("cloudinary-build-url");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to upload to Cloudinary
const uploadToCloudinary = async (
  file,
  folderName,
  existingImageUrl = null
) => {
  try {
    // If an existing image URL is provided, delete the old image
    if (existingImageUrl) {
      const publicId = extractPublicId(existingImageUrl);
      await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    }

    // Upload the new image using the temporary file path
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: folderName,
      resource_type: "auto",
    });

    return result.secure_url;
  } catch (error) {
    throw new Error(`Error uploading to Cloudinary: ${error.message}`);
  }
};

module.exports = uploadToCloudinary;

// const cloudinary = require("cloudinary").v2;
// const fs = require("fs-extra");
// const { extractPublicId } = require("cloudinary-build-url");

// // Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // Middleware to upload to Cloudinary and optionally delete old image
// const uploadToCloudinary = async (filePath, folder, oldImageUrl = null) => {
//   try {
//     // If an old image URL is provided, extract its public ID and delete the old image
//     if (oldImageUrl) {
//       const oldImagePublicId = extractPublicId(oldImageUrl);
//       if (oldImagePublicId) {
//         await cloudinary.uploader.destroy(oldImagePublicId, {
//           resource_type: "image",
//         });
//       }
//     }

//     // Upload the new image
//     const result = await cloudinary.uploader.upload(filePath, {
//       folder: folder,
//       use_filename: true,
//       unique_filename: false,
//       resource_type: "image",
//       transformation: [
//         { width: 1000, crop: "scale" },
//         { quality: "auto:best" },
//         { fetch_format: "auto" },
//       ],
//     });

//     // Delete the local file
//     await fs.remove(filePath);

//     // Return the new image URL and its public ID
//     return result.secure_url; // Return Cloudinary URL
//   } catch (error) {
//     console.error("Error uploading to Cloudinary:", error);
//     throw error;
//   }
// };

// module.exports = uploadToCloudinary;
