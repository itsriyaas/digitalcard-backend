import Category from '../models/Category.js';
import Catalogue from '../models/Catalogue.js';

// @desc    Create category or subcategory
// @route   POST /api/category
// @access  Private
export const createCategory = async (req, res) => {
  try {
    // Verify catalogue ownership
    const catalogue = await Catalogue.findOne({
      _id: req.body.catalogue,
      user: req.user._id
    });

    if (!catalogue) {
      return res.status(404).json({
        success: false,
        message: 'Catalogue not found'
      });
    }

    const category = await Category.create(req.body);

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get categories by catalogue (Admin sees all, customers see only their own)
// @route   GET /api/categories/catalogue/:catalogueId
// @access  Private/Public (Public when called from public routes)
export const getCategoriesByCatalogue = async (req, res) => {
  try {
    const { catalogueId } = req.params;

    // Get all categories (main and subcategories)
    const categories = await Category.find({ catalogue: catalogueId })
      .populate('parentCategory', 'name')
      .populate({
        path: 'catalogue',
        select: 'title slug user',
        populate: {
          path: 'user',
          select: 'name email role'
        }
      })
      .sort({ order: 1, createdAt: 1 });

    // Organize into hierarchy
    const mainCategories = categories.filter(cat => !cat.parentCategory);
    const subcategories = categories.filter(cat => cat.parentCategory);

    const hierarchicalCategories = mainCategories.map(main => ({
      ...main.toObject(),
      subcategories: subcategories.filter(
        sub => sub.parentCategory._id.toString() === main._id.toString()
      )
    }));

    res.json({
      success: true,
      data: hierarchicalCategories,
      flat: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single category
// @route   GET /api/category/:id
// @access  Public
export const getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('parentCategory', 'name');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update category (Admin can update any, customers only their own)
// @route   PUT /api/category/:id
// @access  Private
export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate('catalogue');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Verify ownership (skip for admin)
    if (req.user.role !== 'admin') {
      const catalogue = await Catalogue.findOne({
        _id: category.catalogue._id,
        user: req.user._id
      });

      if (!catalogue) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized'
        });
      }
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedCategory
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete category (Admin can delete any, customers only their own)
// @route   DELETE /api/category/:id
// @access  Private
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate('catalogue');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Verify ownership (skip for admin)
    if (req.user.role !== 'admin') {
      const catalogue = await Catalogue.findOne({
        _id: category.catalogue._id,
        user: req.user._id
      });

      if (!catalogue) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized'
        });
      }
    }

    // Delete subcategories as well
    await Category.deleteMany({ parentCategory: category._id });
    await category.deleteOne();

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
