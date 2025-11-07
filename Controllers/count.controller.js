const Category = require("../Models/category.model");
const Product = require("../Models/product.model");
const SubCategory = require("../Models/subCategory.model");
const PotentialCustomer = require("../Models/potentialCustomer.model");
const Enquire = require("../Models/enquire.model");

exports.getAllCounts = async (req, res) => {
  try {
    const totalProductCount = await Product.countDocuments();
    const activeProductCount = await Product.countDocuments({ isActive: true });
    const inActiveProductCount = await Product.countDocuments({
      isActive: false,
    });

    const categoryCount = await Category.countDocuments();

    const subCategoryCount = await SubCategory.countDocuments();

    const potentialCustomerCount = await PotentialCustomer.countDocuments();

    const [getintouch, enquire] = await Promise.all([
      PotentialCustomer.countDocuments({ source: "get-in-touch" }),
      PotentialCustomer.countDocuments({ source: "enquire" }),
    ]);

    const enquireCount = await Enquire.countDocuments();

    const [PendingCount, CompletedCount] = await Promise.all([
      Enquire.countDocuments({ status: "pending" }),
      Enquire.countDocuments({ status: "completed" }),
    ]);

    const data = {
      totalProductCount,
      activeProductCount,
      inActiveProductCount,
      categoryCount,

      subCategoryCount,

      potentialCustomerCount,
      getintouch,
      enquire,

      enquireCount,
      PendingCount,
      CompletedCount,
    };

    res.status(200).json({ status: true, data });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Internal Server error",
      error: error.message,
    });
  }
};

exports.subCategoryCountByCategory = async (req, res) => {
  const categoryId = req.params.id;
  try {
    if (!categoryId)
      return res
        .status(400)
        .json({ status: false, message: "category id is required" });
    const subCategoryCountUsingCategoryID = await SubCategory.countDocuments({
      category: categoryId,
    });
    // if (!subCategoryCountUsingCategoryID)
    //   return res
    //     .status(404)
    //     .json({ status: false, message: "This category is no sub category" });
    res
      .status(200)
      .json({ status: true, count: subCategoryCountUsingCategoryID });
  } catch (error) {
    res.stauts(500).json({ status: false, message: "Internal Server error" });
  }
};

exports.productCountBySubCategory = async (req, res) => {
  const subCategoryId = req.params.id;
  try {
    // if (!subCategoryId)
    //   return res
    //     .status(400)
    //     .json({ status: false, message: "sub category id is required" });
    const productCounts = await Product.countDocuments({
      subCategory: subCategoryId,
      isActive: true,
    });
    // if (!productCounts)
    //   return res.status(404).json({
    //     status: false,
    //     message: "No Products available in this sub category",
    //   });
    res.status(200).json({ status: true, productCounts });
  } catch (error) {
    res.stauts(500).json({ status: false, message: "Internal Server error" });
  }
};
exports.productCountByCategory = async (req, res) => {
  const { categoryId } = req.body;
  try {
    // if (!categoryId)
    //   return res
    //     .status(400)
    //     .json({ status: false, message: "category id is required" });
    const productCounts = await Product.countDocuments({
      category: categoryId,
    });
    // if (!productCounts)
    //   return res.status(404).json({
    //     status: false,
    //     message: "No Products available in this category",
    //   });
    res.status(200).json({ status: true, productCounts });
  } catch (error) {
    res.stauts(500).json({ status: false, message: "Internal Server error" });
  }
};
