const dotenv = require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const dns = require("dns");
const http = require("http");

const userRoute = require("./routes/userRoute");
const productRoute = require("./routes/productRoute");
const biddingRoute = require("./routes/biddingRoute");
const categoryRoute = require("./routes/categoryRoute");
const appraisalRoute = require("./routes/appraisalRoute");
const documentRoute = require("./routes/documentRoute");
const newsletterRoute = require("./routes/newsletterRoute");
const paymentRoute = require("./routes/paymentRoute");
const errorHandler = require("./middleWare/errorMiddleWare");
const User = require("./model/userModel");
const SocketService = require("./services/socketService");
const AuctionScheduler = require("./services/auctionScheduler");

const app = express();
const server = http.createServer(app);

//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  express.urlencoded({
    extended: false,
  })
);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        process.env.FRONTEND_URL
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

const PORT = process.env.PORT || 5000;

//Routes Middleware
app.use("/api/users", userRoute);
app.use("/api/product", productRoute);
app.use("/api/bidding", biddingRoute);
app.use("/api/category", categoryRoute);
app.use("/api/appraisal", appraisalRoute);
app.use("/api/document", documentRoute);
app.use("/api/newsletter", newsletterRoute);
app.use("/api/payments", paymentRoute);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Erro Middleware
app.use(errorHandler);

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

// Health check endpoint for Vercel with detailed database status
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

// Function to start the server
let serverStarted = false;
const startServer = () => {
  if (serverStarted) {
    return;
  }

  server.listen(PORT, () => {
    serverStarted = true;
    // Server started successfully
  });
};

// Function to initialize services
const initializeServices = () => {
  try {
    // Initialize WebSocket service
    const socketService = new SocketService(server);

    // Initialize auction scheduler
    const auctionScheduler = new AuctionScheduler();

    // Make services available globally for other modules
    global.socketService = socketService;
    global.auctionScheduler = auctionScheduler;
  } catch (error) {
  }
};

// Configure DNS to use Google's DNS servers for better MongoDB Atlas connectivity
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1']);

// MongoDB Connection Configuration optimized for Vercel Serverless
const connectDB = async () => {
  try {
    // Use MONGO_URI first, fallback to DATABASE_CLOUD for backward compatibility
    const mongoURI = process.env.MONGO_URI || process.env.DATABASE_CLOUD;

    if (!mongoURI) {
      console.error('❌ No MongoDB connection string found. Please set MONGO_URI environment variable.');
      return null;
    }

    // Check if already connected to avoid multiple connections in serverless
    if (mongoose.connection.readyState === 1) {
      // Using existing MongoDB connection
      return mongoose.connection;
    }

    // Connecting to MongoDB Atlas

    const conn = await mongoose.connect(mongoURI, {
      // Optimized settings for both local and serverless environments
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout (reduced for faster startup)
      socketTimeoutMS: 45000, // 45 seconds socket timeout
      connectTimeoutMS: 10000, // 10 seconds connection timeout (reduced)
      maxPoolSize: 5, // Reduced pool size for serverless
      minPoolSize: 1, // Minimum 1 connection
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      bufferCommands: true, // Enable mongoose buffering to handle connection delays
      retryWrites: true, // Enable retryable writes
      family: 4, // Force IPv4 to avoid IPv6 DNS issues
      directConnection: false, // Allow MongoDB driver to discover topology
      // Additional optimizations
      heartbeatFrequencyMS: 30000, // Heartbeat every 30 seconds
    });

    console.log('✅ MongoDB Atlas connected successfully');
    console.log(`📍 Connected to: ${conn.connection.host}`);
    console.log(`🗄️  Database: ${conn.connection.name}`);

    // Initialize services after successful database connection
    initializeServices();

    return conn;
  } catch (error) {
    console.error('❌ MongoDB Atlas connection failed:', error.message);

    if (error.name === 'MongoServerSelectionError') {
      console.error('🔧 MongoDB Server Selection Error - Check:');
      console.error('  1. MongoDB Atlas cluster is running');
      console.error('  2. IP whitelist includes 0.0.0.0/0 for Vercel');
      console.error('  3. Database user credentials are correct');
      console.error('  4. Connection string format is valid');
    }

    return null;
  }
};



// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
});

mongoose.connection.on('error', (err) => {
});

mongoose.connection.on('disconnected', () => {
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
});

// Initialize the application
const initializeApp = async () => {
  // Start server immediately
  startServer();

  // Try to connect to database in the background
  try {
    // Attempting database connection in background
    const connection = await connectDB();
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.log('⚠️ Server running without database connection');
  }
};

// Start the application
initializeApp();
