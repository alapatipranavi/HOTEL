// middleware/authSocket.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('No token'));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).populate('hotel');
    if (!user) return next(new Error('User not found'));

    socket.user = {
      id: user._id.toString(),
      hotelId: user.hotel._id.toString(),
      role: user.role
    };
    next();
  } catch (err) {
    next(new Error('Auth failed'));
  }
};
