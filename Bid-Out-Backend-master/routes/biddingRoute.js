const express = require("express");
const {
  placeBid,
  getBiddingHistory,
  sellProduct,
  endAuction,
  getUserBiddingActivity,
  getTotalActiveBidsCount
} = require("../controllers/biddingCtr");
const { protect, isUser, isAdmin } = require("../middleWare/authMiddleWare");
const {
  biddingErrorHandler,
  validateBiddingRequest,
  validateBalance,
  logBiddingAttempt,
  rateLimitBidding
} = require("../middleWare/biddingErrorMiddleware");
const router = express.Router();

// Public routes
router.get("/stats/active-bids-count", getTotalActiveBidsCount);
router.get("/:productId", getBiddingHistory);

// Protected routes
router.post("/",
  protect,
  rateLimitBidding,
  logBiddingAttempt,
  // validateBiddingRequest, // Disabled for demo mode
  // validateBalance, // Disabled for demo mode
  placeBid
);
router.get("/user/activity", protect, getUserBiddingActivity);

// Allow all authenticated users to sell their own products and end their auctions
router.post("/sell", protect, sellProduct);
router.post("/end/:productId", protect, endAuction);

// Error handling middleware (must be last)
router.use(biddingErrorHandler);

module.exports = router;
