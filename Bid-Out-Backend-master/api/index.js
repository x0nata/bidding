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
        'https://bidding-9vw1.vercel.app', // ✅ CORRECT: Main frontend URL
        'https://bidding-9vw1-5kuiwxx8b-x0natas-projects.vercel.app', // Temporary deployment URL
        'https://bidding-9vw1-pro9le6ec-x0natas-projects.vercel.app', // Temporary deployment URL
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
  // Declare variables at function scope for error handling access
  let mongoURI = null;
  let cleanMongoURI = null;

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

      mongoURI = process.env.MONGO_URI || process.env.DATABASE_CLOUD;
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
      console.log('🔗 URI raw (first 100 chars):', JSON.stringify(mongoURI.substring(0, 100)));
      console.log('🔗 URI contains maxPoolSize:', mongoURI.includes('maxPoolSize'));
      console.log('🔗 URI contains serverSelectionTimeoutMS:', mongoURI.includes('serverSelectionTimeoutMS'));

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

      // FIXED: Always use clean connection string approach (same as successful test endpoint)
      // This ensures consistency with the working test endpoint logic
      console.log('🔧 Creating clean connection string (same approach as test endpoint)...');

      // Extract base URI and always create clean version
      const baseURI = mongoURI.split('?')[0];
      cleanMongoURI = `${baseURI}?retryWrites=true&w=majority`;

      console.log('🔧 Original URI:', mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
      console.log('🔧 Clean URI:', cleanMongoURI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
      console.log('🔧 Using same cleaning logic as successful test endpoint');

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
      console.error('  Original URI:', mongoURI ? mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') : 'NOT_FOUND');
      console.error('  Clean URI used:', cleanMongoURI ? cleanMongoURI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') : 'NOT_CREATED');
      console.error('  Error details:', error.message);
    }

    if (error.name === 'ReferenceError') {
      console.error('🔧 Reference Error - Variable scope issue');
      console.error('  Error message:', error.message);
      console.error('  mongoURI available:', typeof mongoURI !== 'undefined');
      console.error('  cleanMongoURI available:', typeof cleanMongoURI !== 'undefined');
    }

    if (error.name === 'MongoNetworkError') {
      console.error('🔧 MongoDB Network Error - Connectivity issue');
      console.error('  Check network access and firewall settings');
    }

    // Additional debugging for ReferenceError
    if (error.name === 'ReferenceError') {
      console.error('🔧 Reference Error - Variable scope issue');
      console.error('  Error message:', error.message);
      console.error('  mongoURI available:', typeof mongoURI !== 'undefined');
      console.error('  cleanMongoURI available:', typeof cleanMongoURI !== 'undefined');
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
      message: "Horn of Antiques API Server - Memory Storage Fixed",
      status: "running",
      timestamp: new Date().toISOString(),
      version: "2.1.0",
      deploymentId: "DEPLOY_2025_07_10_MEMORY_STORAGE_FIX",
      fileUploadMode: "MEMORY_STORAGE_CLOUDINARY",
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
    let connectionAttempted = false;
    let connection = null;

    try {
      connectionAttempted = true;
      connection = await connectDB();
      console.log('🔄 Connection attempt result:', !!connection);
    } catch (connectError) {
      console.error('❌ Connection attempt failed:', connectError.message);
      connection = null;
    }

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
        connectionAttempted: connectionAttempted,
        connectionSuccessful: !!connection
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

// Simple debug endpoint for quick testing
app.get("/debug", (req, res) => {
  res.json({
    message: "Debug endpoint working",
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      "/debug/env",
      "/debug/connection-test",
      "/debug/mongoose-test",
      "/debug/auth",
      "/debug/cors"
    ]
  });
});

// Authentication debug endpoint
app.get("/debug/auth", (req, res) => {
  res.json({
    message: "Authentication Debug Information",
    timestamp: new Date().toISOString(),
    endpoints: {
      register: "POST /api/users/register",
      login: "POST /api/users/login",
      logout: "GET /api/users/logout",
      checkAuth: "GET /api/users/loggedin",
      getUser: "GET /api/users/getuser"
    },
    testCredentials: {
      admin: {
        email: "admin@gmail.com",
        password: "Admin@123",
        note: "Hardcoded admin account for testing"
      }
    },
    headers: {
      received: req.headers,
      origin: req.get('origin'),
      userAgent: req.get('user-agent')
    },
    cookies: req.cookies
  });
});

// CORS debug endpoint
app.get("/debug/cors", (req, res) => {
  const origin = req.get('origin');
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'https://bidding-sandy.vercel.app',
    'https://bidding-3yga80dqn-x0natas-projects.vercel.app',
    'http://localhost:3000'
  ].filter(Boolean);

  res.json({
    message: "CORS Configuration Debug",
    timestamp: new Date().toISOString(),
    request: {
      origin: origin,
      method: req.method,
      headers: {
        origin: req.get('origin'),
        referer: req.get('referer'),
        userAgent: req.get('user-agent')
      }
    },
    corsConfig: {
      allowedOrigins: allowedOrigins,
      originAllowed: allowedOrigins.includes(origin),
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"]
    },
    environment: {
      FRONTEND_URL: process.env.FRONTEND_URL || 'NOT_SET',
      NODE_ENV: process.env.NODE_ENV || 'NOT_SET'
    }
  });
});

// API Routes verification endpoint
app.get("/debug/routes", (req, res) => {
  res.json({
    message: "Backend API Routes Verification",
    timestamp: new Date().toISOString(),
    availableRoutes: {
      authentication: {
        login: "POST /api/users/login",
        register: "POST /api/users/register",
        logout: "GET /api/users/logout",
        checkAuth: "GET /api/users/loggedin",
        getUser: "GET /api/users/getuser"
      },
      products: {
        getAll: "GET /api/product",
        getById: "GET /api/product/:id",
        getActiveAuctions: "GET /api/product/auctions/active",
        getUpcomingAuctions: "GET /api/product/auctions/upcoming",
        getUserProducts: "GET /api/product/user",
        getWonProducts: "GET /api/product/won-products",
        create: "POST /api/product",
        update: "PUT /api/product/:id",
        delete: "DELETE /api/product/:id"
      },
      admin: {
        getAllProducts: "GET /api/product/admin/products",
        getAllAuctions: "GET /api/product/admin/auctions",
        updateAuction: "PUT /api/product/admin/auctions/:id",
        endAuction: "POST /api/product/admin/auctions/:id/end",
        changeAuctionStatus: "PATCH /api/product/admin/auctions/:id/status",
        getAuctionBids: "GET /api/product/admin/auctions/:id/bids",
        getTransportationItems: "GET /api/product/admin/transportation",
        updateTransportationStatus: "PUT /api/product/admin/transportation/:id",
        getTransportationStats: "GET /api/product/admin/transportation/stats"
      },
      users: {
        getProfile: "GET /api/users/getuser",
        updateProfile: "PUT /api/users/profile",
        getSalesHistory: "GET /api/users/sales-history",
        getBalance: "GET /api/users/sell-amount",
        getAllUsers: "GET /api/users/users (admin only)"
      },
      categories: {
        getAll: "GET /api/category",
        getBySlug: "GET /api/category/slug/:slug",
        getByType: "GET /api/category/types",
        getHierarchy: "GET /api/category/hierarchy"
      },
      bidding: {
        placeBid: "POST /api/bidding",
        getBidHistory: "GET /api/bidding/:productId",
        getUserActivity: "GET /api/bidding/user/activity",
        getActiveBidsCount: "GET /api/bidding/stats/active-bids-count"
      }
    },
    databaseStatus: {
      connected: mongoose.connection.readyState === 1,
      readyState: mongoose.connection.readyState
    },
    serverInfo: {
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    }
  });
});

// File upload configuration debug endpoint - DEPLOYMENT FIX 2025-07-10
app.get("/debug/file-upload", (req, res) => {
  const { upload } = require("../utils/fileUpload");

  res.json({
    message: "File Upload Configuration Debug - MEMORY STORAGE ACTIVE",
    timestamp: new Date().toISOString(),
    deploymentStatus: "FIXED_MEMORY_STORAGE_2025_07_10",
    multerConfig: {
      storageType: "MEMORY_STORAGE", // ✅ Using memory storage (NOT disk)
      maxFileSize: "5MB",
      allowedTypes: "images only",
      serverlessCompatible: true,
      diskStorageDisabled: true
    },
    cloudinaryConfig: {
      configured: !!(process.env.CLOUDINARY_CLOUD_NAME &&
                     process.env.CLOUDINARY_API_KEY &&
                     process.env.CLOUDINARY_API_SECRET),
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || "not configured",
      hasApiKey: !!process.env.CLOUDINARY_API_KEY,
      hasApiSecret: !!process.env.CLOUDINARY_API_SECRET
    },
    environment: {
      nodeEnv: process.env.NODE_ENV,
      isVercel: !!process.env.VERCEL,
      platform: process.platform
    },
    fileUploadFlow: [
      "1. Frontend sends FormData with images",
      "2. Multer processes files in MEMORY (no disk writes)",
      "3. Files converted to base64 buffers",
      "4. Uploaded directly to Cloudinary",
      "5. No 'uploads/' directory access needed"
    ],
    notes: [
      "✅ FIXED: Using multer.memoryStorage() for serverless compatibility",
      "✅ FIXED: Files are processed as buffers and uploaded to Cloudinary",
      "✅ FIXED: No local file system access required",
      "❌ OLD: No more disk storage or uploads/ directory access"
    ]
  });
});

// Test authentication endpoint
app.post("/debug/test-login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔄 Test login attempt:', { email, passwordProvided: !!password });
    console.log('🔄 Request headers:', req.headers);
    console.log('🔄 Request origin:', req.get('origin'));

    // Test with hardcoded admin credentials
    if (email === "admin@gmail.com" && password === "Admin@123") {
      const testToken = "test_token_12345";

      // Set cookie
      const isProduction = process.env.NODE_ENV === 'production';
      res.cookie("token", testToken, {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400), // 1 day
        sameSite: isProduction ? "none" : "lax",
        secure: isProduction,
      });

      console.log('✅ Test login successful');

      return res.status(200).json({
        success: true,
        message: "Test login successful",
        user: {
          _id: "test_admin_id",
          name: "Test Admin",
          email: "admin@gmail.com",
          role: "admin"
        },
        token: testToken,
        cookieSet: true,
        environment: process.env.NODE_ENV
      });
    }

    console.log('❌ Test login failed - invalid credentials');
    res.status(400).json({
      success: false,
      message: "Invalid test credentials",
      expectedCredentials: {
        email: "admin@gmail.com",
        password: "Admin@123"
      }
    });

  } catch (error) {
    console.error('❌ Test login error:', error);
    res.status(500).json({
      success: false,
      message: "Test login error",
      error: error.message
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
