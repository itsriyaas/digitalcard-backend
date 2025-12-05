import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    const readableStream = Readable.from(buffer);
    readableStream.pipe(uploadStream);
  });
};

export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Determine resource type based on mimetype
    const resourceType = req.file.mimetype.startsWith("video/") ? "video" : "image";

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: "digicard",
      resource_type: resourceType,
      transformation: resourceType === "image" ? [
        { quality: "auto", fetch_format: "auto" }
      ] : undefined
    });

    res.status(200).json({
      message: "File uploaded successfully",
      file: {
        url: result.secure_url,
        publicId: result.public_id,
        filename: result.original_filename || req.file.originalname,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: result.bytes,
        format: result.format,
        resourceType: result.resource_type
      }
    });
  } catch (error) {
    console.error("Upload error:", error);
    next(error);
  }
};

export const uploadMultipleFiles = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    // Upload all files to Cloudinary
    const uploadPromises = req.files.map(async (file) => {
      const resourceType = file.mimetype.startsWith("video/") ? "video" : "image";

      const result = await uploadToCloudinary(file.buffer, {
        folder: "digicard",
        resource_type: resourceType,
        transformation: resourceType === "image" ? [
          { quality: "auto", fetch_format: "auto" }
        ] : undefined
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
        filename: result.original_filename || file.originalname,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: result.bytes,
        format: result.format,
        resourceType: result.resource_type
      };
    });

    const files = await Promise.all(uploadPromises);

    res.status(200).json({
      message: "Files uploaded successfully",
      files
    });
  } catch (error) {
    console.error("Upload error:", error);
    next(error);
  }
};

export const deleteFile = async (req, res, next) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({ message: "Public ID is required" });
    }

    // Delete from Cloudinary
    // Decode the publicId if it's URL encoded
    const decodedPublicId = decodeURIComponent(publicId);

    await cloudinary.uploader.destroy(decodedPublicId);

    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    next(error);
  }
};
