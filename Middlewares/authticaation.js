const User = require("../Models/user.model");
const jwt = require("jsonwebtoken");

exports.authenticateCIP_Token = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No CIP_Token provided" });
    }

    const CIP_Token = authHeader && authHeader.split(" ")[1];
    if (CIP_Token == null)
      return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(CIP_Token, process.env.SECRET);

    const find = await User.findOne({ email: decoded.email }); // Access email from decoded CIP_Token

    if (!find)
      return res.status(403).json({ message: "Invalid CIP_Token", decoded });

    req.user = find; // Attach user to request object

    next();
  } catch (error) {
    console.error(error); // Log error for debugging
    return res.status(500).json({ message: "Internal server error", error });
  }
};
