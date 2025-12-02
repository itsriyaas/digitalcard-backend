import mongoose from "mongoose";
import slugify from "slugify";

const contactSchema = new mongoose.Schema(
  {
    phone: String,
    whatsapp: String,
    email: String,
    address: String,
    mapLink: String
  },
  { _id: false }
);

const socialLinksSchema = new mongoose.Schema(
  {
    instagram: String,
    facebook: String,
    youtube: String,
    website: String
  },
  { _id: false }
);

const itemSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["product", "service"], default: "product" },
    name: { type: String, required: true },
    price: { type: Number },
    images: [String],
    description: String
  },
  { timestamps: true }
);

const templateSchema = new mongoose.Schema(
  {
    templateId: { type: String, default: "list-basic" },
    filterType: { type: String, default: "all" }
  },
  { _id: false }
);

const colorThemeSchema = new mongoose.Schema(
  {
    id: String,
    name: String,
    primary: String,
    secondary: String,
    accent: String
  },
  { _id: false }
);

const customizationSchema = new mongoose.Schema(
  {
    colorTheme: { type: colorThemeSchema, default: () => ({}) },
    layout: { type: String, default: "centered" },
    spacing: { type: String, default: "normal" },
    borderRadius: { type: Number, default: 8 },
    backgroundPattern: { type: String, default: "none" },
    backgroundColor: { type: String, default: "#FFFFFF" },
    backgroundOpacity: { type: Number, default: 100 }
  },
  { _id: false }
);

const coverMediaSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["image", "video"] },
    source: { type: String, enum: ["file", "url"] },
    url: String,
    fileName: String,
    fileSize: Number
  },
  { _id: false }
);

const galleryImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    caption: String,
    alt: String
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    image: String,
    link: String,
    inStock: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: String,
    company: String,
    avatar: String,
    rating: { type: Number, min: 1, max: 5, default: 5 },
    text: { type: String, required: true }
  },
  { timestamps: true }
);

const offerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    discount: Number,
    discountType: { type: String, enum: ["percentage", "fixed"], default: "percentage" },
    code: String,
    validUntil: Date,
    banner: String,
    link: String,
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const buttonSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    url: { type: String, required: true },
    icon: { type: String, default: "link" },
    style: { type: String, default: "primary" },
    openInNew: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const analyticsSchema = new mongoose.Schema(
  {
    views: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    whatsappClicks: { type: Number, default: 0 },
    callClicks: { type: Number, default: 0 }
  },
  { _id: false }
);

const cardSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    businessType: String,
    logo: String,
    banner: String,
    about: String,

    // New fields for card builder
    template: { type: templateSchema, default: () => ({}) },
    customization: { type: customizationSchema, default: () => ({}) },
    coverMedia: coverMediaSchema,
    gallery: [galleryImageSchema],
    products: [productSchema],
    testimonials: [testimonialSchema],
    offers: [offerSchema],
    buttons: [buttonSchema],

    // Legacy fields (keeping for backward compatibility)
    contact: contactSchema,
    socialLinks: socialLinksSchema,
    items: [itemSchema],

    slug: { type: String, unique: true },
    analytics: { type: analyticsSchema, default: () => ({}) }
  },
  { timestamps: true }
);

// Generate slug
cardSchema.pre("save", async function (next) {
  if (!this.isModified("title") && this.slug) return next();

  const baseSlug = slugify(this.title, { lower: true, strict: true }) || "card";
  let slug = baseSlug;
  let count = 1;

  const Card = mongoose.model("Card", cardSchema);
  while (await Card.findOne({ slug })) {
    slug = `${baseSlug}-${count++}`;
  }

  this.slug = slug;
  next();
});

const Card = mongoose.model("Card", cardSchema);
export default Card;
