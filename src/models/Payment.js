import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'stripe', 'paypal', 'cod'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },

  // Gateway specific data
  gatewayOrderId: {
    type: String
  },
  gatewayPaymentId: {
    type: String
  },
  gatewaySignature: {
    type: String
  },

  // Response data
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed
  },

  // Failure details
  failureReason: {
    type: String
  },

  paidAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
paymentSchema.index({ order: 1 });
paymentSchema.index({ gatewayPaymentId: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
