const { User, createTableSQL: createUsersTable } = require('./users');
const { Billing, createTableSQL: billingTableSQL } = require('./billing');
const { BillingDetail, createTableSQL: billingDetailTableSQL } = require('./billingDetail');
const { BillingHistory, createTableSQL: billingHistoryTableSQL } = require('./billingHistory');
const { pool } = require('../config/database');

async function initializeTables() {
    try {
        // Create tables
        const tables = [
            createUsersTable,
            billingTableSQL,
            billingDetailTableSQL,
            billingHistoryTableSQL
        ];

        for (const sql of tables) {
            const statements = sql.split(';').filter(stmt => stmt.trim());
            for (const stmt of statements) {
                if (stmt.trim()) {
                    await pool.execute(stmt);
                }
            }
        }

        console.log('Tables initialized successfully');
    } catch (error) {
        console.error('Error initializing database tables:', error);
        throw error;
    }
}

module.exports = {
    User,
    Billing,
    BillingDetail,
    BillingHistory,
    initializeTables
};
