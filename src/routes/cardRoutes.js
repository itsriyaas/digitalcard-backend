// src/routes/cardRoutes.js
import express from "express";
import {
  createCard,
  getUserCards,
  getCardById,
  updateCard,
  deleteCard,
  getPublicCard,
  trackView,
  trackShare,
  trackWhatsapp,
  trackCall
} from "../controllers/cardController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected
router.get("/user", protect, getUserCards);
router.post("/", protect, createCard);
router.get("/:id", protect, getCardById);
router.put("/:id", protect, updateCard);
router.delete("/:id", protect, deleteCard);

// Public
router.get("/public/:slugOrId", getPublicCard);

// Analytics
router.post("/:id/view", trackView);
router.post("/:id/share", trackShare);
router.post("/:id/whatsapp", trackWhatsapp);
router.post("/:id/call", trackCall);

export default router;
