const asyncHandler = require("express-async-handler");
const User = require("../model/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Product = require("../model/productModel");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please fill in all required fileds");
  }

  const userExits = await User.findOne({ email });
  if (userExits) {
    res.status(400);
    throw new Error("Email is already exit");
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  const token = generateToken(user._id);

  // Set cookie with environment-appropriate settings
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), // 1 day
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
  });

  if (user) {
    const { _id, name, email, photo, role } = user;
    res.status(201).json({ _id, name, email, photo, token, role });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please add Email and Password");
  }

  // Hardcoded admin login for development
  if (email === "admin@gmail.com" && password === "Admin@123") {
    const adminUser = {
      _id: "admin_hardcoded_id",
      name: "System Administrator",
      email: "admin@gmail.com",
      photo: null,
      role: "admin"
    };

    const token = generateToken("admin_hardcoded_id");

    // Set cookie with environment-appropriate settings
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400), // 1 day
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
    });

    return res.status(200).json({ ...adminUser, token });
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(400);
    throw new Error("User not found, Please signUp");
  }

  const passwordIsCorrrect = await bcrypt.compare(password, user.password);

  const token = generateToken(user._id);

  // Set cookie with environment-appropriate settings
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), // 1 day
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
  });

  if (user && passwordIsCorrrect) {
    const { _id, name, email, photo, role } = user;
    res.status(200).json({ _id, name, email, photo, role, token });
  } else {
    res.status(400);
    throw new Error("Invalid email or password");
  }
});

const loginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json(false);
  }
  const verified = jwt.verify(token, process.env.JWT_SECRET);
  if (verified) {
    return res.json(true);
  }
  return res.json(false);
});

const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  res.status(200).json(user);
});

const logoutUser = asyncHandler(async (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0),
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
  });
  return res.status(200).json({ message: "Successfully Logged Out" });
});

/* const loginAsSeller = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please add Email and Password");
  }
  const user = await User.findOne({ email });
  if (!user) {
    res.status(400);
    throw new Error("User not found, Please signUp");
  }

  const passwordIsCorrrect = await bcrypt.compare(password, user.password);

  const token = generateToken(user._id);

  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400),
    sameSite: "none",
    secure: true,
  });

  user.role = "seller";
  user.save();
  if (user && passwordIsCorrrect) {
    const { _id, name, email, photo, role } = user;
    res.status(201).json({ _id, name, email, photo, role, token });
  } else {
    res.status(400);
    throw new Error("Invalid email or password");
  }
}); */
// loginAsSeller function removed - all users can now buy and sell

const getUserBalance = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({
    balance: user.balance,
  });
});

// Only for admin users
const getAllUser = asyncHandler(async (req, res) => {
  const userList = await User.find({});

  if (!userList.length) {
    return res.status(404).json({ message: "No user found" });
  }

  res.status(200).json(userList);
});

const estimateIncome = asyncHandler(async (req, res) => {
  try {
    const admin = await User.findOne({ role: "admin" });
    if (!admin) {
      return res.status(404).json({ error: "Admin user not found" });
    }
    const commissionBalance = admin.commissionBalance;
    res.status(200).json({ commissionBalance });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update user profile
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const { name, contactNumber, address, phone } = req.body;

  // Update user fields
  if (name) user.name = name;
  if (contactNumber) user.contactNumber = contactNumber;
  if (phone) user.phone = phone;
  if (address) user.address = address;

  // Handle profile image upload
  if (req.file) {
    try {
      // Delete old image from cloudinary if exists
      if (user.photo && user.photo.includes('cloudinary')) {
        const publicId = user.photo.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      }

      // Upload new image to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "user-profiles",
        width: 300,
        height: 300,
        crop: "fill"
      });

      user.photo = result.secure_url;
    } catch (error) {
      res.status(400);
      throw new Error("Failed to upload profile image");
    }
  }

  // Save updated user
  const updatedUser = await user.save();

  // Return updated user data (excluding password)
  const { _id, name: userName, email, photo, role, contactNumber: userContact, address: userAddress } = updatedUser;

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user: {
      _id,
      name: userName,
      email,
      photo,
      role,
      contactNumber: userContact,
      phone: userContact,
      address: userAddress
    }
  });
});
// Admin: Update user by ID
const updateUserByAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, role, status, phone, address } = req.body;

  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Update user fields
  if (name) user.name = name;
  if (email) user.email = email;
  if (role) user.role = role;
  if (status) user.status = status;
  if (phone) user.phone = phone;
  if (address) user.address = address;

  const updatedUser = await user.save();

  res.status(200).json({
    message: "User updated successfully",
    user: {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      status: updatedUser.status,
      phone: updatedUser.phone,
      address: updatedUser.address,
      createdAt: updatedUser.createdAt,
    }
  });
});

// Admin: Delete user by ID
const deleteUserByAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Prevent deletion of admin users
  if (user.role === "admin") {
    res.status(403);
    throw new Error("Cannot delete admin users");
  }

  await User.findByIdAndDelete(id);

  res.status(200).json({
    message: "User deleted successfully",
    deletedUserId: id
  });
});

// Admin: Get user by ID
const getUserByAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status || "active",
      phone: user.phone,
      address: user.address,
      balance: user.balance || 0,
      commissionBalance: user.commissionBalance || 0,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  });
});

module.exports = {
  registerUser,
  loginUser,
  loginStatus,
  logoutUser,
  estimateIncome,
  getUser,
  getUserBalance,
  getAllUser,
  updateUserProfile,
  updateUserByAdmin,
  deleteUserByAdmin,
  getUserByAdmin,
};
