require('dotenv').config();
const { initializeTables } = require('../models');
const { pool, testConnection } = require('../config/database');
const bcrypt = require('bcryptjs');

async function createDefaultData() {
  try {
    // Create default billing statuses
    await pool.execute(`
      INSERT IGNORE INTO billing_status (id, status_name) VALUES 
      (1, 'Draft'),
      (2, 'Approval HOD'),
      (3, 'Checking Finance'),
      (4, 'Approval Finance'),
      (5, 'Approved'),
      (6, 'Paid'),
      (7, 'Rejected')
    `);

    // Create default billing types
    await pool.execute(`
      INSERT IGNORE INTO billing_type (id, type_name) VALUES 
      (1, 'Invoice'),
      (2, 'Receipt'),
      (3, 'Quotation'),
      (4, 'Purchase Order')
    `);

    // Create default payment types
    await pool.execute(`
      INSERT IGNORE INTO payment_type (id, payment_name) VALUES 
      (1, 'Online Payment'),
      (2, 'Cheque')
    `);

    // Create default users for each role
    const defaultUsers = [
      { username: 'admin', email: 'admin@example.com', password: 'admin123', role: 'admin' },
      { username: 'staff1', email: 'staff1@example.com', password: 'staff123', role: 'staff' },
      { username: 'hod1', email: 'hod1@example.com', password: 'hod123', role: 'hod' },
      { username: 'finance_check1', email: 'finance.check1@example.com', password: 'finance123', role: 'finance_check' },
      { username: 'finance_verify1', email: 'finance.verify1@example.com', password: 'finance123', role: 'finance_verify' },
      { username: 'finance_approval1', email: 'finance.approval1@example.com', password: 'finance123', role: 'finance_approval' },
      { username: 'finance_payment1', email: 'finance.payment1@example.com', password: 'finance123', role: 'finance_payment' }
    ];

    for (const user of defaultUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await pool.execute(`
        INSERT IGNORE INTO users (username, email, password_hash, role) 
        VALUES (?, ?, ?, ?)
      `, [user.username, user.email, hashedPassword, user.role]);
    }

    console.log('Default data created successfully');
  } catch (error) {
    console.error('Error creating default data:', error);
    throw error;
  }
}

async function init() {
  try {
    // Test database connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Could not establish database connection');
    }

    // Initialize tables
    await initializeTables();
    console.log('Database tables initialized successfully');
    
    // Create default data
    await createDefaultData();
    console.log('Database initialization completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

// Add delay to ensure connection pool is ready
setTimeout(() => {
  init();
}, 1000);
