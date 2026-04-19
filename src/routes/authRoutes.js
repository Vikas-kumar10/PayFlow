const express = require("express");
const {registerUser, loginUser, setupMpin, getUserProfile} = require("../controllers/authController");
const { protect } = require("../middleware/protect");
const router = express.Router();

router.post("/register",registerUser);
router.post("/login", loginUser);
router.post("/set-mpin",protect, setupMpin)
router.get("/profile",protect, getUserProfile);

module.exports= router