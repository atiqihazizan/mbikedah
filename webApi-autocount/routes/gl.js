import { Router } from "express";
import { query } from "express-validator";
import * as glController from "../controllers/glController.js";

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

/**
 * @swagger
 * /api/gl/accounts:
 *   get:
 *     summary: Get Chart of Accounts
 *     tags: [General Ledger]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: accountCode
 *         schema:
 *           type: string
 *         description: Filter by account code (partial match)
 *       - in: query
 *         name: accountName
 *         schema:
 *           type: string
 *         description: Filter by account name (partial match)
 *     responses:
 *       200:
 *         description: List of accounts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessListResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  "/accounts",
  [
    query("accountCode").optional().isString().trim(),
    query("accountName").optional().isString().trim(),
  ],
  glController.getAccounts
);

/**
 * @swagger
 * /api/gl/cashbook:
 *   get:
 *     summary: Get Cash Book entries
 *     tags: [General Ledger]
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
 *     responses:
 *       200:
 *         description: Cash book entries
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessListResponse'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/cashbook", dateRangeValidators, glController.getCashBook);

/**
 * @swagger
 * /api/gl/journal:
 *   get:
 *     summary: Get GL Journal entries
 *     tags: [General Ledger]
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
 *     responses:
 *       200:
 *         description: Journal entries
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessListResponse'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/journal", dateRangeValidators, glController.getJournal);

/**
 * @swagger
 * /api/gl/ledger:
 *   get:
 *     summary: Get General Ledger (by account)
 *     tags: [General Ledger]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: account
 *         schema:
 *           type: string
 *         description: Account code (exact match)
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
 *     responses:
 *       200:
 *         description: Ledger entries
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
  "/ledger",
  [
    query("account").optional().isString().trim(),
    ...dateRangeValidators,
  ],
  glController.getLedger
);

/**
 * @swagger
 * /api/gl/trial-balance:
 *   get:
 *     summary: Get Trial Balance
 *     tags: [General Ledger]
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
 *     responses:
 *       200:
 *         description: Trial balance rows
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessListResponse'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/trial-balance", dateRangeValidators, glController.getTrialBalance);

/**
 * @swagger
 * /api/gl/profit-loss:
 *   get:
 *     summary: Get Profit & Loss Statement
 *     tags: [General Ledger]
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
 *     responses:
 *       200:
 *         description: Profit & Loss breakdown with summary
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/profit-loss", dateRangeValidators, glController.getProfitLoss);

/**
 * @swagger
 * /api/gl/balance-sheet:
 *   get:
 *     summary: Get Balance Sheet
 *     tags: [General Ledger]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: As-of date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Balance sheet with summary
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  "/balance-sheet",
  [
    query("date")
      .optional()
      .isDate({ format: "YYYY-MM-DD" })
      .withMessage("date must be a valid date (YYYY-MM-DD)"),
  ],
  glController.getBalanceSheet
);

export default router;
