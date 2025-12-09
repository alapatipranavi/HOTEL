const express = require('express');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const auth = require('../middleware/auth');
const Log = require('../models/Log');
const requirePlan = require("../middleware/planGuard");

const router = express.Router();

/**
 * GET /api/bookings
 * Only bookings of logged-in user's hotel
 */
router.get('/', auth, requirePlan, async (req, res) => {
  try {
    const bookings = await Booking.find({ hotelName: req.user.hotelName })
      .populate('room')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error('GET BOOKINGS ERROR:', err.message);
    res.status(500).json({ message: 'Failed to fetch bookings', error: err.message });
  }
});

/**
 * POST /api/bookings
 * Create new booking (admin + staff) — only same hotel rooms
 */
router.post('/', auth, requirePlan, async (req, res) => {
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

    if (!roomId || !guestName || !guestPhone || !checkInDate || !checkOutDate
      || !idProofType || !idProofNumber) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const room = await Room.findOne({
      _id: roomId,
      hotelName: req.user.hotelName,
    });

    if (!room) {
      return res.status(404).json({ message: 'Room not found in your hotel' });
    }

    if (room.status === 'occupied') {
      return res.status(400).json({ message: 'Room already occupied' });
    }

    const booking = await Booking.create({
      hotelName: req.user.hotelName, // ⭐ important
      room: room._id,
      guestName,
      guestPhone,
      checkInDate,
      checkOutDate,
      idProofType,
      idProofNumber,
      isPaid: !!isPaid,
      status: 'active',
    });

    // Update room status
    room.status = 'occupied';
    await room.save();

    const populated = await booking.populate('room');

    await Log.create({
      hotelName: req.user.hotelName,
      action: 'BOOKING_CREATED',
      entityType: 'booking',
      entityId: booking._id.toString(),
      message: `Booking created for room ${room.roomNumber}`,
      userName: req.user?.name,
      userRole: req.user?.role
    });

    res.status(201).json(populated);

  } catch (err) {
    console.error('CREATE BOOKING ERROR:', err);
    res.status(500).json({ message: 'Failed to create booking', error: err.message });
  }
});

/**
 * PUT /api/bookings/:id/payment
 * Only own hotel bookings
 */
router.put('/:id/payment', auth, requirePlan, async (req, res) => {
  try {
    const { isPaid } = req.body;

    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, hotelName: req.user.hotelName },
      { isPaid: !!isPaid },
      { new: true }
    ).populate('room');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found for your hotel' });
    }

    await Log.create({
      hotelName: req.user.hotelName,
      action: 'BOOKING_PAYMENT_UPDATE',
      entityType: 'booking',
      entityId: booking._id.toString(),
      message: `Payment updated: ${isPaid ? 'PAID' : 'UNPAID'}`,
      userName: req.user?.name,
      userRole: req.user?.role
    });

    res.json(booking);

  } catch (err) {
    console.error('UPDATE PAYMENT ERROR:', err.message);
    res.status(500).json({ message: 'Failed to update payment', error: err.message });
  }
});

/**
 * PUT /api/bookings/:id/checkout
 * Only own hotel bookings
 */
router.put('/:id/checkout', auth, requirePlan, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      hotelName: req.user.hotelName,
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found for your hotel' });
    }

    if (booking.status === 'checked_out') {
      return res.status(400).json({ message: 'Booking already checked out' });
    }

    booking.status = 'checked_out';
    await booking.save();

    const room = await Room.findOne({
      _id: booking.room,
      hotelName: req.user.hotelName,
    });

    if (room) {
      room.status = 'available';
      await room.save();
    }

    const populated = await booking.populate('room');

    await Log.create({
      hotelName: req.user.hotelName,
      action: 'BOOKING_CHECKOUT',
      entityType: 'booking',
      entityId: booking._id.toString(),
      message: `Checkout - room ${room?.roomNumber}`,
      userName: req.user?.name,
      userRole: req.user?.role
    });

    res.json(populated);

  } catch (err) {
    console.error('CHECKOUT ERROR:', err.message);
    res.status(500).json({ message: 'Checkout failed', error: err.message });
  }
});

module.exports = router;
