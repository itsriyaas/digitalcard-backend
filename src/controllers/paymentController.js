import Payment from '../models/Payment.js';
import Order from '../models/Order.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// Lazy initialize Razorpay to avoid errors if credentials not set
let razorpay = null;

const getRazorpayInstance = () => {
  if (!razorpay) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env file');
    }
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }
  return razorpay;
};

// @desc    Create Razorpay payment order
// @route   POST /api/payment/razorpay/create
// @access  Public
export const createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    // Get order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Create Razorpay order
    const options = {
      amount: order.total * 100, // amount in smallest currency unit (paise)
      currency: 'INR',
      receipt: order.orderNumber,
      notes: {
        orderId: order._id.toString(),
        catalogueId: order.catalogue.toString()
      }
    };

    const razorpayInstance = getRazorpayInstance();
    const razorpayOrder = await razorpayInstance.orders.create(options);

    // Create payment record
    const payment = await Payment.create({
      order: order._id,
      user: order.user,
      amount: order.total,
      currency: 'INR',
      paymentMethod: 'razorpay',
      gatewayOrderId: razorpayOrder.id,
      status: 'pending'
    });

    res.json({
      success: true,
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/payment/razorpay/verify
// @access  Public
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId
    } = req.body;

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      // Payment verification failed
      await Payment.findOneAndUpdate(
        { gatewayOrderId: razorpay_order_id },
        {
          status: 'failed',
          failureReason: 'Invalid signature'
        }
      );

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { gatewayOrderId: razorpay_order_id },
      {
        status: 'completed',
        gatewayPaymentId: razorpay_payment_id,
        gatewaySignature: razorpay_signature,
        paidAt: Date.now()
      },
      { new: true }
    );

    // Update order payment status
    const order = await Order.findById(orderId);
    order.paymentStatus = 'completed';
    order.paymentId = razorpay_payment_id;
    order.paidAt = Date.now();
    await order.save();

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create Stripe payment intent
// @route   POST /api/payment/stripe/create
// @access  Public
export const createStripePaymentIntent = async (req, res) => {
  try {
    // TODO: Implement Stripe payment intent creation
    // Requires stripe npm package

    res.status(501).json({
      success: false,
      message: 'Stripe integration not yet implemented'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Verify Stripe payment
// @route   POST /api/payment/stripe/verify
// @access  Public
export const verifyStripePayment = async (req, res) => {
  try {
    // TODO: Implement Stripe payment verification
    // Requires stripe npm package

    res.status(501).json({
      success: false,
      message: 'Stripe integration not yet implemented'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create PayPal order
// @route   POST /api/payment/paypal/create
// @access  Public
export const createPayPalOrder = async (req, res) => {
  try {
    // TODO: Implement PayPal order creation
    // Requires @paypal/checkout-server-sdk package

    res.status(501).json({
      success: false,
      message: 'PayPal integration not yet implemented'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Capture PayPal payment
// @route   POST /api/payment/paypal/capture
// @access  Public
export const capturePayPalPayment = async (req, res) => {
  try {
    // TODO: Implement PayPal payment capture
    // Requires @paypal/checkout-server-sdk package

    res.status(501).json({
      success: false,
      message: 'PayPal integration not yet implemented'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get payment by order
// @route   GET /api/payment/order/:orderId
// @access  Public/Private
export const getPaymentByOrder = async (req, res) => {
  try {
    const payment = await Payment.findOne({ order: req.params.orderId })
      .populate('order');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
