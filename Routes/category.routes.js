/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category management APIs
 */
const categoryRouter = require("express").Router();
const categoryController = require("../Controllers/category.controller");
const { verifyJwt } = require("../Middlewares/verifyJwt.middleware");
const loggerMiddleware = require("../Middlewares/logger.middleware");
const { verifyRole } = require("../Middlewares/verifyRole.middleware");
/**
 * @swagger
 * /category/create:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *               icon:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Bad request
 */
categoryRouter.post(
  "/create",
  verifyJwt,
  loggerMiddleware,
  categoryController.createCategory
);

/**
 * @swagger
 * /category:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of all categories
 *       400:
 *         description: Bad request
 */
categoryRouter.get("/", categoryController.getAllCategories);

/**
 * @swagger
 * /category/{id}:
 *   get:
 *     summary: Get a category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The category ID
 *     responses:
 *       200:
 *         description: Category details
 *       404:
 *         description: Category not found
 */
categoryRouter.get("/:id", categoryController.getCategoryById);

/**
 * @swagger
 * /category/update/{id}:
 *   patch:
 *     summary: Update a category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The category ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *               icon:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Category not found
 */
categoryRouter.patch(
  "/update/:id",
  verifyJwt,
  loggerMiddleware,
  categoryController.updateCategory
);

/**
 * @swagger
 * /category/delete/{id}:
 *   delete:
 *     summary: Delete a category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Category not found
 */
categoryRouter.delete(
  "/delete/:id",
  verifyJwt,
  loggerMiddleware,
  verifyRole("superAdmin"),
  categoryController.deleteCategory
);
module.exports = categoryRouter;
