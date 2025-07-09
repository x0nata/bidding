const express = require("express");
const {
  createCategory,
  getAllCategory,
  getCategory,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
  getCategoriesByType,
  getCategoryHierarchy,
} = require("../controllers/categoryController");
const { protect, isAdmin } = require("../middleWare/authMiddleWare");

const categoryRoute = express.Router();

// Public routes
categoryRoute.get("/", getAllCategory);
categoryRoute.get("/types", getCategoriesByType);
categoryRoute.get("/hierarchy", getCategoryHierarchy);
categoryRoute.get("/slug/:slug", getCategoryBySlug);

// Admin-only routes
categoryRoute.post("/", protect, isAdmin, createCategory);
categoryRoute.get("/:id", protect, isAdmin, getCategory);
categoryRoute.put("/:id", protect, isAdmin, updateCategory);
categoryRoute.delete("/:id", protect, isAdmin, deleteCategory);

module.exports = categoryRoute;
