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

// MongoDB Connection for Serverless - Fixed for Vercel
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

    // FIXED: Optimized connection options for Vercel serverless
    const conn = await mongoose.connect(mongoURI, {
      // FIXED: Use longer timeouts that match your environment variables
      serverSelectionTimeoutMS: 30000, // 30 seconds (was 5000)
      connectTimeoutMS: 30000,          // 30 seconds (was 5000)
      socketTimeoutMS: 45000,           // 45 seconds

      // FIXED: Serverless-optimized pool settings
      maxPoolSize: 3,                   // Increased from 1
      minPoolSize: 1,                   // Minimum 1 connection
      maxIdleTimeMS: 30000,             // 30 seconds

      // FIXED: Enable buffering for better serverless compatibility
      bufferCommands: true,             // Enable mongoose buffering (was false)
      retryWrites: true,

      // Network optimization
      family: 4,                        // Force IPv4
      directConnection: false,

      // FIXED: Additional serverless optimizations
      heartbeatFrequencyMS: 30000,      // 30 seconds (was 10000)
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

    // ADDED: More detailed error logging for debugging
    if (error.name === 'MongoServerSelectionError') {
      console.error('🔧 MongoDB Server Selection Error - Possible causes:');
      console.error('  1. MongoDB Atlas cluster is paused or unavailable');
      console.error('  2. IP whitelist does not include 0.0.0.0/0 for Vercel');
      console.error('  3. Database user credentials are incorrect');
      console.error('  4. Connection string format is invalid');
      console.error('  5. Network connectivity issues from Vercel to MongoDB Atlas');
    }

    cachedConnection = null;
    return null;
  }
};

// FIXED: Database connection middleware for API routes
const ensureDBConnection = async (req, res, next) => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('🔄 Database not connected, attempting connection...');
      const connection = await connectDB();

      // If connection failed, return error instead of continuing
      if (!connection || mongoose.connection.readyState !== 1) {
        console.error('❌ Failed to establish database connection');
        return res.status(503).json({
          success: false,
          message: 'Database connection unavailable',
          error: 'SERVICE_UNAVAILABLE',
          details: 'Unable to connect to MongoDB Atlas. Please try again later.'
        });
      }
    }

    // Connection successful, proceed to route
    next();
  } catch (error) {
    console.error('❌ Database connection middleware error:', error);
    return res.status(503).json({
      success: false,
      message: 'Database connection error',
      error: 'CONNECTION_FAILED',
      details: error.message
    });
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
