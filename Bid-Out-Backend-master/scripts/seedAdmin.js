const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../model/userModel");
require("dotenv").config();

const seedAdmin = async () => {
  try {
    // Connect to MongoDB Atlas
    const mongoURI = process.env.MONGO_URI || process.env.DATABASE_CLOUD;

    if (!mongoURI) {
      throw new Error("MongoDB connection string not found in environment variables");
    }

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB Atlas");

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: "admin@gmail.com" });
    
    if (existingAdmin) {
      console.log("Admin user already exists");
      
      // Update password if needed
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("Admin@123", salt);
      
      await User.findByIdAndUpdate(existingAdmin._id, {
        password: hashedPassword,
        role: "admin"
      });
      
      console.log("Admin password updated successfully");
    } else {
      // Create new admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("Admin@123", salt);

      const adminUser = new User({
        name: "System Administrator",
        email: "admin@gmail.com",
        password: hashedPassword,
        role: "admin",
        phone: "+1234567890",
        address: "System Admin Address",
        balance: 0,
        commissionBalance: 0
      });

      await adminUser.save();
      console.log("Admin user created successfully");
      console.log("Email: admin@gmail.com");
      console.log("Password: Admin@123");
    }

    await mongoose.connection.close();
    console.log("Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin user:", error);
    process.exit(1);
  }
};

seedAdmin();
