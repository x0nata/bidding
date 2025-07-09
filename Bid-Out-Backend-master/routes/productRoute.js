const express = require("express");
const {
  createProduct,
  getAllProducts,
  deleteProduct,
  updateProduct,
  getProductBySlug,
  getAllProductsByAmdin,
  deleteProductsByAmdin,
  getAllSoldProducts,
  verifyAndAddCommissionProductByAmdin,
  getAllProductsofUser,
  getWonProducts,
  getActiveAuctions,
  getUpcomingAuctions,
  getAuctionDetails,
  // New admin auction management functions
  getAllAuctionsForAdmin,
  updateAuctionByAdmin,
  endAuctionEarly,
  changeAuctionStatus,
  getAuctionBidHistory,
} = require("../controllers/productCtr");
const { upload } = require("../utils/fileUpload");
const { protect, isUser, isAdmin } = require("../middleWare/authMiddleWare");
const router = express.Router();

// Allow all authenticated users to create, update, and delete their own products
router.post("/", protect, upload.any(), createProduct);
router.delete("/:id", protect, deleteProduct);
router.put("/:id", protect, upload.any(), updateProduct);

router.get("/", getAllProducts);
router.get("/user", protect, getAllProductsofUser);
router.get("/won-products", protect, getWonProducts);
router.get("/sold", getAllSoldProducts);

// Auction-specific routes
router.get("/auctions/active", getActiveAuctions);
router.get("/auctions/upcoming", getUpcomingAuctions);
router.get("/auctions/:id/details", getAuctionDetails);

router.get("/:id", getProductBySlug);

// Only access for admin users
router.patch("/admin/product-verified/:id", protect, isAdmin, verifyAndAddCommissionProductByAmdin);
router.get("/admin/products", protect, isAdmin, getAllProductsByAmdin);
router.delete("/admin/products", protect, isAdmin, deleteProductsByAmdin);

// Enhanced admin auction management routes
router.get("/admin/auctions", protect, isAdmin, getAllAuctionsForAdmin);
router.put("/admin/auctions/:id", protect, isAdmin, updateAuctionByAdmin);
router.post("/admin/auctions/:id/end", protect, isAdmin, endAuctionEarly);
router.patch("/admin/auctions/:id/status", protect, isAdmin, changeAuctionStatus);
router.get("/admin/auctions/:id/bids", protect, isAdmin, getAuctionBidHistory);

module.exports = router;
