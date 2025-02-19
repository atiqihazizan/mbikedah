require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    await connection.connect();
    console.log('Successfully connected to database!');
    
    // Test query
    const [rows] = await connection.execute('SELECT 1 + 1 AS result');
    console.log('Test query result:', rows[0].result);
    
    console.log('Database connection details:');
    console.log('Host:', process.env.DB_HOST);
    console.log('User:', process.env.DB_USER);
    console.log('Database:', process.env.DB_NAME);
  } catch (error) {
    console.error('Database connection error:', error);
  } finally {
    await connection.end();
  }
}

testConnection();
