const { pool } = require('../config/database');
const { BillingHistory } = require('./billingHistory');

// Status transition rules
const STATUS_TRANSITIONS = {
  1: [2],           // Draft -> Approval HOD
  2: [3, 7],        // Approval HOD -> Checking Finance, Rejected
  3: [4],           // Checking Finance -> Approval Finance
  4: [5, 7],        // Approval Finance -> Approved, Rejected
  5: [6],           // Approved -> Paid
  6: [],            // Paid -> (no further transitions)
  7: []             // Rejected -> (no further transitions)
};

class Billing {
  static async create(data) {
    const { 
      title, description, amount, billing_type_id, 
      payment_type_id, created_by, status_id = 1 
    } = data;

    try {
      // Create billing
      const [result] = await pool.execute(
        'INSERT INTO billings (title, description, amount, billing_type_id, payment_type_id, created_by, status_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [title, description, amount, billing_type_id, payment_type_id, created_by, status_id]
      );

      // Create initial history
      await BillingHistory.create({
        billing_id: result.insertId,
        status_id: status_id,
        remarks: 'Permohonan baru dibuat',
        created_by: created_by
      });

      return this.findById(result.insertId);
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT b.*, 
        bs.status_name,
        bt.type_name as billing_type,
        pt.payment_name as payment_type,
        u.username as creator_name
      FROM billings b
      LEFT JOIN billing_status bs ON b.status_id = bs.id
      LEFT JOIN billing_type bt ON b.billing_type_id = bt.id
      LEFT JOIN payment_type pt ON b.payment_type_id = pt.id
      LEFT JOIN users u ON b.created_by = u.id
      WHERE b.id = ?`,
      [id]
    );

    if (rows.length === 0) return null;

    // Get billing history
    const history = await BillingHistory.findByBillingId(id);
    return { ...rows[0], history };
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT b.*, 
        bs.status_name,
        bt.type_name as billing_type,
        pt.payment_name as payment_type,
        u.username as creator_name
      FROM billings b
      LEFT JOIN billing_status bs ON b.status_id = bs.id
      LEFT JOIN billing_type bt ON b.billing_type_id = bt.id
      LEFT JOIN payment_type pt ON b.payment_type_id = pt.id
      LEFT JOIN users u ON b.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.status_id) {
      query += ' AND b.status_id = ?';
      params.push(filters.status_id);
    }

    if (filters.created_by) {
      query += ' AND b.created_by = ?';
      params.push(filters.created_by);
    }

    query += ' ORDER BY b.created_at DESC';

    const [rows] = await pool.execute(query, params);

    // Get history for each billing
    const billingsWithHistory = await Promise.all(
      rows.map(async (billing) => {
        const history = await BillingHistory.findByBillingId(billing.id);
        return { ...billing, history };
      })
    );

    return billingsWithHistory;
  }

  static async updateStatus(id, status_id, updated_by, remarks = null) {
    try {
      // Get current billing status
      const [currentBilling] = await pool.execute(
        'SELECT status_id FROM billings WHERE id = ?',
        [id]
      );

      if (!currentBilling || currentBilling.length === 0) {
        throw new Error('Billing not found');
      }

      const currentStatus = currentBilling[0].status_id;

      // Check if status transition is allowed
      if (!STATUS_TRANSITIONS[currentStatus].includes(status_id)) {
        throw new Error('Invalid status transition');
      }

      // Update billing status
      await pool.execute(
        'UPDATE billings SET status_id = ?, updated_by = ? WHERE id = ?',
        [status_id, updated_by, id]
      );

      // Add status history
      await BillingHistory.create({
        billing_id: id,
        status_id: status_id,
        remarks: remarks,
        created_by: updated_by
      });

      return true;
    } catch (error) {
      throw error;
    }
  }
}

// SQL for creating billings table
const createTableSQL = `
CREATE TABLE IF NOT EXISTS billings (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL,
  billing_type_id INT NOT NULL,
  payment_type_id INT NOT NULL,
  status_id INT NOT NULL DEFAULT 1,
  created_by INT NOT NULL,
  updated_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (billing_type_id) REFERENCES billing_type(id),
  FOREIGN KEY (payment_type_id) REFERENCES payment_type(id),
  FOREIGN KEY (status_id) REFERENCES billing_status(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (updated_by) REFERENCES users(id)
)`;

module.exports = { Billing, createTableSQL, STATUS_TRANSITIONS };
