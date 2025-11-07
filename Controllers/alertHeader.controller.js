const Alert = require("../Models/alertHeader.model");

exports.alertHeaderUpdate = async (req, res) => {
  try {
    console.log("check data: ", req.body);

    const { textField } = req.body; // Extract `online` field from request body

    // Validate input
    if (!textField) {
      return res
        .status(400)
        .json({ success: false, message: "TextField field is required." });
    }

    // Find and update or create the document
    const updatedAlert = await Alert.findOneAndUpdate(
      {}, // Empty filter to find the first document
      { textField }, // Update the `online` field
      { new: true, upsert: true } // `new` returns the updated document; `upsert` creates a new one if none exists
    );

    // Return success response
    return res.status(200).json({ success: true, data: updatedAlert });
  } catch (error) {
    console.error("Error in alertHeaderUpdate:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.alertHeaderFind = async (req, res) => {
  try {
    const findUpdatedAlert = await Alert.findOne();
    return res.status(200).json({ success: true, data: findUpdatedAlert });
  } catch (error) {
    return res.status(200).json({ success: false, error: error.message });
  }
};
