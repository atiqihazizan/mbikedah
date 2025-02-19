const { pool } = require('../config/database');

class UserSession {
  static async create({ userId, token, userAgent, ipAddress }) {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Set expiry to 24 hours from now

    const [result] = await pool.execute(
      `INSERT INTO user_sessions 
       (user_id, session_token, ip_address, user_agent, expires_at, is_active) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, token, ipAddress, userAgent, expiresAt, true]
    );
    return { id: result.insertId, userId, token, userAgent, ipAddress, expiresAt };
  }

  static async findByToken(token) {
    const [rows] = await pool.execute(
      `SELECT * FROM user_sessions 
       WHERE session_token = ? 
       AND expires_at > CURRENT_TIMESTAMP 
       AND is_active = true`,
      [token]
    );
    return rows[0];
  }

  static async invalidate(token) {
    const [result] = await pool.execute(
      'UPDATE user_sessions SET is_active = false WHERE session_token = ?',
      [token]
    );
    return result.affectedRows > 0;
  }

  static async cleanExpiredSessions() {
    const [result] = await pool.execute(
      'UPDATE user_sessions SET is_active = false WHERE expires_at <= CURRENT_TIMESTAMP'
    );
    return result.affectedRows;
  }
}

// SQL for creating user_sessions table
const createTableSQL = `
CREATE TABLE IF NOT EXISTS user_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  session_token VARCHAR(255) NOT NULL UNIQUE,
  ip_address VARCHAR(45) DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  expires_at TIMESTAMP DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT check_expiry CHECK (expires_at IS NULL OR expires_at > last_activity),
  INDEX idx_user_session (user_id)
)`;

module.exports = { UserSession, createTableSQL };
