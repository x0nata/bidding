const asyncHandler = require("express-async-handler");
const Product = require("../model/productModel");
const BiddingProduct = require("../model/biddingProductModel");
const sendEmail = require("../utils/sendEmail");
const User = require("../model/userModel");
const ProxyBiddingService = require("../services/proxyBiddingService");
const HybridBalanceService = require("../services/hybridBalanceService");
const Transaction = require("../model/transactionModel");
const AuctionSettlementService = require("../services/auctionSettlementService");
const ErrorHandlingService = require("../services/errorHandlingService");
const AuctionWinnerService = require("../services/auctionWinnerService");

const proxyBiddingService = new ProxyBiddingService();
const auctionWinnerService = new AuctionWinnerService();

// Helper function to process instant purchase completion
const processInstantPurchaseCompletion = async (product, winningBid, winner) => {
  try {
    // Handle balance settlements
    const settlementResult = await AuctionSettlementService.settleAuctionBalances(
      product._id,
      winningBid
    );

    // Email notifications disabled for simplified deployment
    console.log('📧 Would send instant purchase notifications to winner, seller, and losing bidders');

    // Send WebSocket notifications
    if (global.socketService) {
      // Notify winner
      global.socketService.notifyInstantPurchaseWinner(winner._id, {
        product: product,
        winningBid: winningBid.price,
        message: 'Congratulations! You won the auction with an instant purchase!'
      });

      // Notify seller
      global.socketService.notifyInstantPurchaseSeller(product.user, {
        product: product,
        winner: winner,
        finalPrice: winningBid.price
      });

      // Notify all auction watchers that auction ended
      global.socketService.notifyAuctionEnded(product._id, {
        reason: 'instant_purchase',
        winner: {
          id: winner._id,
          name: winner.name,
          email: winner.email
        },
        finalPrice: winningBid.price,
        product: product
      });

      // Notify about balance updates
      if (settlementResult.winnerSettlement) {
        global.socketService.notifyBalanceUpdate(winner._id, {
          type: 'INSTANT_PURCHASE_PAYMENT',
          amount: winningBid.price,
          auctionTitle: product.title
        });
      }

      // Notify refunded users
      for (const refund of settlementResult.loserRefunds || []) {
        global.socketService.notifyBalanceUpdate(refund.userId, {
          type: 'BID_REFUND',
          amount: refund.amount,
          auctionTitle: product.title,
          reason: 'Auction ended by instant purchase'
        });
      }
    }

    return { success: true, settlement: settlementResult };
  } catch (error) {
    console.error('Error in processInstantPurchaseCompletion:', error);
    return { success: false, error: error.message };
  }
};

// Email notification functions for instant purchase
const sendInstantPurchaseWinnerEmail = async (product, winningBid, winner) => {
  console.log('📧 Email disabled - would notify instant purchase winner:', {
    winner: winner.email,
    product: product.title,
    price: winningBid.price
  });
};

const sendInstantPurchaseSellerEmail = async (product, winningBid, winner) => {
  console.log('📧 Email disabled - would notify seller of instant purchase:', {
    seller: product.user.email,
    product: product.title,
    price: winningBid.price,
    winner: winner.email
  });
};

const sendInstantPurchaseLoserEmails = async (auctionId, winningBidId) => {
  try {
    const losingBids = await BiddingProduct.find({
      product: auctionId,
      _id: { $ne: winningBidId }
    }).populate('user', 'name email').populate('product', 'title auctionType instantPurchasePrice');

    console.log('📧 Email disabled - would notify losing bidders:', {
      count: losingBids.length,
      auction: auctionId
    });
  } catch (error) {
    console.error('Error processing losing bidders notification:', error);
  }
};

// Helper function to handle edge cases and validate instant purchase conditions
const validateInstantPurchaseConditions = async (productId, bidAmount, userId) => {
  try {
    // Re-fetch the product to ensure we have the latest state
    const currentProduct = await Product.findById(productId);

    if (!currentProduct) {
      return { valid: false, reason: 'Product not found' };
    }

    if (currentProduct.isSoldout) {
      return { valid: false, reason: 'Auction already ended' };
    }

    if (!currentProduct.instantPurchasePrice) {
      return { valid: false, reason: 'No instant purchase price set' };
    }

    if (bidAmount < currentProduct.instantPurchasePrice) {
      return { valid: false, reason: 'Bid amount below instant purchase price' };
    }

    // Check if auction is still active
    if (currentProduct.auctionType === 'Timed' && new Date(currentProduct.auctionEndDate) <= new Date()) {
      return { valid: false, reason: 'Timed auction has expired' };
    }

    // Check if user is trying to instant purchase their own auction
    if (currentProduct.user.toString() === userId.toString()) {
      return { valid: false, reason: 'Cannot instant purchase your own auction' };
    }

    return { valid: true, product: currentProduct };
  } catch (error) {
    console.error('Error validating instant purchase conditions:', error);
    return { valid: false, reason: 'Validation error', error: error.message };
  }
};

// Helper function to handle concurrent instant purchase attempts
const handleConcurrentInstantPurchase = async (productId, biddingProductId) => {
  try {
    // Check if there are multiple bids that could trigger instant purchase at the same time
    const concurrentBids = await BiddingProduct.find({
      product: productId,
      createdAt: { $gte: new Date(Date.now() - 1000) }, // Within last second
      bidStatus: { $in: ['Active', 'Won'] }
    }).sort({ createdAt: 1, price: -1 });

    if (concurrentBids.length > 1) {
      console.log(`Detected ${concurrentBids.length} concurrent bids for instant purchase on auction ${productId}`);

      // The first bid (by timestamp) with the highest price wins
      const winningBid = concurrentBids[0];

      // Update all other concurrent bids to lost
      for (const bid of concurrentBids) {
        if (bid._id.toString() !== winningBid._id.toString()) {
          bid.bidStatus = 'Lost';
          bid.isWinningBid = false;
          bid.lostAt = new Date();
          bid.lostReason = 'concurrent_instant_purchase_conflict';
          await bid.save();
        }
      }

      return {
        isWinner: winningBid._id.toString() === biddingProductId.toString(),
        winningBid: winningBid
      };
    }

    return { isWinner: true, winningBid: null };
  } catch (error) {
    console.error('Error handling concurrent instant purchase:', error);
    return { isWinner: false, error: error.message };
  }
};

// Enhanced error logging for instant purchase operations
const logInstantPurchaseEvent = async (eventType, data) => {
  try {
    const logEntry = {
      timestamp: new Date(),
      eventType,
      auctionId: data.auctionId,
      userId: data.userId,
      bidId: data.bidId,
      bidAmount: data.bidAmount,
      instantPurchasePrice: data.instantPurchasePrice,
      success: data.success,
      error: data.error,
      additionalData: data.additionalData
    };

    // In production, send this to a logging service
    // await LoggingService.logInstantPurchaseEvent(logEntry);

  } catch (error) {
    console.error('Error logging instant purchase event:', error);
  }
};

const placeBid = asyncHandler(async (req, res) => {
  const { productId, price, bidType = 'Manual', maxBid } = req.body;
  const userId = req.user.id;

  const product = await Product.findById(productId);

  // Enhanced validation for antique auctions
  if (!product) {
    res.status(404);
    throw new Error("Auction not found");
  }

  // Verification check removed - allow bidding on all auctions
  // if (!product.isverify) {
  //   res.status(400);
  //   throw new Error("This auction has not been verified yet");
  // }

  if (product.isSoldout === true) {
    res.status(400);
    throw new Error("This auction has ended");
  }

  // Check if user is the seller
  if (product.user.toString() === userId) {
    res.status(400);
    throw new Error("You cannot bid on your own auction");
  }

  // Check auction timing and status based on auction type
  const now = new Date();
  if (product.auctionType === 'Timed') {
    if (product.auctionStartDate && now < product.auctionStartDate) {
      res.status(400);
      throw new Error("This auction has not started yet");
    }
    if (product.auctionEndDate && now > product.auctionEndDate) {
      res.status(400);
      throw new Error("This auction has ended");
    }
  } else if (product.auctionType === 'Live') {
    // For live auctions, check if already ended by instant purchase or admin
    if (product.isSoldout) {
      res.status(400);
      throw new Error("This live auction has ended");
    }
    // Live auctions don't have time-based restrictions
  }

  // Validate bid amount
  const highestBid = await BiddingProduct.findOne({ product: productId }).sort({ price: -1 });
  const currentHighestBid = highestBid ? highestBid.price : product.startingBid;
  const minimumBid = currentHighestBid + (product.bidIncrement || 10);

  if (price < minimumBid) {
    res.status(400);
    throw new Error(`Your bid must be at least $${minimumBid} (current bid + increment)`);
  }

  // For proxy bids, validate maxBid
  if (bidType === 'Proxy') {
    if (!maxBid || maxBid < price) {
      res.status(400);
      throw new Error("Maximum bid must be specified and higher than current bid for proxy bidding");
    }
  }

  // Check user balance before allowing bid - DEMO MODE: Always allow bids
  
  // For demo purposes, we'll skip the actual balance check and always allow bids
  // In production, you would uncomment the balance check below:
  /*
  try {
    const balanceInfo = await HybridBalanceService.getUserBalanceInfo(userId);
    
    if (balanceInfo.availableBalance < price) {
      res.status(400);
      throw new Error(`Insufficient balance. Available: ${balanceInfo.availableBalance} ETB, Required: ${price} ETB. Please add balance to your account.`);
    }
  } catch (balanceError) {
  }
  */

  // Get user's existing bid
  const existingUserBid = await BiddingProduct.findOne({ user: userId, product: productId });

  let biddingProduct;
  let holdTransaction = null;

  if (existingUserBid) {
    // Update existing bid
    if (price <= existingUserBid.price && bidType !== 'Proxy') {
      res.status(400);
      throw new Error("Your bid must be higher than your previous bid");
    }

    // Demo mode: Skip balance hold operations
    
    // In production, uncomment the balance hold operations below:
    /*
    // Release previous bid hold if exists
    if (existingUserBid.holdTransactionId) {
      try {
        await HybridBalanceService.releaseBidHold(
          existingUserBid.holdTransactionId,
          `Released previous bid hold for ${product.title} - updating to higher bid`
        );
      } catch (error) {
        // Continue with new bid even if release fails
      }
    }

    // Create new hold for updated bid amount
    try {
      const holdResult = await HybridBalanceService.holdBidAmount(
        userId,
        price,
        productId,
        existingUserBid._id,
        `Bid hold for ${product.title} - ${price} ETB`,
        req.ip,
        req.get('User-Agent')
      );
      holdTransaction = holdResult.transaction;
    } catch (error) {
      // Continue without holding balance for demo purposes
    }
    */

    // Update the bid
    existingUserBid.price = price;
    existingUserBid.bidType = bidType;
    existingUserBid.maxBid = maxBid;
    existingUserBid.bidStatus = 'Active';
    existingUserBid.ipAddress = req.ip;
    existingUserBid.userAgent = req.get('User-Agent');
    // existingUserBid.holdTransactionId = holdTransaction?._id; // Disabled for demo mode

    await existingUserBid.save();
    biddingProduct = existingUserBid;
  } else {
    // Create new bid
    biddingProduct = await BiddingProduct.create({
      user: userId,
      product: productId,
      price,
      bidType,
      maxBid,
      bidStatus: 'Active',
      bidIncrement: product.bidIncrement || 10,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    // Demo mode: Skip balance hold for new bids
    
    // In production, uncomment the balance hold operations below:
    /*
    // Create hold for new bid
    try {
      const holdResult = await HybridBalanceService.holdBidAmount(
        userId,
        price,
        productId,
        biddingProduct._id,
        `Bid hold for ${product.title} - ${price} ETB`,
        req.ip,
        req.get('User-Agent')
      );
      holdTransaction = holdResult.transaction;

      // Update bid with hold transaction ID
      biddingProduct.holdTransactionId = holdTransaction._id;
      await biddingProduct.save();
    } catch (error) {
      // Continue without holding balance for demo purposes
    }
    */
  }

  // Update previous winning bids to 'Outbid' and release their holds
  if (highestBid && highestBid.user.toString() !== userId) {
    // Demo mode: Skip releasing previous bidder's hold
    
    // In production, uncomment the hold release below:
    /*
    // Release the previous highest bidder's hold
    if (highestBid.holdTransactionId) {
      try {
        await HybridBalanceService.releaseBidHold(
          highestBid.holdTransactionId,
          `Released bid hold for ${product.title} - outbid by higher bid`
        );
      } catch (error) {
        // Continue even if release fails - we'll handle this in cleanup
      }
    }
    */

    await BiddingProduct.findByIdAndUpdate(highestBid._id, {
      bidStatus: 'Outbid',
      isWinningBid: false
    });

    // Notify the outbid user via WebSocket
    if (global.socketService) {
      try {
        global.socketService.notifyUserOutbid(highestBid.user, {
          product: product,
          outbidAmount: price,
          previousBid: highestBid.price
        });
      } catch (error) {
      }
    }
  }

  // Set current bid as winning
  biddingProduct.isWinningBid = true;
  biddingProduct.bidStatus = 'Winning';
  await biddingProduct.save();

  // Check for instant purchase (Buy Now) condition with atomic operations
  let auctionEnded = false;
  let instantPurchaseTriggered = false;

  if (product.instantPurchasePrice && price >= product.instantPurchasePrice) {
    instantPurchaseTriggered = true;

    // Validate instant purchase conditions before proceeding
    const validation = await validateInstantPurchaseConditions(productId, price, userId);
    if (!validation.valid) {
      console.log(`Instant purchase validation failed: ${validation.reason}`);
      instantPurchaseTriggered = false;
    } else {
      // Handle potential concurrent instant purchase attempts
      const concurrentResult = await handleConcurrentInstantPurchase(productId, biddingProduct._id);
      if (!concurrentResult.isWinner) {
        console.log(`Bid ${biddingProduct._id} lost in concurrent instant purchase resolution`);
        instantPurchaseTriggered = false;
        auctionEnded = true; // Auction still ended, just not by this bid

        // Update this bid to lost
        biddingProduct.bidStatus = 'Lost';
        biddingProduct.isWinningBid = false;
        biddingProduct.lostAt = new Date();
        biddingProduct.lostReason = 'concurrent_instant_purchase_conflict';
        await biddingProduct.save();
      }
    }

    try {
      // Use atomic operation with retry mechanism to prevent race conditions
      let retryCount = 0;
      const maxRetries = 3;
      let atomicUpdate = null;

      while (retryCount < maxRetries && !atomicUpdate) {
        try {
          // First, try to update the product to mark it as sold
          atomicUpdate = await Product.findOneAndUpdate(
            {
              _id: productId,
              isSoldout: false, // Only update if not already sold
              $or: [
                { auctionType: 'Live' },
                { auctionType: 'Timed', auctionEndDate: { $gt: new Date() } }
              ]
            },
            {
              isSoldout: true,
              soldTo: userId,
              finalPrice: price,
              auctionEndReason: 'instant_purchase',
              auctionEndedAt: new Date(),
              instantPurchaseTriggeredBy: biddingProduct._id
            },
            { new: true }
          );

          if (atomicUpdate) {
            // Successfully claimed the instant purchase
            auctionEnded = true;

            // Log successful instant purchase
            await logInstantPurchaseEvent('SUCCESS', {
              auctionId: productId,
              userId: userId,
              bidId: biddingProduct._id,
              bidAmount: price,
              instantPurchasePrice: product.instantPurchasePrice,
              success: true,
              additionalData: { retryCount, auctionType: product.auctionType }
            });

            // Update the winning bid with transaction safety
            try {
              biddingProduct.bidStatus = 'Won';
              biddingProduct.isWinningBid = true;
              biddingProduct.wonAt = new Date();
              biddingProduct.instantPurchaseWin = true;
              await biddingProduct.save();

              // Update all other bids to 'Lost' in a single operation
              const lostBidsUpdate = await BiddingProduct.updateMany(
                { product: productId, _id: { $ne: biddingProduct._id } },
                {
                  bidStatus: 'Lost',
                  isWinningBid: false,
                  lostAt: new Date(),
                  lostReason: 'instant_purchase_by_other_bidder'
                }
              );

              console.log(`Instant purchase: Updated ${lostBidsUpdate.modifiedCount} losing bids`);

              // Process instant purchase completion with error handling
              const completionResult = await processInstantPurchaseCompletion(product, biddingProduct, user);

              if (!completionResult.success) {
                console.error('Instant purchase completion failed:', completionResult.error);
                // Log the error but don't fail the entire operation
              }

            } catch (bidUpdateError) {
              console.error('Error updating bid statuses after instant purchase:', bidUpdateError);
              // Rollback the product update if bid updates fail
              await Product.findByIdAndUpdate(productId, {
                isSoldout: false,
                soldTo: null,
                finalPrice: null,
                auctionEndReason: null,
                auctionEndedAt: null,
                instantPurchaseTriggeredBy: null
              });
              throw bidUpdateError;
            }

          } else {
            // Check if auction was already ended by another instant purchase
            const updatedProduct = await Product.findById(productId);
            if (updatedProduct && updatedProduct.isSoldout && updatedProduct.auctionEndReason === 'instant_purchase') {
              // Another bid already triggered instant purchase
              biddingProduct.bidStatus = 'Lost';
              biddingProduct.isWinningBid = false;
              biddingProduct.lostAt = new Date();
              biddingProduct.lostReason = 'instant_purchase_by_other_bidder';
              await biddingProduct.save();

              console.log(`Bid ${biddingProduct._id} lost due to concurrent instant purchase`);
              break; // Exit retry loop
            }
          }

        } catch (atomicError) {
          retryCount++;
          console.warn(`Instant purchase atomic operation attempt ${retryCount} failed:`, atomicError.message);

          if (retryCount >= maxRetries) {
            throw atomicError;
          }

          // Wait briefly before retry to reduce contention
          await new Promise(resolve => setTimeout(resolve, 50 * retryCount));
        }
      }

      if (!atomicUpdate && retryCount >= maxRetries) {
        console.error('Failed to process instant purchase after maximum retries');
        // Continue with normal bid processing
      }

    } catch (error) {
      console.error('Critical error processing instant purchase:', error);

      // Ensure bid is saved even if instant purchase processing fails
      try {
        if (!biddingProduct.bidStatus) {
          biddingProduct.bidStatus = 'Active';
        }
        await biddingProduct.save();
      } catch (saveError) {
        console.error('Failed to save bid after instant purchase error:', saveError);
      }

      // Don't throw the error - continue with normal bid processing
      // The bid is still valid even if instant purchase processing failed
    }
  }

  // Handle proxy bidding logic
  if (bidType === 'Proxy' || bidType === 'Manual') {
    // Process any competing proxy bids
    setTimeout(async () => {
      try {
        await proxyBiddingService.processProxyBids(productId, price, userId);
      } catch (error) {
      }
    }, 100); // Small delay to ensure current bid is saved first
  }

  // Populate the response
  const populatedBid = await BiddingProduct.findById(biddingProduct._id)
    .populate('user', 'name email')
    .populate('product', 'title auctionType auctionEndDate');

  // Notify listing owner via WebSocket (if socket service is available)
  if (global.socketService) {
    try {
      await global.socketService.notifyListingOwnerOfBid(productId, {
        price: populatedBid.price,
        user: populatedBid.user,
        createdAt: populatedBid.createdAt
      });
    } catch (error) {
      // Don't fail the bid placement if WebSocket notification fails
    }
  }

  res.status(201).json({
    success: true,
    bid: populatedBid,
    auctionEnded,
    instantPurchase: instantPurchaseTriggered && auctionEnded,
    instantPurchasePrice: product.instantPurchasePrice,
    finalPrice: auctionEnded ? price : null,
    auctionEndReason: auctionEnded ? 'instant_purchase' : null,
    message: auctionEnded && instantPurchaseTriggered
      ? '🎉 Congratulations! You won the auction with an instant purchase!'
      : auctionEnded
        ? 'Auction ended - another bidder triggered instant purchase'
        : (bidType === 'Proxy' ? 'Proxy bid placed successfully' : 'Bid placed successfully'),
    notifications: {
      emailSent: auctionEnded && instantPurchaseTriggered,
      webSocketSent: auctionEnded
    }
  });
});

const getBiddingHistory = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const biddingHistory = await BiddingProduct.find({ product: productId }).sort("-createdAt").populate("user").populate("product");

  res.status(200).json(biddingHistory);
});

const sellProduct = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const userId = req.user.id;

  // Find the product
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  //   /* const currentTime = new Date();
  //   const tenMinutesAgo = new Date(currentTime - 2 * 60 * 1000); // 10 minutes ago

  //     if (!product.isSoldout || product.updatedAt < tenMinutesAgo || product.createdAt < tenMinutesAgo) {
  //     return res.status(400).json({ error: "Product cannot be sold at this time" });
  //   } */

  // Check if the user is authorized to sell the product
  if (product.user.toString() !== userId) {
    return res.status(403).json({ error: "You do not have permission to sell this product" });
  }

  // Find the highest bid
  const highestBid = await BiddingProduct.findOne({ product: productId }).sort({ price: -1 }).populate("user");
  if (!highestBid) {
    return res.status(400).json({ error: "No winning bid found for the product" });
  }

  // Calculate commission and final price
  const commissionRate = product.commission;
  const commissionAmount = (commissionRate / 100) * highestBid.price;
  const finalPrice = highestBid.price - commissionAmount;

  // Update product details
  product.isSoldout = true;
  product.soldTo = highestBid.user;
  product.soldPrice = finalPrice;

  // Update admin's commission balance
  const admin = await User.findOne({ role: "admin" });
  if (admin) {
    admin.commissionBalance += commissionAmount;
    await admin.save();
  }

  // Update seller's balance
  const seller = await User.findById(product.user);
  if (seller) {
    seller.balance += finalPrice; // Add the remaining amount to the seller's balance
    await seller.save();
  } else {
    return res.status(404).json({ error: "Seller not found" });
  }

  // Save product
  await product.save();

  // Email notification disabled for simplified deployment
  console.log('📧 Email disabled - would notify auction winner:', {
    winner: highestBid.user.email,
    product: product.title,
    price: highestBid.price
  });

  res.status(200).json({ message: "Product has been successfully sold!" });
});

// End auction and determine winner
const endAuction = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Auction not found");
  }

  // Check if user is authorized (seller or admin)
  if (product.user.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error("Not authorized to end this auction");
  }

  // Use the winner service to handle auction ending
  const result = await auctionWinnerService.determineAndProcessWinner(
    productId,
    'admin_ended',
    { endedBy: req.user.id }
  );

  if (!result.success) {
    res.status(400);
    throw new Error(result.error || result.message);
  }

  res.status(200).json(result);
});

// Get user's bidding activity
const getUserBiddingActivity = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { status, page = 1, limit = 20 } = req.query;

  let filter = { user: userId };
  if (status) {
    filter.bidStatus = status;
  }

  const skip = (page - 1) * limit;

  const bids = await BiddingProduct.find(filter)
    .sort({ createdAt: -1 })
    .populate('product', 'title image auctionType auctionEndDate')
    .skip(skip)
    .limit(Number(limit));

  const totalBids = await BiddingProduct.countDocuments(filter);
  const totalPages = Math.ceil(totalBids / limit);

  res.status(200).json({
    bids,
    pagination: {
      currentPage: Number(page),
      totalPages,
      totalBids,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  });
});

// Get total active bids count across all auctions
const getTotalActiveBidsCount = asyncHandler(async (req, res) => {
  try {
    // Get all active auctions (not sold out and not expired)
    const now = new Date();
    const activeAuctions = await Product.find({
      isSoldout: false,
      $or: [
        { auctionEndDate: { $gt: now } }, // Future end date
        { auctionEndDate: { $exists: false } }, // No end date set
        { auctionEndDate: null } // Null end date
      ]
    }).select('_id');

    const activeAuctionIds = activeAuctions.map(auction => auction._id);

    // Count all bids on active auctions with active status
    const activeBidsCount = await BiddingProduct.countDocuments({
      product: { $in: activeAuctionIds },
      bidStatus: { $in: ['Active', 'Winning'] }
    });

    res.status(200).json({
      totalActiveBids: activeBidsCount,
      activeAuctions: activeAuctionIds.length,
      timestamp: now
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get active bids count',
      message: error.message
    });
  }
});

module.exports = {
  placeBid,
  getBiddingHistory,
  sellProduct,
  endAuction,
  getUserBiddingActivity,
  getTotalActiveBidsCount,
};
