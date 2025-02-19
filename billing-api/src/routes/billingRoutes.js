const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Billing, BillingDetail, BillingAccess } = require('../models');
const { auth, authorize } = require('../middleware/auth');
const notificationService = require('../services/notificationService');
const { AuditService } = require('../services/auditService');

// Create new billing
router.post('/', 
  auth,
  authorize('admin', 'finance'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('status').isIn(['Draft', 'Pending Approval', 'Approved', 'Rejected', 'Completed', 'Cancelled'])
      .withMessage('Invalid status')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const billingData = {
        ...req.body,
        created_by: req.user.id
      };

      const billing = await Billing.create(billingData);
      
      // Create billing details if provided
      if (req.body.details && req.body.details.length > 0) {
        await BillingDetail.create(billing.id, req.body.details);
      }

      // Grant access to creator
      await BillingAccess.create({
        billingId: billing.id,
        userId: req.user.id,
        accessLevel: 'edit'
      });

      res.status(201).json(billing);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get all billings
router.get('/', 
  auth,
  async (req, res) => {
    try {
      const { 
        status, type, project, from, to, 
        amount_min, amount_max, 
        issued_by, sort_by, sort_order,
        page = 1, limit = 10
      } = req.query;

      let billings;

      if (project) {
        billings = await Billing.findByProject(project);
      } else {
        billings = await Billing.findAll();
      }

      // Apply filters
      if (status) {
        billings = billings.filter(b => b.billing_status_id === parseInt(status));
      }
      if (type) {
        billings = billings.filter(b => b.billing_type_id === parseInt(type));
      }
      if (from) {
        billings = billings.filter(b => new Date(b.issue_at) >= new Date(from));
      }
      if (to) {
        billings = billings.filter(b => new Date(b.issue_at) <= new Date(to));
      }
      if (amount_min) {
        billings = billings.filter(b => b.amount >= parseFloat(amount_min));
      }
      if (amount_max) {
        billings = billings.filter(b => b.amount <= parseFloat(amount_max));
      }
      if (issued_by) {
        billings = billings.filter(b => b.issued_by === parseInt(issued_by));
      }

      // Apply sorting
      if (sort_by) {
        billings.sort((a, b) => {
          const order = sort_order === 'desc' ? -1 : 1;
          return order * (a[sort_by] > b[sort_by] ? 1 : -1);
        });
      }

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const total = billings.length;
      billings = billings.slice(startIndex, endIndex);

      res.json({
        data: billings,
        pagination: {
          total,
          page: parseInt(page),
          total_pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get billing by id
router.get('/:id', 
  auth,
  async (req, res) => {
    try {
      const billing = await Billing.findById(req.params.id);
      if (!billing) {
        return res.status(404).json({ error: 'Billing not found' });
      }

      const details = await BillingDetail.findByBillingId(req.params.id);
      const history = await Billing.getStatusHistory(req.params.id);
      const access = await BillingAccess.findByBillingId(req.params.id);

      res.json({
        billing,
        details,
        history,
        access
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Update billing
router.put('/:id',
  auth,
  authorize('admin', 'finance'),
  [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('amount').optional().isNumeric().withMessage('Amount must be a number'),
    body('status').optional().isIn(['Draft', 'Pending Approval', 'Approved', 'Rejected', 'Completed', 'Cancelled'])
      .withMessage('Invalid status')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const billing = await Billing.findById(req.params.id);
      if (!billing) {
        return res.status(404).json({ error: 'Billing not found' });
      }

      // Check if user has edit access
      const hasAccess = await BillingAccess.checkAccess(req.params.id, req.user.id, 'edit');
      if (!hasAccess) {
        return res.status(403).json({ error: 'You do not have permission to edit this billing' });
      }

      // Only allow updates if status is Draft or Rejected
      if (![1, 4].includes(billing.billing_status_id)) {
        return res.status(400).json({ 
          error: 'Cannot update billing in current status',
          currentStatus: billing.billing_status_id
        });
      }

      await Billing.update(req.params.id, req.user.id, req.body);

      // Update details if provided
      if (req.body.details) {
        await BillingDetail.deleteAllByBillingId(req.params.id);
        await BillingDetail.create(req.params.id, req.body.details);
      }

      const updatedBilling = await Billing.findById(req.params.id);
      const details = await BillingDetail.findByBillingId(req.params.id);

      res.json({ billing: updatedBilling, details });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Delete billing
router.delete('/:id',
  auth,
  authorize('admin'),
  async (req, res) => {
    try {
      const billing = await Billing.findById(req.params.id);
      if (!billing) {
        return res.status(404).json({ error: 'Billing not found' });
      }

      // Only allow deletion of Draft or Rejected billings
      if (![1, 4].includes(billing.billing_status_id)) {
        return res.status(400).json({ 
          error: 'Cannot delete billing in current status',
          currentStatus: billing.billing_status_id
        });
      }

      await Billing.delete(req.params.id, req.user.id);
      res.json({ message: 'Billing deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Batch update billings
router.post('/batch',
  auth,
  authorize('admin', 'finance'),
  [
    body('ids').isArray().withMessage('IDs must be an array'),
    body('status').isIn(['Draft', 'Pending Approval', 'Approved', 'Rejected', 'Completed', 'Cancelled'])
      .withMessage('Invalid status')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { ids, status } = req.body;
      await Billing.batchUpdate(ids, { status, updated_by: req.user.id });
      
      res.json({ message: 'Billings updated successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Batch update billing statuses
router.patch('/batch/status', 
  auth, 
  authorize('admin', 'finance'), 
  async (req, res) => {
    const { billings } = req.body; // Array of { id, newStatusId, remarks }
    const results = [];
    const errors = [];

    try {
      for (const item of billings) {
        try {
          const billing = await Billing.findById(item.id);
          if (!billing) {
            errors.push({ id: item.id, error: 'Billing not found' });
            continue;
          }

          const isValidTransition = await Billing.validateStatusTransition(
            billing.billing_status_id,
            item.newStatusId
          );

          if (!isValidTransition) {
            errors.push({ id: item.id, error: 'Invalid status transition' });
            continue;
          }

          await Billing.updateStatus(item.id, item.newStatusId, req.user.id, item.remarks);
          
          // Log the change
          await AuditService.log({
            userId: req.user.id,
            action: 'UPDATE_STATUS',
            resourceType: 'BILLING',
            resourceId: item.id,
            oldValue: { status: billing.billing_status_id },
            newValue: { status: item.newStatusId },
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
          });

          results.push({ id: item.id, success: true });
        } catch (error) {
          errors.push({ id: item.id, error: error.message });
        }
      }

      res.json({ results, errors });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Update billing status
router.patch('/:id/status', 
  auth, 
  authorize('admin', 'finance', 'manager'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { newStatusId, remarks } = req.body;

      const billing = await Billing.findById(id);
      if (!billing) {
        return res.status(404).json({ error: 'Billing not found' });
      }

      const isValidTransition = await Billing.validateStatusTransition(
        billing.billing_status_id,
        newStatusId
      );

      if (!isValidTransition) {
        return res.status(400).json({ error: 'Invalid status transition' });
      }

      await Billing.updateStatus(id, newStatusId, req.user.id, remarks);

      // Get updated billing with history
      const updatedBilling = await Billing.findById(id);
      const history = await Billing.getStatusHistory(id);

      res.json({ billing: updatedBilling, history });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Schedule status change
router.post('/:id/schedule-status', 
  auth, 
  authorize('admin', 'finance'), 
  async (req, res) => {
    try {
      const { id } = req.params;
      const { newStatusId, scheduledDate, remarks } = req.body;

      const billing = await Billing.findById(id);
      if (!billing) {
        return res.status(404).json({ error: 'Billing not found' });
      }

      const isValidTransition = await Billing.validateStatusTransition(
        billing.billing_status_id,
        newStatusId
      );

      if (!isValidTransition) {
        return res.status(400).json({ error: 'Invalid status transition' });
      }

      // Schedule the status change
      const [result] = await pool.execute(
        `INSERT INTO scheduled_status_changes 
         (billing_id, new_status_id, scheduled_date, remarks, created_by) 
         VALUES (?, ?, ?, ?, ?)`,
        [id, newStatusId, scheduledDate, remarks, req.user.id]
      );

      // Log the scheduling
      await AuditService.log({
        userId: req.user.id,
        action: 'SCHEDULE_STATUS_CHANGE',
        resourceType: 'BILLING',
        resourceId: id,
        newValue: { 
          status: newStatusId, 
          scheduledDate,
          remarks 
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      res.json({ 
        message: 'Status change scheduled',
        scheduleId: result.insertId
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get billing status history
router.get('/:id/history', auth, async (req, res) => {
  try {
    const history = await Billing.getStatusHistory(req.params.id);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get audit logs for a billing
router.get('/:id/audit', auth, async (req, res) => {
  try {
    const logs = await AuditService.getResourceLogs('BILLING', req.params.id);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
