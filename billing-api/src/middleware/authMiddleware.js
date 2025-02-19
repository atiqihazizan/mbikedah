const jwt = require('jsonwebtoken');
const { User } = require('../models/users');

exports.protect = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        error: 'Not authorized to access this route'
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({
          status: 'error',
          error: 'Not authorized to access this route'
        });
      }

      // Add user to request
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        status: 'error',
        error: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        error: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};
