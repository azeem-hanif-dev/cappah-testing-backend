const express = require("express");
const countRouter = express.Router();
const countController = require("../Controllers/count.controller");

countRouter.get("/get-all-counts", countController.getAllCounts);
countRouter.get(
  "/sub-category-count-by-category-id/:id",
  countController.subCategoryCountByCategory
);
countRouter.get(
  "/products-count-by-sub-category-id/:id",
  countController.productCountBySubCategory
);
countRouter.get(
  "/products-count-by-category-id",
  countController.productCountByCategory
);

module.exports = countRouter;
