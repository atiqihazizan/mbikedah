const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const { validateRequest } = require('../middleware/validateRequest');
const { verifyToken } = require('../middleware/auth');
const {
    createRecipient,
    getRecipients,
    getRecipientById,
    updateRecipient,
    searchRecipients
} = require('../controllers/billingRecipientController');

// Validation rules
const recipientValidationRules = [
    body('name').notEmpty().trim().withMessage('Name is required'),
    body('address').optional().trim(),
    body('phone').optional().trim(),
    body('email').optional().isEmail().withMessage('Invalid email format'),
    body('company_name').optional().trim(),
    body('company_registration_no').optional().trim(),
    body('attention_to').optional().trim(),
    body('department_id').optional().isInt().withMessage('Invalid department ID'),
    body('status').optional().isIn([0, 1]).withMessage('Invalid status')
];

// Routes
router.post('/',
    verifyToken,
    recipientValidationRules,
    validateRequest,
    createRecipient
);

router.get('/',
    verifyToken,
    [
        query('department_id').optional().isInt().withMessage('Invalid department ID'),
        query('status').optional().isIn(['0', '1']).withMessage('Invalid status')
    ],
    validateRequest,
    getRecipients
);

router.get('/search',
    verifyToken,
    [
        query('query').notEmpty().trim().withMessage('Search query is required')
    ],
    validateRequest,
    searchRecipients
);

router.get('/:id',
    verifyToken,
    getRecipientById
);

router.put('/:id',
    verifyToken,
    recipientValidationRules,
    validateRequest,
    updateRecipient
);

module.exports = router;
