const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const getMe = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(200).json({ isLoggedIn: false, user: null });
  }

  try {
    const decodedUser = jwt.verify(token, process.env.JWT_SECRET_KEY);

    return res.status(200).json({
      isLoggedIn: true,
      user: decodedUser,
    });
  } catch (err) {
    return res.status(200).json({
      isLoggedIn: false,
      user: null,
    });
  }
};

const postLogin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    // Find the user by email
    const user = await User.findOne({ email });

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
        success: false,
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        message: "Please verify your email first",
        success: false,
        redirectTo: `/verify-otp?email=${email}`,
      });
    }

    const isMatching = await bcrypt.compare(password, user.password);

    if (isMatching) {
      const { _id, userType, firstName, lastName, email } = user;
      const payload = { _id, userType, firstName, lastName, email };

      const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
        expiresIn: "15d",
      });

      res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // secure true in production
        maxAge: 60000 * 60 * 24 * 15, // 15 days
      });

      return res.status(200).json({
        success: true,
        user: payload,
      });
    } else {
      return res.status(401).json({
        message: "Invalid email or password",
        success: false,
      });
    }
  } catch (err) {
    console.log("Login error:", err);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

const postLogout = (req, res, next) => {
    // Clear the session cookie from browser
    res.clearCookie("token", {
      path: "/",
      httpOnly: true,
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
};

module.exports = {
  getMe,
  postLogin,
  postLogout,
};
