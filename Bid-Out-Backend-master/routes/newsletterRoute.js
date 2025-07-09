const express = require("express");
const {
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
  updateNewsletterPreferences,
  getNewsletterStats,
  getAllSubscribers,
  sendNewsletterToAll,
} = require("../controllers/newsletterController");
const { protect, isAdmin } = require("../middleWare/authMiddleWare");

const newsletterRoute = express.Router();

// Public routes
newsletterRoute.post("/subscribe", subscribeToNewsletter);
newsletterRoute.get("/unsubscribe/:token", unsubscribeFromNewsletter);
newsletterRoute.put("/preferences/:token", updateNewsletterPreferences);

// Admin routes
newsletterRoute.get("/stats", protect, isAdmin, getNewsletterStats);
newsletterRoute.get("/subscribers", protect, isAdmin, getAllSubscribers);
newsletterRoute.post("/send", protect, isAdmin, sendNewsletterToAll);

module.exports = newsletterRoute;
