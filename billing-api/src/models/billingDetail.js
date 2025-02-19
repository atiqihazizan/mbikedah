const { pool } = require('../config/database');

class BillingDetail {
    static async create(billingId, details) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            for (const detail of details) {
                await connection.execute(
                    `INSERT INTO billing_details 
                    (billing_id, description, budget, quantity, unit, reference) 
                    VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        billingId,
                        detail.description,
                        detail.budget,
                        detail.quantity,
                        detail.unit,
                        detail.reference
                    ]
                );
            }

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async findByBillingId(billingId) {
        const [rows] = await pool.execute(
            'SELECT * FROM billing_details WHERE billing_id = ?',
            [billingId]
        );
        return rows;
    }
}

// SQL for creating billing_details table
const createTableSQL = `
CREATE TABLE IF NOT EXISTS billing_details (
    id INT NOT NULL AUTO_INCREMENT,
    billing_id INT NOT NULL,
    description TEXT NOT NULL,
    budget DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL,
    unit VARCHAR(50) NOT NULL,
    reference VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (billing_id) REFERENCES billings(id) ON DELETE CASCADE
)`;

module.exports = { BillingDetail, createTableSQL };
