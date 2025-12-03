import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  price: {
    type: Number,
    required: false,
    default: null
  },
  isEnquiry: {
    type: Boolean,
    default: false
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sessionId: {
    type: String
  },
  catalogue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Catalogue',
    required: true
  },
  items: [cartItemSchema],
  subtotal: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    default: 0
  },
  appliedCoupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon'
  }
}, {
  timestamps: true
});

// Calculate totals before saving
cartSchema.pre('save', function(next) {
  // Only calculate totals for items with price (exclude enquiry items)
  this.subtotal = this.items.reduce((sum, item) => {
    if (!item.isEnquiry && item.price !== null) {
      return sum + (item.price * item.quantity);
    }
    return sum;
  }, 0);
  this.total = this.subtotal - this.discount;
  next();
});

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
