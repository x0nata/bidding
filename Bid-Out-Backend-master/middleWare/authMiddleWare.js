const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../model/userModel");

const protect = expressAsyncHandler(async (req, res, next) => {
  try {
    // Check for token in multiple places: cookies, Authorization header, and x-auth-token header
    let token = req.cookies.token;

    // Check Authorization header (Bearer token)
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check x-auth-token header (for localStorage tokens)
    if (!token && req.headers['x-auth-token']) {
      token = req.headers['x-auth-token'];
    }

    if (!token) {
      res.status(401);
      throw new Error("Not authorized, Please Login");
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);

    // Handle hardcoded admin user
    if (verified.id === "admin_hardcoded_id") {
      req.user = {
        _id: "admin_hardcoded_id",
        name: "System Administrator",
        email: "admin@gmail.com",
        role: "admin"
      };
    } else {
      const user = await User.findById(verified.id).select("-password");
      if (!user) {
        res.status(401);
        throw new Error("User not found");
      }
      req.user = user;
    }
    next();
  } catch (error) {
    res.status(401);
    throw new Error("Not authorized, Please Login");
  }
});

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403);
    throw new Error("Access denied. You are not an admin.");
  }
};

const isUser = (req, res, next) => {
  if (req.user && (req.user.role === "user" || req.user.role === "admin")) {
    next();
  } else {
    res.status(403);
    throw new Error("Access denied. You need to be logged in.");
  }
};

module.exports = { protect, isAdmin, isUser };
