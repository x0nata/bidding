const mongoose = require("mongoose");

const BiddingProductSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: "User",
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: "Product",
    },
    price: {
      type: Number,
      require: [true, "Please add a Price"],
    },
    // Enhanced bidding fields for antique auctions
    bidType: {
      type: String,
      enum: ['Manual', 'Proxy', 'Auto'],
      default: 'Manual',
    },
    maxBid: {
      type: Number, // For proxy bidding
    },
    isWinningBid: {
      type: Boolean,
      default: false,
    },
    bidStatus: {
      type: String,
      enum: ['Active', 'Outbid', 'Winning', 'Won', 'Lost'],
      default: 'Active',
    },
    bidIncrement: {
      type: Number,
      default: 10,
    },
    bidderNumber: {
      type: String, // Anonymous bidder number for live auctions
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    // Balance hold transaction reference
    holdTransactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
    },
    // Auction session info for live auctions
    auctionSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuctionSession",
    },
    // Notification preferences
    notifications: {
      outbid: { type: Boolean, default: true },
      winning: { type: Boolean, default: true },
      auctionEnd: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);
const biddingproduct = mongoose.model("BiddingProduct", BiddingProductSchema);
module.exports = biddingproduct;
