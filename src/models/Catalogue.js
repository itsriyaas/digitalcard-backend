import mongoose from 'mongoose';
import slugify from 'slugify';

const catalogueSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Catalogue title is required'],
    trim: true
  },
  slug: {
    type: String,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  logo: {
    type: String
  },
  banner: {
    type: String
  },

  // Template & Customization
  template: {
    templateId: {
      type: String,
      enum: ['grid', 'showcase', 'minimal'],
      default: 'grid'
    }
  },
  customization: {
    primaryColor: {
      type: String,
      default: '#3B82F6'
    },
    secondaryColor: {
      type: String,
      default: '#1E40AF'
    },
    fontStyle: {
      type: String,
      enum: ['sans', 'serif', 'mono'],
      default: 'sans'
    },
    buttonStyle: {
      type: String,
      enum: ['rounded', 'square', 'pill'],
      default: 'rounded'
    },
    headerPosition: {
      type: String,
      enum: ['left', 'center', 'right'],
      default: 'center'
    }
  },

  // About/Brand Section
  about: {
    type: String
  },

  // Status
  isPublished: {
    type: Boolean,
    default: false
  },

  // Analytics
  analytics: {
    visitors: {
      type: Number,
      default: 0
    },
    totalOrders: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Generate slug before saving
catalogueSchema.pre('save', async function(next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });

    // Ensure unique slug
    const existingCatalogue = await this.constructor.findOne({ slug: this.slug });
    if (existingCatalogue && existingCatalogue._id.toString() !== this._id.toString()) {
      this.slug = `${this.slug}-${Date.now()}`;
    }
  }
  next();
});

const Catalogue = mongoose.model('Catalogue', catalogueSchema);

export default Catalogue;
