const { pool } = require('../config/database');

class Attachment {
  static async create({ billingId, filePath, uploadedBy }) {
    const [result] = await pool.execute(
      'INSERT INTO attachments (billing_id, file_path, uploaded_by) VALUES (?, ?, ?)',
      [billingId, filePath, uploadedBy]
    );
    return { id: result.insertId, billingId, filePath, uploadedBy };
  }

  static async findByBillingId(billingId) {
    const [rows] = await pool.execute(
      `SELECT a.*, u.username as uploaded_by_name
       FROM attachments a
       LEFT JOIN users u ON a.uploaded_by = u.id
       WHERE a.billing_id = ?
       ORDER BY a.uploaded_at DESC`,
      [billingId]
    );
    return rows;
  }

  static async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM attachments WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

// SQL for creating attachments table
const createTableSQL = `
CREATE TABLE IF NOT EXISTS attachments (
  id INT NOT NULL AUTO_INCREMENT,
  billing_id INT NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  uploaded_by INT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (billing_id) REFERENCES billings (id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users (id)
)`;

module.exports = { Attachment, createTableSQL };
