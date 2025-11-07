const express = require("express");
const subcategoryRouter = express.Router();
const subcategoryController = require("../Controllers/subCategory.controller");
const { verifyJwt } = require("../Middlewares/verifyJwt.middleware");
const loggerMiddleware = require("../Middlewares/logger.middleware");

/**
 * @swagger
 * tags:
 *   - name: Subcategory
 *     description: Subcategory management APIs
 */

/**
 * @swagger
 * /sub-category/create:
 *   post:
 *     tags: [Subcategory]
 *     summary: Create a new subcategory with an image
 *     description: This endpoint allows the creation of a new subcategory with an image upload.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the subcategory.
 *                 example: "Electronics"
 *               category:
 *                 type: string
 *                 description: The name of the parent category.
 *                 example: "60d5f77b9c4f5c1d4f52a39e"
 *               description:
 *                 type: string
 *                 description: A brief description of the subcategory.
 *                 example: "Electronics items"
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Upload an image for the subcategory.
 *     responses:
 *       201:
 *         description: Subcategory created successfully
 *       400:
 *         description: Invalid input or validation errors
 *       500:
 *         description: Internal server error
 */
subcategoryRouter.post(
  "/create",
  verifyJwt,
  loggerMiddleware,
  subcategoryController.createSubCategory
);

/**
 * @swagger
 * /sub-category:
 *   get:
 *     tags: [Subcategory]
 *     summary: Get all subcategories
 *     description: Retrieve all subcategories.
 *     responses:
 *       200:
 *         description: A list of subcategories
 *       500:
 *         description: Internal server error
 */
subcategoryRouter.get("/", subcategoryController.getAllSubCategories);

/**
 * @swagger
 * /sub-category/{id}:
 *   get:
 *     tags: [Subcategory]
 *     summary: Get a single subcategory by ID
 *     description: Retrieve a single subcategory by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the subcategory to retrieve.
 *     responses:
 *       200:
 *         description: Subcategory retrieved successfully
 *       404:
 *         description: Subcategory not found
 *       500:
 *         description: Internal server error
 */
subcategoryRouter.get("/:id", subcategoryController.getSubCategoryById);

/**
 * @swagger
 * /sub-category/update/{id}:
 *   patch:
 *     tags: [Subcategory]
 *     summary: Update a subcategory by ID
 *     description: Update an existing subcategory.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the subcategory to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The updated name of the subcategory.
 *                 example: "Updated Electronics"
 *               description:
 *                 type: string
 *                 description: Updated description.
 *                 example: "Updated electronics description."
 *     responses:
 *       200:
 *         description: Subcategory updated successfully
 *       404:
 *         description: Subcategory not found
 *       500:
 *         description: Internal server error
 */
subcategoryRouter.patch(
  "/update/:id",
  // verifyJwt,
  loggerMiddleware,
  subcategoryController.updateSubCategory
);

/**
 * @swagger
 * /sub-category/delete/{id}:
 *   delete:
 *     tags: [Subcategory]
 *     summary: Delete a subcategory by ID
 *     description: Delete a subcategory by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the subcategory to delete.
 *     responses:
 *       200:
 *         description: Subcategory deleted successfully
 *       404:
 *         description: Subcategory not found
 *       500:
 *         description: Internal server error
 */
subcategoryRouter.delete(
  "/delete/:id",
  verifyJwt,
  loggerMiddleware,
  subcategoryController.deleteSubCategory
);

module.exports = subcategoryRouter;
