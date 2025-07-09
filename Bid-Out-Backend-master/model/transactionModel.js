const mongoose = require("mongoose");

const transactionSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        'DEPOSIT',           // User adds balance (demo payment)
        'BID_HOLD',          // Amount held when placing bid
        'BID_RELEASE',       // Amount released when outbid
        'BID_DEDUCTION',     // Final deduction when winning auction
        'REFUND',            // Manual refund
        'COMMISSION_PAYMENT', // Commission payment to admin
        'WITHDRAWAL'         // Future: when real withdrawals are implemented
      ],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    balanceBefore: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'],
      default: 'COMPLETED',
    },
    description: {
      type: String,
      required: true,
    },
    // Related entities
    relatedProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    relatedBid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BiddingProduct",
    },
    relatedAuction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuctionSession",
    },
    // Payment gateway info (for demo payments)
    paymentMethod: {
      type: String,
      enum: ['DEMO_CARD', 'DEMO_BANK', 'DEMO_MOBILE', 'SYSTEM'],
      default: 'SYSTEM',
    },
    paymentReference: {
      type: String, // Demo transaction reference
    },
    // Metadata
    metadata: {
      type: Object,
      default: {},
    },
    // IP and user agent for security
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    // For held amounts (bid holds)
    isHeld: {
      type: Boolean,
      default: false,
    },
    heldUntil: {
      type: Date, // When the hold expires
    },
    relatedHoldTransaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction", // Links release/deduction to original hold
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });
transactionSchema.index({ relatedProduct: 1 });
transactionSchema.index({ relatedBid: 1 });
transactionSchema.index({ isHeld: 1, heldUntil: 1 });

// Virtual for formatted amount
transactionSchema.virtual('formattedAmount').get(function() {
  return `${this.amount.toFixed(2)} ETB`;
});

// Method to check if transaction is a debit (reduces balance)
transactionSchema.methods.isDebit = function() {
  return ['BID_HOLD', 'BID_DEDUCTION', 'COMMISSION_PAYMENT', 'WITHDRAWAL'].includes(this.type);
};

// Method to check if transaction is a credit (increases balance)
transactionSchema.methods.isCredit = function() {
  return ['DEPOSIT', 'BID_RELEASE', 'REFUND'].includes(this.type);
};

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
