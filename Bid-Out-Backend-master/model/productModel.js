const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: [true, "Please add a title"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
      trim: true,
    },
    image: {
      type: Object,
      default: {},
    },
    category: {
      type: String,
      required: [true, "Post category is required"],
      default: "All",
    },
    commission: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "Please add a Price"],
    },
    height: {
      type: Number,
    },
    lengthpic: {
      type: Number,
    },
    width: {
      type: Number,
    },
    mediumused: {
      type: String,
    },
    weigth: {
      type: Number,
    },
    // Antique-specific fields
    era: {
      type: String,
      // Removed strict enum to allow flexible user input
      // Common values: Ancient, Medieval, Renaissance, Baroque, Georgian, Victorian, Edwardian, Art Nouveau, Art Deco, Mid-Century Modern, Contemporary
      trim: true,
    },
    period: {
      type: String, // Specific time period (e.g., "1850-1870", "Early 19th Century")
    },
    provenance: {
      type: String, // History of ownership and origin
    },
    condition: {
      type: String,
      // Made more flexible - common values: Excellent, Very Good, Good, Fair, Poor, Restoration Required
      default: 'Good',
      trim: true,
    },
    conditionDetails: {
      type: String, // Detailed condition description
    },
    authenticity: {
      status: {
        type: String,
        enum: ['Verified', 'Pending', 'Unverified', 'Disputed'],
        default: 'Pending',
      },
      verifiedBy: {
        type: String, // Expert or institution name
      },
      verificationDate: {
        type: Date,
      },
      certificateNumber: {
        type: String,
      },
    },
    materials: [{
      type: String, // e.g., "Wood", "Silver", "Porcelain", "Oil on Canvas"
    }],
    techniques: [{
      type: String, // e.g., "Hand-carved", "Blown glass", "Lithograph"
    }],
    historicalSignificance: {
      type: String, // Cultural or historical importance
    },
    maker: {
      name: {
        type: String, // Artist, craftsman, or manufacturer
      },
      nationality: {
        type: String,
      },
      lifespan: {
        type: String, // e.g., "1820-1890"
      },
    },
    style: {
      type: String, // e.g., "Chippendale", "Louis XVI", "Arts and Crafts"
    },
    rarity: {
      type: String,
      // Made more flexible - common values: Common, Uncommon, Rare, Very Rare, Extremely Rare, Unique
      default: 'Common',
      trim: true,
    },
    appraisal: {
      estimatedValue: {
        type: Number,
      },
      appraisedBy: {
        type: String,
      },
      appraisalDate: {
        type: Date,
      },
      appraisalDocument: {
        type: Object, // Cloudinary document
      },
    },
    // Auction-specific fields
    auctionType: {
      type: String,
      enum: ['Live', 'Timed', 'Buy Now'],
      default: 'Timed',
    },
    reservePrice: {
      type: Number,
      default: 0,
    },
    startingBid: {
      type: Number,
      required: true,
    },
    instantPurchasePrice: {
      type: Number,
      // Buy Now price - when reached, live auctions end immediately
      // For timed auctions, this acts as a "Buy It Now" option
    },
    auctionStartDate: {
      type: Date,
    },
    auctionEndDate: {
      type: Date,
    },
    bidIncrement: {
      type: Number,
      default: 10,
    },
    // Additional images for detailed views
    additionalImages: [{
      type: Object, // Cloudinary images
    }],
    // Documentation
    documents: [{
      type: {
        type: String,
        enum: ['Certificate', 'Provenance', 'Appraisal', 'Insurance', 'Other'],
      },
      file: {
        type: Object, // Cloudinary document
      },
      description: {
        type: String,
      },
    }],
    isverify: {
      type: Boolean,
      default: false,
    },
    isSoldout: {
      type: Boolean,
      default: false,
    },
    soldTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // Settlement tracking
    settlementCompleted: {
      type: Boolean,
      default: false,
    },
    settlementDate: {
      type: Date,
    },
    finalPrice: {
      type: Number,
    },
    commissionAmount: {
      type: Number,
      default: 0,
    },
    sellerAmount: {
      type: Number,
    },
    // Transportation Management Fields
    transportationStatus: {
      type: String,
      enum: ['Ready for Pickup', 'In Transit', 'Delivered', 'Not Required'],
      default: 'Not Required',
    },
    transportationNotes: {
      type: String,
      trim: true,
    },
    transportationAssignedTo: {
      type: String, // Name or ID of delivery personnel
      trim: true,
    },
    transportationStatusHistory: [{
      status: {
        type: String,
        enum: ['Ready for Pickup', 'In Transit', 'Delivered'],
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      notes: {
        type: String,
        trim: true,
      },
    }],
    pickupAddress: {
      type: String, // Seller's pickup address
      trim: true,
    },
    deliveryAddress: {
      type: String, // Buyer's delivery address
      trim: true,
    },
    transportationStartDate: {
      type: Date,
    },
    transportationCompletedDate: {
      type: Date,
    },
  },
  { timestamps: true }
);
const product = mongoose.model("Product", productSchema);
module.exports = product;
