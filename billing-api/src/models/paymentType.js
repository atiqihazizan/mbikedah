const { pool } = require('../config/database');

class PaymentType {
  static async create({ payment_name, description }) {
    const [result] = await pool.execute(
      'INSERT INTO payment_type (payment_name, description) VALUES (?, ?)',
      [payment_name, description]
    );
    return { id: result.insertId, payment_name, description };
  }

  static async findAll() {
    const [rows] = await pool.execute('SELECT * FROM payment_type');
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM payment_type WHERE id = ?',
      [id]
    );
    return rows[0];
  }
}

// SQL for creating payment_type table
const createTableSQL = `
CREATE TABLE IF NOT EXISTS payment_type (
  id INT NOT NULL AUTO_INCREMENT,
  payment_name VARCHAR(50) NOT NULL,
  description TEXT DEFAULT NULL,
  PRIMARY KEY (id),
  CONSTRAINT unique_payment_name UNIQUE (payment_name)
)`;

module.exports = { PaymentType, createTableSQL };
