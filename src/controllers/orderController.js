import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import Catalogue from '../models/Catalogue.js';
import Payment from '../models/Payment.js';
import { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } from '../utils/emailService.js';

// @desc    Create order from cart
// @route   POST /api/order
// @access  Public
export const createOrder = async (req, res) => {
  try {
    const { catalogueId, customer, paymentMethod } = req.body;
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'];

    // Get cart
    const cart = await Cart.findOne({
      catalogue: catalogueId,
      ...(userId ? { user: userId } : { sessionId })
    }).populate('items.product').populate('appliedCoupon');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Validate stock for all items
    for (const item of cart.items) {
      if (!item.product.stockAvailable || item.product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `${item.product.title} is out of stock`
        });
      }
    }

    // Prepare order items
    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      title: item.product.title,
      image: item.product.images?.[0] || null,
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity
    }));

    // Generate order number
    const count = await Order.countDocuments();
    const orderNumber = `ORD-${Date.now()}-${(count + 1).toString().padStart(5, '0')}`;

    // Create order
    const order = await Order.create({
      orderNumber,
      catalogue: catalogueId,
      user: userId || null,
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: {
          street: customer.address?.street || '',
          city: customer.address?.city || '',
          state: customer.address?.state || '',
          zipCode: customer.address?.zipCode || '',
          country: customer.address?.country || 'India'
        }
      },
      items: orderItems,
      subtotal: cart.subtotal,
      discount: cart.discount || 0,
      total: cart.total,
      appliedCoupon: cart.appliedCoupon ? {
        code: cart.appliedCoupon.code,
        discount: cart.discount
      } : undefined,
      paymentMethod
    });

    // Update product stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity, orders: 1 }
      });
    }

    // Update coupon usage
    if (cart.appliedCoupon) {
      await Coupon.findByIdAndUpdate(cart.appliedCoupon._id, {
        $inc: { usageCount: 1 }
      });
    }

    // Clear cart
    cart.items = [];
    cart.appliedCoupon = null;
    cart.discount = 0;
    await cart.save();

    // Update catalogue analytics - increment order count
    await Catalogue.findByIdAndUpdate(catalogueId, {
      $inc: {
        'analytics.totalOrders': 1
      }
    });

    // Get catalogue details for email
    const catalogueDetails = await Catalogue.findById(catalogueId);

    // Send order confirmation email
    sendOrderConfirmationEmail(order, catalogueDetails).catch(err => {
      console.error('Failed to send order confirmation email:', err);
    });

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get orders by catalogue (Admin)
// @route   GET /api/orders/:catalogueId
// @access  Private
export const getOrdersByCatalogue = async (req, res) => {
  try {
    const { catalogueId } = req.params;
    const { status, paymentStatus, search } = req.query;

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

    const query = { catalogue: catalogueId };

    if (status) query.orderStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(query)
      .populate('items.product', 'title')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single order
// @route   GET /api/order/:id
// @access  Public/Private
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product')
      .populate('catalogue', 'title');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update order status
// @route   PUT /api/order/:id/status
// @access  Private
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const order = await Order.findById(req.params.id).populate('catalogue');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify ownership (skip for admin)
    if (req.user.role !== 'admin') {
      const catalogue = await Catalogue.findOne({
        _id: order.catalogue._id,
        user: req.user._id
      });

      if (!catalogue) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized'
        });
      }
    }

    const oldStatus = order.orderStatus;
    order.orderStatus = orderStatus;

    if (orderStatus === 'delivered') {
      order.deliveredAt = Date.now();
      // Mark payment as completed for COD orders when delivered
      if (order.paymentMethod === 'cod' && order.paymentStatus !== 'completed') {
        order.paymentStatus = 'completed';
        order.paidAt = Date.now();
        // Update revenue for COD orders
        await Catalogue.findByIdAndUpdate(order.catalogue._id, {
          $inc: {
            'analytics.totalRevenue': order.total
          }
        });
      }
    }

    await order.save();

    // Send status update email
    sendOrderStatusUpdateEmail(order, order.catalogue, oldStatus, orderStatus).catch(err => {
      console.error('Failed to send order status update email:', err);
    });

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update payment status
// @route   PUT /api/order/:id/payment
// @access  Private
export const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, paymentId } = req.body;

    const order = await Order.findById(req.params.id).populate('catalogue');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.paymentStatus = paymentStatus;
    if (paymentId) order.paymentId = paymentId;
    if (paymentStatus === 'completed') {
      order.paidAt = Date.now();

      // Update catalogue analytics - add revenue
      await Catalogue.findByIdAndUpdate(order.catalogue._id, {
        $inc: {
          'analytics.totalRevenue': order.total
        }
      });
    }

    await order.save();

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user orders
// @route   GET /api/orders/user
// @access  Private
// @desc    Get all orders for admin's catalogues
// @route   GET /api/orders
// @access  Private (Admin)
export const getAllAdminOrders = async (req, res) => {
  try {
    // Get admin's catalogues
    const catalogues = await Catalogue.find({ user: req.user._id });
    const catalogueIds = catalogues.map(cat => cat._id);

    // Get all orders for these catalogues
    const orders = await Order.find({ catalogue: { $in: catalogueIds } })
      .populate('catalogue', 'title')
      .populate('items.product', 'title images')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('catalogue', 'title')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
