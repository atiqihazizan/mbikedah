import { Router } from "express";
import { query, param } from "express-validator";
import * as arController from "../controllers/arController.js";

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
 * /api/ar/debtors:
 *   get:
 *     summary: Get list of Debtors (Customers)
 *     tags: [Account Receivable]
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
 *         description: Paginated debtor list
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
  "/debtors",
  [
    query("keyword").optional().isString().trim(),
    ...paginationValidators,
  ],
  arController.getDebtors
);

/**
 * @swagger
 * /api/ar/debtors/{accNo}:
 *   get:
 *     summary: Get a single Debtor by Account No
 *     tags: [Account Receivable]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: accNo
 *         required: true
 *         schema:
 *           type: string
 *         description: Debtor account number
 *     responses:
 *       200:
 *         description: Debtor record
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
  "/debtors/:accNo",
  [param("accNo").notEmpty().withMessage("accNo is required")],
  arController.getDebtorByAccNo
);

/**
 * @swagger
 * /api/ar/invoices:
 *   get:
 *     summary: Get AR Invoices
 *     tags: [Account Receivable]
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
 *         name: debtor
 *         schema:
 *           type: string
 *         description: Filter by debtor account code
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
 *         description: Paginated AR invoice list
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
    query("debtor").optional().isString().trim(),
    ...paginationValidators,
  ],
  arController.getInvoices
);

/**
 * @swagger
 * /api/ar/invoices/{docNo}:
 *   get:
 *     summary: Get AR Invoice detail by Document No
 *     tags: [Account Receivable]
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
 *         description: AR Invoice with line items
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
  arController.getInvoiceByDocNo
);

/**
 * @swagger
 * /api/ar/payments:
 *   get:
 *     summary: Get AR Receipts / Payments
 *     tags: [Account Receivable]
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
 *         name: debtor
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: AR payment list
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
  "/payments",
  [
    ...dateRangeValidators,
    query("debtor").optional().isString().trim(),
  ],
  arController.getPayments
);

export default router;
