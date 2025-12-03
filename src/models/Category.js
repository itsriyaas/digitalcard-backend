import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  catalogue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Catalogue',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  order: {
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

// Index for faster queries
categorySchema.index({ catalogue: 1, parentCategory: 1 });

const Category = mongoose.model('Category', categorySchema);

export default Category;
