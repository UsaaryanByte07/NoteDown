const jwt = require("jsonwebtoken");
require("dotenv").config();

// Verifies the superuser Bearer token sent in Authorization header
const requireSuperuser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authenticated as superuser" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (decoded.role !== "superuser") {
      return res.status(403).json({ success: false, message: "Access denied — superuser only" });
    }
    req.superuser = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired superuser token" });
  }
};

module.exports = { requireSuperuser };
