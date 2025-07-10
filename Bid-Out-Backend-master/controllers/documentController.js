const asyncHandler = require("express-async-handler");
const cloudinary = require("cloudinary").v2;
const Product = require("../model/productModel");
const Appraisal = require("../model/appraisalModel");
const User = require("../model/userModel");
const sendEmail = require("../utils/sendEmail");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload document for product authenticity
const uploadProductDocument = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { documentType, description } = req.body;

  if (!req.file) {
    res.status(400);
    throw new Error("Please upload a document file");
  }

  // Validate product exists and user owns it
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (product.user.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error("Not authorized to upload documents for this product");
  }

  try {
    // Upload to Cloudinary (using memory storage)
    const base64String = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(base64String, {
      folder: "antique-auction/documents",
      resource_type: "auto", // Supports images, videos, and raw files
      public_id: `${productId}_${documentType}_${Date.now()}`,
    });

    // Create document object
    const documentData = {
      type: documentType,
      file: {
        public_id: result.public_id,
        url: result.secure_url,
        format: result.format,
        resource_type: result.resource_type,
        bytes: result.bytes,
        created_at: result.created_at,
      },
      description: description || '',
    };

    // Add document to product
    product.documents = product.documents || [];
    product.documents.push(documentData);
    await product.save();

    res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      document: documentData,
    });

  } catch (error) {
    res.status(500);
    throw new Error("Document upload failed");
  }
});

// Upload document for appraisal
const uploadAppraisalDocument = asyncHandler(async (req, res) => {
  const { appraisalId } = req.params;
  const { documentType, description } = req.body;

  if (!req.file) {
    res.status(400);
    throw new Error("Please upload a document file");
  }

  // Validate appraisal exists and user is authorized
  const appraisal = await Appraisal.findById(appraisalId);
  if (!appraisal) {
    res.status(404);
    throw new Error("Appraisal not found");
  }

  const isAuthorized = 
    appraisal.requestedBy.toString() === req.user.id ||
    appraisal.expert.toString() === req.user.id ||
    req.user.role === 'admin';

  if (!isAuthorized) {
    res.status(403);
    throw new Error("Not authorized to upload documents for this appraisal");
  }

  try {
    // Upload to Cloudinary (using memory storage)
    const base64String = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(base64String, {
      folder: "antique-auction/appraisal-documents",
      resource_type: "auto",
      public_id: `appraisal_${appraisalId}_${documentType}_${Date.now()}`,
    });

    // Create document object
    const documentData = {
      type: documentType,
      file: {
        public_id: result.public_id,
        url: result.secure_url,
        format: result.format,
        resource_type: result.resource_type,
        bytes: result.bytes,
        created_at: result.created_at,
      },
      description: description || '',
    };

    // Add document to appraisal
    appraisal.documents = appraisal.documents || [];
    appraisal.documents.push(documentData);
    await appraisal.save();

    res.status(201).json({
      success: true,
      message: "Appraisal document uploaded successfully",
      document: documentData,
    });

  } catch (error) {
    res.status(500);
    throw new Error("Document upload failed");
  }
});

// Get product documents
const getProductDocuments = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await Product.findById(productId).select('documents user');
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Check if user can view documents (owner, admin, or if product is public)
  const canView = 
    product.user.toString() === req.user.id ||
    req.user.role === 'admin' ||
    product.isverify; // Public if verified

  if (!canView) {
    res.status(403);
    throw new Error("Not authorized to view these documents");
  }

  res.status(200).json({
    success: true,
    documents: product.documents || [],
  });
});

// Get appraisal documents
const getAppraisalDocuments = asyncHandler(async (req, res) => {
  const { appraisalId } = req.params;

  const appraisal = await Appraisal.findById(appraisalId).select('documents requestedBy expert');
  if (!appraisal) {
    res.status(404);
    throw new Error("Appraisal not found");
  }

  // Check authorization
  const isAuthorized = 
    appraisal.requestedBy.toString() === req.user.id ||
    appraisal.expert.toString() === req.user.id ||
    req.user.role === 'admin';

  if (!isAuthorized) {
    res.status(403);
    throw new Error("Not authorized to view these documents");
  }

  res.status(200).json({
    success: true,
    documents: appraisal.documents || [],
  });
});

// Delete document
const deleteDocument = asyncHandler(async (req, res) => {
  const { type, id, documentId } = req.params; // type: 'product' or 'appraisal'

  let item;
  if (type === 'product') {
    item = await Product.findById(id);
  } else if (type === 'appraisal') {
    item = await Appraisal.findById(id);
  } else {
    res.status(400);
    throw new Error("Invalid document type");
  }

  if (!item) {
    res.status(404);
    throw new Error(`${type.charAt(0).toUpperCase() + type.slice(1)} not found`);
  }

  // Check authorization
  let isAuthorized = false;
  if (type === 'product') {
    isAuthorized = item.user.toString() === req.user.id || req.user.role === 'admin';
  } else if (type === 'appraisal') {
    isAuthorized = 
      item.requestedBy.toString() === req.user.id ||
      item.expert.toString() === req.user.id ||
      req.user.role === 'admin';
  }

  if (!isAuthorized) {
    res.status(403);
    throw new Error("Not authorized to delete this document");
  }

  // Find and remove document
  const documentIndex = item.documents.findIndex(doc => doc._id.toString() === documentId);
  if (documentIndex === -1) {
    res.status(404);
    throw new Error("Document not found");
  }

  const document = item.documents[documentIndex];

  try {
    // Delete from Cloudinary
    await cloudinary.uploader.destroy(document.file.public_id);

    // Remove from database
    item.documents.splice(documentIndex, 1);
    await item.save();

    res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });

  } catch (error) {
    res.status(500);
    throw new Error("Failed to delete document");
  }
});

// Update product authenticity status (admin/expert only)
const updateAuthenticityStatus = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { status, verifiedBy, certificateNumber, notes } = req.body;

  if (req.user.role !== 'admin' && req.user.role !== 'expert') {
    res.status(403);
    throw new Error("Not authorized to update authenticity status");
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Update authenticity information
  product.authenticity = {
    status: status,
    verifiedBy: verifiedBy || req.user.name,
    verificationDate: new Date(),
    certificateNumber: certificateNumber || productId,
  };

  await product.save();

  // Email notification disabled for simplified deployment
  const owner = await User.findById(product.user);
  if (owner) {
    console.log('📧 Email disabled - would notify product owner of authenticity update:', {
      owner: owner.email,
      product: product.title,
      status: status
    });
  }

  res.status(200).json({
    success: true,
    message: "Authenticity status updated successfully",
    authenticity: product.authenticity,
  });
});

module.exports = {
  uploadProductDocument,
  uploadAppraisalDocument,
  getProductDocuments,
  getAppraisalDocuments,
  deleteDocument,
  updateAuthenticityStatus,
};
