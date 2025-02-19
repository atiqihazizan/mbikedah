const { Billing } = require('../models/billing');
const { BillingDetail } = require('../models/billingDetail');
const { BillingHistory } = require('../models/billingHistory');

const billingController = {
    // Create new billing
    createBilling: async (req, res) => {
        try {
            // Extract only needed fields
            const {
                title,
                issue_desc,
                issue_to,
                no_project,
                total,
                payment_type_id,
                status,
                department_id,
                running_no,
                detail
            } = req.body;

            // Create billing with validated data
            const billingData = {
                title,
                issue_desc,
                issue_to,
                no_project,
                total,
                payment_type_id,
                status: status || 1,
                department_id,
                running_no,
                created_by: req.user.id
            };

            console.log('Creating billing with data:', billingData);

            const billing = await Billing.create(billingData);
            
            if (detail && detail.length > 0) {
                await BillingDetail.create(billing.id, detail);
            }
            
            res.json({
                success: true,
                message: 'Billing created successfully',
                data: {
                    id: billing.id,
                    running_no: billing.running_no
                }
            });
        } catch (error) {
            console.error('Error in createBilling:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error creating billing',
                error: error.message 
            });
        }
    },

    // Get all billings
    getBillings: async (req, res) => {
        try {
            const { archived } = req.query;
            const billings = await Billing.findAll({
                userId: req.user.id,
                role: req.user.role,
                department_id: req.user.department_id,
                archived: archived === 'true'
            });
            res.json({ success: true, data: billings });
        } catch (error) {
            console.error('Error in getBillings:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Get single billing
    getBillingById: async (req, res) => {
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
    },

    // Update billing status
    updateBillingStatus: async (req, res) => {
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
    },

    // Toggle archive billing
    toggleArchive: async (req, res) => {
        try {
            const { id } = req.params;
            await Billing.toggleArchive(id);
            res.json({
                success: true,
                message: 'Billing archive status toggled successfully'
            });
        } catch (error) {
            console.error('Error in toggleArchive:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Helper function to get billing with details
    getBillingWithDetails: async (billingId) => {
        const billing = await Billing.findById(billingId);
        if (!billing) return null;
        
        const details = await BillingDetail.findByBillingId(billingId);
        return { ...billing, detail: details };
    }
};

module.exports = billingController;
