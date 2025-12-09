// backend/src/routes/dashboard.js
const express = require('express');
const auth = require('../middleware/auth');
const Room = require('../models/Room');
const Booking = require('../models/Booking');

const router = express.Router();

/**
 * GET /api/dashboard/summary
 * Basic stats for dashboard
 */
router.get('/summary', auth, async (req, res) => {
  try {
    // date range for "today"
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const [
      totalRooms,
      availableRooms,
      occupiedRooms,
      maintenanceRooms,
      activeBookings,
      todayCheckins,
      todayCheckouts,
      recentBookings,
    ] = await Promise.all([
      Room.countDocuments(),
      Room.countDocuments({ status: 'available' }),
      Room.countDocuments({ status: 'occupied' }),
      Room.countDocuments({ status: 'under_maintenance' }),
      Booking.countDocuments({ status: 'active' }),
      Booking.countDocuments({
        checkInDate: { $gte: start, $lte: end },
      }),
      Booking.countDocuments({
        checkOutDate: { $gte: start, $lte: end },
      }),
      Booking.find()
        .populate('room')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    res.json({
      totalRooms,
      availableRooms,
      occupiedRooms,
      maintenanceRooms,
      activeBookings,
      todayCheckins,
      todayCheckouts,
      recentBookings,
    });
  } catch (err) {
    console.error('DASHBOARD SUMMARY ERROR:', err.message);
    res
      .status(500)
      .json({ message: 'Failed to load dashboard', error: err.message });
  }
});

module.exports = router;
