import Catalogue from '../models/Catalogue.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

// @desc    Create new catalogue
// @route   POST /api/catalogue
// @access  Private
export const createCatalogue = async (req, res) => {
  try {
    const catalogue = await Catalogue.create({
      ...req.body,
      user: req.user._id
    });

    res.status(201).json({
      success: true,
      data: catalogue
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user's catalogues (Admin sees all, customers see only their own)
// @route   GET /api/catalogue
// @access  Private
export const getUserCatalogues = async (req, res) => {
  try {
    let query = {};

    // If not admin, filter by user
    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    }

    const catalogues = await Catalogue.find(query)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: catalogues.length,
      data: catalogues
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single catalogue (Admin can view any, customers only their own)
// @route   GET /api/catalogue/:id
// @access  Private
export const getCatalogue = async (req, res) => {
  try {
    let query = { _id: req.params.id };

    // If not admin, filter by user
    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    }

    const catalogue = await Catalogue.findOne(query)
      .populate('user', 'name email role');

    if (!catalogue) {
      return res.status(404).json({
        success: false,
        message: 'Catalogue not found'
      });
    }

    res.json({
      success: true,
      data: catalogue
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update catalogue
// @route   PUT /api/catalogue/:id
// @access  Private
export const updateCatalogue = async (req, res) => {
  try {
    let catalogue = await Catalogue.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!catalogue) {
      return res.status(404).json({
        success: false,
        message: 'Catalogue not found'
      });
    }

    catalogue = await Catalogue.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: catalogue
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete catalogue
// @route   DELETE /api/catalogue/:id
// @access  Private
export const deleteCatalogue = async (req, res) => {
  try {
    const catalogue = await Catalogue.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!catalogue) {
      return res.status(404).json({
        success: false,
        message: 'Catalogue not found'
      });
    }

    // Delete associated data
    await Product.deleteMany({ catalogue: catalogue._id });
    await Category.deleteMany({ catalogue: catalogue._id });
    await catalogue.deleteOne();

    res.json({
      success: true,
      message: 'Catalogue deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get public catalogue by slug
// @route   GET /api/catalogue/public/:slug
// @access  Public
export const getPublicCatalogue = async (req, res) => {
  try {
    const catalogue = await Catalogue.findOne({
      slug: req.params.slug,
      isPublished: true
    });

    if (!catalogue) {
      return res.status(404).json({
        success: false,
        message: 'Catalogue not found'
      });
    }

    // Increment visitor count
    catalogue.analytics.visitors += 1;
    await catalogue.save();

    res.json({
      success: true,
      data: catalogue
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
