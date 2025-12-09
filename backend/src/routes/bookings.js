// backend/src/routes/bookings.js
const express = require('express');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const auth = require('../middleware/auth');
const Log = require('../models/Log');

const router = express.Router();

/**
 * GET /api/bookings
 * All bookings (latest first)
 */
router.get('/', auth, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('room')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error('GET BOOKINGS ERROR:', err.message);
    res
      .status(500)
      .json({ message: 'Failed to fetch bookings', error: err.message });
  }
});

/**
 * POST /api/bookings
 * Create new booking (admin + staff)
 */
router.post('/', auth, async (req, res) => {
  try {
    const {
      roomId,
      guestName,
      guestPhone,
      checkInDate,
      checkOutDate,
      idProofType,
      idProofNumber,
      isPaid,
    } = req.body;

    if (
      !roomId ||
      !guestName ||
      !guestPhone ||
      !checkInDate ||
      !checkOutDate ||
      !idProofType ||
      !idProofNumber
    ) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.status === 'occupied') {
      return res.status(400).json({ message: 'Room already occupied' });
    }

    const booking = await Booking.create({
      room: room._id,
      guestName,
      guestPhone,
      checkInDate: new Date(checkInDate),
      checkOutDate: new Date(checkOutDate),
      idProofType,
      idProofNumber,
      isPaid: !!isPaid,
    });

    // Mark room as occupied
    room.status = 'occupied';
    await room.save();

    const populated = await booking.populate('room');

    await Log.create({
    action: 'BOOKING_CREATED',
    entityType: 'booking',
    entityId: booking._id.toString(),
    message: `Booking created for room ${room.roomNumber} by ${guestName}`,
    userName: req.user?.name || 'System',
    userRole: req.user?.role || '',
});


    res.status(201).json(populated);
  } catch (err) {
    console.error('CREATE BOOKING ERROR:', err);
    res
      .status(500)
      .json({ message: 'Failed to create booking', error: err.message });
  }
});

/**
 * PUT /api/bookings/:id/payment
 * Toggle / set payment status
 */
router.put('/:id/payment', auth, async (req, res) => {
  try {
    const { isPaid } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { isPaid: !!isPaid },
      { new: true }
    ).populate('room');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    await Log.create({
    action: 'BOOKING_PAYMENT_UPDATE',
    entityType: 'booking',
    entityId: booking._id.toString(),
    message: `Payment status for booking ${booking._id} set to ${isPaid ? 'PAID' : 'UNPAID'}`,
    userName: req.user?.name || 'System',
    userRole: req.user?.role || '',
});


    res.json(booking);
  } catch (err) {
    console.error('UPDATE PAYMENT ERROR:', err.message);
    res
      .status(500)
      .json({ message: 'Failed to update payment', error: err.message });
  }
});

/**
 * PUT /api/bookings/:id/checkout
 * Checkout: mark booking checked_out + free room
 */
router.put('/:id/checkout', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status === 'checked_out') {
      return res.status(400).json({ message: 'Booking already checked out' });
    }

    booking.status = 'checked_out';
    await booking.save();

    // Room becomes available again
    const room = await Room.findById(booking.room);
    if (room) {
      room.status = 'available';
      await room.save();
    }

    const populated = await booking.populate('room');

    await Log.create({
    action: 'BOOKING_CHECKOUT',
    entityType: 'booking',
    entityId: booking._id.toString(),
    message: `Guest ${booking.guestName} checked out from room ${room?.roomNumber}`,
    userName: req.user?.name || 'System',
    userRole: req.user?.role || '',
});


    res.json(populated);
  } catch (err) {
    console.error('CHECKOUT ERROR:', err.message);
    res
      .status(500)
      .json({ message: 'Failed to checkout', error: err.message });
  }
});

module.exports = router;
