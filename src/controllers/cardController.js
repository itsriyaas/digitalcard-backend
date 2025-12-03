// src/controllers/cardController.js
import mongoose from "mongoose";
import Card from "../models/Card.js";

/**
 * POST /api/cards
 */
export const createCard = async (req, res, next) => {
  try {
    const {
      title,
      businessType,
      about,
      logo,
      banner,
      contact,
      socialLinks,
      items,
      template,
      customization,
      coverMedia,
      gallery,
      products,
      testimonials,
      offers,
      buttons
    } = req.body;

    if (!title) return res.status(400).json({ message: "Title is required" });

    const card = await Card.create({
      user: req.user._id,
      title,
      businessType,
      about,
      logo,
      banner,
      contact,
      socialLinks,
      items,
      template,
      customization,
      coverMedia,
      gallery,
      products,
      testimonials,
      offers,
      buttons
    });

    res.status(201).json({ card });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/cards/user
 */
export const getUserCards = async (req, res, next) => {
  try {
    const cards = await Card.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ cards });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/cards/:id
 */
export const getCardById = async (req, res, next) => {
  try {
    const card = await Card.findOne({ _id: req.params.id, user: req.user._id });
    if (!card) return res.status(404).json({ message: "Card not found" });
    res.json({ card });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/cards/:id
 */
export const updateCard = async (req, res, next) => {
  try {
    const card = await Card.findOne({ _id: req.params.id, user: req.user._id });
    if (!card) return res.status(404).json({ message: "Card not found" });

    Object.assign(card, req.body);
    await card.save();
    res.json({ card });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/cards/:id
 */
export const deleteCard = async (req, res, next) => {
  try {
    const card = await Card.findOne({ _id: req.params.id, user: req.user._id });
    if (!card) return res.status(404).json({ message: "Card not found" });

    await card.deleteOne();
    res.json({ message: "Card deleted" });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/cards/public/:slugOrId
 */
export const getPublicCard = async (req, res, next) => {
  try {
    const { slugOrId } = req.params;
    let card;

    if (mongoose.Types.ObjectId.isValid(slugOrId)) {
      card = await Card.findById(slugOrId);
    }
    if (!card) {
      card = await Card.findOne({ slug: slugOrId });
    }

    if (!card) return res.status(404).json({ message: "Card not found" });

    res.json({ card });
  } catch (err) {
    next(err);
  }
};

// ------ Analytics helpers ------
const incField = async (id, field, res, next) => {
  try {
    const card = await Card.findById(id);
    if (!card) return res.status(404).json({ message: "Card not found" });
    card.analytics[field] = (card.analytics[field] || 0) + 1;
    await card.save();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

export const trackView = (req, res, next) => incField(req.params.id, "views", res, next);
export const trackShare = (req, res, next) => incField(req.params.id, "shares", res, next);
export const trackWhatsapp = (req, res, next) =>
  incField(req.params.id, "whatsappClicks", res, next);
export const trackCall = (req, res, next) =>
  incField(req.params.id, "callClicks", res, next);
