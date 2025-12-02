import Product from '../models/Product.js';
import Catalogue from '../models/Catalogue.js';

// @desc    Create new product
// @route   POST /api/product
// @access  Private
export const createProduct = async (req, res) => {
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

    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all products (Admin sees all, customers see only their own)
// @route   GET /api/products
// @access  Private
export const getAllUserProducts = async (req, res) => {
  try {
    let query = {};

    // If not admin, filter by user's catalogues
    if (req.user.role !== 'admin') {
      const catalogues = await Catalogue.find({ user: req.user._id });
      const catalogueIds = catalogues.map(cat => cat._id);
      query.catalogue = { $in: catalogueIds };
    }

    // Get all products
    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('subcategory', 'name')
      .populate({
        path: 'catalogue',
        select: 'title slug user',
        populate: {
          path: 'user',
          select: 'name email role'
        }
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get products by catalogue
// @route   GET /api/products/catalogue/:catalogueId
// @access  Public
export const getProductsByCatalogue = async (req, res) => {
  try {
    const { catalogueId } = req.params;
    const { category, subcategory, status, featured, search } = req.query;

    const query = { catalogue: catalogueId };

    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    if (status) query.status = status;
    if (featured) query.isFeatured = featured === 'true';
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('subcategory', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single product
// @route   GET /api/product/:id
// @access  Public
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name')
      .populate('subcategory', 'name')
      .populate('catalogue', 'title slug');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Increment view count
    product.views += 1;
    await product.save();

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update product (Admin can update any, customers only their own)
// @route   PUT /api/product/:id
// @access  Private
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('catalogue');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Verify ownership (skip for admin)
    if (req.user.role !== 'admin' && product.catalogue.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedProduct
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete product (Admin can delete any, customers only their own)
// @route   DELETE /api/product/:id
// @access  Private
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('catalogue');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Verify ownership (skip for admin)
    if (req.user.role !== 'admin' && product.catalogue.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    await product.deleteOne();

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Bulk import products
// @route   POST /api/products/bulk-import
// @access  Private
export const bulkImportProducts = async (req, res) => {
  try {
    const { catalogueId, products } = req.body;

    // Verify catalogue ownership
    const catalogue = await Catalogue.findOne({
      _id: catalogueId,
      user: req.user._id
    });

    if (!catalogue) {
      return res.status(404).json({
        success: false,
        message: 'Catalogue not found'
      });
    }

    // Add catalogue to each product
    const productsWithCatalogue = products.map(p => ({
      ...p,
      catalogue: catalogueId
    }));

    const createdProducts = await Product.insertMany(productsWithCatalogue);

    res.status(201).json({
      success: true,
      data: createdProducts,
      count: createdProducts.length
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
