// backend/src/routes/logs.js
const express = require('express');
const Log = require('../models/Log');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/logs
 * Admin only – latest logs first
 */
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can view logs' });
    }

    const logs = await Log.find().sort({ createdAt: -1 }).limit(200);
    res.json(logs);
  } catch (err) {
    console.error('GET LOGS ERROR:', err.message);
    res
      .status(500)
      .json({ message: 'Failed to fetch logs', error: err.message });
  }
});

module.exports = router;
