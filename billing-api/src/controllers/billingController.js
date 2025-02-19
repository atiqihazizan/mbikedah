const { Billing } = require('../models/billing');
const { BillingDetail } = require('../models/billingDetail');

// Create new billing
const createBilling = async (req, res) => {
    try {
        const billingData = {
            title: req.body.issue_desc,
            description: `${req.body.no_project} - ${req.body.issue_to}`,
            amount: req.body.total,
            billing_type_id: 1, // Default type
            payment_type_id: req.body.payment_type,
            created_by: req.user.id,
            status_id: req.body.status
        };

        // Create billing
        const billing = await Billing.create(billingData);

        // Create billing details
        if (req.body.detail && req.body.detail.length > 0) {
            const details = req.body.detail.map(item => ({
                description: item.desc,
                budget: item.budget,
                quantity: item.qty,
                unit: 'unit',
                reference: item.ref
            }));
            
            await BillingDetail.create(billing.id, details);
        }

        // Get complete billing with details
        const completeData = await getBillingWithDetails(billing.id);

        res.status(201).json({
            success: true,
            message: 'Billing created successfully',
            data: completeData
        });

    } catch (error) {
        console.error('Error creating billing:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating billing',
            error: error.message
        });
    }
};

// Get all billings
const getBillings = async (req, res) => {
    try {
        const billings = await Billing.findAll();
        
        // Get details for each billing
        const billingsWithDetails = await Promise.all(
            billings.map(async (billing) => {
                const details = await BillingDetail.findByBillingId(billing.id);
                return { ...billing, detail: details };
            })
        );

        res.json({
            success: true,
            data: billingsWithDetails
        });

    } catch (error) {
        console.error('Error getting billings:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting billings',
            error: error.message
        });
    }
};

// Get single billing
const getBillingById = async (req, res) => {
    try {
        const billing = await Billing.findById(req.params.id);
        
        if (!billing) {
            return res.status(404).json({
                success: false,
                message: 'Billing not found'
            });
        }

        const details = await BillingDetail.findByBillingId(billing.id);
        
        res.json({
            success: true,
            data: { ...billing, detail: details }
        });

    } catch (error) {
        console.error('Error getting billing:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting billing',
            error: error.message
        });
    }
};

// Update billing status
const updateBillingStatus = async (req, res) => {
    try {
        const billingId = parseInt(req.params.id);
        const { status, remarks } = req.body;
        const userId = req.user.id;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        try {
            await Billing.updateStatus(billingId, status, userId, remarks);
            
            // Get updated billing data
            const updatedBilling = await Billing.findById(billingId);
            
            return res.json({
                success: true,
                message: 'Billing status updated successfully',
                data: updatedBilling
            });
        } catch (error) {
            if (error.message === 'Billing not found') {
                return res.status(404).json({
                    success: false,
                    message: 'Billing not found'
                });
            } else if (error.message === 'Invalid status transition') {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status transition. Please check the allowed status transitions.'
                });
            } else {
                throw error; // Re-throw other errors to be caught by outer catch block
            }
        }
    } catch (error) {
        console.error('Error updating billing status:', error);
        return res.status(500).json({
            success: false,
            message: 'Error updating billing status',
            error: error.message
        });
    }
};

// Helper function to get billing with details
async function getBillingWithDetails(billingId) {
    const billing = await Billing.findById(billingId);
    if (!billing) return null;
    
    const details = await BillingDetail.findByBillingId(billingId);
    return { ...billing, detail: details };
}

module.exports = {
    createBilling,
    getBillings,
    getBillingById,
    updateBillingStatus
};
