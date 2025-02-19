const { pool } = require('../config/database');
const { BillingHistory } = require('./billingHistory');

// Status transition rules
const STATUS_TRANSITIONS = {
  1: [2],           // Draft -> Approval HOD
  2: [3, 7],        // Approval HOD -> Checking Finance, Rejected
  3: [4],           // Checking Finance -> Approval Finance
  4: [5, 7],        // Approval Finance -> Approved, Rejected
  5: [6],           // Approved -> Paid
  6: [],            // Paid -> (no further transitions)
  7: []             // Rejected -> (no further transitions)
};

class Billing {
  static async create(data) {
    const { 
      title, issue_desc, issue_to, no_project, total,
      status, department_id, running_no,
      created_by
    } = data;

    try {
      // Create billing with only required fields
      const [result] = await pool.execute(
        `INSERT INTO billings SET
          title = ?,
          issue_desc = ?,
          issue_to = ?,
          no_project = ?,
          total = ?,
          status = ?,
          department_id = ?,
          running_no = ?,
          created_by = ?`,
        [
          title,
          issue_desc,
          issue_to,
          no_project,
          total,
          status || 1,
          department_id,
          running_no,
          created_by
        ]
      );

      // Create initial history
      await BillingHistory.create({
        billing_id: result.insertId,
        status_id: status || 1,
        remarks: 'Permohonan baru dibuat',
        created_by: created_by
      });

      return this.findById(result.insertId);
    } catch (error) {
      console.error('Error creating billing:', error);
      throw error;
    }
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT b.*, 
        bs.status_name,
        bt.type_name as billing_type,
        pt.payment_name as payment_type,
        u.username as creator_name,
        d.name as department_name
      FROM billings b
      LEFT JOIN billing_status bs ON b.status_id = bs.id
      LEFT JOIN billing_type bt ON b.billing_type_id = bt.id
      LEFT JOIN payment_type pt ON b.payment_type_id = pt.id
      LEFT JOIN users u ON b.created_by = u.id
      LEFT JOIN departments d ON b.department_id = d.id
      WHERE b.id = ?`,
      [id]
    );

    if (rows.length === 0) return null;

    // Get billing history
    const history = await BillingHistory.findByBillingId(id);
    return { ...rows[0], history };
  }

  static async findAll({ userId, role, department_id, archived = false }) {
    let sql = `
      SELECT b.*, 
        d.name as department_name,
        u1.username as creator_name,
        u2.username as finance_checker_name,
        u3.username as finance_approver_name,
        bs.status_name
      FROM billings b
      LEFT JOIN departments d ON b.department_id = d.id
      LEFT JOIN users u1 ON b.created_by = u1.id
      LEFT JOIN users u2 ON b.finance_checked_by = u2.id
      LEFT JOIN users u3 ON b.finance_approved_by = u3.id
      LEFT JOIN billing_status bs ON b.status_id = bs.id
      WHERE b.is_archived = ?
    `;

    const params = [archived ? 1 : 0];

    // Role-based filtering
    switch(role) {
      case 'user':
        sql += ' AND b.created_by = ?';
        params.push(userId);
        break;
      case 'hod':
        sql += ' AND b.department_id = ?';
        params.push(department_id);
        break;
      case 'finance':
        sql += ' AND (b.status_id IN (3,4,6))'; // Checking Finance, Approval Finance, Paid
        break;
      case 'admin':
        // Admin can see all
        break;
      default:
        throw new Error('Invalid role');
    }

    sql += ' ORDER BY b.created_at DESC';

    try {
      const [rows] = await pool.execute(sql, params);
      return rows;
    } catch (error) {
      console.error('Error finding billings:', error);
      throw error;
    }
  }

  static async updateStatus(id, status_id, updated_by, remarks = null) {
    try {
      // Get current billing status
      const [currentBilling] = await pool.execute(
        'SELECT status_id FROM billings WHERE id = ?',
        [id]
      );

      if (!currentBilling || currentBilling.length === 0) {
        throw new Error('Billing not found');
      }

      const currentStatus = currentBilling[0].status_id;

      // Check if status transition is allowed
      if (!STATUS_TRANSITIONS[currentStatus].includes(status_id)) {
        throw new Error('Invalid status transition');
      }

      // Update billing status
      await pool.execute(
        'UPDATE billings SET status_id = ?, updated_by = ? WHERE id = ?',
        [status_id, updated_by, id]
      );

      // Add status history
      await BillingHistory.create({
        billing_id: id,
        status_id: status_id,
        remarks: remarks,
        created_by: updated_by
      });

      return true;
    } catch (error) {
      throw error;
    }
  }

  static async toggleArchive(id) {
    try {
      await pool.execute(
        'UPDATE billings SET is_archived = NOT is_archived WHERE id = ?',
        [id]
      );
      return true;
    } catch (error) {
      console.error('Error toggling archive status:', error);
      throw error;
    }
  }
}

// SQL for creating billings table
const createTableSQL = `
CREATE TABLE IF NOT EXISTS billings (
  id int NOT NULL AUTO_INCREMENT,
  title varchar(255) NOT NULL,
  issue_desc text,
  issue_to varchar(255) DEFAULT NULL,
  no_project varchar(100) DEFAULT NULL,
  total decimal(10,2) DEFAULT NULL,
  status int DEFAULT '1',
  department_id int DEFAULT NULL,
  running_no varchar(20) DEFAULT NULL,
  billing_type_id int NOT NULL DEFAULT '1',
  payment_type_id int NOT NULL DEFAULT '1',
  status_id int NOT NULL DEFAULT '1',
  created_by int NOT NULL,
  updated_by int DEFAULT NULL,
  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_archived tinyint(1) DEFAULT '0',
  finance_checked_by int DEFAULT NULL,
  finance_checked_at timestamp NULL DEFAULT NULL,
  finance_approved_by int DEFAULT NULL,
  finance_approved_at timestamp NULL DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY unique_running_no (running_no),
  KEY billing_type_id (billing_type_id),
  KEY payment_type_id (payment_type_id),
  KEY updated_by (updated_by),
  KEY idx_status (status_id),
  KEY idx_created_by (created_by),
  KEY department_id (department_id),
  KEY finance_checked_by (finance_checked_by),
  KEY finance_approved_by (finance_approved_by),
  CONSTRAINT billings_ibfk_1 FOREIGN KEY (billing_type_id) REFERENCES billing_type (id),
  CONSTRAINT billings_ibfk_2 FOREIGN KEY (payment_type_id) REFERENCES payment_type (id),
  CONSTRAINT billings_ibfk_3 FOREIGN KEY (status_id) REFERENCES billing_status (id),
  CONSTRAINT billings_ibfk_4 FOREIGN KEY (created_by) REFERENCES users (id),
  CONSTRAINT billings_ibfk_5 FOREIGN KEY (updated_by) REFERENCES users (id),
  CONSTRAINT billings_ibfk_6 FOREIGN KEY (department_id) REFERENCES departments (id),
  CONSTRAINT billings_ibfk_7 FOREIGN KEY (finance_checked_by) REFERENCES users (id),
  CONSTRAINT billings_ibfk_8 FOREIGN KEY (finance_approved_by) REFERENCES users (id)
)`;

module.exports = { Billing, createTableSQL, STATUS_TRANSITIONS };
