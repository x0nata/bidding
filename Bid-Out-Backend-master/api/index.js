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

// MongoDB Connection for Serverless - Optimized for Vercel
let cachedConnection = null;

const connectDB = async () => {
  try {
    // Use cached connection if available and connected
    if (cachedConnection && mongoose.connection.readyState === 1) {
      console.log('🔄 Using cached MongoDB connection');
      return cachedConnection;
    }

    const mongoURI = process.env.MONGO_URI || process.env.DATABASE_CLOUD;

    if (!mongoURI) {
      console.error('❌ No MongoDB connection string found');
      console.error('Available env vars:', Object.keys(process.env).filter(key => key.includes('MONGO')));
      return null;
    }

    console.log('🔄 Establishing new MongoDB connection...');
    console.log('🔗 Connection URI format:', mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));

    // Close existing connection if in bad state
    if (mongoose.connection.readyState === 2 || mongoose.connection.readyState === 3) {
      console.log('🔄 Closing existing connection in bad state');
      await mongoose.connection.close();
    }

    // Optimized connection options for Vercel serverless
    const conn = await mongoose.connect(mongoURI, {
      // Reduced timeouts for faster serverless startup
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 30000,

      // Serverless-optimized pool settings
      maxPoolSize: 1,
      minPoolSize: 0,
      maxIdleTimeMS: 10000,

      // Essential options
      bufferCommands: false, // Disable mongoose buffering for serverless
      bufferMaxEntries: 0,   // Disable mongoose buffering
      retryWrites: true,

      // Network optimization
      family: 4,
      directConnection: false,

      // Additional serverless optimizations
      heartbeatFrequencyMS: 10000,
      serverSelectionRetryDelayMS: 2000,
    });

    console.log('✅ MongoDB Atlas connected successfully');
    console.log(`📍 Connected to: ${conn.connection.host}`);
    console.log(`🗄️  Database: ${conn.connection.name}`);

    cachedConnection = conn;
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('❌ Error details:', {
      name: error.name,
      code: error.code,
      codeName: error.codeName
    });

    cachedConnection = null;
    return null;
  }
};

// Database connection middleware for API routes
const ensureDBConnection = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('🔄 Database not connected, attempting connection...');
      await connectDB();
    }
    next();
  } catch (error) {
    console.error('❌ Database connection middleware error:', error);
    next(); // Continue anyway, let individual routes handle DB errors
  }
};

// Routes
app.get("/", async (req, res) => {
  try {
    // Attempt connection if not connected
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    const dbState = mongoose.connection.readyState;
    res.json({
      message: "Horn of Antiques API Server",
      status: "running",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      database: {
        connected: dbState === 1,
        state: dbState === 1 ? "connected" : dbState === 2 ? "connecting" : "disconnected",
        host: mongoose.connection.host || "not connected",
        name: mongoose.connection.name || "unknown"
      },
      endpoints: {
        health: "/health",
        api: "/api/*"
      }
    });
  } catch (error) {
    console.error('❌ Root endpoint error:', error);
    res.json({
      message: "Horn of Antiques API Server",
      status: "running",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      database: {
        connected: false,
        state: "error",
        error: error.message
      }
    });
  }
});

// Health check endpoint with connection attempt
app.get("/health", async (req, res) => {
  try {
    // Force connection attempt for health check
    await connectDB();

    const dbState = mongoose.connection.readyState;
    const dbStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    res.json({
      status: dbState === 1 ? "healthy" : "degraded",
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
  } catch (error) {
    console.error('❌ Health check error:', error);
    res.status(503).json({
      status: "unhealthy",
      database: {
        state: "error",
        connected: false,
        error: error.message
      },
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      version: "1.0.0"
    });
  }
});

// API Routes with database connection middleware
app.use("/api/users", ensureDBConnection, userRoute);
app.use("/api/product", ensureDBConnection, productRoute);
app.use("/api/bidding", ensureDBConnection, biddingRoute);
app.use("/api/category", ensureDBConnection, categoryRoute);
app.use("/api/appraisal", ensureDBConnection, appraisalRoute);
app.use("/api/document", ensureDBConnection, documentRoute);
app.use("/api/newsletter", ensureDBConnection, newsletterRoute);
app.use("/api/payments", ensureDBConnection, paymentRoute);
app.use("/api/auction-management", ensureDBConnection, auctionManagementRoute);

// Note: Static file serving removed for serverless compatibility
// Files should be served from cloud storage (Cloudinary) instead

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

// Export for Vercel serverless functions
module.exports = app;
