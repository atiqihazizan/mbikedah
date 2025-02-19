const { pool } = require('../config/database');

class BillingAccess {
  static async create({ billingId, userId, accessLevel }) {
    const [result] = await pool.execute(
      'INSERT INTO billing_access (billing_id, user_id, access_level) VALUES (?, ?, ?)',
      [billingId, userId, accessLevel]
    );
    return { id: result.insertId, billingId, userId, accessLevel };
  }

  static async findByBillingId(billingId) {
    const [rows] = await pool.execute(
      `SELECT ba.*, u.username, u.email
       FROM billing_access ba
       LEFT JOIN users u ON ba.user_id = u.id
       WHERE ba.billing_id = ?`,
      [billingId]
    );
    return rows;
  }

  static async findByUserId(userId) {
    const [rows] = await pool.execute(
      `SELECT ba.*, b.title, b.description
       FROM billing_access ba
       LEFT JOIN billings b ON ba.billing_id = b.id
       WHERE ba.user_id = ?`,
      [userId]
    );
    return rows;
  }

  static async checkAccess(billingId, userId, requiredLevel) {
    const [rows] = await pool.execute(
      'SELECT access_level FROM billing_access WHERE billing_id = ? AND user_id = ?',
      [billingId, userId]
    );
    
    if (rows.length === 0) return false;
    
    const accessLevels = {
      'view': 1,
      'edit': 2,
      'approve': 3
    };
    
    return accessLevels[rows[0].access_level] >= accessLevels[requiredLevel];
  }

  static async delete(billingId, userId) {
    const [result] = await pool.execute(
      'DELETE FROM billing_access WHERE billing_id = ? AND user_id = ?',
      [billingId, userId]
    );
    return result.affectedRows > 0;
  }
}

// SQL for creating billing_access table
const createTableSQL = `
CREATE TABLE IF NOT EXISTS billing_access (
  id INT NOT NULL AUTO_INCREMENT,
  billing_id INT NOT NULL,
  user_id INT NOT NULL,
  access_level ENUM('view', 'edit', 'approve') NOT NULL,
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (billing_id) REFERENCES billings (id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT unique_billing_user UNIQUE (billing_id, user_id)
)`;

module.exports = { BillingAccess, createTableSQL };
