// backend/src/middleware/planGuard.js
const User = require("../models/User");

module.exports = async function requireActivePlan(req, res, next) {
  try {
    // auth middleware token decode chesi req.user.id ni set chesundi
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Paid plan aina direct allow
    if (user.planType === "paid") {
      return next();
    }

    // Trial info lekapoyina accidental case – allow (or you can block if you want)
    if (!user.trialEndsAt) {
      return next();
    }

    const now = new Date();
    const end = new Date(user.trialEndsAt);

    if (now > end) {
      // 🔒 Trial ipudu expiry ayipoyindi → block all actions
      return res.status(402).json({
        code: "TRIAL_EXPIRED",
        message:
          "Your hotel's free trial has expired. Please contact the owner to activate a paid plan.",
        trialEndsAt: user.trialEndsAt,
      });
    }

    // Trial still active → allow
    return next();
  } catch (err) {
    console.error("PLAN GUARD ERROR:", err);
    return res.status(500).json({ message: "Plan verification failed" });
  }
};
