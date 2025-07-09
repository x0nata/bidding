// Vercel Serverless Function Entry Point
// This file is the main entry point for the Vercel deployment

const dotenv = require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const dns = require("dns");

// Import routes
const userRoute = require("../routes/userRoute");
const productRoute = require("../routes/productRoute");
const biddingRoute = require("../routes/biddingRoute");
const categoryRoute = require("../routes/categoryRoute");
const appraisalRoute = require("../routes/appraisalRoute");
const documentRoute = require("../routes/documentRoute");
const newsletterRoute = require("../routes/newsletterRoute");
const paymentRoute = require("../routes/paymentRoute");
const auctionManagementRoute = require("../routes/auctionManagementRoute");
const errorHandler = require("../middleWare/errorMiddleWare");

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));
app.use(cookieParser());

// CORS Configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        process.env.FRONTEND_URL,
        'https://bidding-sandy.vercel.app',
        'https://bidding-3yga80dqn-x0natas-projects.vercel.app',
        'http://localhost:3000' // For development
      ].filter(Boolean);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"],
  })
);

// Configure DNS for better MongoDB Atlas connectivity
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1']);

// MongoDB Connection for Serverless
let isConnecting = false;
let connectionPromise = null;

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || process.env.DATABASE_CLOUD;

    if (!mongoURI) {
      console.error('❌ No MongoDB connection string found');
      return null;
    }

    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    // Prevent multiple connection attempts
    if (isConnecting) {
      return connectionPromise;
    }

    isConnecting = true;
    console.log('🔄 Connecting to MongoDB Atlas...');

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 5,
      minPoolSize: 1,
      maxIdleTimeMS: 30000,
      bufferCommands: true,
      retryWrites: true,
      family: 4,
      directConnection: false,
      heartbeatFrequencyMS: 30000,
    });

    console.log('✅ MongoDB Atlas connected successfully');
    isConnecting = false;
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    isConnecting = false;
    return null;
  }
};

// Initialize database connection
if (!connectionPromise) {
  connectionPromise = connectDB();
}

// Routes
app.get("/", (req, res) => {
  const dbState = mongoose.connection.readyState;
  res.json({
    message: "Horn of Antiques API Server",
    status: "running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    database: {
      connected: dbState === 1,
      state: dbState === 1 ? "connected" : dbState === 2 ? "connecting" : "disconnected",
      host: mongoose.connection.host || "not connected"
    },
    endpoints: {
      health: "/health",
      api: "/api/*"
    }
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  res.json({
    status: "healthy",
    database: {
      state: dbStates[dbState] || 'unknown',
      connected: dbState === 1,
      host: mongoose.connection.host || 'unknown',
      name: mongoose.connection.name || 'unknown',
      readyState: dbState
    },
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

// API Routes
app.use("/api/users", userRoute);
app.use("/api/product", productRoute);
app.use("/api/bidding", biddingRoute);
app.use("/api/category", categoryRoute);
app.use("/api/appraisal", appraisalRoute);
app.use("/api/document", documentRoute);
app.use("/api/newsletter", newsletterRoute);
app.use("/api/payments", paymentRoute);
app.use("/api/auction-management", auctionManagementRoute);

// Static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Error handling middleware
app.use(errorHandler);

// Handle 404
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl
  });
});

// Export for Vercel
module.exports = app;
