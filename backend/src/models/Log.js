// backend/src/models/Log.js
const mongoose = require('mongoose');

const logSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },       // e.g. USER_REGISTER, ROOM_CREATED
    entityType: { type: String, required: true },   // user, room, booking, system
    entityId: { type: String },                     // e.g. room id, booking id
    message: { type: String },                      // human readable text
    userName: { type: String },                     // who did it
    userRole: { type: String },                     // admin / staff
  },
  { timestamps: true }
);

module.exports = mongoose.model('Log', logSchema);
