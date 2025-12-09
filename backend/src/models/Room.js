// backend/src/models/Room.js
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    roomNumber: { type: String, required: true }, // ex: "101"
    roomType: {
      type: String,
      enum: ['single', 'double', 'suite', 'deluxe'],
      required: true,
    },
    costPerNight: { type: Number, required: true }, // in rupees
    amenities: [{ type: String }], // ["AC", "TV", "WiFi"]
    status: {
      type: String,
      enum: ['available', 'occupied', 'under_maintenance'],
      default: 'available',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Room', roomSchema);
