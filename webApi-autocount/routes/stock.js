import { Router } from "express";
import { query, param } from "express-validator";
import * as stockController from "../controllers/stockController.js";

const router = Router();

/**
 * @swagger
 * /api/stock/items:
 *   get:
 *     summary: Get list of stock items
 *     tags: [Stock]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Filter by item code or description
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Paginated item list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  "/items",
  [
    query("keyword").optional().isString().trim(),
    query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 200 })
      .withMessage("limit must be between 1 and 200"),
  ],
  stockController.getItems
);

/**
 * @swagger
 * /api/stock/items/{itemCode}:
 *   get:
 *     summary: Get stock item by item code
 *     tags: [Stock]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: itemCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Stock item record
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  "/items/:itemCode",
  [param("itemCode").notEmpty().withMessage("itemCode is required")],
  stockController.getItemByCode
);

/**
 * @swagger
 * /api/stock/balance:
 *   get:
 *     summary: Get current stock balance
 *     tags: [Stock]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: itemCode
 *         schema:
 *           type: string
 *         description: Filter by item code
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by warehouse/location code
 *     responses:
 *       200:
 *         description: Stock balance list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessListResponse'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  "/balance",
  [
    query("itemCode").optional().isString().trim(),
    query("location").optional().isString().trim(),
  ],
  stockController.getStockBalance
);

/**
 * @swagger
 * /api/stock/movement:
 *   get:
 *     summary: Get stock movement transactions
 *     tags: [Stock]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: itemCode
 *         schema:
 *           type: string
 *         description: Filter by item code
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Paginated stock movement list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  "/movement",
  [
    query("itemCode").optional().isString().trim(),
    query("from")
      .optional()
      .isDate({ format: "YYYY-MM-DD" })
      .withMessage("from must be a valid date (YYYY-MM-DD)"),
    query("to")
      .optional()
      .isDate({ format: "YYYY-MM-DD" })
      .withMessage("to must be a valid date (YYYY-MM-DD)"),
    query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 200 })
      .withMessage("limit must be between 1 and 200"),
  ],
  stockController.getStockMovement
);

export default router;
