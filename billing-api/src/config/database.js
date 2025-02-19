const mysql = require('mysql2/promise');
require('dotenv').config();

const createPool = () => {
  return mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    namedPlaceholders: true
  });
};

let pool = createPool();

// Test the connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    await connection.query('SELECT 1 + 1 AS result');
    console.log('Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('Error connecting to the database:', error);
    return false;
  }
};

// Reconnect function
const reconnect = () => {
  pool = createPool();
  return testConnection();
};

module.exports = { pool, testConnection, reconnect };
