// backend/src/routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// helper: create token + clean user object
function buildUserResponse(user) {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      hotelName: user.hotelName,
      planType: user.planType,
      trialEndsAt: user.trialEndsAt,
    },
  };
}

// REGISTER – create account (admin / staff)
router.post('/register', async (req, res) => {
  try {
    const { hotelName, name, email, password, role } = req.body;

    if (!hotelName || !name || !email || !password || !role) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already used' });
    }

    // 10 days trial from now
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 10);

    const user = await User.create({
      hotelName,
      name,
      email,
      password,
      role,
      planType: 'trial',
      trialEndsAt,
    });

    const { token, user: userResp } = buildUserResponse(user);
    res.json({ token, user: userResp });
  } catch (err) {
    console.error('REGISTER ERROR:', err.message);
    res
      .status(500)
      .json({ message: 'Registration failed', error: err.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Missing email or password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const ok = await user.comparePassword(password);
    if (!ok) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const { token, user: userResp } = buildUserResponse(user);
    res.json({ token, user: userResp });
  } catch (err) {
    console.error('LOGIN ERROR:', err.message);
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

// GET CURRENT USER DETAILS
router.get('/me', auth, async (req, res) => {
  try {
    const user = req.user;
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      hotelName: user.hotelName,
      planType: user.planType,
      trialEndsAt: user.trialEndsAt,
    });
  } catch (err) {
    console.error('ME ERROR:', err.message);
    res.status(500).json({ message: 'Failed to load profile' });
  }
});

// UPDATE PROFILE (name, hotelName for admin)
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, hotelName } = req.body;
    const user = req.user;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    user.name = name;

    if (hotelName && user.role === 'admin') {
      user.hotelName = hotelName;
    }

    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      hotelName: user.hotelName,
      planType: user.planType,
      trialEndsAt: user.trialEndsAt,
    });
  } catch (err) {
    console.error('PROFILE UPDATE ERROR:', err.message);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// CHANGE PASSWORD
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: 'Current and new password are required' });
    }

    const ok = await user.comparePassword(currentPassword);
    if (!ok) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: 'New password must be at least 6 characters' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('CHANGE PASSWORD ERROR:', err.message);
    res.status(500).json({ message: 'Failed to change password' });
  }
});

// MARK HOTEL AS PAID (Admin only)
router.put('/settings/mark-paid', auth, async (req, res) => {
  try {
    const user = req.user;

    if (user.role !== 'admin') {
      return res
        .status(403)
        .json({ message: 'Only admins can update plan settings' });
    }

    user.planType = 'paid';
    user.trialEndsAt = null;
    await user.save();

    res.json({
      message: 'Marked as paid plan',
      planType: user.planType,
      trialEndsAt: user.trialEndsAt,
    });
  } catch (err) {
    console.error('SETTINGS UPDATE ERROR:', err.message);
    res.status(500).json({ message: 'Failed to update settings' });
  }
});

module.exports = router;
