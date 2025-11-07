exports.verifyRole = (role) => {
  return (req, res, next) => {
    if (role !== req.admin.role) {
      return res.status(400).json({
        status: false,
        message: "Unauthorize access You are not Super Admin",
      });
    }
    next();
  };
};
