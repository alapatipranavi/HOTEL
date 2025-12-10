// backend/src/models/Log.js
const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {
    hotelName: {
      type: String,
      required: true,
      trim: true,
    },
    action: {
      type: String,
      required: true, // e.g. 'ROOM_CREATED', 'BOOKING_CREATED'
      trim: true,
    },
    entityType: {
      type: String,   // e.g. 'room', 'booking', 'user'
      trim: true,
    },
    entityId: {
      type: String,   // store ObjectId as string
      trim: true,
    },
    message: {
      type: String,
    },
    userName: {
      type: String,
      trim: true,
    },
    userRole: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Log", logSchema);
