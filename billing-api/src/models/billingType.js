const { pool } = require('../config/database');

class BillingType {
  static async create({ type_name, description }) {
    const [result] = await pool.execute(
      'INSERT INTO billing_type (type_name, description) VALUES (?, ?)',
      [type_name, description]
    );
    return { id: result.insertId, type_name, description };
  }

  static async findAll() {
    const [rows] = await pool.execute('SELECT * FROM billing_type');
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM billing_type WHERE id = ?',
      [id]
    );
    return rows[0];
  }
}

// SQL for creating billing_type table
const createTableSQL = `
CREATE TABLE IF NOT EXISTS billing_type (
  id INT NOT NULL AUTO_INCREMENT,
  type_name VARCHAR(50) NOT NULL,
  description TEXT DEFAULT NULL,
  PRIMARY KEY (id),
  CONSTRAINT unique_type_name UNIQUE (type_name)
)`;

module.exports = { BillingType, createTableSQL };
