// models/Hotel.js
const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: String,
  phone: String,
  // SaaS fields
  createdAt: { type: Date, default: Date.now },
  trialEndsAt: { type: Date },   // createdAt + 10 days
  isPaid: { type: Boolean, default: false }
});

module.exports = mongoose.model('Hotel', hotelSchema);
