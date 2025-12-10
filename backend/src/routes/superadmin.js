// backend/src/routes/superadmin.js
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const User = require("../models/User");

/**
 * Simple middleware: only superadmin allowed
 */
function requireSuperAdmin(req, res, next) {
  if (!req.user || req.user.role !== "superadmin") {
    return res.status(403).json({ message: "Only super admin can access this." });
  }
  next();
}

/**
 * GET /api/superadmin/hotels
 * → List all hotels (grouped by hotelName)
 */
router.get("/hotels", auth, requireSuperAdmin, async (req, res) => {
  try {
    const users = await User.find().sort({ hotelName: 1, createdAt: 1 });

    const hotelsMap = new Map();

    for (const u of users) {
      if (!u.hotelName) continue;
      const key = u.hotelName;

      if (!hotelsMap.has(key)) {
        hotelsMap.set(key, {
          hotelName: key,
          planType: u.planType || "trial",
          trialEndsAt: u.trialEndsAt || null,
          usersCount: 0,
          adminsCount: 0,
          staffCount: 0,
          firstCreatedAt: u.createdAt,
        });
      }

      const h = hotelsMap.get(key);
      h.usersCount += 1;
      if (u.role === "admin") h.adminsCount += 1;
      if (u.role === "staff") h.staffCount += 1;

      // If any user already paid, treat hotel as paid
      if (u.planType === "paid") {
        h.planType = "paid";
        h.trialEndsAt = null;
      }

      // earliest createdAt
      if (u.createdAt && h.firstCreatedAt && u.createdAt < h.firstCreatedAt) {
        h.firstCreatedAt = u.createdAt;
      }
    }

    const hotels = Array.from(hotelsMap.values());

    res.json(hotels);
  } catch (err) {
    console.error("SUPERADMIN GET HOTELS ERROR:", err);
    res.status(500).json({ message: "Failed to load hotels list" });
  }
});

/**
 * PUT /api/superadmin/hotels/:hotelName/plan
 * body: { planType: 'paid' }  → mark as paid
 *    or { planType: 'trial', days: 10 } → reset trial for X days
 */
router.put("/hotels/:hotelName/plan", auth, requireSuperAdmin, async (req, res) => {
  try {
    const rawHotelName = req.params.hotelName;
    const hotelName = decodeURIComponent(rawHotelName);
    const { planType, days } = req.body;

    if (!planType || !["paid", "trial"].includes(planType)) {
      return res.status(400).json({ message: "Invalid planType. Use 'paid' or 'trial'." });
    }

    let update = {};

    if (planType === "paid") {
      update = {
        planType: "paid",
        trialEndsAt: null,
      };
    } else {
      // reset trial for X days (default 10)
      const trialDays = Number(days) || 10;
      const now = new Date();
      const end = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);

      update = {
        planType: "trial",
        trialEndsAt: end,
      };
    }

    const result = await User.updateMany(
      { hotelName },
      { $set: update }
    );

    if (result.matchedCount === 0 && result.modifiedCount === 0) {
      return res.status(404).json({ message: "No users found for that hotel" });
    }

    return res.json({
      success: true,
      message:
        planType === "paid"
          ? `Hotel "${hotelName}" marked as PAID`
          : `Hotel "${hotelName}" trial set to ${Number(days) || 10} days from today`,
    });
  } catch (err) {
    console.error("SUPERADMIN UPDATE HOTEL PLAN ERROR:", err);
    res.status(500).json({ message: "Failed to update hotel plan" });
  }
});

module.exports = router;
