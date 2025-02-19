const { pool } = require('../config/database');

class BillingDetail {
  static async create(billingId, details) {
    const values = details.map(detail => [
      billingId,
      detail.description,
      detail.budget,
      detail.quantity,
      detail.unit,
      detail.reference || null
    ]);

    const [result] = await pool.execute(
      `INSERT INTO billing_detail 
       (billing_id, description, budget, quantity, unit, reference) 
       VALUES ?`,
      [values]
    );
    return { insertId: result.insertId, affectedRows: result.affectedRows };
  }

  static async findByBillingId(billingId) {
    const [rows] = await pool.execute(
      `SELECT * FROM billing_detail 
       WHERE billing_id = ? 
       ORDER BY created_at ASC`,
      [billingId]
    );
    return rows;
  }

  static async update(id, billingId, updateData) {
    const [result] = await pool.execute(
      `UPDATE billing_detail 
       SET description = ?, budget = ?, quantity = ?, 
           unit = ?, reference = ?
       WHERE id = ? AND billing_id = ?`,
      [
        updateData.description,
        updateData.budget,
        updateData.quantity,
        updateData.unit,
        updateData.reference || null,
        id,
        billingId
      ]
    );
    return result.affectedRows > 0;
  }

  static async delete(id, billingId) {
    const [result] = await pool.execute(
      'DELETE FROM billing_detail WHERE id = ? AND billing_id = ?',
      [id, billingId]
    );
    return result.affectedRows > 0;
  }

  static async deleteAllByBillingId(billingId) {
    const [result] = await pool.execute(
      'DELETE FROM billing_detail WHERE billing_id = ?',
      [billingId]
    );
    return result.affectedRows;
  }
}

// SQL for creating billing_detail table
const createTableSQL = `
CREATE TABLE IF NOT EXISTS billing_detail (
  id INT NOT NULL AUTO_INCREMENT,
  billing_id INT NOT NULL,
  description TEXT NOT NULL,
  budget DECIMAL(15,2) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1.00,
  unit VARCHAR(20) NOT NULL DEFAULT 'unit',
  reference VARCHAR(100) DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (billing_id) REFERENCES billings (id) ON DELETE CASCADE,
  CONSTRAINT check_positive_budget CHECK (budget >= 0),
  CONSTRAINT check_positive_quantity CHECK (quantity > 0),
  INDEX idx_billing_id (billing_id)
)`;

module.exports = { BillingDetail, createTableSQL };
