const { pool } = require('../config/database');

class AuditService {
  static async log(data) {
    const {
      userId,
      action,
      resourceType,
      resourceId,
      oldValue,
      newValue,
      ipAddress,
      userAgent
    } = data;

    const [result] = await pool.execute(
      `INSERT INTO audit_logs 
       (user_id, action, resource_type, resource_id, old_value, new_value, ip_address, user_agent) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, action, resourceType, resourceId, oldValue, newValue, ipAddress, userAgent]
    );

    return result.insertId;
  }

  static async getResourceLogs(resourceType, resourceId) {
    const [rows] = await pool.execute(
      `SELECT al.*, u.username 
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE resource_type = ? AND resource_id = ?
       ORDER BY created_at DESC`,
      [resourceType, resourceId]
    );
    return rows;
  }

  static async getUserLogs(userId) {
    const [rows] = await pool.execute(
      `SELECT * FROM audit_logs 
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );
    return rows;
  }
}

// SQL for creating audit_logs table
const createTableSQL = `
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  action VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id INT NOT NULL,
  old_value JSON DEFAULT NULL,
  new_value JSON DEFAULT NULL,
  ip_address VARCHAR(45) DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_resource (resource_type, resource_id),
  INDEX idx_user_action (user_id, action)
)`;

module.exports = { AuditService, createTableSQL };
