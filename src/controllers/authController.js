const User = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d", // ✅ fixed
  });
};

// Register User
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Check user exists
    let userExist = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (userExist) {
      return res.status(400).json({
        message: "User Already Exist",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate UPI ID
    const sanitizedName = email.toLowerCase();
    const upiId = `${sanitizedName.split("@")[0]}@phonepay`;

    // Create user
    const newUser = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      upiId,
      mPin: "0000",
    });

    // Response
    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      upiId: newUser.upiId,
      balance: newUser.balance,
      token: generateToken(newUser._id), //  added token
      hasMpinSet: false,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      message: "Please provide valid email and password",
    });
  }

  try {
    const user = await User.findOne({ email });

    // Check user
    if (!user) {
      return res.status(401).json({
        message: "Invalid Email or Password",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid Email or Password",
      });
    }

    // Success response
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      upiId: user.upiId,
      balance: user.balance,
      hasMpinSet: !!user.mPin, //  fixed
      token: generateToken(user._id),
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};


// Set Mpin
const setupMpin = async (req, res) => {
  const { mPin } = req.body;

  // Validate MPIN (must be 4 digits)
  if (!mPin || mPin.length !== 4) {
    return res.status(400).json({
      message: "Please provide valid 4-digit MPIN",
    });
  }

  try {
    // Hash MPIN
    const salt = await bcrypt.genSalt(10);
    const hashedMpin = await bcrypt.hash(mPin, salt);

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { mPin: hashedMpin }, 
      { new: true }
    );

    if (user) {
      res.status(200).json({
        message: "MPIN set successfully",
      });
    } else {
      res.status(400).json({
        message: "Failed to set MPIN",
      });
    }

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

// Profile User
const getUserProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    const user = await User.findById(req.user._id).select("-password -mPin");

    if (user) {
      return res.status(200).json(user);
    } else {
      return res.status(404).json({
        message: "User not found",
      });
    }

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};


module.exports = { registerUser ,loginUser,setupMpin,getUserProfile};