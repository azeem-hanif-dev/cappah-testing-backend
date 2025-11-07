const Logger = require("../Models/logger.model");

exports.getAllLogs = async (req, res) => {
  try {
    // Get the `page` and `limit` query parameters with default values
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 entries per page

    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;

    // Fetch logs with pagination and sort by creation date
    const logs = await Logger.find()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    // Get the total count of logs
    const totalLogs = await Logger.countDocuments();

    res.status(200).json({
      status: true,
      data: logs,
      pagination: {
        total: totalLogs,
        page,
        limit,
        totalPages: Math.ceil(totalLogs / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ status: false, message: "Internal Server error" });
  }
};
