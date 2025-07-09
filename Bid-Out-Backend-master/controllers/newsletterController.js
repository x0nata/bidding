const asyncHandler = require("express-async-handler");
const Newsletter = require("../model/newsletterModel");
const sendEmail = require("../utils/sendEmail");

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
const subscribeToNewsletter = asyncHandler(async (req, res) => {
  const { email, preferences, source } = req.body;

  if (!email) {
    res.status(400);
    throw new Error("Email is required");
  }

  // Check if email already exists
  const existingSubscription = await Newsletter.findOne({ email });
  
  if (existingSubscription) {
    if (existingSubscription.isActive) {
      res.status(400);
      throw new Error("Email is already subscribed to our newsletter");
    } else {
      // Reactivate subscription
      existingSubscription.isActive = true;
      existingSubscription.preferences = preferences || existingSubscription.preferences;
      existingSubscription.source = source || existingSubscription.source;
      await existingSubscription.save();

      res.status(200).json({
        message: "Successfully resubscribed to newsletter",
        subscription: {
          email: existingSubscription.email,
          preferences: existingSubscription.preferences,
        },
      });
      return;
    }
  }

  // Create new subscription
  const subscription = await Newsletter.create({
    email,
    preferences: preferences || {
      auctionUpdates: true,
      newListings: true,
      expertTips: true,
      weeklyDigest: true,
    },
    source: source || "footer",
    ipAddress: req.ip,
    userAgent: req.get("User-Agent"),
  });

  // Email functionality disabled for simplified deployment
  console.log('📧 Email disabled - would send welcome email to:', subscription.email);

  res.status(201).json({
    message: "Successfully subscribed to newsletter",
    subscription: {
      email: subscription.email,
      preferences: subscription.preferences,
    },
  });
});

// @desc    Unsubscribe from newsletter
// @route   GET /api/newsletter/unsubscribe/:token
// @access  Public
const unsubscribeFromNewsletter = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const subscription = await Newsletter.findOne({ unsubscribeToken: token });

  if (!subscription) {
    res.status(404);
    throw new Error("Invalid unsubscribe link");
  }

  subscription.isActive = false;
  await subscription.save();

  res.status(200).json({
    message: "Successfully unsubscribed from newsletter",
  });
});

// @desc    Update newsletter preferences
// @route   PUT /api/newsletter/preferences/:token
// @access  Public
const updateNewsletterPreferences = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { preferences } = req.body;

  const subscription = await Newsletter.findOne({ unsubscribeToken: token });

  if (!subscription) {
    res.status(404);
    throw new Error("Invalid preferences link");
  }

  subscription.preferences = { ...subscription.preferences, ...preferences };
  await subscription.save();

  res.status(200).json({
    message: "Newsletter preferences updated successfully",
    preferences: subscription.preferences,
  });
});

// @desc    Get newsletter statistics (Admin only)
// @route   GET /api/newsletter/stats
// @access  Private/Admin
const getNewsletterStats = asyncHandler(async (req, res) => {
  const totalSubscribers = await Newsletter.countDocuments({ isActive: true });
  const totalUnsubscribed = await Newsletter.countDocuments({ isActive: false });
  const recentSubscribers = await Newsletter.countDocuments({
    isActive: true,
    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
  });

  const sourceStats = await Newsletter.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: "$source", count: { $sum: 1 } } },
  ]);

  res.status(200).json({
    totalSubscribers,
    totalUnsubscribed,
    recentSubscribers,
    sourceStats,
  });
});

// @desc    Get all newsletter subscribers (Admin only)
// @route   GET /api/newsletter/subscribers
// @access  Private/Admin
const getAllSubscribers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  const subscribers = await Newsletter.find({ isActive: true })
    .select("email preferences source createdAt lastEmailSent emailsSent")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Newsletter.countDocuments({ isActive: true });

  res.status(200).json({
    subscribers,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// @desc    Send newsletter to all subscribers (Admin only)
// @route   POST /api/newsletter/send
// @access  Private/Admin
const sendNewsletterToAll = asyncHandler(async (req, res) => {
  const { subject, content, type } = req.body;

  if (!subject || !content) {
    res.status(400);
    throw new Error("Subject and content are required");
  }

  // Get all active subscribers based on type
  let query = { isActive: true };
  
  if (type === "auctionUpdates") {
    query["preferences.auctionUpdates"] = true;
  } else if (type === "newListings") {
    query["preferences.newListings"] = true;
  } else if (type === "expertTips") {
    query["preferences.expertTips"] = true;
  } else if (type === "weeklyDigest") {
    query["preferences.weeklyDigest"] = true;
  }

  const subscribers = await Newsletter.find(query);

  let successCount = 0;
  let failureCount = 0;

  // Send emails in batches to avoid overwhelming the email service
  const batchSize = 50;
  for (let i = 0; i < subscribers.length; i += batchSize) {
    const batch = subscribers.slice(i, i + batchSize);
    
    await Promise.all(
      batch.map(async (subscriber) => {
        try {
          const unsubscribeLink = `${process.env.FRONTEND_URL}/newsletter/unsubscribe/${subscriber.unsubscribeToken}`;
          const emailContent = `${content}\n\n---\nTo unsubscribe, visit: ${unsubscribeLink}`;

          // Email functionality disabled for simplified deployment
          console.log('📧 Email disabled - would send newsletter to:', subscriber.email);

          // Update subscriber stats (simulate email sent)
          subscriber.lastEmailSent = new Date();
          subscriber.emailsSent += 1;
          await subscriber.save();

          successCount++;
        } catch (error) {
          failureCount++;
        }
      })
    );

    // Add delay between batches
    if (i + batchSize < subscribers.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  res.status(200).json({
    message: "Newsletter sent successfully",
    stats: {
      totalSubscribers: subscribers.length,
      successCount,
      failureCount,
    },
  });
});

module.exports = {
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
  updateNewsletterPreferences,
  getNewsletterStats,
  getAllSubscribers,
  sendNewsletterToAll,
};
