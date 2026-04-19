const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");

const protect = async (req, res, next) => {
  let token;
  console.log("Token:", token);

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      //  GET TOKEN (YOU MISSED THIS)
      token = req.headers.authorization.split(" ")[1];
      // console.log("Token:", token);

      //  VERIFY
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      // console.log("Decoded:", decode);

      //  GET USER
      req.user = await User.findById(decode.id).select("-password");

      next();

    } catch (error) {
      console.log(error);

      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          message: "Token expired, please login again",
        });
      }

      return res.status(401).json({
        message: "Not authorized, token failed",
      });
    }
  }

  // No token
  if (!token) {
    return res.status(401).json({
      message: "Not authorized, no token",
    });
  }
};

module.exports = { protect };