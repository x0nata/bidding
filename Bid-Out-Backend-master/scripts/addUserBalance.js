const mongoose = require("mongoose");
const User = require("../model/userModel");
const Transaction = require("../model/transactionModel");
require("dotenv").config();

const addBalanceToAllUsers = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || process.env.DATABASE_CLOUD;
    await mongoose.connect(mongoURI);

    // Find all users
    const users = await User.find({});

    if (users.length === 0) {
      return;
    }

    // Add balance to all users
    for (const user of users) {
      const currentBalance = user.balance || 0;
      const newBalance = Math.max(50000, currentBalance); // Ensure at least 50,000 ETB

      if (currentBalance < 50000) {
        const addedAmount = newBalance - currentBalance;
        
        // Update user balance
        user.balance = newBalance;
        await user.save();

        // Create transaction record
        const transaction = new Transaction({
          user: user._id,
          type: 'DEPOSIT',
          amount: addedAmount,
          balanceBefore: currentBalance,
          balanceAfter: newBalance,
          status: 'COMPLETED',
          description: 'Demo balance top-up for bidding',
          paymentMethod: 'SYSTEM_CREDIT',
          paymentReference: `DEMO_${Date.now()}_${user._id}`,
        });

        await transaction.save();

      } else {
      }
    }


  } catch (error) {
  } finally {
    await mongoose.disconnect();
  }
};

// Run the script
addBalanceToAllUsers();