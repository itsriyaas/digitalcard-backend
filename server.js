// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import cardRoutes from "./src/routes/cardRoutes.js";
import uploadRoutes from "./src/routes/uploadRoutes.js";
import catalogueRoutes from "./src/routes/catalogueRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import categoryRoutes from "./src/routes/categoryRoutes.js";
import cartRoutes from "./src/routes/cartRoutes.js";
import couponRoutes from "./src/routes/couponRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";
import paymentRoutes from "./src/routes/paymentRoutes.js";
import customerRoutes from "./src/routes/customerRoutes.js";
import { notFound, errorHandler } from "./src/middleware/errorMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
connectDB();

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);

app.use(morgan("dev"));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/upload", uploadRoutes);

// E-Commerce Routes
app.use("/api/catalogue", catalogueRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);

// Customer Management Routes
app.use("/api/customers", customerRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Error middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
