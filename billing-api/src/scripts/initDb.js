require('dotenv').config();
const { initializeTables } = require('../models');
const { pool, testConnection } = require('../config/database');
const bcrypt = require('bcryptjs');

async function createDefaultData() {
  try {
    // Create default billing statuses
    await pool.execute(`
      INSERT IGNORE INTO billing_status (id, status_name, description) VALUES 
      (1, 'Draf', 'Permohonan bil masih dalam draf dan belum dihantar untuk kelulusan.'),
      (2, 'Kelulusan Ketua Jabatan', 'Permohonan bil sedang menunggu kelulusan daripada Ketua Jabatan.'),
      (3, 'Semakan Kewangan', 'Permohonan bil sedang dalam proses semakan oleh bahagian kewangan.'),
      (4, 'Pengesahan Kewangan', 'Permohonan bil sedang disahkan oleh pegawai kewangan yang bertanggungjawab.'),
      (5, 'Kelulusan Kewangan', 'Permohonan bil menunggu kelulusan akhir daripada bahagian kewangan.'),
      (6, 'Diluluskan', 'Permohonan bil telah diluluskan dan boleh diproses untuk pembayaran.'),
      (7, 'Dibayar', 'Bayaran telah dibuat untuk permohonan bil ini.'),
      (8, 'Ditolak', 'Permohonan bil telah ditolak dan tidak akan diproses selanjutnya.');
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
      INSERT IGNORE INTO payment_type (id, payment_name, description) VALUES 
        (1, 'Bayaran Atas Talian', 'Pembayaran dilakukan secara atas talian melalui perbankan internet atau sistem pembayaran elektronik.'),
        (2, 'Cek', 'Pembayaran dilakukan menggunakan cek yang perlu diproses oleh pihak bank.');
    `);

    // Create default users for each role
    const defaultUsers = [
      { username: 'admin', email: 'admin@example.com', password: '1234565', role: 'admin' },
      { username: 'staff1', email: 'staff1@example.com', password: '123334556', role: 'staff' },
      { username: 'hod1', email: 'hod1@example.com', password: '123334556', role: 'hod' },
      { username: 'finance_check1', email: 'finance.check1@example.com', password: '1233456', role: 'finance_check' },
      { username: 'finance_verify1', email: 'finance.verify1@example.com', password: '1233456', role: 'finance_verify' },
      { username: 'finance_approval1', email: 'finance.approval1@example.com', password: '1233456', role: 'finance_approval' },
      { username: 'finance_payment1', email: 'finance.payment1@example.com', password: '1233456', role: 'finance_payment' }
    ];

    for (const user of defaultUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await pool.execute(`
        INSERT IGNORE INTO users (username, email, password_hash, role) 
        VALUES (?, ?, ?, ?)
      `, [user.username, user.email, hashedPassword, user.role]);
    }

    // Create default departments
    await pool.execute(`
      INSERT IGNORE INTO departments (name, code) VALUES
        ('AUDIT DALAMAN, SEKRETARIAT ANAK SYARIKAT DAN PEMANTAUAN', 'AUD'),
        ('KOMUNIKASI KORPORAT, MULTIMEDIA & IT', 'IT'),
        ('KEWANGAN & PERAKAUNAN', 'KPW'),
        ('LADANG HUTAN', 'LH'),
        ('LADANG MBI & ASAS TANI', 'LMBI'),
        ('PENGURUSAN ASET & PELABURAN', 'PAP'),
        ('PEMBALAKAN', 'PB'),
        ('PERUNDANGAN & DOCUMENT CONTROL', 'PDO'),
        ('PEMBANGUNAN HARTANAAH', 'PH'),
        ('PEJABAT KETUA PEGAWAI EKSEKUTIF', 'PKP'),
        ('PEMBANGUNAN PERNIAGAAN, PENGURUSAN ASET & PELABURAN', 'PPP'),
        ('SUMBER MANUSIA & PENTADBIRAN', 'SMP'),
        ('TENAGA & TENAGA DIPERBAHARUI', 'TT');
    `);

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
