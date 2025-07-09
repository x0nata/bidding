const mongoose = require("mongoose");
const Category = require("../model/categoryModel");
const User = require("../model/userModel");
const antiqueCategories = require("../seeds/antiqueCategories");
require("dotenv").config();

const seedCategories = async () => {
  try {
    // Connect to MongoDB Atlas
    const mongoURI = process.env.MONGO_URI || process.env.DATABASE_CLOUD;

    if (!mongoURI) {
      throw new Error("MongoDB connection string not found in environment variables");
    }

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    // Find an admin user to assign as category creator
    let adminUser = await User.findOne({ role: "admin" });
    
    if (!adminUser) {
      // Create a default admin user if none exists
      adminUser = await User.create({
        name: "System Admin",
        email: "admin@gmail.com",
        password: "Admin@123", // This should be hashed in production
        role: "admin",
      });
    }

    // Clear existing categories
    await Category.deleteMany({});

    // Create main categories and their subcategories
    for (const categoryData of antiqueCategories) {
      const { subcategories, ...mainCategoryData } = categoryData;
      
      // Create main category
      const mainCategory = await Category.create({
        ...mainCategoryData,
        user: adminUser._id,
      });
      

      // Create subcategories if they exist
      if (subcategories && subcategories.length > 0) {
        const createdSubcategories = [];
        
        for (const subCategoryData of subcategories) {
          const subCategory = await Category.create({
            ...subCategoryData,
            user: adminUser._id,
            parentCategory: mainCategory._id,
          });
          
          createdSubcategories.push(subCategory._id);
        }
        
        // Update main category with subcategory references
        mainCategory.subcategories = createdSubcategories;
        await mainCategory.save();
      }
    }

    
    // Display summary
    const totalCategories = await Category.countDocuments();
    const mainCategories = await Category.countDocuments({ parentCategory: { $exists: false } });
    const subCategories = await Category.countDocuments({ parentCategory: { $exists: true } });
    

  } catch (error) {
  } finally {
    // Close the connection
    await mongoose.connection.close();
  }
};

// Run the seeding function
if (require.main === module) {
  seedCategories();
}

module.exports = seedCategories;
