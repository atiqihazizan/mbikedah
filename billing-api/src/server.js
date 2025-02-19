require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { testConnection } = require('./config/database');
const { initializeTables } = require('./models');

// Import routes
const authRoutes = require('./routes/authRoutes');
const billingRoutes = require('./routes/billingRoutes');

// Create Express app
const app = express();

// Connect to MySQL and initialize tables
const initializeApp = async () => {
  try {
    await testConnection();
    await initializeTables();
  } catch (error) {
    console.error('Failed to initialize application:', error);
    process.exit(1);
  }
};

initializeApp();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/billings', billingRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
