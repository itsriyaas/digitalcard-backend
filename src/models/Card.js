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
    template: { type: String, default: "template1" },
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
