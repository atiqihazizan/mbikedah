import { Router } from "express";
import { query, param } from "express-validator";
import * as apController from "../controllers/apController.js";

const router = Router();

const dateRangeValidators = [
  query("from")
    .optional()
    .isDate({ format: "YYYY-MM-DD" })
    .withMessage("from must be a valid date (YYYY-MM-DD)"),
  query("to")
    .optional()
    .isDate({ format: "YYYY-MM-DD" })
    .withMessage("to must be a valid date (YYYY-MM-DD)"),
];

const paginationValidators = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage("limit must be between 1 and 200"),
];

/**
 * @swagger
 * /api/ap/creditors:
 *   get:
 *     summary: Get list of Creditors (Suppliers)
 *     tags: [Account Payable]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Filter by account code or company name
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
 *         description: Paginated creditor list
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
  "/creditors",
  [
    query("keyword").optional().isString().trim(),
    ...paginationValidators,
  ],
  apController.getCreditors
);

/**
 * @swagger
 * /api/ap/creditors/{accNo}:
 *   get:
 *     summary: Get a single Creditor by Account No
 *     tags: [Account Payable]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: accNo
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Creditor record
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
  "/creditors/:accNo",
  [param("accNo").notEmpty().withMessage("accNo is required")],
  apController.getCreditorByAccNo
);

/**
 * @swagger
 * /api/ap/invoices:
 *   get:
 *     summary: Get AP Invoices
 *     tags: [Account Payable]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
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
 *         name: creditor
 *         schema:
 *           type: string
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
 *         description: Paginated AP invoice list
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
    ...dateRangeValidators,
    query("creditor").optional().isString().trim(),
    ...paginationValidators,
  ],
  apController.getInvoices
);

/**
 * @swagger
 * /api/ap/invoices/{docNo}:
 *   get:
 *     summary: Get AP Invoice detail by Document No
 *     tags: [Account Payable]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: docNo
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: AP Invoice with line items
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
  apController.getInvoiceByDocNo
);

/**
 * @swagger
 * /api/ap/payments:
 *   get:
 *     summary: Get AP Payments
 *     tags: [Account Payable]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
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
 *         name: creditor
 *         schema:
 *           type: string
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
 *         description: Paginated AP payment list
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
  "/payments",
  [
    ...dateRangeValidators,
    query("creditor").optional().isString().trim(),
    ...paginationValidators,
  ],
  apController.getPayments
);

export default router;
