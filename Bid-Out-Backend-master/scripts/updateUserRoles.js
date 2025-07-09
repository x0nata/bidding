const mongoose = require('mongoose');
require('dotenv').config();

const updateUserRoles = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database');

    const User = require('../model/userModel');
    
    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users to update`);
    
    let updatedCount = 0;
    
    for (const user of users) {
      let newRole = 'user'; // Default role
      
      // Keep admin users as admin
      if (user.role === 'admin') {
        newRole = 'admin';
      }
      // Convert all other roles (seller, buyer, expert) to 'user'
      else if (['seller', 'buyer', 'expert'].includes(user.role)) {
        newRole = 'user';
      }
      
      // Update the user if role needs to change
      if (user.role !== newRole) {
        await User.findByIdAndUpdate(user._id, { role: newRole });
        console.log(`Updated user ${user.email}: ${user.role} -> ${newRole}`);
        updatedCount++;
      } else {
        console.log(`User ${user.email}: ${user.role} (no change needed)`);
      }
    }
    
    console.log(`\n=== ROLE UPDATE SUMMARY ===`);
    console.log(`Total users: ${users.length}`);
    console.log(`Updated users: ${updatedCount}`);
    console.log(`No change needed: ${users.length - updatedCount}`);
    
    // Show final role distribution
    const finalUsers = await User.find({});
    const roleDistribution = finalUsers.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n=== FINAL ROLE DISTRIBUTION ===');
    Object.entries(roleDistribution).forEach(([role, count]) => {
      console.log(`${role}: ${count} users`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating user roles:', error);
    process.exit(1);
  }
};

updateUserRoles();
