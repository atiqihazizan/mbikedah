const { pool } = require('../config/database');

const BillingDetail = {
	// Create new billing details
	create: async (billingId, details) => {
		const connection = await pool.getConnection();
		try {
			await connection.beginTransaction();
						
			for (const detail of details) {
				await connection.query(
					`INSERT INTO billing_details (
						billing_id, 
						budget_id,
						budget_year,
						description,
						budget,
						qty,
						unit,
						budget_remaining,
						ref
					) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
					[
						billingId,
						detail.budget_id || null,
						detail.budget_year || null,
						detail.desc,
						detail.budget || 0,
						detail.qty || 0,
						detail.unit || '',
						detail.budget_remaining || 0,
						detail.ref || null
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
	},

	// Find billing details by billing ID
	findByBillingId: async (billingId) => {
		const [rows] = await pool.query(
			'SELECT * FROM billing_details WHERE billing_id = ?',
			[billingId]
		);
		return rows;
	},

	// Update billing details
	update: async (billingId, details) => {
		const connection = await pool.getConnection();
		try {
			await connection.beginTransaction();

			// Delete existing details
			await connection.query(
				'DELETE FROM billing_details WHERE billing_id = ?',
				[billingId]
			);

			// Insert new details
			for (const detail of details) {
				await connection.query(
					`INSERT INTO billing_details (
						billing_id,
						budget_id,
						budget_year,
						desc,
						budget,
						qty,
						unit,
						amount,
						budget_remaining,
						ref
					) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
					[
						billingId,
						detail.budget_id,
						detail.budget_year,
						detail.desc,
						detail.budget || 0,
						detail.qty || 0,
						detail.unit || '',
						detail.amount || 0,
						detail.budget_remaining || 0,
						detail.ref || null
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
	},

	// Delete billing details
	delete: async (billingId) => {
		const [result] = await pool.query(
			'DELETE FROM billing_details WHERE billing_id = ?',
			[billingId]
		);
		return result.affectedRows > 0;
	}
};

// SQL for creating billing_details table
const createTableSQL = `
CREATE TABLE IF NOT EXISTS billing_details (
  id int NOT NULL AUTO_INCREMENT,
  billing_id int NOT NULL,
  budget_id int DEFAULT NULL,
  budget_year int DEFAULT NULL,
  description text NOT NULL,
  budget_code varchar(50) NOT NULL,
  budget decimal(10,2) NOT NULL,
  price decimal(10,2) NOT NULL,
  qty int NOT NULL DEFAULT '0',
  amount decimal(10,2) GENERATED ALWAYS AS ((price * qty)) STORED,
  budget_remaining decimal(15,2) DEFAULT '0.00',
  unit varchar(50) NOT NULL,
  ref varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY billing_id (billing_id),
  KEY budget_id (budget_id),
  CONSTRAINT billing_details_ibfk_1 FOREIGN KEY (billing_id) REFERENCES billings (id) ON DELETE CASCADE,
  CONSTRAINT billing_details_ibfk_2 FOREIGN KEY (budget_id) REFERENCES budget_master (id)
)`;

module.exports = { BillingDetail, createTableSQL };
