const { Billing, BillingDetail } = require('../models');

exports.createBilling = async (req, res) => {
  try {
    const {
      billNumber,
      billingTypeId,
      amount,
      statusId,
      dueDate,
      paymentTypeId,
      notes,
      details
    } = req.body;

    const billing = await Billing.create({
      billNumber,
      userId: req.user.id,
      billingTypeId,
      amount,
      statusId,
      dueDate,
      paymentTypeId,
      notes
    });

    if (details && details.length > 0) {
      const billingDetails = details.map(detail => ({
        ...detail,
        billingId: billing._id
      }));
      await BillingDetail.insertMany(billingDetails);
    }

    res.status(201).json({
      status: 'success',
      data: billing
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.getBillings = async (req, res) => {
  try {
    const billings = await Billing.find({ userId: req.user.id })
      .populate('billingTypeId')
      .populate('statusId')
      .populate('paymentTypeId');

    res.status(200).json({
      status: 'success',
      data: billings
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.getBillingById = async (req, res) => {
  try {
    const billing = await Billing.findOne({
      _id: req.params.id,
      userId: req.user.id
    })
      .populate('billingTypeId')
      .populate('statusId')
      .populate('paymentTypeId');

    if (!billing) {
      return res.status(404).json({
        status: 'error',
        message: 'Billing not found'
      });
    }

    const details = await BillingDetail.find({ billingId: billing._id });

    res.status(200).json({
      status: 'success',
      data: { ...billing.toObject(), details }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.updateBilling = async (req, res) => {
  try {
    const billing = await Billing.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );

    if (!billing) {
      return res.status(404).json({
        status: 'error',
        message: 'Billing not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: billing
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.deleteBilling = async (req, res) => {
  try {
    const billing = await Billing.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!billing) {
      return res.status(404).json({
        status: 'error',
        message: 'Billing not found'
      });
    }

    await BillingDetail.deleteMany({ billingId: req.params.id });

    res.status(200).json({
      status: 'success',
      message: 'Billing deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
