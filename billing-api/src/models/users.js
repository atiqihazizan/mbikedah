const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create({ username, email, password, role }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, role]
    );
    return { id: result.insertId, username, email, role };
  }

  static async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  static async findByUsername(username) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async validatePassword(storedHash, inputPassword) {
    return bcrypt.compare(inputPassword, storedHash);
  }

  static async updateProfile(id, { username, email }) {
    const [result] = await pool.execute(
      'UPDATE users SET username = ?, email = ? WHERE id = ?',
      [username, email, id]
    );
    return result.affectedRows > 0;
  }

  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const [result] = await pool.execute(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [hashedPassword, id]
    );
    return result.affectedRows > 0;
  }
}

// SQL for creating users table
const createTableSQL = `
CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'staff', 'hod', 'finance_check', 'finance_verify', 'finance_approval', 'finance_payment') NOT NULL DEFAULT 'staff',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_email (email),
  INDEX idx_username (username),
  INDEX idx_role (role)
)`;

module.exports = { User, createTableSQL };
