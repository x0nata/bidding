const express = require("express");
const {
  addBalance,
  getBalanceInfo,
  getTransactionHistory,
  getPaymentMethods,
  validatePaymentDetails
} = require("../controllers/paymentCtr");
const { protect } = require("../middleWare/authMiddleWare");
const router = express.Router();

// All payment routes require authentication
router.use(protect);

// Payment methods and validation
router.get("/methods", getPaymentMethods);
router.post("/validate", validatePaymentDetails);

// Balance management
router.post("/add-balance", addBalance);
router.get("/balance", getBalanceInfo);

// Transaction history
router.get("/transactions", getTransactionHistory);

module.exports = router;
