const { Billing } = require('../models');

const validateStatusTransition = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newStatusId } = req.body;

    // Get current billing
    const billing = await Billing.findById(id);
    if (!billing) {
      return res.status(404).json({ message: 'Billing not found' });
    }

    // Check if user has permission
    const hasAccess = await Billing.checkAccess(id, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({ message: 'You do not have permission to update this billing' });
    }

    // Validate status transition
    const isValidTransition = await Billing.validateStatusTransition(
      billing.billing_status_id,
      newStatusId
    );

    if (!isValidTransition) {
      return res.status(400).json({ 
        message: 'Invalid status transition',
        currentStatus: billing.billing_status_id,
        requestedStatus: newStatusId
      });
    }

    // Add billing to request for later use
    req.billing = billing;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { validateStatusTransition };
