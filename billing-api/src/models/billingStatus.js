const { pool } = require('../config/database');

class BillingStatus {
  static async create({ status_name, description }) {
    const [result] = await pool.execute(
      'INSERT INTO billing_status (status_name, description) VALUES (?, ?)',
      [status_name, description]
    );
    return { id: result.insertId, status_name, description };
  }

  static async findAll() {
    const [rows] = await pool.execute('SELECT * FROM billing_status');
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM billing_status WHERE id = ?',
      [id]
    );
    return rows[0];
  }
}

// SQL for creating billing_status table
const createTableSQL = `
CREATE TABLE IF NOT EXISTS billing_status (
  id INT NOT NULL AUTO_INCREMENT,
  status_name VARCHAR(50) NOT NULL,
  description TEXT DEFAULT NULL,
  PRIMARY KEY (id),
  CONSTRAINT unique_status_name UNIQUE (status_name)
)`;

module.exports = { BillingStatus, createTableSQL };
