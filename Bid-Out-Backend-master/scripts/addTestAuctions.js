const mongoose = require('mongoose');
require('dotenv').config();

const addTestAuctions = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database');

    const Product = require('../model/productModel');
    const User = require('../model/userModel');
    
    // Get the existing user
    const user = await User.findOne({ email: 'j@gmail.com' });
    if (!user) {
      console.log('User not found');
      process.exit(1);
    }
    
    // Create additional test auctions
    const testAuctions = [
      {
        user: user._id,
        title: 'Vintage Wooden Chair',
        slug: 'vintage-wooden-chair',
        description: 'Beautiful antique wooden chair from the 1950s',
        category: 'furniture',
        price: 50,
        startingBid: 50,
        reservePrice: 150,
        instantPurchasePrice: 300,
        auctionType: 'Timed',
        auctionStartDate: new Date(),
        auctionEndDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        bidIncrement: 5,
        condition: 'Good',
        materials: ['wood'],
        era: '1950s',
        period: 'Mid-Century',
        provenance: 'Estate sale',
        isverify: true,
        isSoldout: false,
        image: {
          fileName: 'chair.jpg',
          filePath: 'https://via.placeholder.com/300x200?text=Vintage+Chair',
          fileType: 'image/jpeg'
        }
      },
      {
        user: user._id,
        title: 'Ceramic Vase Collection',
        slug: 'ceramic-vase-collection',
        description: 'Set of 3 handmade ceramic vases',
        category: 'ceramics',
        price: 75,
        startingBid: 75,
        reservePrice: 200,
        instantPurchasePrice: 400,
        auctionType: 'Timed',
        auctionStartDate: new Date(),
        auctionEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        bidIncrement: 10,
        condition: 'Excellent',
        materials: ['ceramic'],
        era: 'Contemporary',
        period: 'Modern',
        provenance: 'Artist studio',
        isverify: false, // Pending approval
        isSoldout: false,
        image: {
          fileName: 'vases.jpg',
          filePath: 'https://via.placeholder.com/300x200?text=Ceramic+Vases',
          fileType: 'image/jpeg'
        }
      },
      {
        user: user._id,
        title: 'Antique Silver Watch',
        slug: 'antique-silver-watch',
        description: 'Rare pocket watch from the early 1900s',
        category: 'jewelry',
        price: 200,
        startingBid: 200,
        reservePrice: 500,
        instantPurchasePrice: 800,
        auctionType: 'Timed',
        auctionStartDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        auctionEndDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
        bidIncrement: 25,
        condition: 'Fair',
        materials: ['silver'],
        era: '1900s',
        period: 'Edwardian',
        provenance: 'Family heirloom',
        isverify: true,
        isSoldout: true, // Sold
        image: {
          fileName: 'watch.jpg',
          filePath: 'https://via.placeholder.com/300x200?text=Silver+Watch',
          fileType: 'image/jpeg'
        }
      }
    ];
    
    // Insert the test auctions
    const insertedAuctions = await Product.insertMany(testAuctions);
    console.log(`Successfully created ${insertedAuctions.length} test auctions`);
    
    // Show all auctions now
    const allAuctions = await Product.find({}).select('title category isverify isSoldout auctionStartDate auctionEndDate');
    console.log('\n=== ALL AUCTIONS IN DATABASE ===');
    console.log('Total auctions:', allAuctions.length);
    
    allAuctions.forEach((auction, index) => {
      console.log(`${index + 1}. ${auction.title}`);
      console.log(`   Category: ${auction.category}`);
      console.log(`   Verified: ${auction.isverify}`);
      console.log(`   Sold: ${auction.isSoldout}`);
      console.log('---');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

addTestAuctions();
