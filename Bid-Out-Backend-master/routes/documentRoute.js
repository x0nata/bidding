const express = require("express");
const multer = require("multer");
const {
  uploadProductDocument,
  uploadAppraisalDocument,
  getProductDocuments,
  getAppraisalDocuments,
  deleteDocument,
  updateAuthenticityStatus,
} = require("../controllers/documentController");
const { protect, isAdmin, isUser } = require("../middleWare/authMiddleWare");

const documentRoute = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/documents/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const fileFilter = (req, file, cb) => {
  // Accept documents, images, and PDFs
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'text/plain',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only documents, images, and PDFs are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter,
});

// Product document routes
documentRoute.post("/product/:productId", protect, upload.single('document'), uploadProductDocument);
documentRoute.get("/product/:productId", protect, getProductDocuments);

// Appraisal document routes
documentRoute.post("/appraisal/:appraisalId", protect, upload.single('document'), uploadAppraisalDocument);
documentRoute.get("/appraisal/:appraisalId", protect, getAppraisalDocuments);

// Delete document routes
documentRoute.delete("/:type/:id/:documentId", protect, deleteDocument);

// Authenticity status routes (admin only)
documentRoute.put("/authenticity/:productId", protect, isAdmin, updateAuthenticityStatus);

module.exports = documentRoute;
