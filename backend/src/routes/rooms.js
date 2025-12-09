// backend/src/routes/rooms.js
const express = require('express');
const Room = require('../models/Room');
const auth = require('../middleware/auth');
const Log = require('../models/Log');

const router = express.Router();

/**
 * GET /api/rooms
 * Admin & staff – can view rooms
 */
router.get('/', auth, async (req, res) => {
  try {
    const rooms = await Room.find().sort({ roomNumber: 1 });
    res.json(rooms);
  } catch (err) {
    console.error('GET ROOMS ERROR:', err.message);
    res
      .status(500)
      .json({ message: 'Failed to fetch rooms', error: err.message });
  }
});

/**
 * POST /api/rooms
 * ONLY ADMIN can add new room
 */
router.post('/', auth, async (req, res) => {
  try {
    // role check
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create rooms' });
    }

    const { roomNumber, roomType, costPerNight, amenities } = req.body;

    console.log('CREATE ROOM BODY:', req.body);

    if (!roomNumber || !roomType || !costPerNight) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const existing = await Room.findOne({ roomNumber });
    if (existing) {
      return res.status(400).json({ message: 'Room number already exists' });
    }

    const room = await Room.create({
      roomNumber,
      roomType,
      costPerNight,
      amenities: amenities || [],
    });

    await Log.create({
    action: 'ROOM_CREATED',
    entityType: 'room',
    entityId: room._id.toString(),
    message: `Room ${room.roomNumber} (${room.roomType}) created at ₹${room.costPerNight}/night`,
    userName: req.user?.name || 'System',
    userRole: req.user?.role || '',
});


    res.status(201).json(room);
  } catch (err) {
    console.error('CREATE ROOM ERROR:', err);
    res
      .status(500)
      .json({ message: 'Failed to create room', error: err.message });
  }
});

/**
 * PUT /api/rooms/:id/status
 * Admin & staff – can change status
 */
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['available', 'occupied', 'under_maintenance'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    await Log.create({
    action: 'ROOM_STATUS_CHANGE',
    entityType: 'room',
    entityId: room._id.toString(),
    message: `Room ${room.roomNumber} status changed to ${status}`,
    userName: req.user?.name || 'System',
    userRole: req.user?.role || '',
});


    res.json(room);
  } catch (err) {
    console.error('UPDATE STATUS ERROR:', err.message);
    res
      .status(500)
      .json({ message: 'Failed to update status', error: err.message });
  }
});

module.exports = router;
