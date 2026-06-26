import { Router } from "express";
import { query, param } from "express-validator";
import * as salesController from "../controllers/salesController.js";

const router = Router();

/**
 * @swagger
 * /api/sales/invoices:
 *   get:
 *     summary: Get Sales Invoices
 *     tags: [Sales]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *       - in: query
 *         name: customer
 *         schema:
 *           type: string
 *         description: Filter by customer account code
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
 *         description: Paginated sales invoice list
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
  "/invoices",
  [
    query("from")
      .optional()
      .isDate({ format: "YYYY-MM-DD" })
      .withMessage("from must be a valid date (YYYY-MM-DD)"),
    query("to")
      .optional()
      .isDate({ format: "YYYY-MM-DD" })
      .withMessage("to must be a valid date (YYYY-MM-DD)"),
    query("customer").optional().isString().trim(),
    query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 200 })
      .withMessage("limit must be between 1 and 200"),
  ],
  salesController.getSalesInvoices
);

/**
 * @swagger
 * /api/sales/invoices/{docNo}:
 *   get:
 *     summary: Get Sales Invoice detail by Document No
 *     tags: [Sales]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: docNo
 *         required: true
 *         schema:
 *           type: string
 *         description: Sales invoice document number
 *     responses:
 *       200:
 *         description: Sales invoice with line items
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
  "/invoices/:docNo",
  [param("docNo").notEmpty().withMessage("docNo is required")],
  salesController.getSalesInvoiceByDocNo
);

export default router;
