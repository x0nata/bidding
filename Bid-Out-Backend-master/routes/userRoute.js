const express = require("express");
const router = express.Router();
const { registerUser, loginUser, loginStatus, logoutUser, estimateIncome, getUser, getUserBalance, getAllUser, updateUserProfile, updateUserByAdmin, deleteUserByAdmin, getUserByAdmin } = require("../controllers/userCtr");
const { protect, isAdmin } = require("../middleWare/authMiddleWare");
const { upload } = require("../utils/fileUpload");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/loggedin", loginStatus);
router.get("/logout", logoutUser);
// loginAsSeller route removed - all users can buy and sell
router.get("/getuser", protect, getUser);
router.get("/sell-amount", protect, getUserBalance);
router.put("/profile", protect, upload.single("profileImage"), updateUserProfile);

router.get("/estimate-income", protect, isAdmin, estimateIncome);
router.get("/users", protect, isAdmin, getAllUser);

// Admin user management routes
router.get("/admin/:id", protect, isAdmin, getUserByAdmin);
router.put("/admin/:id", protect, isAdmin, updateUserByAdmin);
router.delete("/admin/:id", protect, isAdmin, deleteUserByAdmin);

module.exports = router;
