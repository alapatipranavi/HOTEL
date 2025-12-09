// middleware/subscription.js
const subscriptionCheck = (req, res, next) => {
  const hotel = req.user.hotel;

  // If still in trial
  const now = new Date();
  if (hotel.trialEndsAt && now <= hotel.trialEndsAt) {
    return next();
  }

  // Trial over, allow only if paid
  if (hotel.isPaid) return next();

  return res.status(402).json({ 
    message: 'Subscription expired. Please upgrade plan.' 
  });
};

module.exports = subscriptionCheck;
