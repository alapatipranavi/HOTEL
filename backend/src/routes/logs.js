const express = require('express');
const Log = require('../models/Log');
const auth = require('../middleware/auth');
const requirePlan = require("../middleware/planGuard");

const router = express.Router();

// GET /api/logs
router.get('/', auth, requirePlan, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can view logs' });
    }

    const logs = await Log.find({ hotelName: req.user.hotelName })
      .sort({ createdAt: -1 })
      .limit(200);

    res.json(logs);
  } catch (err) {
    console.error('GET LOGS ERROR:', err.message);
    res.status(500).json({ message: 'Failed to fetch logs' });
  }
});

module.exports = router;
