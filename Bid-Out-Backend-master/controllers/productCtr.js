const asyncHandler = require("express-async-handler");
const Product = require("../model/productModel");
const slugify = require("slugify");
const BiddingProduct = require("../model/biddingProductModel");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Enhanced error logging utility
const logError = (stage, error, context = {}) => {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    stage,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    context,
    requestId: context.requestId || 'unknown'
  };

  return errorInfo;
};

// Enhanced error response utility
const createErrorResponse = (stage, error, details = {}) => {
  const errorResponse = {
    success: false,
    error: {
      stage,
      type: error.name || 'UnknownError',
      message: error.message,
      details,
      timestamp: new Date().toISOString()
    }
  };

  // Add specific error codes for different types
  switch (stage) {
    case 'validation':
      errorResponse.error.code = 'VALIDATION_ERROR';
      break;
    case 'file_upload':
      errorResponse.error.code = 'FILE_UPLOAD_ERROR';
      break;
    case 'database':
      errorResponse.error.code = 'DATABASE_ERROR';
      break;
    case 'authentication':
      errorResponse.error.code = 'AUTH_ERROR';
      break;
    default:
      errorResponse.error.code = 'GENERAL_ERROR';
  }

  return errorResponse;
};

const createProduct = asyncHandler(async (req, res) => {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const requestContext = { requestId, userId: req.user?.id, timestamp: new Date().toISOString() };



  // Validate user authentication
  if (!req.user || !req.user.id) {
    const errorDetails = {
      issue: 'User not authenticated',
      headers: req.headers,
      cookies: req.cookies,
      requestId
    };

    logError('authentication', new Error('User not authenticated'), { ...requestContext, ...errorDetails });

    return res.status(401).json(createErrorResponse('authentication',
      new Error('Please log in to create a listing'),
      errorDetails
    ));
  }

  const userId = req.user.id;



  let {
    title,
    description,
    price,
    category,
    height,
    lengthpic,
    width,
    mediumused,
    weigth,
    // Antique-specific fields
    era,
    period,
    provenance,
    condition,
    conditionDetails,
    materials,
    techniques,
    historicalSignificance,
    maker,
    style,
    rarity,
    // Auction-specific fields
    auctionType,
    reservePrice,
    startingBid,
    auctionStartDate,
    auctionEndDate,
    bidIncrement
  } = req.body;

  // Parse JSON strings if they exist
  try {
    if (typeof materials === 'string') {
      materials = JSON.parse(materials);
    }
    if (typeof techniques === 'string') {
      techniques = JSON.parse(techniques);
    }
    if (typeof maker === 'string') {
      maker = JSON.parse(maker);
    }
  } catch (parseError) {
    // Continue with original values if parsing fails
  }

  const originalSlug = slugify(title, {
    lower: true,
    remove: /[*+~.()'"!:@]/g,
    strict: true,
  });

  let slug = originalSlug;
  let suffix = 1;

  while (await Product.findOne({ slug })) {
    slug = `${originalSlug}-${suffix}`;
    suffix++;
  }

  // Enhanced validation for antique auctions
  try {
    const validationErrors = [];
    const requiredFields = { title, description, startingBid };

    // Check required fields
    Object.entries(requiredFields).forEach(([field, value]) => {
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        validationErrors.push({
          field,
          message: `${field.charAt(0).toUpperCase() + field.slice(1)} is required`,
          value: value || null
        });
      }
    });

    if (validationErrors.length > 0) {
      const errorDetails = {
        missingFields: validationErrors,
        receivedFields: Object.keys(req.body),
        requestId
      };

      logError('validation', new Error('Required fields missing'), { ...requestContext, ...errorDetails });

      return res.status(400).json(createErrorResponse('validation',
        new Error(`Missing required fields: ${validationErrors.map(e => e.field).join(', ')}`),
        errorDetails
      ));
    }

    // Validate starting bid is a positive number
    const startingBidNum = parseFloat(startingBid);
    if (isNaN(startingBidNum) || startingBidNum <= 0) {
      const errorDetails = {
        field: 'startingBid',
        receivedValue: startingBid,
        parsedValue: startingBidNum,
        requestId
      };

      logError('validation', new Error('Invalid starting bid'), { ...requestContext, ...errorDetails });

      return res.status(400).json(createErrorResponse('validation',
        new Error("Starting bid must be a positive number"),
        errorDetails
      ));
    }
  } catch (validationError) {
    logError('validation', validationError, requestContext);
    return res.status(400).json(createErrorResponse('validation', validationError, { requestId }));
  }

  // Validate auction dates for timed auctions
  if (auctionType === 'Timed') {
    // If dates are provided, validate them
    if (auctionStartDate && auctionEndDate) {
      const startDate = new Date(auctionStartDate);
      const endDate = new Date(auctionEndDate);
      const now = new Date();

      if (startDate < now) {
        res.status(400);
        throw new Error("Auction start date cannot be in the past");
      }

      if (endDate <= startDate) {
        res.status(400);
        throw new Error("Auction end date must be after start date");
      }
    }
    // If dates are not provided, we'll set defaults below
  }

  // Validate reserve price
  if (reservePrice && reservePrice < startingBid) {
    res.status(400);
    throw new Error("Reserve price cannot be lower than starting bid");
  }

  // Set default auction dates if not provided or invalid
  let finalAuctionStartDate = auctionStartDate;
  let finalAuctionEndDate = auctionEndDate;

  if (auctionType === 'Timed') {
    const now = new Date();

    // Check if start date is provided and valid
    if (!auctionStartDate || auctionStartDate === '' || isNaN(new Date(auctionStartDate))) {
      finalAuctionStartDate = new Date(now.getTime() + 5 * 60 * 1000); // Start 5 minutes from now
    }

    // Check if end date is provided and valid
    if (!auctionEndDate || auctionEndDate === '' || isNaN(new Date(auctionEndDate))) {
      finalAuctionEndDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Default 7 days from now
    }

    // Ensure end date is after start date
    const startDate = new Date(finalAuctionStartDate);
    const endDate = new Date(finalAuctionEndDate);

    if (endDate <= startDate) {
      finalAuctionEndDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days after start
    }
  }

  // Enhanced file upload handling
  let fileData = {};
  let mainImageFile = null;

  // Find the main image file from uploaded files
  if (req.files && req.files.length > 0) {
    // Look for files with fieldname 'image' first, then 'images', then any image file
    mainImageFile = req.files.find(file => file.fieldname === 'image') ||
                   req.files.find(file => file.fieldname === 'images') ||
                   req.files.find(file => file.mimetype && file.mimetype.startsWith('image/'));

    // Validate image file type if found
    if (mainImageFile && !mainImageFile.mimetype.startsWith('image/')) {
      const errorDetails = {
        issue: 'Invalid file type',
        receivedType: mainImageFile.mimetype,
        allowedTypes: ['image/png', 'image/jpg', 'image/jpeg'],
        filename: mainImageFile.originalname,
        requestId
      };

      logError('file_upload', new Error('Invalid file type'), { ...requestContext, ...errorDetails });

      return res.status(400).json(createErrorResponse('file_upload',
        new Error('Please upload a valid image file (PNG, JPG, or JPEG)'),
        errorDetails
      ));
    }
  }

  if (mainImageFile) {
    try {

      // Check if Cloudinary is configured
      const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME &&
                                     process.env.CLOUDINARY_API_KEY &&
                                     process.env.CLOUDINARY_API_SECRET &&
                                     process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloudinary_cloud_name';

      if (!isCloudinaryConfigured) {
        const errorDetails = {
          issue: 'Cloudinary not configured',
          missingVars: [
            !process.env.CLOUDINARY_CLOUD_NAME && 'CLOUDINARY_CLOUD_NAME',
            !process.env.CLOUDINARY_API_KEY && 'CLOUDINARY_API_KEY',
            !process.env.CLOUDINARY_API_SECRET && 'CLOUDINARY_API_SECRET'
          ].filter(Boolean),
          requestId
        };

        logError('file_upload', new Error('Cloudinary configuration missing'), { ...requestContext, ...errorDetails });

        return res.status(500).json(createErrorResponse('file_upload',
          new Error('Image upload service is not configured. Please contact support.'),
          errorDetails
        ));
      }

      let uploadedFile;
      try {
        // Convert buffer to base64 for Cloudinary upload (memory storage)
        const base64String = `data:${mainImageFile.mimetype};base64,${mainImageFile.buffer.toString('base64')}`;

        uploadedFile = await cloudinary.uploader.upload(base64String, {
          folder: "Bidding/Product",
          resource_type: "image",
          timeout: 60000 // 60 second timeout
        });

        fileData = {
          fileName: mainImageFile.originalname,
          filePath: uploadedFile.secure_url,
          fileType: mainImageFile.mimetype,
          public_id: uploadedFile.public_id,
        };

      } catch (uploadError) {
        const errorDetails = {
          cloudinaryError: uploadError.message,
          fileInfo: {
            originalname: mainImageFile.originalname,
            mimetype: mainImageFile.mimetype,
            size: mainImageFile.size
          },
          requestId
        };

        logError('file_upload', uploadError, { ...requestContext, ...errorDetails });

        return res.status(500).json(createErrorResponse('file_upload',
          new Error(`Failed to upload image: ${uploadError.message}`),
          errorDetails
        ));
      }
    } catch (fileError) {
      logError('file_upload', fileError, requestContext);
      return res.status(500).json(createErrorResponse('file_upload', fileError, { requestId }));
    }
  }

  // Enhanced database creation handling
  let product;
  try {
    const productData = {
      user: userId,
      title,
      slug: slug,
      description,
      price: price || startingBid, // Use startingBid as base price
      category,
      height: height ? parseFloat(height) : undefined,
      lengthpic: lengthpic ? parseFloat(lengthpic) : undefined,
      width: width ? parseFloat(width) : undefined,
      mediumused,
      weigth: weigth ? parseFloat(weigth) : undefined,
      image: fileData,
      // Antique-specific fields
      era,
      period,
      provenance,
      condition: condition || 'Good',
      conditionDetails,
      materials: materials ? (Array.isArray(materials) ? materials : [materials]) : [],
      techniques: techniques ? (Array.isArray(techniques) ? techniques : [techniques]) : [],
      historicalSignificance,
      maker: maker && typeof maker === 'object' ? {
        name: maker.name,
        nationality: maker.nationality,
        lifespan: maker.lifespan
      } : undefined,
      style,
      rarity: rarity || 'Common',
      // Auction-specific fields
      auctionType: auctionType || 'Timed',
      reservePrice: reservePrice ? parseFloat(reservePrice) : 0,
      startingBid: parseFloat(startingBid),
      auctionStartDate: finalAuctionStartDate ? new Date(finalAuctionStartDate) : undefined,
      auctionEndDate: finalAuctionEndDate ? new Date(finalAuctionEndDate) : undefined,
      bidIncrement: bidIncrement ? parseFloat(bidIncrement) : 10,
      // Auto-verify all new listings
      isverify: true,
      commission: 5, // Default 5% commission
      // Set authenticity status to verified for new items
      authenticity: {
        status: 'Verified',
        verifiedBy: 'System Auto-Verification',
        verificationDate: new Date(),
        certificateNumber: `AUTO-${Date.now()}`
      }
    };

    product = await Product.create(productData);

    if (!product || !product._id) {
      throw new Error('Product creation returned invalid result - no product ID generated');
    }



  } catch (createError) {
    const errorDetails = {
      errorType: createError.name,
      mongooseErrors: createError.errors ? Object.keys(createError.errors) : null,
      validationErrors: createError.errors ?
        Object.entries(createError.errors).map(([field, error]) => ({
          field,
          message: error.message,
          kind: error.kind,
          value: error.value
        })) : null,
      requestId,
      productData: {
        title,
        category,
        startingBid,
        auctionType
      }
    };

    logError('database', createError, { ...requestContext, ...errorDetails });

    // Provide specific error messages based on error type
    let userMessage = 'Failed to create antique listing';
    let statusCode = 500;

    if (createError.name === 'ValidationError') {
      statusCode = 400;
      const fieldErrors = Object.values(createError.errors).map(err => err.message);
      userMessage = `Validation failed: ${fieldErrors.join(', ')}`;
    } else if (createError.name === 'MongoError' || createError.name === 'MongoServerError') {
      if (createError.code === 11000) {
        statusCode = 409;
        userMessage = 'A product with this title already exists. Please choose a different title.';
      } else {
        userMessage = 'Database error occurred while creating the listing';
      }
    } else if (createError.message.includes('timeout')) {
      userMessage = 'Database operation timed out. Please try again.';
    }

    return res.status(statusCode).json(createErrorResponse('database',
      new Error(userMessage),
      errorDetails
    ));
  }

  // Enhanced auction scheduling with error handling
  try {
    if (auctionType === 'Timed' && finalAuctionEndDate) {
      if (global.auctionScheduler) {
        try {
          global.auctionScheduler.scheduleAuctionEnd(product._id, new Date(finalAuctionEndDate));
        } catch (schedulingError) {
          // Log the error but don't fail the product creation
          logError('auction_scheduling', schedulingError, {
            ...requestContext,
            productId: product._id,
            auctionEndDate: finalAuctionEndDate
          });
        }
      } else {
      }
    }
  } catch (schedulingError) {
    // Log but don't fail the request since product was created successfully
    logError('auction_scheduling', schedulingError, { ...requestContext, productId: product._id });
  }

  // Enhanced success response
  const successResponse = {
    success: true,
    data: product,
    metadata: {
      requestId,
      createdAt: new Date().toISOString(),
      productId: product._id,
      slug: product.slug,
      auctionScheduled: auctionType === 'Timed' && finalAuctionEndDate && global.auctionScheduler
    }
  };

  res.status(201).json(successResponse);
});

const getAllProducts = asyncHandler(async (req, res) => {
  const {
    category,
    auctionType,
    era,
    condition,
    priceMin,
    priceMax,
    authenticity,
    search,
    status,
    page = 1,
    limit = 20
  } = req.query;

  // Build filter object
  let filter = {};

  if (category && category !== 'All') {
    filter.category = category;
  }

  if (auctionType) {
    filter.auctionType = auctionType;
  }

  if (era) {
    filter.era = era;
  }

  if (condition) {
    filter.condition = condition;
  }

  if (authenticity) {
    filter['authenticity.status'] = authenticity;
  }

  // Price range filter (using startingBid for auctions)
  if (priceMin || priceMax) {
    filter.startingBid = {};
    if (priceMin) filter.startingBid.$gte = Number(priceMin);
    if (priceMax) filter.startingBid.$lte = Number(priceMax);
  }

  // Search functionality
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { 'maker.name': { $regex: search, $options: 'i' } },
      { style: { $regex: search, $options: 'i' } },
      { materials: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  // Status filter (active auctions, ended, etc.)
  const now = new Date();
  if (status === 'active') {
    filter.$or = [
      { auctionType: 'Live' },
      {
        auctionType: 'Timed',
        auctionStartDate: { $lte: now },
        auctionEndDate: { $gte: now }
      },
      { auctionType: 'Buy Now' }
    ];
  } else if (status === 'upcoming') {
    filter.auctionStartDate = { $gt: now };
  } else if (status === 'ended') {
    filter.auctionEndDate = { $lt: now };
  }

  // Pagination
  const skip = (page - 1) * limit;

  const products = await Product.find(filter)
    .sort("-createdAt")
    .populate("user", "name email")
    .skip(skip)
    .limit(Number(limit));

  const productsWithDetails = await Promise.all(
    products.map(async (product) => {
      const latestBid = await BiddingProduct.findOne({ product: product._id }).sort("-createdAt");
      const currentBid = latestBid ? latestBid.price : product.startingBid;
      const totalBids = await BiddingProduct.countDocuments({ product: product._id });

      // Calculate auction status
      let auctionStatus = 'upcoming';
      if (product.auctionType === 'Live') {
        auctionStatus = 'live';
      } else if (product.auctionType === 'Buy Now') {
        auctionStatus = 'buy-now';
      } else if (product.auctionType === 'Timed') {
        const now = new Date();
        if (product.auctionStartDate && product.auctionEndDate) {
          if (now < product.auctionStartDate) {
            auctionStatus = 'upcoming';
          } else if (now >= product.auctionStartDate && now <= product.auctionEndDate) {
            auctionStatus = 'active';
          } else {
            auctionStatus = 'ended';
          }
        }
      }

      // Check if reserve price is met
      const reserveMet = product.reservePrice ? currentBid >= product.reservePrice : true;

      return {
        ...product._doc,
        currentBid,
        totalBids,
        auctionStatus,
        reserveMet,
        timeRemaining: product.auctionEndDate ? Math.max(0, product.auctionEndDate - now) : null
      };
    })
  );

  // Get total count for pagination
  const totalProducts = await Product.countDocuments(filter);
  const totalPages = Math.ceil(totalProducts / limit);

  res.status(200).json({
    products: productsWithDetails,
    pagination: {
      currentPage: Number(page),
      totalPages,
      totalProducts,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  });
});

const getAllProductsofUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const products = await Product.find({ user: userId }).sort("-createdAt").populate("user");

  const now = new Date();

  const productsWithDetails = await Promise.all(
    products.map(async (product) => {
      // Get latest bid and total bid count
      const latestBid = await BiddingProduct.findOne({ product: product._id })
        .sort("-createdAt")
        .populate("user", "name email");

      const totalBids = await BiddingProduct.countDocuments({ product: product._id });
      const currentBid = latestBid ? latestBid.price : product.startingBid || product.price;

      // Calculate auction status and time remaining
      let auctionStatus = 'upcoming';
      let timeRemaining = null;

      if (product.auctionStartDate && product.auctionEndDate) {
        if (now < product.auctionStartDate) {
          auctionStatus = 'upcoming';
          timeRemaining = product.auctionStartDate - now;
        } else if (now >= product.auctionStartDate && now < product.auctionEndDate) {
          auctionStatus = 'active';
          timeRemaining = product.auctionEndDate - now;
        } else {
          auctionStatus = 'ended';
          timeRemaining = 0;
        }
      } else if (product.auctionEndDate) {
        // Only end date specified
        if (now < product.auctionEndDate) {
          auctionStatus = 'active';
          timeRemaining = product.auctionEndDate - now;
        } else {
          auctionStatus = 'ended';
          timeRemaining = 0;
        }
      } else {
        // No auction dates - treat as active listing
        auctionStatus = 'active';
      }

      // Check if reserve price is met
      const reserveMet = product.reservePrice ? currentBid >= product.reservePrice : true;

      // Get recent bidding activity (last 5 bids)
      const recentBids = await BiddingProduct.find({ product: product._id })
        .sort("-createdAt")
        .limit(5)
        .populate("user", "name email");

      return {
        ...product._doc,
        currentBid,
        totalBids,
        auctionStatus,
        timeRemaining: Math.max(0, timeRemaining || 0),
        reserveMet,
        latestBidder: latestBid ? {
          name: latestBid.user?.name || 'Anonymous',
          email: latestBid.user?.email,
          bidTime: latestBid.createdAt
        } : null,
        recentBids: recentBids.map(bid => ({
          id: bid._id,
          amount: bid.price,
          bidder: {
            name: bid.user?.name || 'Anonymous',
            email: bid.user?.email
          },
          timestamp: bid.createdAt
        })),
        // Legacy field for backward compatibility
        biddingPrice: currentBid
      };
    })
  );

  res.status(200).json(productsWithDetails);
});

const getWonProducts = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const wonProducts = await Product.find({ soldTo: userId }).sort("-createdAt").populate("user");

  const productsWithPrices = await Promise.all(
    wonProducts.map(async (product) => {
      const latestBid = await BiddingProduct.findOne({ product: product._id }).sort("-createdAt");
      const biddingPrice = latestBid ? latestBid.price : product.price;
      return {
        ...product._doc,
        biddingPrice, // Adding the price field
      };
    })
  );

  res.status(200).json(productsWithPrices);
});

const getAllSoldProducts = asyncHandler(async (req, res) => {
  const product = await Product.find({ isSoldout: true }).sort("-createdAt").populate("user");
  res.status(200).json(product);
});
const getProductBySlug = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.status(200).json(product);
});
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  if (product.user?.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authorized");
  }

  if (product.image && product.image.public_id) {
    try {
      await cloudinary.uploader.destroy(product.image.public_id);
    } catch (error) {
    }
  }

  await Product.findByIdAndDelete(id);
  res.status(200).json({ message: "Product deleted." });
});
const updateProduct = asyncHandler(async (req, res) => {
  const { title, description, price, height, lengthpic, width, mediumused, weigth } = req.body;
  const { id } = req.params;
  const product = await Product.findById(id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  if (product.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authorized");
  }

  let fileData = {};
  if (req.file) {
    let uploadedFile;
    try {
      // Convert buffer to base64 for Cloudinary upload (memory storage)
      const base64String = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

      uploadedFile = await cloudinary.uploader.upload(base64String, {
        folder: "Product-Images",
        resource_type: "image",
      });
    } catch (error) {
      res.status(500);
      throw new Error("Image colud not be uploaded");
    }

    if (product.image && product.image.public_id) {
      try {
        await cloudinary.uploader.destroy(product.image.public_id);
      } catch (error) {
      }
    }
    //step 1 :
    fileData = {
      fileName: req.file.originalname,
      filePath: uploadedFile.secure_url,
      fileType: req.file.mimetype,
      public_id: uploadedFile.public_id,
    };
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    { _id: id },
    {
      title,
      description,
      price,
      height,
      lengthpic,
      width,
      mediumused,
      weigth,
      image: Object.keys(fileData).length === 0 ? Product?.image : fileData,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).json(updatedProduct);
});

// for admin only users
const verifyAndAddCommissionProductByAmdin = asyncHandler(async (req, res) => {
  const { commission } = req.body;
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  product.isverify = true;
  product.commission = commission;

  await product.save();

  res.status(200).json({ message: "Product verified successfully", data: product });
});

const getAllProductsByAmdin = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort("-createdAt").populate("user");

  const productsWithPrices = await Promise.all(
    products.map(async (product) => {
      const latestBid = await BiddingProduct.findOne({ product: product._id }).sort("-createdAt");
      const biddingPrice = latestBid ? latestBid.price : product.price;
      return {
        ...product._doc,
        biddingPrice, // Adding the price field
      };
    })
  );

  res.status(200).json(productsWithPrices);
});

// dot not it
const deleteProductsByAmdin = asyncHandler(async (req, res) => {
  try {
    const { productIds } = req.body;

    const result = await Product.findOneAndDelete({ _id: productIds });

    res.status(200).json({ message: `${result.deletedCount} products deleted successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Enhanced Admin Auction Management Functions
const getAllAuctionsForAdmin = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Build filter query
    let filter = {};

    if (status && status !== 'all') {
      if (status === 'active') {
        filter.auctionEndDate = { $gt: new Date() };
        filter.isverify = true;
      } else if (status === 'completed') {
        filter.isSoldout = true;
      } else if (status === 'pending') {
        filter.isverify = false;
      } else if (status === 'ended') {
        filter.auctionEndDate = { $lt: new Date() };
        filter.isSoldout = false;
      }
    }

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const auctions = await Product.find(filter)
      .populate('user', 'name email')
      .populate('soldTo', 'name email')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    // Get bid information for each auction
    const auctionsWithBids = await Promise.all(
      auctions.map(async (auction) => {
        const bids = await BiddingProduct.find({ product: auction._id })
          .populate('user', 'name email')
          .sort('-createdAt');

        const highestBid = bids[0];
        const bidCount = bids.length;
        const uniqueBidders = [...new Set(bids.filter(bid => bid.user && bid.user._id).map(bid => bid.user._id.toString()))].length;

        // Determine auction status
        let auctionStatus = 'pending';
        const now = new Date();

        if (!auction.isverify) {
          auctionStatus = 'pending';
        } else if (auction.isSoldout) {
          auctionStatus = 'completed';
        } else if (auction.auctionEndDate && auction.auctionEndDate < now) {
          auctionStatus = 'ended';
        } else if (auction.auctionStartDate && auction.auctionStartDate <= now && auction.auctionEndDate && auction.auctionEndDate > now) {
          auctionStatus = 'active';
        } else if (auction.auctionStartDate && auction.auctionStartDate > now) {
          auctionStatus = 'upcoming';
        }

        return {
          _id: auction._id,
          title: auction.title,
          description: auction.description,
          category: auction.category,
          seller: auction.user ? {
            _id: auction.user._id,
            name: auction.user.name,
            email: auction.user.email
          } : null,
          auctionType: auction.auctionType,
          startingBid: auction.startingBid,
          reservePrice: auction.reservePrice,
          instantPurchasePrice: auction.instantPurchasePrice,
          currentPrice: highestBid ? highestBid.price : auction.startingBid,
          finalPrice: auction.finalPrice,
          auctionStartDate: auction.auctionStartDate,
          auctionEndDate: auction.auctionEndDate,
          status: auctionStatus,
          isVerified: auction.isverify,
          isSoldOut: auction.isSoldout,
          bidCount,
          uniqueBidders,
          highestBidder: (highestBid && highestBid.user) ? {
            _id: highestBid.user._id,
            name: highestBid.user.name,
            email: highestBid.user.email
          } : null,
          soldTo: auction.soldTo ? {
            _id: auction.soldTo._id,
            name: auction.soldTo.name,
            email: auction.soldTo.email
          } : null,
          image: auction.image,
          createdAt: auction.createdAt,
          updatedAt: auction.updatedAt
        };
      })
    );

    // Get total count for pagination
    const totalCount = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      auctions: auctionsWithBids,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching auctions for admin:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching auctions",
      error: error.message
    });
  }
});

const updateAuctionByAdmin = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find the auction
    const auction = await Product.findById(id);
    if (!auction) {
      return res.status(404).json({
        success: false,
        message: "Auction not found"
      });
    }

    // Validate update data
    if (updateData.auctionEndDate && new Date(updateData.auctionEndDate) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Auction end date must be in the future"
      });
    }

    if (updateData.startingBid && updateData.startingBid < 0) {
      return res.status(400).json({
        success: false,
        message: "Starting bid must be positive"
      });
    }

    // Update the auction
    const updatedAuction = await Product.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('user', 'name email');

    res.status(200).json({
      success: true,
      message: "Auction updated successfully",
      auction: updatedAuction
    });
  } catch (error) {
    console.error('Error updating auction:', error);
    res.status(500).json({
      success: false,
      message: "Error updating auction",
      error: error.message
    });
  }
});

const endAuctionEarly = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Find the auction
    const auction = await Product.findById(id);
    if (!auction) {
      return res.status(404).json({
        success: false,
        message: "Auction not found"
      });
    }

    // Check if auction is active
    const now = new Date();
    if (auction.auctionEndDate <= now) {
      return res.status(400).json({
        success: false,
        message: "Auction has already ended"
      });
    }

    if (auction.isSoldout) {
      return res.status(400).json({
        success: false,
        message: "Auction is already completed"
      });
    }

    // Get the highest bid
    const highestBid = await BiddingProduct.findOne({ product: id })
      .populate('user', 'name email')
      .sort('-createdAt');

    // Update auction to end early
    const updatedAuction = await Product.findByIdAndUpdate(
      id,
      {
        auctionEndDate: now,
        isSoldout: highestBid ? true : false,
        soldTo: highestBid ? highestBid.user._id : null,
        finalPrice: highestBid ? highestBid.price : null,
        updatedAt: now
      },
      { new: true }
    ).populate('user', 'name email').populate('soldTo', 'name email');

    // Update winning bid status
    if (highestBid) {
      await BiddingProduct.findByIdAndUpdate(
        highestBid._id,
        { isWinningBid: true, bidStatus: 'Won' }
      );

      // Update other bids to lost
      await BiddingProduct.updateMany(
        { product: id, _id: { $ne: highestBid._id } },
        { bidStatus: 'Lost' }
      );
    }

    res.status(200).json({
      success: true,
      message: "Auction ended successfully",
      auction: updatedAuction,
      winner: highestBid ? {
        _id: highestBid.user._id,
        name: highestBid.user.name,
        email: highestBid.user.email,
        winningBid: highestBid.price
      } : null,
      reason
    });
  } catch (error) {
    console.error('Error ending auction early:', error);
    res.status(500).json({
      success: false,
      message: "Error ending auction",
      error: error.message
    });
  }
});

// Get active auctions (live and timed auctions that are currently running)
const getActiveAuctions = asyncHandler(async (req, res) => {
  const now = new Date();

  const activeAuctions = await Product.find({
    $or: [
      { auctionType: 'Live' },
      {
        auctionType: 'Timed',
        auctionStartDate: { $lte: now },
        auctionEndDate: { $gte: now }
      }
    ],
    isverify: true
  })
    .sort({ auctionEndDate: 1 }) // Sort by ending soonest first
    .populate("user", "name email");

  const auctionsWithDetails = await Promise.all(
    activeAuctions.map(async (auction) => {
      const latestBid = await BiddingProduct.findOne({ product: auction._id }).sort("-createdAt");
      const currentBid = latestBid ? latestBid.price : auction.startingBid;
      const totalBids = await BiddingProduct.countDocuments({ product: auction._id });

      const timeRemaining = auction.auctionEndDate ? Math.max(0, auction.auctionEndDate - now) : null;
      const reserveMet = auction.reservePrice ? currentBid >= auction.reservePrice : true;

      return {
        ...auction._doc,
        currentBid,
        totalBids,
        timeRemaining,
        reserveMet
      };
    })
  );

  res.status(200).json(auctionsWithDetails);
});

// Get upcoming auctions
const getUpcomingAuctions = asyncHandler(async (req, res) => {
  const now = new Date();

  const upcomingAuctions = await Product.find({
    auctionStartDate: { $gt: now },
    isverify: true
  })
    .sort({ auctionStartDate: 1 })
    .populate("user", "name email");

  res.status(200).json(upcomingAuctions);
});

// Get auction by ID with detailed bidding information
const getAuctionDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const auction = await Product.findById(id).populate("user", "name email");

  if (!auction) {
    res.status(404);
    throw new Error("Auction not found");
  }

  // Get all bids for this auction
  const bids = await BiddingProduct.find({ product: id })
    .sort("-createdAt")
    .populate("user", "name email")
    .limit(50); // Limit to last 50 bids

  const totalBids = await BiddingProduct.countDocuments({ product: id });
  const currentBid = bids.length > 0 ? bids[0].price : auction.startingBid;

  // Calculate auction status and time remaining
  const now = new Date();
  let auctionStatus = 'upcoming';
  let timeRemaining = null;

  if (auction.auctionType === 'Live') {
    auctionStatus = 'live';
  } else if (auction.auctionType === 'Buy Now') {
    auctionStatus = 'buy-now';
  } else if (auction.auctionType === 'Timed') {
    if (auction.auctionStartDate && auction.auctionEndDate) {
      if (now < auction.auctionStartDate) {
        auctionStatus = 'upcoming';
        timeRemaining = auction.auctionStartDate - now;
      } else if (now >= auction.auctionStartDate && now <= auction.auctionEndDate) {
        auctionStatus = 'active';
        timeRemaining = auction.auctionEndDate - now;
      } else {
        auctionStatus = 'ended';
        timeRemaining = 0;
      }
    }
  }

  const reserveMet = auction.reservePrice ? currentBid >= auction.reservePrice : true;

  res.status(200).json({
    auction: {
      ...auction._doc,
      currentBid,
      totalBids,
      auctionStatus,
      timeRemaining,
      reserveMet
    },
    bids: bids.map(bid => ({
      ...bid._doc,
      isWinning: bid._id.toString() === bids[0]?._id.toString()
    }))
  });
});

const changeAuctionStatus = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    // Find the auction
    const auction = await Product.findById(id);
    if (!auction) {
      return res.status(404).json({
        success: false,
        message: "Auction not found"
      });
    }

    let updateData = { updatedAt: new Date() };

    switch (status) {
      case 'approve':
        updateData.isverify = true;
        break;
      case 'reject':
        updateData.isverify = false;
        break;
      case 'pause':
        // Extend end date by 24 hours to effectively pause
        if (auction.auctionEndDate) {
          updateData.auctionEndDate = new Date(auction.auctionEndDate.getTime() + 24 * 60 * 60 * 1000);
        }
        break;
      case 'cancel':
        updateData.isSoldout = false;
        updateData.auctionEndDate = new Date(); // End immediately
        // Update all bids to cancelled
        await BiddingProduct.updateMany(
          { product: id },
          { bidStatus: 'Lost' }
        );
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid status"
        });
    }

    const updatedAuction = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('user', 'name email');

    res.status(200).json({
      success: true,
      message: `Auction ${status}d successfully`,
      auction: updatedAuction,
      reason
    });
  } catch (error) {
    console.error('Error changing auction status:', error);
    res.status(500).json({
      success: false,
      message: "Error changing auction status",
      error: error.message
    });
  }
});

const getAuctionBidHistory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Check if auction exists
    const auction = await Product.findById(id);
    if (!auction) {
      return res.status(404).json({
        success: false,
        message: "Auction not found"
      });
    }

    // Get bid history with pagination
    const skip = (page - 1) * limit;
    const bids = await BiddingProduct.find({ product: id })
      .populate('user', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const totalBids = await BiddingProduct.countDocuments({ product: id });
    const totalPages = Math.ceil(totalBids / limit);

    const bidHistory = bids.map((bid, index) => ({
      _id: bid._id,
      bidder: {
        _id: bid.user._id,
        name: bid.user.name,
        email: bid.user.email
      },
      amount: bid.price,
      bidType: bid.bidType,
      maxBid: bid.maxBid,
      status: bid.bidStatus,
      isWinning: index === 0 && !auction.isSoldout, // First bid is currently winning if auction not sold
      timestamp: bid.createdAt
    }));

    res.status(200).json({
      success: true,
      auction: {
        _id: auction._id,
        title: auction.title,
        currentPrice: bids.length > 0 ? bids[0].price : auction.startingBid,
        startingBid: auction.startingBid,
        reservePrice: auction.reservePrice
      },
      bidHistory,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalBids,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching bid history:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching bid history",
      error: error.message
    });
  }
});

// Transportation Management Functions

// Get all items ready for transportation (admin only)
const getItemsForTransportation = asyncHandler(async (req, res) => {
  const {
    search,
    status,
    assignedTo,
    dateFrom,
    dateTo,
    page = 1,
    limit = 20
  } = req.query;

  // Build filter for sold items
  let filter = {
    isSoldout: true,
    soldTo: { $exists: true, $ne: null }
  };

  // Filter by transportation status
  if (status && status !== 'all') {
    filter.transportationStatus = status;
  }

  // Filter by assigned personnel
  if (assignedTo) {
    filter.transportationAssignedTo = { $regex: assignedTo, $options: 'i' };
  }

  // Date range filter (settlement date)
  if (dateFrom || dateTo) {
    filter.settlementDate = {};
    if (dateFrom) filter.settlementDate.$gte = new Date(dateFrom);
    if (dateTo) filter.settlementDate.$lte = new Date(dateTo);
  }

  // Search filter
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  // Pagination
  const skip = (page - 1) * limit;

  try {
    const items = await Product.find(filter)
      .populate('user', 'name email phone address') // Seller info
      .populate('soldTo', 'name email phone address') // Buyer info
      .sort('-settlementDate')
      .skip(skip)
      .limit(Number(limit));

    const totalItems = await Product.countDocuments(filter);

    const itemsWithDetails = items.map(item => ({
      _id: item._id,
      title: item.title,
      description: item.description,
      image: item.image,
      finalPrice: item.finalPrice,
      settlementDate: item.settlementDate,
      transportationStatus: item.transportationStatus || 'Ready for Pickup',
      transportationNotes: item.transportationNotes,
      transportationAssignedTo: item.transportationAssignedTo,
      transportationStatusHistory: item.transportationStatusHistory || [],
      pickupAddress: item.pickupAddress || item.user?.address,
      deliveryAddress: item.deliveryAddress || item.soldTo?.address,
      transportationStartDate: item.transportationStartDate,
      transportationCompletedDate: item.transportationCompletedDate,
      seller: {
        _id: item.user._id,
        name: item.user.name,
        email: item.user.email,
        phone: item.user.phone,
        address: item.user.address
      },
      buyer: {
        _id: item.soldTo._id,
        name: item.soldTo.name,
        email: item.soldTo.email,
        phone: item.soldTo.phone,
        address: item.soldTo.address
      }
    }));

    res.status(200).json({
      success: true,
      data: itemsWithDetails,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
        hasNext: page * limit < totalItems,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500);
    throw new Error(`Failed to fetch transportation items: ${error.message}`);
  }
});

// Update transportation status (admin only)
const updateTransportationStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    status,
    notes,
    assignedTo,
    pickupAddress,
    deliveryAddress
  } = req.body;

  const product = await Product.findById(id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (!product.isSoldout || !product.soldTo) {
    res.status(400);
    throw new Error("Product is not sold or doesn't have a buyer");
  }

  try {
    // Update transportation fields
    const updateData = {};

    if (status) {
      updateData.transportationStatus = status;

      // Set dates based on status
      if (status === 'In Transit' && !product.transportationStartDate) {
        updateData.transportationStartDate = new Date();
      }
      if (status === 'Delivered') {
        updateData.transportationCompletedDate = new Date();
      }

      // Add to status history
      const historyEntry = {
        status,
        timestamp: new Date(),
        updatedBy: req.user._id,
        notes: notes || ''
      };

      updateData.$push = {
        transportationStatusHistory: historyEntry
      };
    }

    if (notes !== undefined) updateData.transportationNotes = notes;
    if (assignedTo !== undefined) updateData.transportationAssignedTo = assignedTo;
    if (pickupAddress !== undefined) updateData.pickupAddress = pickupAddress;
    if (deliveryAddress !== undefined) updateData.deliveryAddress = deliveryAddress;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('user', 'name email phone address')
     .populate('soldTo', 'name email phone address');

    res.status(200).json({
      success: true,
      message: "Transportation status updated successfully",
      data: {
        _id: updatedProduct._id,
        title: updatedProduct.title,
        transportationStatus: updatedProduct.transportationStatus,
        transportationNotes: updatedProduct.transportationNotes,
        transportationAssignedTo: updatedProduct.transportationAssignedTo,
        transportationStatusHistory: updatedProduct.transportationStatusHistory,
        pickupAddress: updatedProduct.pickupAddress,
        deliveryAddress: updatedProduct.deliveryAddress,
        transportationStartDate: updatedProduct.transportationStartDate,
        transportationCompletedDate: updatedProduct.transportationCompletedDate
      }
    });
  } catch (error) {
    res.status(500);
    throw new Error(`Failed to update transportation status: ${error.message}`);
  }
});

// Get transportation statistics (admin only)
const getTransportationStats = asyncHandler(async (req, res) => {
  try {
    const stats = await Product.aggregate([
      {
        $match: {
          isSoldout: true,
          soldTo: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: "$transportationStatus",
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedStats = {
      'Ready for Pickup': 0,
      'In Transit': 0,
      'Delivered': 0,
      'Not Required': 0
    };

    stats.forEach(stat => {
      if (formattedStats.hasOwnProperty(stat._id)) {
        formattedStats[stat._id] = stat.count;
      }
    });

    // Get total sold items
    const totalSoldItems = await Product.countDocuments({
      isSoldout: true,
      soldTo: { $exists: true, $ne: null }
    });

    res.status(200).json({
      success: true,
      data: {
        statusBreakdown: formattedStats,
        totalSoldItems,
        totalRequiringTransportation: totalSoldItems - formattedStats['Not Required']
      }
    });
  } catch (error) {
    res.status(500);
    throw new Error(`Failed to fetch transportation statistics: ${error.message}`);
  }
});

module.exports = {
  createProduct,
  getAllProducts,
  getWonProducts,
  getProductBySlug,
  deleteProduct,
  updateProduct,
  verifyAndAddCommissionProductByAmdin,
  getAllProductsByAmdin,
  deleteProductsByAmdin,
  getAllSoldProducts,
  getAllProductsofUser,
  getActiveAuctions,
  getUpcomingAuctions,
  getAuctionDetails,
  // New admin auction management functions
  getAllAuctionsForAdmin,
  updateAuctionByAdmin,
  endAuctionEarly,
  changeAuctionStatus,
  getAuctionBidHistory,
  // Transportation management functions
  getItemsForTransportation,
  updateTransportationStatus,
  getTransportationStats,
};
