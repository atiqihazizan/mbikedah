const { pool } = require('../config/database');

class BillingHistory {
    static async create(data) {
        const { billing_id, status_id, remarks, created_by } = data;
        
        const [result] = await pool.execute(
            `INSERT INTO billing_history 
            (billing_id, status_id, remarks, created_by) 
            VALUES (?, ?, ?, ?)`,
            [billing_id, status_id, remarks, created_by]
        );
        
        return result.insertId;
    }

    static async findByBillingId(billingId) {
        const [rows] = await pool.execute(
            `SELECT h.id, h.billing_id, h.status_id, h.remarks, h.created_at,
                bs.status_name,
                u.username as creator_name
            FROM billing_history h
            LEFT JOIN billing_status bs ON h.status_id = bs.id
            LEFT JOIN users u ON h.created_by = u.id
            WHERE h.billing_id = ?
            ORDER BY h.created_at DESC`,
            [billingId]
        );
        return rows;
    }
}

// SQL for creating billing_history table
const createTableSQL = `
DROP TABLE IF EXISTS billing_history;
CREATE TABLE billing_history (
    id INT NOT NULL AUTO_INCREMENT,
    billing_id INT NOT NULL,
    status_id INT NOT NULL,
    remarks TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (billing_id) REFERENCES billings(id) ON DELETE CASCADE,
    FOREIGN KEY (status_id) REFERENCES billing_status(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;

module.exports = { BillingHistory, createTableSQL };
