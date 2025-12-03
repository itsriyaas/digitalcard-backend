import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  catalogue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Catalogue',
    required: true
  },
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    uppercase: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'flat'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0
  },
  maxDiscount: {
    type: Number,
    min: 0
  },
  minCartValue: {
    type: Number,
    default: 0,
    min: 0
  },

  // Applicability
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  applicableCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],

  // Validity
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date,
    default: null // null means never expires
  },

  // Usage limits
  maxUsage: {
    type: Number,
    default: null
  },
  usageCount: {
    type: Number,
    default: 0
  },

  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster lookups
couponSchema.index({ code: 1 });
couponSchema.index({ catalogue: 1 });

// Check if coupon is valid
couponSchema.methods.isValid = function() {
  const now = new Date();

  if (!this.isActive) return false;
  if (now < this.validFrom) return false;
  if (this.validUntil && now > this.validUntil) return false; // Only check if validUntil exists
  if (this.maxUsage && this.usageCount >= this.maxUsage) return false;

  return true;
};

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;
