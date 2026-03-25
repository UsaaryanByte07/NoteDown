const jwt = require("jsonwebtoken");
require("dotenv").config();

const requireAdmin = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not Authenticated" });
  }

  try {
    const decodedUser = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (decodedUser.userType !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Access Denied, Only Admins can Access",
      });
    }
    req.user = decodedUser;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Not Authenticated" });
  }
};

const requireLogin = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not Authenticated" });
  }

  try {
    const decodedUser = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decodedUser;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or Expired Token" });
  }
};

const requireNotLoggedIn = (req, res, next) => {
  const token = req.cookies.token;
  
  if (token) {
    try {
      // If token is valid, they are logged in
      jwt.verify(token, process.env.JWT_SECRET_KEY);
      return res.status(400).json({ success: false, message: 'Already Logged In' });
    } catch (err) {
      // If token is invalid/expired, they are technically not logged in, so proceed
      next();
    }
  } else {
    next();
  }
};

const requireUser = (req, res, next) => {
  const token = req.cookies.token;

  if(!token){
    return res.status(401).json({ success: false, message: 'Not Authenticated' });
  }

  try {
    const decodedUser = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (decodedUser.userType !== 'user') {
      return res.status(401).json({ success: false, message: 'Access Denied, Only Users can Access' });
    }
    req.user = decodedUser;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not Authenticated' });
  }
};

module.exports = {
  requireAdmin,
  requireLogin,
  requireNotLoggedIn,
  requireUser,
};
