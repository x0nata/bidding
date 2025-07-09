const mongoose = require("mongoose");

const AppraisalSchema = mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    expert: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Expert appraiser
      required: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Product owner
      required: true,
    },
    appraisalType: {
      type: String,
      enum: ['Authentication', 'Valuation', 'Condition Assessment', 'Full Appraisal'],
      required: true,
    },
    status: {
      type: String,
      enum: ['Requested', 'In Progress', 'Completed', 'Disputed', 'Cancelled'],
      default: 'Requested',
    },
    // Appraisal details
    estimatedValue: {
      currency: {
        type: String,
        default: 'USD',
      },
      amount: {
        type: Number,
      },
      range: {
        low: { type: Number },
        high: { type: Number },
      },
    },
    marketValue: {
      retail: { type: Number },
      auction: { type: Number },
      insurance: { type: Number },
    },
    // Authentication results
    authenticity: {
      isAuthentic: {
        type: Boolean,
      },
      confidence: {
        type: String,
        enum: ['Very High', 'High', 'Medium', 'Low', 'Uncertain'],
      },
      reasoning: {
        type: String,
      },
    },
    // Condition assessment
    condition: {
      overall: {
        type: String,
        enum: ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'],
      },
      details: {
        type: String,
      },
      defects: [{
        type: {
          type: String,
          enum: ['Crack', 'Chip', 'Stain', 'Fade', 'Repair', 'Missing Part', 'Wear', 'Other'],
        },
        description: {
          type: String,
        },
        severity: {
          type: String,
          enum: ['Minor', 'Moderate', 'Major', 'Severe'],
        },
        location: {
          type: String,
        },
      }],
    },
    // Attribution and provenance
    attribution: {
      maker: {
        type: String,
      },
      period: {
        type: String,
      },
      style: {
        type: String,
      },
      region: {
        type: String,
      },
      confidence: {
        type: String,
        enum: ['Certain', 'Probable', 'Possible', 'Uncertain'],
      },
    },
    provenance: {
      history: {
        type: String,
      },
      previousOwners: [{
        name: { type: String },
        period: { type: String },
        documentation: { type: String },
      }],
      exhibitions: [{
        venue: { type: String },
        date: { type: String },
        catalog: { type: String },
      }],
      publications: [{
        title: { type: String },
        author: { type: String },
        date: { type: String },
        page: { type: String },
      }],
    },
    // Expert's detailed report
    report: {
      summary: {
        type: String,
      },
      methodology: {
        type: String,
      },
      comparables: [{
        description: { type: String },
        saleDate: { type: Date },
        salePrice: { type: Number },
        venue: { type: String },
      }],
      recommendations: {
        type: String,
      },
      limitations: {
        type: String,
      },
    },
    // Documentation
    documents: [{
      type: {
        type: String,
        enum: ['Report', 'Certificate', 'Photos', 'Research', 'Comparables', 'Other'],
      },
      file: {
        type: Object, // Cloudinary document
      },
      description: {
        type: String,
      },
    }],
    // Fees and payment
    fee: {
      amount: {
        type: Number,
      },
      currency: {
        type: String,
        default: 'ETB',
      },
      paid: {
        type: Boolean,
        default: false,
      },
      paidDate: {
        type: Date,
      },
    },
    // Validity and updates
    validUntil: {
      type: Date,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    revisions: [{
      date: { type: Date, default: Date.now },
      changes: { type: String },
      reason: { type: String },
    }],
  },
  { timestamps: true }
);

// Indexes for efficient queries
AppraisalSchema.index({ product: 1 });
AppraisalSchema.index({ expert: 1 });
AppraisalSchema.index({ requestedBy: 1 });
AppraisalSchema.index({ status: 1 });
AppraisalSchema.index({ appraisalType: 1 });

const Appraisal = mongoose.model("Appraisal", AppraisalSchema);
module.exports = Appraisal;
