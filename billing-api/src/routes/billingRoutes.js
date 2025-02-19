const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { validateRequest } = require('../middleware/validate');
const { auth } = require('../middleware/auth');
const { 
    createBilling, 
    getBillings, 
    getBillingById, 
    updateBillingStatus,
    toggleArchive
} = require('../controllers/billingController');

// Create billing validation
const createBillingValidation = [
    body('title').notEmpty().withMessage('Title is required'),
    body('issue_desc').notEmpty().withMessage('Issue description is required'),
    body('issue_to').notEmpty().withMessage('Issue to is required'),
    body('no_project').notEmpty().withMessage('No project is required'),
    body('total').isNumeric().withMessage('Total must be a number'),
    body('billing_type_id').isInt().withMessage('Billing type must be an integer'),
    body('payment_type_id').isInt().withMessage('Payment type must be an integer'),
    body('detail').isArray().withMessage('Detail must be an array'),
    body('detail.*.desc').notEmpty().withMessage('Detail description is required'),
    body('detail.*.budget_code').notEmpty().withMessage('Budget code is required'),
    body('detail.*.budget').isNumeric().withMessage('Detail budget must be a number'),
    body('detail.*.qty').isInt().withMessage('Detail quantity must be an integer'),
    body('detail.*.ref').optional().isString().withMessage('Detail reference must be a string')
];

// Get billings validation
const getBillingsValidation = [
    query('archived').optional().isBoolean().withMessage('Archived must be a boolean')
];

// Routes
router.post('/', auth, createBillingValidation, validateRequest, createBilling);
router.get('/', auth, getBillingsValidation, validateRequest, getBillings);
router.get('/:id', auth, param('id').isInt(), validateRequest, getBillingById);
router.patch('/:id/status', auth, updateBillingStatus);
router.patch('/:id/archive', auth, param('id').isInt(), validateRequest, toggleArchive);

module.exports = router;
