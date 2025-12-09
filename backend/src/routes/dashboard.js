const express = require("express");
const router = express.Router();
const requirePlan = require("../middleware/planGuard");
const auth = require("../middleware/auth");
const User = require("../models/User");
const Room = require("../models/Room");
const Booking = require("../models/Booking");

// GET /api/dashboard/summary
router.get("/summary", auth, requirePlan, async (req, res) => {
  try {
    // Only rooms and bookings of the same hotel
    const rooms = await Room.find({ hotelName: req.user.hotelName });
    const bookings = await Booking.find({ hotelName: req.user.hotelName });

    const totalRooms = rooms.length;
    const availableRooms = rooms.filter((r) => r.status === "available").length;
    const occupiedRooms = rooms.filter((r) => r.status === "occupied").length;
    const maintenanceRooms = rooms.filter((r) => r.status === "under_maintenance").length;

    const activeBookings = bookings.filter((b) => b.status === "active").length;

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    const todayCheckins = bookings.filter(
      (b) => b.checkInDate >= startOfDay && b.checkInDate <= endOfDay && b.status === "active"
    ).length;

    const todayCheckouts = bookings.filter(
      (b) => b.checkOutDate >= startOfDay && b.checkOutDate <= endOfDay && b.status !== "active"
    ).length;

    res.json({
      totalRooms,
      availableRooms,
      occupiedRooms,
      maintenanceRooms,
      activeBookings,
      todayCheckins,
      todayCheckouts,
    });
  } catch (err) {
    console.error("DASHBOARD SUMMARY ERROR:", err);
    res.status(500).json({ message: "Failed to load dashboard" });
  }
});

// GET /api/dashboard/recent-bookings
router.get("/recent-bookings", auth, requirePlan, async (req, res) => {
  try {
    const bookings = await Booking.find({ hotelName: req.user.hotelName })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("room");

    const cleaned = bookings.map((b) => ({
      _id: b._id,
      guestName: b.guestName,
      guestPhone: b.guestPhone,
      room: b.room,
      checkInDate: b.checkInDate,
      checkOutDate: b.checkOutDate,
      isPaid: b.isPaid,
      status: b.status,
      createdAt: b.createdAt,
    }));

    res.json(cleaned);
  } catch (err) {
    console.error("RECENT BOOKINGS ERROR:", err);
    res.status(500).json({ message: "Failed to load recent bookings" });
  }
});

// PUT /api/dashboard/upgrade-plan
router.put("/upgrade-plan", auth, requirePlan, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);

    if (!currentUser) return res.status(404).json({ message: "User not found" });
    if (currentUser.role !== "admin") return res.status(403).json({ message: "Only admin allowed" });

    await User.updateMany(
      { hotelName: currentUser.hotelName },
      { $set: { planType: "paid", trialEndsAt: null } }
    );

    return res.json({
      success: true,
      message: `Plan upgraded to PAID for hotel "${currentUser.hotelName}"`,
    });
  } catch (err) {
    console.error("UPGRADE PLAN ERROR:", err);
    res.status(500).json({ message: "Plan upgrade failed" });
  }
});

module.exports = router;
