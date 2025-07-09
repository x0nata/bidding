const asyncHandler = require("express-async-handler");
const Category = require("../model/categoryModel");
const slugify = require("slugify");

const createCategory = asyncHandler(async (req, res) => {
  try {
    const { title, description, categoryType, parentCategory, expertiseRequired, averageValue, popularEras } = req.body;

    // Check if category with this title already exists
    const existingCategory = await Category.findOne({ title });
    if (existingCategory) {
      res.status(400).json({ message: "Category with this title already exists" });
      return;
    }

    // Generate slug from title
    const slug = slugify(title, { lower: true, strict: true });

    // Check if slug already exists
    const existingSlug = await Category.findOne({ slug });
    if (existingSlug) {
      res.status(400).json({ message: "Category with this slug already exists" });
      return;
    }

    // Validate parent category if provided
    if (parentCategory) {
      const parent = await Category.findById(parentCategory);
      if (!parent) {
        res.status(400).json({ message: "Parent category not found" });
        return;
      }
    }

    const category = await Category.create({
      user: req.user._id,
      title,
      description,
      slug,
      categoryType,
      parentCategory: parentCategory || undefined,
      expertiseRequired: expertiseRequired || false,
      averageValue: averageValue || { min: 0, max: 0 },
      popularEras: popularEras || [],
      sortOrder: req.body.sortOrder || 0,
    });

    // If this is a subcategory, add it to parent's subcategories array
    if (parentCategory) {
      await Category.findByIdAndUpdate(
        parentCategory,
        { $push: { subcategories: category._id } }
      );
    }

    // Populate the response
    const populatedCategory = await Category.findById(category._id)
      .populate("user", "name email")
      .populate("parentCategory", "title slug")
      .populate("subcategories", "title slug");

    res.status(201).json(populatedCategory);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

const getAllCategory = asyncHandler(async (req, res) => {
  try {
    const { type, includeSubcategories, activeOnly } = req.query;

    // Build query filter
    let filter = {};

    if (type) {
      filter.categoryType = type;
    }

    if (activeOnly === 'true') {
      filter.isActive = true;
    }

    // If includeSubcategories is false, only get main categories (no parent)
    if (includeSubcategories === 'false') {
      filter.parentCategory = { $exists: false };
    }

    const categories = await Category.find(filter)
      .populate("user", "name email")
      .populate("parentCategory", "title slug categoryType")
      .populate("subcategories", "title slug categoryType averageValue")
      .sort({ sortOrder: 1, createdAt: -1 });

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories", error: error.message });
  }
});
const getCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const category = await Category.findById(id)
      .populate("user", "name email")
      .populate("parentCategory", "title slug categoryType")
      .populate("subcategories", "title slug categoryType averageValue");

    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: "Error fetching category", error: error.message });
  }
});

const getCategoryBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  try {
    const category = await Category.findOne({ slug })
      .populate("user", "name email")
      .populate("parentCategory", "title slug categoryType")
      .populate("subcategories", "title slug categoryType averageValue");

    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: "Error fetching category", error: error.message });
  }
});

const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const { title, description, categoryType, expertiseRequired, averageValue, popularEras, isActive, sortOrder } = req.body;

    // Generate new slug if title is being updated
    let updateData = {
      title,
      description,
      categoryType,
      expertiseRequired,
      averageValue,
      popularEras,
      isActive,
      sortOrder,
    };

    if (title) {
      const slug = slugify(title, { lower: true, strict: true });
      // Check if new slug conflicts with existing categories (excluding current one)
      const existingSlug = await Category.findOne({ slug, _id: { $ne: id } });
      if (existingSlug) {
        res.status(400).json({ message: "Category with this slug already exists" });
        return;
      }
      updateData.slug = slug;
    }

    const category = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("user", "name email")
      .populate("parentCategory", "title slug categoryType")
      .populate("subcategories", "title slug categoryType averageValue");

    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: "Error updating category", error: error.message });
  }
});
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const category = await Category.findById(id);

    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    // Check if category has subcategories
    if (category.subcategories && category.subcategories.length > 0) {
      res.status(400).json({
        message: "Cannot delete category with subcategories. Please delete subcategories first."
      });
      return;
    }

    // Remove this category from parent's subcategories array if it has a parent
    if (category.parentCategory) {
      await Category.findByIdAndUpdate(
        category.parentCategory,
        { $pull: { subcategories: id } }
      );
    }

    await Category.findByIdAndDelete(id);
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting category", error: error.message });
  }
});

// Get categories by type (for filtering)
const getCategoriesByType = asyncHandler(async (req, res) => {
  try {
    const categoryTypes = await Category.distinct("categoryType", { isActive: true });
    res.json(categoryTypes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching category types", error: error.message });
  }
});

// Get category hierarchy (main categories with their subcategories)
const getCategoryHierarchy = asyncHandler(async (req, res) => {
  try {
    const mainCategories = await Category.find({
      parentCategory: { $exists: false },
      isActive: true
    })
      .populate("subcategories", "title slug categoryType averageValue isActive")
      .sort({ sortOrder: 1, createdAt: -1 });

    // Filter out inactive subcategories
    const filteredCategories = mainCategories.map(category => ({
      ...category.toObject(),
      subcategories: category.subcategories.filter(sub => sub.isActive)
    }));

    res.json(filteredCategories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching category hierarchy", error: error.message });
  }
});

module.exports = {
  createCategory,
  getAllCategory,
  getCategory,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
  getCategoriesByType,
  getCategoryHierarchy
};
