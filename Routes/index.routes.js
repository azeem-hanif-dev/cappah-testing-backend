const express = require("express");
const router = express.Router();

const productRouter = require("./product.routes");
const eventRouter = require("./event.routes");
const contactRouter = require("./contact.routes");
const subscribeRouter = require("./subscribe.routes");
const categoryRouter = require("./category.routes");
const subCategoryRouter = require("./subCategory.routes");
const adminRouter = require("./admin.routes");
const authRouter = require("./auth.routes");
const countRouter = require("./counter.routes");
const enquireRouter = require("./enquire.routes");
const potentialCustomerRoute = require("./potentialCustomer.routes");
const alertHeaderRoute = require("./alertHeader.routes");
const permissionRouter = require("./permission.routes");
const logoRouter = require("./logo.routes");
const loggerRouter = require("./logger.routes");

router.use("/api/v1/product", productRouter);
router.use("/api/v1/event", eventRouter);
router.use("/api/v1/get-in-touch", contactRouter);
router.use("/api/v1/subscribe", subscribeRouter);
router.use("/api/v1/category", categoryRouter);
router.use("/api/v1/sub-category", subCategoryRouter);
router.use("/api/v1/admin", adminRouter);
router.use("/api/v1/auth", authRouter);
router.use("/api/v1/count", countRouter);
router.use("/api/v1/enquire", enquireRouter);
router.use("/api/v1/permission", permissionRouter);
router.use("/api/v1/logo", logoRouter);
router.use("/api/v1/logger", loggerRouter);

////////   Ali work this 2 route
router.use("/api/v1/potential-customer", potentialCustomerRoute);
router.use("/api/v1/alert-header", alertHeaderRoute);

module.exports = router;
