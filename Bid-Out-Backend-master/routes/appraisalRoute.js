const express = require("express");
const {
  createAppraisal,
  getAllAppraisals,
  getUserAppraisals,
  getAppraisal,
  updateAppraisal,
  deleteAppraisal,
  acceptAppraisal,
} = require("../controllers/appraisalController");
const { protect, isAdmin, isUser } = require("../middleWare/authMiddleWare");

const appraisalRoute = express.Router();

// Public routes (none for appraisals - all require authentication)

// Protected routes for all authenticated users
appraisalRoute.get("/user", protect, getUserAppraisals);
appraisalRoute.get("/:id", protect, getAppraisal);
appraisalRoute.post("/", protect, createAppraisal);

// Admin routes (only admins can accept and update appraisals now)
appraisalRoute.put("/:id/accept", protect, isAdmin, acceptAppraisal);
appraisalRoute.put("/:id", protect, isAdmin, updateAppraisal);

// Admin routes
appraisalRoute.get("/", protect, isAdmin, getAllAppraisals);
appraisalRoute.delete("/:id", protect, isAdmin, deleteAppraisal);

module.exports = appraisalRoute;
