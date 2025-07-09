const mongoose = require("mongoose");
const Product = require("../model/productModel");
require("dotenv").config();

const verifyAllProducts = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || process.env.DATABASE_CLOUD;
    await mongoose.connect(mongoURI);

    // Find all unverified products
    const unverifiedProducts = await Product.find({ 
      $or: [
        { isverify: false },
        { isverify: { $exists: false } }
      ]
    });


    if (unverifiedProducts.length === 0) {
      return;
    }

    // Update all unverified products
    const updateResult = await Product.updateMany(
      { 
        $or: [
          { isverify: false },
          { isverify: { $exists: false } }
        ]
      },
      {
        $set: {
          isverify: true,
          commission: 5, // Default 5% commission
          'authenticity.status': 'Verified',
          'authenticity.verifiedBy': 'System Auto-Verification',
          'authenticity.verificationDate': new Date(),
          'authenticity.certificateNumber': `AUTO-BULK-${Date.now()}`
        }
      }
    );


    // Show some examples of verified products
    const verifiedProducts = await Product.find({ isverify: true }).limit(5);
    verifiedProducts.forEach(product => {
    });

  } catch (error) {
  } finally {
    await mongoose.disconnect();
  }
};

// Run the script
verifyAllProducts();