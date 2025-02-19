const { BillingRecipient } = require('../models/billingRecipient');

exports.createRecipient = async (req, res) => {
    try {
        const recipientData = {
            ...req.body,
            created_by: req.user.id
        };

        const id = await BillingRecipient.create(recipientData);
        const recipient = await BillingRecipient.findById(id);

        res.json({
            success: true,
            message: 'Billing recipient created successfully',
            data: recipient
        });
    } catch (error) {
        console.error('Error in createRecipient:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getRecipients = async (req, res) => {
    try {
        const { department_id, status } = req.query;
        const recipients = await BillingRecipient.findAll({
            department_id: department_id ? parseInt(department_id) : null,
            status: status !== undefined ? parseInt(status) : 1
        });
        res.json({ success: true, data: recipients });
    } catch (error) {
        console.error('Error in getRecipients:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getRecipientById = async (req, res) => {
    try {
        const { id } = req.params;
        const recipient = await BillingRecipient.findById(id);
        
        if (!recipient) {
            return res.status(404).json({
                success: false,
                message: 'Billing recipient not found'
            });
        }

        res.json({ success: true, data: recipient });
    } catch (error) {
        console.error('Error in getRecipientById:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateRecipient = async (req, res) => {
    try {
        const { id } = req.params;
        const recipientData = req.body;

        await BillingRecipient.update(id, recipientData, req.user.id);
        const recipient = await BillingRecipient.findById(id);

        res.json({
            success: true,
            message: 'Billing recipient updated successfully',
            data: recipient
        });
    } catch (error) {
        console.error('Error in updateRecipient:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.searchRecipients = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query || query.length < 2) {
            return res.json({ success: true, data: [] });
        }

        const recipients = await BillingRecipient.search(query);
        res.json({ success: true, data: recipients });
    } catch (error) {
        console.error('Error in searchRecipients:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
