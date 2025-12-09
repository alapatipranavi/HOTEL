// backend/src/models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    guestName: { type: String, required: true },
    guestPhone: { type: String, required: true },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },

    idProofType: { type: String, required: true }, // e.g., Aadhar, Passport
    idProofNumber: { type: String, required: true },

    status: {
      type: String,
      enum: ['active', 'checked_out'],
      default: 'active',
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
