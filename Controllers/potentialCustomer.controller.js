const PotentialCustomer = require("../Models/potentialCustomer.model");

exports.potentialCustomer = async (req, res) => {
  try {
    const potentialCustomers = await PotentialCustomer.find();

    return res.status(200).json({
      success: true,
      data: potentialCustomers,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
