const { User, createTableSQL: createUsersTable } = require('./users');
const { Billing, createTableSQL: createBillingTable } = require('./billing');
const { BillingDetail, createTableSQL: createBillingDetailTable } = require('./billingDetail');
const { BillingStatus, createTableSQL: createBillingStatusTable } = require('./billingStatus');
const { BillingType, createTableSQL: createBillingTypeTable } = require('./billingType');
const { PaymentType, createTableSQL: createPaymentTypeTable } = require('./paymentType');
const { UserSession, createTableSQL: userSessionTableSQL } = require('./userSession');
const { BillingHistory, createTableSQL: createBillingHistoryTable } = require('./billingHistory');
const { Attachment, createTableSQL: createAttachmentTable } = require('./attachments');
const { BillingAccess, createTableSQL: createBillingAccessTable } = require('./billingAccess');
const { Payment, createTableSQL: createPaymentTable } = require('./payment');
const { pool } = require('../config/database');

// Initialize database tables
async function initializeTables() {
  try {
    // Create tables in the correct order (due to foreign key constraints)
    // First, create tables with no dependencies
    await pool.execute(createUsersTable);
    await pool.execute(createBillingStatusTable);
    await pool.execute(createBillingTypeTable);
    await pool.execute(createPaymentTypeTable);
    await pool.execute(userSessionTableSQL);

    // Then create the main billing table
    await pool.execute(createBillingTable);

    // Finally create tables that depend on billing
    await pool.execute(createBillingDetailTable);
    await pool.execute(createBillingHistoryTable);
    await pool.execute(createBillingAccessTable);
    await pool.execute(createAttachmentTable);
    await pool.execute(createPaymentTable);
    
    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database tables:', error);
    throw error;
  }
};

module.exports = {
  User,
  Billing,
  BillingDetail,
  BillingStatus,
  BillingType,
  PaymentType,
  UserSession,
  BillingHistory,
  Attachment,
  BillingAccess,
  Payment,
  initializeTables
};
