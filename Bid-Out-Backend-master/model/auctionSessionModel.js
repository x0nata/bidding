const mongoose = require("mongoose");

const AuctionSessionSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Auction session title is required"],
    },
    description: {
      type: String,
    },
    auctioneer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sessionType: {
      type: String,
      enum: ['Live', 'Timed', 'Silent'],
      default: 'Live',
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Preview', 'Live', 'Paused', 'Completed', 'Cancelled'],
      default: 'Scheduled',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    previewStartDate: {
      type: Date, // When bidders can preview items
    },
    registrationDeadline: {
      type: Date,
    },
    // Products included in this auction session
    products: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      lotNumber: {
        type: Number,
        required: true,
      },
      estimatedValue: {
        low: { type: Number },
        high: { type: Number },
      },
      order: {
        type: Number,
        default: 0,
      },
    }],
    // Registered bidders
    registeredBidders: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      bidderNumber: {
        type: String,
        required: true,
      },
      registrationDate: {
        type: Date,
        default: Date.now,
      },
      depositAmount: {
        type: Number,
        default: 0,
      },
      isApproved: {
        type: Boolean,
        default: false,
      },
    }],
    // Session settings
    settings: {
      bidIncrement: {
        type: Number,
        default: 10,
      },
      extendTime: {
        type: Number,
        default: 300, // seconds to extend when bid placed near end
      },
      requireRegistration: {
        type: Boolean,
        default: true,
      },
      requireDeposit: {
        type: Boolean,
        default: false,
      },
      allowProxyBids: {
        type: Boolean,
        default: true,
      },
    },
    // Statistics
    stats: {
      totalLots: {
        type: Number,
        default: 0,
      },
      totalBids: {
        type: Number,
        default: 0,
      },
      totalValue: {
        type: Number,
        default: 0,
      },
      soldLots: {
        type: Number,
        default: 0,
      },
      unsoldLots: {
        type: Number,
        default: 0,
      },
    },
    // Live auction specific fields
    currentLot: {
      type: Number,
      default: 0,
    },
    isLive: {
      type: Boolean,
      default: false,
    },
    liveViewers: {
      type: Number,
      default: 0,
    },
    // Streaming/webcast info
    streamUrl: {
      type: String,
    },
    chatEnabled: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
AuctionSessionSchema.index({ startDate: 1, status: 1 });
AuctionSessionSchema.index({ "products.product": 1 });
AuctionSessionSchema.index({ "registeredBidders.user": 1 });

const AuctionSession = mongoose.model("AuctionSession", AuctionSessionSchema);
module.exports = AuctionSession;
