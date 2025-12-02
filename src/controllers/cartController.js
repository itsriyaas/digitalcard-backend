import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';

// @desc    Get or create cart
// @route   GET /api/cart/:catalogueId
// @access  Public
export const getCart = async (req, res) => {
  try {
    const { catalogueId } = req.params;
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'];

    let cart = await Cart.findOne({
      catalogue: catalogueId,
      ...(userId ? { user: userId } : { sessionId })
    }).populate('items.product').populate('appliedCoupon');

    if (!cart) {
      cart = await Cart.create({
        catalogue: catalogueId,
        ...(userId ? { user: userId } : { sessionId }),
        items: []
      });
    }

    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Public
export const addToCart = async (req, res) => {
  try {
    const { catalogueId, productId, quantity = 1 } = req.body;
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'];

    // Get product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check stock
    if (!product.stockAvailable || product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Product out of stock'
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({
      catalogue: catalogueId,
      ...(userId ? { user: userId } : { sessionId })
    });

    if (!cart) {
      cart = await Cart.create({
        catalogue: catalogueId,
        ...(userId ? { user: userId } : { sessionId }),
        items: []
      });
    }

    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity,
        price: product.discountPrice || product.price
      });
    }

    await cart.save();
    await cart.populate('items.product');

    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/update
// @access  Public
export const updateCartItem = async (req, res) => {
  try {
    const { catalogueId, productId, quantity } = req.body;
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'];

    const cart = await Cart.findOne({
      catalogue: catalogueId,
      ...(userId ? { user: userId } : { sessionId })
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not in cart'
      });
    }

    if (quantity <= 0) {
      // Remove item
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    await cart.populate('items.product');

    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:productId
// @access  Public
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const { catalogueId } = req.body;
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'];

    const cart = await Cart.findOne({
      catalogue: catalogueId,
      ...(userId ? { user: userId } : { sessionId })
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    );

    await cart.save();
    await cart.populate('items.product');

    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Apply coupon to cart
// @route   POST /api/cart/apply-coupon
// @access  Public
export const applyCoupon = async (req, res) => {
  try {
    const { catalogueId, couponCode } = req.body;
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'];

    const cart = await Cart.findOne({
      catalogue: catalogueId,
      ...(userId ? { user: userId } : { sessionId })
    }).populate('items.product');

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Find coupon
    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      catalogue: catalogueId
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code'
      });
    }

    // Check if coupon is valid
    if (!coupon.isValid()) {
      return res.status(400).json({
        success: false,
        message: 'Coupon has expired or reached usage limit'
      });
    }

    // Check minimum cart value
    if (cart.subtotal < coupon.minCartValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum cart value of ${coupon.minCartValue} required`
      });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (cart.subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      discount = coupon.discountValue;
    }

    cart.appliedCoupon = coupon._id;
    cart.discount = discount;
    await cart.save();
    await cart.populate('appliedCoupon');

    res.json({
      success: true,
      data: cart,
      message: 'Coupon applied successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Remove coupon from cart
// @route   POST /api/cart/remove-coupon
// @access  Public
export const removeCoupon = async (req, res) => {
  try {
    const { catalogueId } = req.body;
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'];

    const cart = await Cart.findOne({
      catalogue: catalogueId,
      ...(userId ? { user: userId } : { sessionId })
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.appliedCoupon = null;
    cart.discount = 0;
    await cart.save();

    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart/:catalogueId
// @access  Public
export const clearCart = async (req, res) => {
  try {
    const { catalogueId } = req.params;
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'];

    const cart = await Cart.findOne({
      catalogue: catalogueId,
      ...(userId ? { user: userId } : { sessionId })
    });

    if (cart) {
      cart.items = [];
      cart.appliedCoupon = null;
      cart.discount = 0;
      await cart.save();
    }

    res.json({
      success: true,
      message: 'Cart cleared'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
