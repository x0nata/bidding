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
      console.log('🔗 URI length:', mongoURI.length);
      console.log('🔗 URI parameters:', mongoURI.includes('?') ? mongoURI.split('?')[1] : 'none');

      // Test URI parsing before attempting connection
      try {
        const testUrl = new URL(mongoURI);
        console.log('✅ URI parsing test passed');
        console.log('🔗 Protocol:', testUrl.protocol);
        console.log('🔗 Hostname:', testUrl.hostname);
        console.log('🔗 Database:', testUrl.pathname);
      } catch (parseError) {
        console.error('❌ URI parsing test failed:', parseError.message);
        throw new Error(`Invalid MongoDB URI format: ${parseError.message}`);
      }

      // Close existing connection if in disconnecting state
      if (mongoose.connection.readyState === 3) {
        console.log('🔄 Waiting for existing connection to close...');
        await mongoose.connection.close();
      }

      console.log('🔄 Attempting mongoose.connect...');

      // FIXED: Clean connection string without conflicting parameters
      // Remove parameters that will be set in options to avoid conflicts
      let cleanMongoURI = mongoURI;

      // If URI contains parameters that conflict with our options, use a clean version
      if (mongoURI.includes('maxPoolSize') || mongoURI.includes('serverSelectionTimeoutMS')) {
        console.log('🔧 Detected parameter conflicts in URI, using clean connection string...');
        // Extract base URI without conflicting parameters
        const baseURI = mongoURI.split('?')[0];
        // Keep only essential parameters that don't conflict
        cleanMongoURI = `${baseURI}?retryWrites=true&w=majority`;
        console.log('🔧 Clean URI format: mongodb+srv://***:***@host/database?retryWrites=true&w=majority');
      }

      // FIXED: Serverless-optimized connection options (no conflicts with URI)
      const conn = await mongoose.connect(cleanMongoURI, {
        // Balanced timeouts for serverless environment
        serverSelectionTimeoutMS: 30000, // 30 seconds for Vercel cold starts
        connectTimeoutMS: 30000,          // 30 seconds for initial connection
        socketTimeoutMS: 45000,           // 45 seconds for operations

        // Serverless-optimized pool settings
        maxPoolSize: 1,                   // Single connection for serverless
        minPoolSize: 0,                   // No minimum connections
        maxIdleTimeMS: 60000,             // Keep connection alive longer

        // Essential options for serverless
        bufferCommands: true,             // Enable buffering for better reliability
        bufferMaxEntries: 0,              // No buffer limit

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

// Enhanced debug endpoint to check environment variables and connection string details
app.get("/debug/env", (req, res) => {
  const mongoVars = Object.keys(process.env).filter(key =>
    key.includes('MONGO') || key.includes('DATABASE') || key === 'NODE_ENV'
  );

  const envInfo = {};
  mongoVars.forEach(key => {
    if (key.includes('MONGO') || key.includes('DATABASE')) {
      // Show more details for debugging while masking credentials
      const value = process.env[key];
      if (value) {
        envInfo[key] = {
          masked: value.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'),
          length: value.length,
          startsWith: value.substring(0, 20),
          hasSpecialChars: /[<>"|{}\\^`\[\]]/.test(value),
          parameterCount: (value.split('?')[1] || '').split('&').length
        };
      } else {
        envInfo[key] = 'NOT_SET';
      }
    } else {
      envInfo[key] = process.env[key] || 'NOT_SET';
    }
  });

  // Test connection string parsing
  const mongoURI = process.env.MONGO_URI || process.env.DATABASE_CLOUD;
  let parseTest = null;
  if (mongoURI) {
    try {
      // Test if the URI can be parsed by Node.js URL parser
      const url = new URL(mongoURI);
      parseTest = {
        protocol: url.protocol,
        hostname: url.hostname,
        database: url.pathname.substring(1),
        searchParams: Object.fromEntries(url.searchParams),
        isValid: true
      };
    } catch (error) {
      parseTest = {
        isValid: false,
        error: error.message
      };
    }
  }

  res.json({
    message: "Enhanced Environment Variables Debug",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongoVariables: envInfo,
    connectionStringTest: parseTest,
    totalEnvVars: Object.keys(process.env).length
  });
});

// Test endpoint to try different connection string formats
app.get("/debug/connection-test", async (req, res) => {
  const results = [];

  // Test 1: Basic connection string without parameters
  const basicURI = "mongodb+srv://bid:wasd1234@bid.cfyzacu.mongodb.net/bidding_site";
  results.push(await testConnectionString("Basic URI", basicURI));

  // Test 2: With minimal parameters
  const minimalURI = "mongodb+srv://bid:wasd1234@bid.cfyzacu.mongodb.net/bidding_site?retryWrites=true&w=majority";
  results.push(await testConnectionString("Minimal URI", minimalURI));

  // Test 3: Current environment variable
  const envURI = process.env.MONGO_URI || process.env.DATABASE_CLOUD;
  results.push(await testConnectionString("Environment URI", envURI));

  res.json({
    message: "Connection String Testing",
    timestamp: new Date().toISOString(),
    tests: results
  });
});

async function testConnectionString(name, uri) {
  if (!uri) {
    return { name, status: "SKIPPED", reason: "URI not provided" };
  }

  try {
    // Test URL parsing
    const url = new URL(uri);

    // Test mongoose connection validation (without actually connecting)
    let mongooseValidation = "UNKNOWN";
    let cleanURI = uri;

    try {
      // Clean URI if it has conflicting parameters
      if (uri.includes('maxPoolSize') || uri.includes('serverSelectionTimeoutMS')) {
        const baseURI = uri.split('?')[0];
        cleanURI = `${baseURI}?retryWrites=true&w=majority`;
        mongooseValidation = "CLEANED_FOR_MONGOOSE";
      } else {
        mongooseValidation = "MONGOOSE_COMPATIBLE";
      }
    } catch (mongooseError) {
      mongooseValidation = `MONGOOSE_ERROR: ${mongooseError.message}`;
    }

    const testResult = {
      name,
      status: "PARSE_SUCCESS",
      length: uri.length,
      protocol: url.protocol,
      hostname: url.hostname,
      database: url.pathname.substring(1),
      parameterCount: uri.includes('?') ? uri.split('?')[1].split('&').length : 0,
      parameters: uri.includes('?') ? Object.fromEntries(new URLSearchParams(uri.split('?')[1])) : {},
      mongooseValidation,
      cleanURI: cleanURI !== uri ? cleanURI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') : "SAME_AS_ORIGINAL"
    };

    return testResult;
  } catch (error) {
    return {
      name,
      status: "PARSE_FAILED",
      error: error.message,
      uri: uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')
    };
  }
}

// Real mongoose connection test endpoint
app.get("/debug/mongoose-test", async (req, res) => {
  const results = [];

  // Test 1: Clean basic URI
  const basicURI = "mongodb+srv://bid:wasd1234@bid.cfyzacu.mongodb.net/bidding_site?retryWrites=true&w=majority";
  results.push(await testMongooseConnection("Clean Basic URI", basicURI));

  // Test 2: Current environment URI (cleaned)
  const envURI = process.env.MONGO_URI || process.env.DATABASE_CLOUD;
  if (envURI) {
    const baseURI = envURI.split('?')[0];
    const cleanEnvURI = `${baseURI}?retryWrites=true&w=majority`;
    results.push(await testMongooseConnection("Cleaned Environment URI", cleanEnvURI));
  }

  res.json({
    message: "Mongoose Connection Testing",
    timestamp: new Date().toISOString(),
    tests: results,
    note: "These tests create temporary connections that are immediately closed"
  });
});

async function testMongooseConnection(name, uri) {
  if (!uri) {
    return { name, status: "SKIPPED", reason: "URI not provided" };
  }

  const startTime = Date.now();
  let testConnection = null;

  try {
    // Create a new mongoose connection for testing
    testConnection = mongoose.createConnection();

    // Set a shorter timeout for testing
    const testOptions = {
      serverSelectionTimeoutMS: 10000, // 10 seconds for testing
      connectTimeoutMS: 10000,
      socketTimeoutMS: 15000,
      maxPoolSize: 1,
      bufferCommands: false,
      family: 4
    };

    await testConnection.openUri(uri, testOptions);

    const duration = Date.now() - startTime;
    const result = {
      name,
      status: "CONNECTION_SUCCESS",
      duration: `${duration}ms`,
      host: testConnection.host,
      database: testConnection.name,
      readyState: testConnection.readyState
    };

    // Close the test connection
    await testConnection.close();

    return result;

  } catch (error) {
    const duration = Date.now() - startTime;

    // Close connection if it was created
    if (testConnection) {
      try {
        await testConnection.close();
      } catch (closeError) {
        // Ignore close errors
      }
    }

    return {
      name,
      status: "CONNECTION_FAILED",
      duration: `${duration}ms`,
      error: error.name,
      message: error.message,
      uri: uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')
    };
  }
}

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
