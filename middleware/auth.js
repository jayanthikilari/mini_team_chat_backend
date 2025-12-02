const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  const auth = req.header('Authorization');
  if (!auth) return res.status(401).json({ msg: 'No token' });
  const token = auth.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-passwordHash');
    if (!req.user) return res.status(401).json({ msg: 'Invalid token' });
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token invalid' });
  }
};
