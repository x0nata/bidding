const asyncHandler = require("express-async-handler");
const Appraisal = require("../model/appraisalModel");
const Product = require("../model/productModel");
const User = require("../model/userModel");
const sendEmail = require("../utils/sendEmail");

// Create new appraisal request
const createAppraisal = asyncHandler(async (req, res) => {
  const {
    productId,
    expertId,
    appraisalType,
    estimatedValue,
    marketValue,
    authenticity,
    condition,
    attribution,
    provenance,
    report,
    fee
  } = req.body;

  const userId = req.user.id;

  // Validate product exists and user owns it
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (product.user.toString() !== userId && req.user.role !== 'admin') {
    res.status(403);
    throw new Error("Not authorized to request appraisal for this product");
  }

  // Validate expert exists and has appropriate role
  const expert = await User.findById(expertId);
  if (!expert || (expert.role !== 'admin' && expert.role !== 'expert')) {
    res.status(400);
    throw new Error("Invalid expert selected");
  }

  // Check if there's already a pending appraisal for this product
  const existingAppraisal = await Appraisal.findOne({
    product: productId,
    status: { $in: ['Requested', 'In Progress'] }
  });

  if (existingAppraisal) {
    res.status(400);
    throw new Error("There is already a pending appraisal for this product");
  }

  const appraisal = await Appraisal.create({
    product: productId,
    expert: expertId,
    requestedBy: userId,
    appraisalType,
    status: 'Requested',
    estimatedValue,
    marketValue,
    authenticity,
    condition,
    attribution,
    provenance,
    report,
    fee: fee || { amount: 0, currency: 'USD', paid: false }
  });

  // Populate the response
  const populatedAppraisal = await Appraisal.findById(appraisal._id)
    .populate('product', 'title image')
    .populate('expert', 'name email')
    .populate('requestedBy', 'name email');

  // Email notification disabled for simplified deployment
  console.log('📧 Email disabled - would notify expert of new appraisal request:', {
    expert: expert.email,
    product: product.title,
    requester: req.user.name
  });

  res.status(201).json(populatedAppraisal);
});

// Get all appraisals (admin only)
const getAllAppraisals = asyncHandler(async (req, res) => {
  const { status, appraisalType, page = 1, limit = 20 } = req.query;

  let filter = {};
  if (status) filter.status = status;
  if (appraisalType) filter.appraisalType = appraisalType;

  const skip = (page - 1) * limit;

  const appraisals = await Appraisal.find(filter)
    .populate('product', 'title image')
    .populate('expert', 'name email')
    .populate('requestedBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const totalAppraisals = await Appraisal.countDocuments(filter);
  const totalPages = Math.ceil(totalAppraisals / limit);

  res.status(200).json({
    appraisals,
    pagination: {
      currentPage: Number(page),
      totalPages,
      totalAppraisals,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  });
});

// Get appraisals for current user
const getUserAppraisals = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { status, page = 1, limit = 20 } = req.query;

  let filter = {};
  
  // Users can see appraisals they requested or are assigned as expert
  if (req.user.role === 'expert' || req.user.role === 'admin') {
    filter.$or = [
      { requestedBy: userId },
      { expert: userId }
    ];
  } else {
    filter.requestedBy = userId;
  }

  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  const appraisals = await Appraisal.find(filter)
    .populate('product', 'title image')
    .populate('expert', 'name email')
    .populate('requestedBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const totalAppraisals = await Appraisal.countDocuments(filter);
  const totalPages = Math.ceil(totalAppraisals / limit);

  res.status(200).json({
    appraisals,
    pagination: {
      currentPage: Number(page),
      totalPages,
      totalAppraisals,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  });
});

// Get single appraisal
const getAppraisal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const appraisal = await Appraisal.findById(id)
    .populate('product', 'title image description')
    .populate('expert', 'name email')
    .populate('requestedBy', 'name email');

  if (!appraisal) {
    res.status(404);
    throw new Error("Appraisal not found");
  }

  // Check authorization
  const isAuthorized = 
    appraisal.requestedBy._id.toString() === userId ||
    appraisal.expert._id.toString() === userId ||
    req.user.role === 'admin';

  if (!isAuthorized) {
    res.status(403);
    throw new Error("Not authorized to view this appraisal");
  }

  res.status(200).json(appraisal);
});

// Update appraisal (expert only)
const updateAppraisal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const appraisal = await Appraisal.findById(id);
  if (!appraisal) {
    res.status(404);
    throw new Error("Appraisal not found");
  }

  // Check if user is the assigned expert or admin
  if (appraisal.expert.toString() !== userId && req.user.role !== 'admin') {
    res.status(403);
    throw new Error("Not authorized to update this appraisal");
  }

  const {
    status,
    estimatedValue,
    marketValue,
    authenticity,
    condition,
    attribution,
    provenance,
    report,
    documents,
    validUntil
  } = req.body;

  // Update appraisal
  const updatedAppraisal = await Appraisal.findByIdAndUpdate(
    id,
    {
      status,
      estimatedValue,
      marketValue,
      authenticity,
      condition,
      attribution,
      provenance,
      report,
      documents,
      validUntil,
      lastUpdated: new Date(),
      $push: {
        revisions: {
          date: new Date(),
          changes: req.body.revisionNotes || 'Appraisal updated',
          reason: req.body.revisionReason || 'Update'
        }
      }
    },
    { new: true, runValidators: true }
  )
    .populate('product', 'title image')
    .populate('expert', 'name email')
    .populate('requestedBy', 'name email');

  // If appraisal is completed, update the product's authenticity status
  if (status === 'Completed' && authenticity && authenticity.isAuthentic !== undefined) {
    await Product.findByIdAndUpdate(appraisal.product._id, {
      'authenticity.status': authenticity.isAuthentic ? 'Verified' : 'Disputed',
      'authenticity.verifiedBy': req.user.name,
      'authenticity.verificationDate': new Date(),
      'authenticity.certificateNumber': appraisal._id.toString()
    });

    // Email notification disabled for simplified deployment
    const productOwner = await User.findById(appraisal.requestedBy._id);
    console.log('📧 Email disabled - would notify product owner of completed appraisal:', {
      owner: productOwner.email,
      product: appraisal.product.title,
      expert: req.user.name
    });
  }

  res.status(200).json(updatedAppraisal);
});

// Delete appraisal (admin only)
const deleteAppraisal = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const appraisal = await Appraisal.findById(id);
  if (!appraisal) {
    res.status(404);
    throw new Error("Appraisal not found");
  }

  await Appraisal.findByIdAndDelete(id);
  res.status(200).json({ message: "Appraisal deleted successfully" });
});

// Accept appraisal request (expert only)
const acceptAppraisal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const appraisal = await Appraisal.findById(id);
  if (!appraisal) {
    res.status(404);
    throw new Error("Appraisal not found");
  }

  if (appraisal.expert.toString() !== userId) {
    res.status(403);
    throw new Error("Not authorized to accept this appraisal");
  }

  if (appraisal.status !== 'Requested') {
    res.status(400);
    throw new Error("Appraisal is not in requested status");
  }

  appraisal.status = 'In Progress';
  await appraisal.save();

  // Email notification disabled for simplified deployment
  const requester = await User.findById(appraisal.requestedBy);
  console.log('📧 Email disabled - would notify requester of accepted appraisal:', {
    requester: requester.email,
    product: appraisal.product.title,
    expert: req.user.name
  });

  res.status(200).json({ message: "Appraisal accepted successfully", appraisal });
});

module.exports = {
  createAppraisal,
  getAllAppraisals,
  getUserAppraisals,
  getAppraisal,
  updateAppraisal,
  deleteAppraisal,
  acceptAppraisal,
};
