const mongoose = require("mongoose");

const newsletterSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please enter a valid email",
      ],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    preferences: {
      auctionUpdates: {
        type: Boolean,
        default: true,
      },
      newListings: {
        type: Boolean,
        default: true,
      },
      expertTips: {
        type: Boolean,
        default: true,
      },
      weeklyDigest: {
        type: Boolean,
        default: true,
      },
    },
    source: {
      type: String,
      enum: ["footer", "blog", "contact", "popup", "manual"],
      default: "footer",
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    unsubscribeToken: {
      type: String,
      unique: true,
    },
    lastEmailSent: {
      type: Date,
    },
    emailsSent: {
      type: Number,
      default: 0,
    },
    bounced: {
      type: Boolean,
      default: false,
    },
    complained: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Generate unsubscribe token before saving
newsletterSchema.pre("save", function (next) {
  if (!this.unsubscribeToken) {
    this.unsubscribeToken = require("crypto").randomBytes(32).toString("hex");
  }
  next();
});

// Index for better query performance (email and unsubscribeToken already have unique indexes)
newsletterSchema.index({ isActive: 1 });

const Newsletter = mongoose.model("Newsletter", newsletterSchema);
module.exports = Newsletter;
