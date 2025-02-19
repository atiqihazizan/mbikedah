const { pool } = require('../config/database');

class Payment {
  static async create({ 
    billingId, 
    paymentTypeId, 
    amount,
    paymentDate,
    referenceNo,
    bankName,
    chequeNo,
    chequeDate,
    notes
  }) {
    const [result] = await pool.execute(
      `INSERT INTO payments (
        billing_id, 
        payment_type_id, 
        amount,
        payment_date,
        reference_no,
        bank_name,
        cheque_no,
        cheque_date,
        notes,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        billingId,
        paymentTypeId,
        amount,
        paymentDate,
        referenceNo,
        bankName,
        chequeNo,
        chequeDate,
        notes
      ]
    );
    return { id: result.insertId };
  }

  static async findByBillingId(billingId) {
    const [rows] = await pool.execute(
      `SELECT p.*, pt.payment_name as payment_type_name
       FROM payments p
       LEFT JOIN payment_type pt ON p.payment_type_id = pt.id
       WHERE p.billing_id = ?
       ORDER BY p.created_at DESC`,
      [billingId]
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT p.*, pt.payment_name as payment_type_name
       FROM payments p
       LEFT JOIN payment_type pt ON p.payment_type_id = pt.id
       WHERE p.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async update(id, {
    paymentTypeId,
    amount,
    paymentDate,
    referenceNo,
    bankName,
    chequeNo,
    chequeDate,
    notes
  }) {
    const [result] = await pool.execute(
      `UPDATE payments SET
        payment_type_id = ?,
        amount = ?,
        payment_date = ?,
        reference_no = ?,
        bank_name = ?,
        cheque_no = ?,
        cheque_date = ?,
        notes = ?,
        updated_at = NOW()
       WHERE id = ?`,
      [
        paymentTypeId,
        amount,
        paymentDate,
        referenceNo,
        bankName,
        chequeNo,
        chequeDate,
        notes,
        id
      ]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM payments WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

// SQL for creating payments table
const createTableSQL = `
CREATE TABLE IF NOT EXISTS payments (
  id INT NOT NULL AUTO_INCREMENT,
  billing_id INT NOT NULL,
  payment_type_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  reference_no VARCHAR(50),
  bank_name VARCHAR(100),
  cheque_no VARCHAR(50),
  cheque_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (billing_id) REFERENCES billings(id) ON DELETE CASCADE,
  FOREIGN KEY (payment_type_id) REFERENCES payment_type(id),
  INDEX idx_billing (billing_id),
  INDEX idx_payment_type (payment_type_id),
  INDEX idx_payment_date (payment_date)
)`;

module.exports = { Payment, createTableSQL };
