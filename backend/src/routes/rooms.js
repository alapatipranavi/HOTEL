const express = require('express');
const Room = require('../models/Room');
const auth = require('../middleware/auth');
const Log = require('../models/Log');
const requirePlan = require("../middleware/planGuard");

const router = express.Router();

/**
 * GET /api/rooms
 * Admin & staff – View only their hotel rooms
 */
router.get('/', auth, requirePlan, async (req, res) => {
  try {
    const rooms = await Room.find({ hotelName: req.user.hotelName })
      .sort({ roomNumber: 1 });

    res.json(rooms);
  } catch (err) {
    console.error('GET ROOMS ERROR:', err.message);
    res.status(500).json({
      message: 'Failed to fetch rooms',
      error: err.message
    });
  }
});

/**
 * POST /api/rooms
 * ONLY Admin – Add new room (hotel specific)
 */
router.post('/', auth, requirePlan, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create rooms' });
    }

    const { roomNumber, roomType, costPerNight, amenities } = req.body;

    if (!roomNumber || !roomType || !costPerNight) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    // Check room uniqueness inside same hotel
    const existing = await Room.findOne({
      roomNumber,
      hotelName: req.user.hotelName
    });

    if (existing) {
      return res.status(400).json({ message: 'Room number already exists in this hotel' });
    }

    const room = await Room.create({
      hotelName: req.user.hotelName, // ⭐ important
      roomNumber,
      roomType,
      costPerNight,
      amenities: amenities || []
    });

    await Log.create({
      hotelName: req.user.hotelName,
      action: 'ROOM_CREATED',
      entityType: 'room',
      entityId: room._id.toString(),
      message: `Room ${room.roomNumber} (${room.roomType}) created at ₹${room.costPerNight}/night`,
      userName: req.user?.name,
      userRole: req.user?.role
    });

    res.status(201).json(room);

  } catch (err) {
    console.error('CREATE ROOM ERROR:', err);
    res.status(500).json({
      message: 'Failed to create room',
      error: err.message
    });
  }
});

/**
 * PUT /api/rooms/:id/status
 * Admin & Staff – Update status (hotel restricted)
 */
router.put('/:id/status', auth, requirePlan, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['available', 'occupied', 'under_maintenance'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const room = await Room.findOneAndUpdate(
      { _id: req.params.id, hotelName: req.user.hotelName }, // ⭐ only own hotel rooms
      { status },
      { new: true }
    );

    if (!room) {
      return res.status(404).json({ message: 'Room not found in your hotel' });
    }

    await Log.create({
      hotelName: req.user.hotelName,
      action: 'ROOM_STATUS_CHANGE',
      entityType: 'room',
      entityId: room._id.toString(),
      message: `Room ${room.roomNumber} status changed to ${status}`,
      userName: req.user?.name,
      userRole: req.user?.role
    });

    res.json(room);

  } catch (err) {
    console.error('UPDATE STATUS ERROR:', err.message);
    res.status(500).json({
      message: 'Failed to update status',
      error: err.message
    });
  }
});

module.exports = router;
