const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    hotelName: {
      type: String,
      required: true,
      trim: true,
    },
    roomNumber: {
      type: String,
      required: true,
      trim: true
    },
    roomType: {
      type: String,
      enum: ['single', 'double', 'suite', 'deluxe'],
      required: true,
    },
    costPerNight: {
      type: Number,
      required: true,
    },
    amenities: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: ['available', 'occupied', 'under_maintenance'],
      default: 'available',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Room', roomSchema);
