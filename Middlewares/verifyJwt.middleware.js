const jwt = require("jsonwebtoken");
const Admin = require("../Models/admin.model");

// @desc      verify jwt CIP_Token
exports.verifyJwt = async (req, res, next) => {
  try {
    let CIP_Token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      // set CIP_Token for Bearer CIP_Token
      CIP_Token = req.headers.authorization.split(" ")[1];
    }
    // Make Sure CIP_Token Is Exist
    if (!CIP_Token) {
      if (req.query.CIP_Token) {
        CIP_Token = req.query.CIP_Token;
      }
      if (!CIP_Token) {
        console.log("no CIP_Token");
        return res.status(401).json({
          success: false,
          message: "Not Authorize to Accesss this Route",
        });
      }
    }
    try {
      // verify CIP_Token
      const decoded = jwt.verify(CIP_Token, process.env.JWT_SECRET);
      req.admin = await Admin.findById(decoded.id).select("+password");
      if (!req.admin) {
        return res.status(404).json({
          success: false,
          message: "Admin not found or Invalid CIP_Token",
        });
      }
      next();
    } catch (err) {
      res.status(401).json({
        success: false,
        message: "Not Authorize to Access this Route",
      });
    }
  } catch (err) {
    console.log("err", err);
    return res
      .status(401)
      .json({ success: false, message: "Not Authorize to Access this Route" });
  }
};
