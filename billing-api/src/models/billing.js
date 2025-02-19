const { pool } = require('../config/database');

// Status transition rules
const STATUS_TRANSITIONS = {
  'Draft': ['Approval HOD'],
  'Approval HOD': ['Checking Finance', 'Rejected'],
  'Checking Finance': ['Approval Finance'],
  'Approval Finance': ['Approved', 'Rejected'],
  'Approved': ['Paid'],
  'Paid': [],
  'Rejected': []
};

class Billing {
  static async create(data) {
    const { 
      title, description, amount, billing_type_id, 
      payment_type_id, created_by, status_id = 1 
    } = data;

    const [result] = await pool.execute(
      `INSERT INTO billings (
        title, description, amount, billing_type_id, 
        payment_type_id, created_by, status_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, description, amount, billing_type_id, payment_type_id, created_by, status_id]
    );

    return this.findById(result.insertId);
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
    return rows[0];
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
    return rows;
  }

  static async update(id, data) {
    const allowedFields = ['title', 'description', 'amount', 'billing_type_id', 'payment_type_id'];
    const updates = [];
    const values = [];

    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(data[field]);
      }
    });

    if (updates.length === 0) return false;

    values.push(id);
    const query = `UPDATE billings SET ${updates.join(', ')} WHERE id = ?`;
    const [result] = await pool.execute(query, values);
    return result.affectedRows > 0;
  }

  static async updateStatus(id, newStatusId, userId) {
    const billing = await this.findById(id);
    if (!billing) {
      throw new Error('Billing not found');
    }

    // Get status names
    const [[currentStatus]] = await pool.execute(
      'SELECT status_name FROM billing_status WHERE id = ?',
      [billing.status_id]
    );
    const [[newStatus]] = await pool.execute(
      'SELECT status_name FROM billing_status WHERE id = ?',
      [newStatusId]
    );

    // Check if transition is allowed
    const allowedNextStatuses = STATUS_TRANSITIONS[currentStatus.status_name] || [];
    if (!allowedNextStatuses.includes(newStatus.status_name)) {
      throw new Error(`Invalid status transition from ${currentStatus.status_name} to ${newStatus.status_name}`);
    }

    // Update status
    const [result] = await pool.execute(
      'UPDATE billings SET status_id = ?, updated_by = ? WHERE id = ?',
      [newStatusId, userId, id]
    );

    // Create history record
    await pool.execute(
      `INSERT INTO billing_history (
        billing_id, status_id, updated_by, notes
      ) VALUES (?, ?, ?, ?)`,
      [id, newStatusId, userId, `Status changed to ${newStatus.status_name}`]
    );

    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.execute('DELETE FROM billings WHERE id = ?', [id]);
    return result.affectedRows > 0;
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
  FOREIGN KEY (updated_by) REFERENCES users(id),
  INDEX idx_status (status_id),
  INDEX idx_created_by (created_by)
)`;

module.exports = { Billing, createTableSQL };
