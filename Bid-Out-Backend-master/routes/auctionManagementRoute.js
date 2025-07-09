const express = require("express");
const asyncHandler = require("express-async-handler");
const ServerlessAuctionService = require("../services/serverlessAuctionService");
const ServerlessSocketService = require("../services/serverlessSocketService");
const { protect, isAdmin } = require("../middleWare/authMiddleWare");

const router = express.Router();
const auctionService = new ServerlessAuctionService();
const socketService = new ServerlessSocketService();

/**
 * @route   POST /api/auction-management/process-expired
 * @desc    Process expired auctions (to be called by cron jobs)
 * @access  Public (for Vercel Cron)
 */
router.post("/process-expired", asyncHandler(async (req, res) => {
  try {
    console.log('🔄 Processing expired auctions via cron job');

    const result = await auctionService.processExpiredAuctions();
    res.status(200).json({
      success: true,
      message: "Expired auctions processed successfully",
      data: result
    });
  } catch (error) {
    console.error('❌ Failed to process expired auctions:', error);
    res.status(500).json({
      success: false,
      message: "Failed to process expired auctions",
      error: error.message
    });
  }
}));

/**
 * @route   POST /api/auction-management/process-expired-admin
 * @desc    Process expired auctions (admin access)
 * @access  Admin only
 */
router.post("/process-expired-admin", protect, isAdmin, asyncHandler(async (req, res) => {
  try {
    const result = await auctionService.processExpiredAuctions();
    res.status(200).json({
      success: true,
      message: "Expired auctions processed successfully",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to process expired auctions",
      error: error.message
    });
  }
}));

/**
 * @route   POST /api/auction-management/end-auction/:id
 * @desc    Manually end a specific auction
 * @access  Admin only
 */
router.post("/end-auction/:id", protect, isAdmin, asyncHandler(async (req, res) => {
  try {
    const result = await auctionService.endAuction(req.params.id);
    res.status(200).json({
      success: true,
      message: "Auction ended successfully",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to end auction",
      error: error.message
    });
  }
}));

/**
 * @route   GET /api/auction-management/ending-soon
 * @desc    Get auctions ending soon
 * @access  Admin only
 */
router.get("/ending-soon", protect, isAdmin, asyncHandler(async (req, res) => {
  try {
    const minutesAhead = parseInt(req.query.minutes) || 30;
    const auctions = await auctionService.getAuctionsEndingSoon(minutesAhead);
    res.status(200).json({
      success: true,
      data: auctions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get auctions ending soon",
      error: error.message
    });
  }
}));

/**
 * @route   POST /api/auction-management/check-extension/:id
 * @desc    Check if auction should be extended
 * @access  Public (can be called by frontend)
 */
router.post("/check-extension/:id", asyncHandler(async (req, res) => {
  try {
    const result = await auctionService.checkAuctionExtension(req.params.id);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to check auction extension",
      error: error.message
    });
  }
}));

/**
 * @route   GET /api/auction-management/auction-state/:id
 * @desc    Get current auction state (for polling)
 * @access  Public
 */
router.get("/auction-state/:id", asyncHandler(async (req, res) => {
  try {
    const state = await socketService.getCurrentAuctionState(req.params.id);
    res.status(200).json({
      success: true,
      data: state
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get auction state",
      error: error.message
    });
  }
}));

/**
 * @route   GET /api/auction-management/bid-activity/:id
 * @desc    Get recent bid activity for an auction
 * @access  Public
 */
router.get("/bid-activity/:id", asyncHandler(async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const activity = await socketService.getRecentBidActivity(req.params.id, limit);
    res.status(200).json({
      success: true,
      data: activity
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get bid activity",
      error: error.message
    });
  }
}));

/**
 * @route   GET /api/auction-management/stats/:id
 * @desc    Get auction statistics
 * @access  Public
 */
router.get("/stats/:id", asyncHandler(async (req, res) => {
  try {
    const stats = await socketService.getAuctionStats(req.params.id);
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get auction stats",
      error: error.message
    });
  }
}));

/**
 * @route   GET /api/auction-management/health
 * @desc    Health check for auction management service
 * @access  Public
 */
router.get("/health", asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Auction management service is healthy",
    timestamp: new Date().toISOString(),
    services: {
      auctionService: "active",
      socketService: "active (serverless mode)"
    }
  });
}));

module.exports = router;
