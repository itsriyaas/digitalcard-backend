import express from "express";
import { uploadFile, uploadMultipleFiles, deleteFile } from "../controllers/uploadController.js";
import { uploadSingle, uploadMultiple } from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/single", protect, uploadSingle, uploadFile);

router.post("/multiple", protect, uploadMultiple, uploadMultipleFiles);

router.delete("/:filename", protect, deleteFile);

export default router;
