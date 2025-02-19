const { pool } = require('../config/database');

class BillingDetail {
    static async create(billingId, details) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const createDetail = async (billingId, details) => {
                const sql = `
                    INSERT INTO billing_details 
                    (billing_id, description, budget_code, budget, quantity, unit, reference) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `;

                try {
                    for (const detail of details) {
                        await connection.execute(sql, [
                            billingId,
                            detail.description,
                            detail.budget_code,
                            detail.budget,
                            detail.quantity,
                            detail.unit || 'unit',
                            detail.reference || null
                        ]);
                    }
                    return true;
                } catch (error) {
                    console.error('Error creating billing detail:', error);
                    throw error;
                }
            };

            await createDetail(billingId, details);
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
    budget_code VARCHAR(50) NOT NULL,
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
