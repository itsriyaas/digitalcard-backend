import mongoose from 'mongoose';
import slugify from 'slugify';

const digitalCardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Personal Information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  title: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    trim: true
  },

  // Contact Information
  email: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  alternatePhone: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },

  // Address
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },

  // Social Media Links
  socialLinks: {
    facebook: String,
    instagram: String,
    twitter: String,
    linkedin: String,
    youtube: String,
    whatsapp: String
  },

  // Media
  profileImage: {
    type: String
  },
  coverImage: {
    type: String
  },
  logo: {
    type: String
  },

  // Customization
  theme: {
    primaryColor: {
      type: String,
      default: '#3B82F6'
    },
    secondaryColor: {
      type: String,
      default: '#1E40AF'
    },
    backgroundColor: {
      type: String,
      default: '#FFFFFF'
    },
    textColor: {
      type: String,
      default: '#000000'
    }
  },

  // Unique URL
  slug: {
    type: String,
    unique: true,
    required: true
  },

  // Settings
  isPublished: {
    type: Boolean,
    default: false
  },
  enableEnquiryForm: {
    type: Boolean,
    default: true
  },

  // Analytics
  views: {
    type: Number,
    default: 0
  },
  enquiries: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Generate unique slug before saving
digitalCardSchema.pre('save', async function(next) {
  if (this.isModified('name') && !this.slug) {
    let baseSlug = slugify(this.name, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    // Ensure unique slug
    while (await this.constructor.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }
  next();
});

const DigitalCard = mongoose.model('DigitalCard', digitalCardSchema);

export default DigitalCard;
