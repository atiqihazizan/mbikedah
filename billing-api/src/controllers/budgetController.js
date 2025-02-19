const { BudgetMaster } = require('../models/budgetMaster');

exports.createBudget = async (req, res) => {
    try {
        const budgetData = {
            ...req.body,
            created_by: req.user.id
        };

        // Validate budget code uniqueness
        const isValid = await BudgetMaster.validateBudgetCode(
            budgetData.code,
            budgetData.year
        );
        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Budget code already exists for this year'
            });
        }

        const id = await BudgetMaster.create(budgetData);
        const budget = await BudgetMaster.findById(id);

        res.json({
            success: true,
            message: 'Budget created successfully',
            data: budget
        });
    } catch (error) {
        console.error('Error in createBudget:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getBudgets = async (req, res) => {
    try {
        const { department_id, year, type } = req.query;
        const budgets = await BudgetMaster.findAll({
            department_id: department_id ? parseInt(department_id) : null,
            year: year ? parseInt(year) : new Date().getFullYear(),
            type
        });
        res.json({ success: true, data: budgets });
    } catch (error) {
        console.error('Error in getBudgets:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getBudgetById = async (req, res) => {
    try {
        const { id } = req.params;
        const budget = await BudgetMaster.findById(id);
        
        if (!budget) {
            return res.status(404).json({
                success: false,
                message: 'Budget not found'
            });
        }

        res.json({ success: true, data: budget });
    } catch (error) {
        console.error('Error in getBudgetById:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateBudget = async (req, res) => {
    try {
        const { id } = req.params;
        const budgetData = req.body;

        // Validate budget code uniqueness
        const isValid = await BudgetMaster.validateBudgetCode(
            budgetData.code,
            budgetData.year,
            id
        );
        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Budget code already exists for this year'
            });
        }

        await BudgetMaster.update(id, budgetData, req.user.id);
        const budget = await BudgetMaster.findById(id);

        res.json({
            success: true,
            message: 'Budget updated successfully',
            data: budget
        });
    } catch (error) {
        console.error('Error in updateBudget:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getBudgetHierarchy = async (req, res) => {
    try {
        const { year } = req.query;
        const currentYear = year ? parseInt(year) : new Date().getFullYear();
        
        const hierarchy = await BudgetMaster.getHierarchy(
            currentYear,
            req.user.department_id
        );

        res.json({ success: true, data: hierarchy });
    } catch (error) {
        console.error('Error in getBudgetHierarchy:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
