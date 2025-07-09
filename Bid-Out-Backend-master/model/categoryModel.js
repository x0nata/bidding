const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    description: {
      type: String,
    },
    slug: {
      type: String,
      unique: true,
    },
    // Antique-specific category fields
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    subcategories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    }],
    categoryType: {
      type: String,
      enum: ['Furniture', 'Jewelry', 'Art & Paintings', 'Ceramics & Pottery', 'Textiles', 'Books & Manuscripts', 'Coins & Currency', 'Vintage Collectibles', 'Decorative Arts', 'Musical Instruments', 'Scientific Instruments', 'Other'],
      required: true,
    },
    expertiseRequired: {
      type: Boolean,
      default: false, // Some categories may require expert authentication
    },
    averageValue: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
    },
    popularEras: [{
      type: String,
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);
module.exports = Category;
