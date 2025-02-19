const jwt = require('jsonwebtoken');

// Payload data for the token
const payload = {
  userId: 1, // Replace with actual user ID
  role: 'user', // Replace with actual user role
};

// Secret key for signing the token
const secret = 'mbiclickPro23'; // Use your actual secret key

// Options for the token
const options = {
  expiresIn: '24h', // Token expiry time
};

// Generate the token
const token = jwt.sign(payload, secret, options);

console.log('Generated JWT:', token);
