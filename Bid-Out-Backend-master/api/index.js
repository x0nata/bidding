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

// FIXED: Serverless-optimized MongoDB Connection with proper caching
let isConnecting = false;

const connectDB = async () => {
  try {
    console.log('🔄 connectDB() called - checking connection state...');
    console.log('🔄 Current mongoose readyState:', mongoose.connection.readyState);

    // If already connected, return immediately
    if (mongoose.connection.readyState === 1) {
      console.log('✅ Using existing MongoDB connection (readyState: 1)');
      return mongoose.connection;
    }

    // If currently connecting, wait for it to complete
    if (mongoose.connection.readyState === 2 || isConnecting) {
      console.log('⏳ Connection in progress, waiting...');
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout while waiting for existing connection'));
        }, 30000);

        mongoose.connection.once('connected', () => {
          clearTimeout(timeout);
          console.log('✅ Waited connection completed successfully');
          resolve(mongoose.connection);
        });

        mongoose.connection.once('error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });
    }

    // If disconnected or disconnecting, establish new connection
    if (mongoose.connection.readyState === 0 || mongoose.connection.readyState === 3) {
      console.log('🔄 Establishing new MongoDB connection...');
      isConnecting = true;

      const mongoURI = process.env.MONGO_URI || process.env.DATABASE_CLOUD;
      console.log('🔄 Environment check - MONGO_URI exists:', !!process.env.MONGO_URI);
      console.log('🔄 Environment check - DATABASE_CLOUD exists:', !!process.env.DATABASE_CLOUD);

      if (!mongoURI) {
        console.error('❌ No MongoDB connection string found');
        console.error('Available env vars:', Object.keys(process.env).filter(key => key.includes('MONGO')));
        isConnecting = false;
        return null;
      }

      console.log('🔗 Connection URI format:', mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));

      // Close existing connection if in disconnecting state
      if (mongoose.connection.readyState === 3) {
        console.log('🔄 Waiting for existing connection to close...');
        await mongoose.connection.close();
      }

      // FIXED: Serverless-optimized connection options
      const conn = await mongoose.connect(mongoURI, {
        // Balanced timeouts for serverless environment
        serverSelectionTimeoutMS: 15000, // 15 seconds (faster than 30s)
        connectTimeoutMS: 15000,          // 15 seconds (faster than 30s)
        socketTimeoutMS: 30000,           // 30 seconds for operations

        // Serverless-optimized pool settings
        maxPoolSize: 1,                   // Single connection for serverless
        minPoolSize: 0,                   // No minimum connections
        maxIdleTimeMS: 60000,             // Keep connection alive longer

        // Essential options for serverless
        bufferCommands: false,            // Fail fast if not connected
        bufferMaxEntries: 0,              // No buffering
        retryWrites: true,

        // Network optimization
        family: 4,                        // Force IPv4
        directConnection: false,

        // Serverless optimizations
        heartbeatFrequencyMS: 60000,      // Less frequent heartbeats
      });

      console.log('✅ MongoDB Atlas connected successfully');
      console.log(`📍 Connected to: ${conn.connection.host}`);
      console.log(`🗄️  Database: ${conn.connection.name}`);
      console.log(`🔌 Final connection state: ${conn.connection.readyState}`);

      isConnecting = false;
      return conn;
    }

    // Should not reach here
    console.warn('⚠️ Unexpected connection state:', mongoose.connection.readyState);
    return mongoose.connection.readyState === 1 ? mongoose.connection : null;

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('❌ Error details:', {
      name: error.name,
      code: error.code,
      codeName: error.codeName
    });

    // Reset connecting flag on error
    isConnecting = false;

    // ADDED: More detailed error logging for debugging
    if (error.name === 'MongoServerSelectionError') {
      console.error('🔧 MongoDB Server Selection Error - Possible causes:');
      console.error('  1. MongoDB Atlas cluster is paused or unavailable');
      console.error('  2. IP whitelist does not include 0.0.0.0/0 for Vercel');
      console.error('  3. Database user credentials are incorrect');
      console.error('  4. Connection string format is invalid');
      console.error('  5. Network connectivity issues from Vercel to MongoDB Atlas');
    }

    if (error.name === 'MongoParseError') {
      console.error('🔧 MongoDB Parse Error - Connection string format issue');
      console.error('  Check your MONGO_URI format and parameters');
    }

    if (error.name === 'MongoNetworkError') {
      console.error('🔧 MongoDB Network Error - Connectivity issue');
      console.error('  Check network access and firewall settings');
    }

    return null;
  }
};

// FIXED: Robust database connection middleware for API routes
const ensureDBConnection = async (req, res, next) => {
  try {
    console.log('🔄 Middleware - checking database connection...');
    console.log('🔄 Current readyState:', mongoose.connection.readyState);

    // Always attempt to ensure connection
    const connection = await connectDB();

    // Check final connection state
    const finalState = mongoose.connection.readyState;
    console.log('🔄 Final readyState after connectDB:', finalState);

    if (finalState !== 1) {
      console.error('❌ Database connection not established, readyState:', finalState);
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable',
        error: 'SERVICE_UNAVAILABLE',
        details: `Database readyState: ${finalState} (expected: 1)`,
        readyState: finalState
      });
    }

    console.log('✅ Database connection confirmed, proceeding to route');
    next();
  } catch (error) {
    console.error('❌ Database connection middleware error:', error);
    return res.status(503).json({
      success: false,
      message: 'Database connection error',
      error: 'CONNECTION_FAILED',
      details: error.message,
      readyState: mongoose.connection.readyState
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
    console.log('🔄 Health check - attempting database connection...');

    // Check environment variables first
    const mongoURI = process.env.MONGO_URI || process.env.DATABASE_CLOUD;
    console.log('🔗 MongoDB URI available:', !!mongoURI);
    console.log('🔗 URI format:', mongoURI ? mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') : 'NOT_FOUND');

    // Force connection attempt for health check
    const connection = await connectDB();
    console.log('🔄 Connection attempt result:', !!connection);

    const dbState = mongoose.connection.readyState;
    const dbStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    console.log('🔄 Final database state:', dbStates[dbState], 'readyState:', dbState);

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
      version: "1.0.0",
      debug: {
        mongoUriAvailable: !!mongoURI,
        connectionAttempted: !!connection
      }
    });
  } catch (error) {
    console.error('❌ Health check error:', error);
    res.status(503).json({
      status: "unhealthy",
      database: {
        state: "error",
        connected: false,
        error: error.message,
        errorName: error.name
      },
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      version: "1.0.0"
    });
  }
});

// Debug endpoint to check environment variables (remove after debugging)
app.get("/debug/env", (req, res) => {
  const mongoVars = Object.keys(process.env).filter(key =>
    key.includes('MONGO') || key.includes('DATABASE') || key === 'NODE_ENV'
  );

  const envInfo = {};
  mongoVars.forEach(key => {
    if (key.includes('MONGO') || key.includes('DATABASE')) {
      // Mask sensitive connection strings
      envInfo[key] = process.env[key] ?
        process.env[key].replace(/\/\/[^:]+:[^@]+@/, '//***:***@') :
        'NOT_SET';
    } else {
      envInfo[key] = process.env[key] || 'NOT_SET';
    }
  });

  res.json({
    message: "Environment Variables Debug",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongoVariables: envInfo,
    totalEnvVars: Object.keys(process.env).length
  });
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
