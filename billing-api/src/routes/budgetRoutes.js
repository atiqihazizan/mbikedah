const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const { validateRequest } = require('../middleware/validateRequest');
const { verifyToken } = require('../middleware/auth');
const {
    createBudget,
    getBudgets,
    getBudgetById,
    updateBudget,
    getBudgetHierarchy
} = require('../controllers/budgetController');

// Validation rules
const budgetValidationRules = [
    body('code').notEmpty().trim().withMessage('Budget code is required'),
    body('name').notEmpty().trim().withMessage('Budget name is required'),
    body('type').isIn(['category', 'subcategory', 'item'])
        .withMessage('Invalid budget type'),
    body('year').isInt({ min: 2000 }).withMessage('Invalid year'),
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be non-negative'),
    body('department_id').optional().isInt().withMessage('Invalid department ID'),
    body('parent_id').optional().isInt().withMessage('Invalid parent ID'),
    body('description').optional().trim()
];

// Routes
router.post('/',
    verifyToken,
    budgetValidationRules,
    validateRequest,
    createBudget
);

router.get('/',
    verifyToken,
    [
        query('year').optional().isInt().withMessage('Invalid year'),
        query('department_id').optional().isInt().withMessage('Invalid department ID'),
        query('type').optional().isIn(['category', 'subcategory', 'item'])
            .withMessage('Invalid type')
    ],
    validateRequest,
    getBudgets
);

router.get('/hierarchy',
    verifyToken,
    [
        query('year').optional().isInt().withMessage('Invalid year')
    ],
    validateRequest,
    getBudgetHierarchy
);

router.get('/:id',
    verifyToken,
    getBudgetById
);

router.put('/:id',
    verifyToken,
    budgetValidationRules,
    validateRequest,
    updateBudget
);

module.exports = router;
