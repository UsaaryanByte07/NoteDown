const User = require("../../models/User");
const bcrypt = require("bcryptjs");

const getMe = (req, res, next) => {
  if (req.session.isLoggedIn && req.session.user) {
    return res.status(200).json({
      isLoggedIn: true,
      user: {
        _id: req.session.user._id,
        firstName: req.session.user.firstName,
        lastName: req.session.user.lastName,
        userType: req.session.user.userType,
        email: req.session.user.email,
      },
    });
  }
  return res.status(200).json({
    isLoggedIn: false,
    user: null,
  });
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
      req.session.isLoggedIn = true;
      req.session.user = user;
      
      req.session.save((err) => {
        if (err) {
          return res.status(500).json({
            message: "Session save error",
            success: false,
          });
        }
        return res.status(200).json({
          success: true,
          user: {
            _id: req.session.user._id,
            firstName: req.session.user.firstName,
            lastName: req.session.user.lastName,
            userType: req.session.user.userType,
            email: req.session.user.email,
          },
        });
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
  //Don't use async await as it doesn't returns a promise by default..
  req.session.destroy((err) => {
    if (err) {
      console.log("Session Destroy error:", err);
    }
    // Clear the session cookie from browser
    res.clearCookie("connect.sid", {
      path: "/",
      httpOnly: true,
    });
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });

  });
};

module.exports = {
  getMe,
  postLogin,
  postLogout,
};
