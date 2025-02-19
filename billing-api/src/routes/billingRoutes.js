const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { validateRequest } = require('../middleware/validate');
const { auth } = require('../middleware/auth');
const { 
    createBilling, 
    getBillings, 
    getBillingById, 
    updateBillingStatus 
} = require('../controllers/billingController');

// Create billing validation
const createBillingValidation = [
    body('issue_desc').notEmpty().withMessage('Description is required'),
    body('no_project').notEmpty().withMessage('Project number is required'),
    body('issue_to').notEmpty().withMessage('Issue to is required'),
    body('total').isNumeric().withMessage('Total must be a number'),
    body('status').isInt().withMessage('Status must be an integer'),
    body('payment_type').isInt().withMessage('Payment type must be an integer'),
    body('detail').isArray().withMessage('Detail must be an array'),
    body('detail.*.desc').notEmpty().withMessage('Detail description is required'),
    body('detail.*.budget_code').notEmpty().withMessage('Budget code is required'),
    body('detail.*.budget').isNumeric().withMessage('Detail budget must be a number'),
    body('detail.*.qty').isInt().withMessage('Detail quantity must be an integer'),
    body('detail.*.ref').optional().isString().withMessage('Detail reference must be a string')
];

// Update status validation
const updateStatusValidation = [
    param('id').isInt().withMessage('Invalid billing ID'),
    body('status').isInt().withMessage('Status must be an integer'),
    body('remarks').optional().isString().withMessage('Remarks must be a string')
];

// Routes
router.post('/', auth, createBillingValidation, validateRequest, createBilling);
router.get('/', auth, getBillings);
router.get('/:id', auth, param('id').isInt(), validateRequest, getBillingById);
router.patch('/:id/status', auth, updateStatusValidation, validateRequest, updateBillingStatus);

module.exports = router;
