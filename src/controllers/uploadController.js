import path from "path";
import fs from "fs";

export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    res.status(200).json({
      message: "File uploaded successfully",
      file: {
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      }
    });
  } catch (error) {
    next(error);
  }
};

export const uploadMultipleFiles = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const files = req.files.map((file) => ({
      url: `/uploads/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    }));

    res.status(200).json({
      message: "Files uploaded successfully",
      files
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFile = async (req, res, next) => {
  try {
    const { filename } = req.params;

    if (!filename) {
      return res.status(400).json({ message: "Filename is required" });
    }

    const filePath = path.join("uploads", filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    fs.unlinkSync(filePath);

    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    next(error);
  }
};
