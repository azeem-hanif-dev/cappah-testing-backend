/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management APIs
 */
const express = require("express");
const productRouter = express.Router();
const productController = require("../Controllers/product.controller");
const { verifyJwt } = require("../Middlewares/verifyJwt.middleware");
const loggerMiddleware = require("../Middlewares/logger.middleware");
const checkPermission = require("../Middlewares/permission.middleware");
const { verifyRole } = require("../Middlewares/verifyRole.middleware");

/**
 * @swagger
 * /product/create:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               productCode:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Validation error or bad request
 *       500:
 *         description: Internal server error
 */

productRouter.post(
  "/create",
  verifyJwt,
  loggerMiddleware,
  productController.createProduct
);

/**
 * @swagger
 * /product/get-products-by-category-id/{id}:
 *   get:
 *     summary: Get products by category ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Successfully retrieved products
 *       404:
 *         description: No products found for the given category ID
 *       500:
 *         description: Internal server error
 */

productRouter.get(
  "/get-products-by-category-id/:id",
  productController.getProductByCategoryId
);

/**
 * @swagger
 * /product/get-products-by-sub-category-id/{id}:
 *   get:
 *     summary: Get products by sub-category ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sub-category ID
 *     responses:
 *       200:
 *         description: Successfully retrieved products
 *       404:
 *         description: No products found for the given sub-category ID
 *       500:
 *         description: Internal server error
 */

productRouter.get(
  "/get-products-by-sub-category-id/:id",
  productController.getProductBySubCategoryId
);

/**
 * @swagger
 * /product/related-products/{id}:
 *   get:
 *     summary: Get related products by category or sub-category ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category or Sub-category ID
 *     responses:
 *       200:
 *         description: Successfully retrieved related products
 *       404:
 *         description: No related products found
 *       500:
 *         description: Internal server error
 */

productRouter.get(
  "/related-products/:id",
  productController.getAllRelatedProducts
);

/**
 * @swagger
 * /product/:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Successfully retrieved all products
 *       500:
 *         description: Internal server error
 */

productRouter.get("/", productController.getAllProducts);

/**
 * @swagger
 * /product/{id}:
 *   get:
 *     summary: Get a single product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Successfully retrieved the product
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */

productRouter.get("/:id", productController.getProductById);

productRouter.patch(
  "/update/:id",
  verifyJwt,
  loggerMiddleware,
  checkPermission("update", "product"),
  productController.updateProduct
);

/**
 * @swagger
 * /product/change-image/{id}:
 *   patch:
 *     tags: [Product]
 *     summary: Change a product's image
 *     description: |
 *       Upload a new image for a specific product by its ID.
 *       If the product has less than 3 images, the new image will be added.
 *     parameters:
 *       - in: path
 *         name: id
 *         type: string
 *         required: true
 *         description: The ID of the product to update with a new image.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: |
 *                   The new image to upload for the product.
 *                   Allowed formats: jpeg, jpg, png, gif.
 *                 example: "image.png"
 *     responses:
 *       201:
 *         description: Image uploaded successfully and added to the product.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid image file, file size too large, or the product already has 3 images.
 *       404:
 *         description: Product not found.
 *       500:
 *         description: Error uploading the image to Cloudinary or internal server error.
 */
productRouter.patch("/change-image/:id", productController.uploadImage);

/**
 * @swagger
 * /product/image/{id}:
 *   delete:
 *     tags: [Product]
 *     summary: Delete a specific image from a product.
 *     description: Delete a specific image from a product.
 *     parameters:
 *       - in: path
 *         name: id
 *         type: string
 *         required: true
 *         description: The ID of the product.
 *       - in: formData
 *         name: imagePath
 *         type: string
 *         required: true
 *         description: The URL of the image to delete.
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *       404:
 *         description: Product or image not found
 *       500:
 *         description: Internal server error
 */
productRouter.delete("/image/:id", productController.deleteProductImage);

productRouter.delete(
  "/delete/:id",
  verifyJwt,
  loggerMiddleware,
  verifyRole("superAdmin"),
  productController.deleteProduct
);

module.exports = productRouter;
