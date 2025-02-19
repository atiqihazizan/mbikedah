const { pool } = require('../config/database');

class BillingHistory {
  static async create({ billingId, statusId, changedBy, notes }) {
    const [result] = await pool.execute(
      'INSERT INTO billing_history (billing_id, status_id, changed_by, notes) VALUES (?, ?, ?, ?)',
      [billingId, statusId, changedBy, notes]
    );
    return { id: result.insertId, billingId, statusId, changedBy, notes };
  }

  static async findByBillingId(billingId) {
    const [rows] = await pool.execute(
      `SELECT bh.*, bs.status_name, u.username as changed_by_name
       FROM billing_history bh
       LEFT JOIN billing_status bs ON bh.status_id = bs.id
       LEFT JOIN users u ON bh.changed_by = u.id
       WHERE bh.billing_id = ?
       ORDER BY bh.changed_at DESC`,
      [billingId]
    );
    return rows;
  }
}

// SQL for creating billing_history table
const createTableSQL = `
CREATE TABLE IF NOT EXISTS billing_history (
  id INT NOT NULL AUTO_INCREMENT,
  billing_id INT NOT NULL,
  status_id INT NOT NULL,
  changed_by INT NOT NULL,
  notes TEXT,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (billing_id) REFERENCES billings (id) ON DELETE CASCADE,
  FOREIGN KEY (status_id) REFERENCES billing_status (id),
  FOREIGN KEY (changed_by) REFERENCES users (id)
)`;

module.exports = { BillingHistory, createTableSQL };
