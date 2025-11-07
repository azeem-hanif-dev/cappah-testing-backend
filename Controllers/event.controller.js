const uploadToCloudinary = require("../Middlewares/cloudinaryUploader.middleware");
const Event = require("../Models/event.model");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const { extractPublicId } = require("cloudinary-build-url");

// Create Event
exports.createEvent = async (req, res) => {
  try {
    const { title, description, link, location, fromDate, toDate, time } =
      req.body;

    if (!title || !location || !fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const newEvent = new Event({
      title,
      link,
      description,

      location,
      schedule: { fromDate, toDate },
      time,
    });

    const folderName = "Cappah_International";

    // Handle banner image upload
    if (req.files && req.files["banner"]) {
      const bannerFile = req.files["banner"];
      const cloudinaryUrl = await uploadToCloudinary(bannerFile, folderName);
      newEvent.bannerImage = cloudinaryUrl;
    }

    // Handle gallery images upload
    if (req.files && req.files["images"]) {
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
      if (newEvent.images.length + uploadedImages.length <= 4) {
        newEvent.images = [...newEvent.images, ...uploadedImages];
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Only 4 images are allowed." });
      }
    }

    await newEvent.save();

    res.status(201).json({
      success: true,
      message: "Event created successfully.",
      data: newEvent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating event.",
      error: error.message,
    });
  }
};

// Get All events
exports.getAllEvents = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Default to page 1, 5 events per page

    // Paginate the results
    const events = await Event.find()
      .sort({ "schedule.fromDate": -1 }) // Sort by start date (descending)
      .skip((page - 1) * limit) // Skip previous pages
      .limit(Number(limit)); // Limit the number of documents per page

    const totalEvents = await Event.countDocuments();

    res.status(200).json({
      success: true,
      totalEvents,
      totalPages: Math.ceil(totalEvents / limit),
      currentPage: Number(page),
      events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching events.",
      error: error.message,
    });
  }
};

// // Get Event by ID
exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the event by its ID
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching the event.",
      error: error.message,
    });
  }
};

// Get Event by status
exports.getEventsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const events = await Event.find({ status })
      .sort({ "schedule.fromDate": 1 })
      .skip(skip)
      .limit(limit);

    const total = await Event.countDocuments({ status });

    if (!events.length) {
      return res.status(404).json({
        success: false,
        message: `No ${status} events found.`,
      });
    }

    res.status(200).json({
      success: true,
      data: events,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalEvents: total,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching events.",
      error: error.message,
    });
  }
};

// Update the event
exports.updateEvent = async (req, res) => {
  try {
    const {
      title,
      description,

      link,
      fromDate,
      toDate,
      location,
      pastEventDetails,
      isActive,
    } = req.body;

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "No event found to update." });
    }

    if (fromDate && toDate && new Date(fromDate) >= new Date(toDate)) {
      return res.status(400).json({
        success: false,
        message: "fromDate must be earlier than toDate.",
      });
    }

    // Update fields
    if (title) event.title = title;
    if (description) event.description = description;
    if (link) event.link = link;
    if (fromDate) event.fromDate = fromDate;
    if (toDate) event.toDate = toDate;
    if (location) event.location = location;
    if (pastEventDetails) event.pastEventDetails = pastEventDetails;
    if (isActive !== undefined) event.isActive = isActive;

    const folderName = "Cappah_International";

    // Handle banner image upload
    if (req.files && req.files["banner"]) {
      const bannerFile = req.files["banner"];
      const cloudinaryUrl = await uploadToCloudinary(bannerFile, folderName);
      event.bannerImage = cloudinaryUrl;
    }

    // Handle gallery images upload
    if (req.files && req.files["images"]) {
      // Check if images array already has maximum allowed images
      if (event.images.length >= 4) {
        return res
          .status(400)
          .json({ success: false, message: "Maximum 4 images are allowed." });
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
      if (event.images.length + uploadedImages.length <= 4) {
        event.images = [...event.images, ...uploadedImages];
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Only 4 images are allowed." });
      }
    }

    await event.save();
    res
      .status(200)
      .json({ success: true, message: "Event updated successfully.", event });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating event.",
      error: error.message,
    });
  }
};

// Delete the event
exports.deleteEvent = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({
        success: false,
        message: "Event Id will be required.",
      });
    }

    // Find the event first to get image URLs
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "No event found to delete." });
    }

    // Delete banner image from Cloudinary if exists
    if (event.bannerImage) {
      try {
        const publicId = extractPublicId(event.bannerImage);
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error("Error deleting banner image from Cloudinary:", error);
      }
    }

    // Delete gallery images from Cloudinary if exist
    if (event.images && event.images.length > 0) {
      const deletePromises = event.images.map((imageUrl) => {
        const publicId = extractPublicId(imageUrl);
        return cloudinary.uploader.destroy(publicId);
      });

      try {
        await Promise.all(deletePromises);
      } catch (error) {
        console.error("Error deleting gallery images from Cloudinary:", error);
      }
    }

    // Delete the event from database
    await Event.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Event and associated images deleted successfully.",
    });
  } catch (error) {
    console.error("Error in deleteEvent:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting event.",
      error: error.message,
    });
  }
};

// Status Change of Event
exports.statusChangeOfEvent = async (req, res) => {
  try {
    const { isActive } = req.body;

    // Create an object with only the fields that are not undefined
    const updateData = { isActive };

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required to update the event",
      });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedEvent) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    res.status(200).json({ success: true, data: updatedEvent });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating event status",
      error: error.message,
    });
  }
};
