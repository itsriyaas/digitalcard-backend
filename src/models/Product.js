import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  catalogue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Catalogue',
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  images: [{
    type: String
  }],
  videos: [{
    type: String
  }],
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: 0
  },
  discountPrice: {
    type: Number,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  stockAvailable: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },

  // Analytics
  views: {
    type: Number,
    default: 0
  },
  orders: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better performance
productSchema.index({ catalogue: 1, category: 1 });
productSchema.index({ catalogue: 1, status: 1 });
productSchema.index({ sku: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
