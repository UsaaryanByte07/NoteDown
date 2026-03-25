const jwt = require("jsonwebtoken");
const validator = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require("../../models/User");
const { sendWelcomeAdminEmail } = require("../../utils/email-util");
const {
  emailValidator,
  passwordValidator,
  firstNameValidator,
  lastNameValidator,
} = require("../../utils/validator-util");
require("dotenv").config();

const getSuperuserMe = (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return res.status(200).json({ isLoggedIn: false, superuser: null });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    return res.status(200).json({ isLoggedIn: true, superuser: decoded });
  } catch (err) {
    return res.status(200).json({ isLoggedIn: false, superuser: null });
  }
};

const postLogin = (req, res) => {
  const { superuserId, superuserPassword } = req.body;

  if (!superuserId || !superuserPassword) {
    return res.status(400).json({
      success: false,
      message: "Superuser ID and password are required",
    });
  }

  if (
    superuserId === process.env.SUPERUSER_ID &&
    superuserPassword === process.env.SUPERUSER_PASS
  ) {
    const superuserFirstName = process.env.SUPERUSER_FIRSTNAME || "Superuser";
    const superuserLastName = process.env.SUPERUSER_LASTNAME || "Admin";
    const payload = { superuserId, superuserFirstName, superuserLastName, role: "superuser" };
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: "2d",
    });
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      superuser: payload,
    });
  }

  return res.status(401).json({
    success: false,
    message: "Invalid Superuser ID or Password",
  });
};

const getAdmins = async (req, res) => {
  try {
    const admins = await User.find({ userType: "admin" }).select(
      "firstName lastName email createdAt"
    );
    return res.status(200).json({ success: true, admins });
  } catch (err) {
    console.error("Error fetching admins:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const postAddAdmin = [
  firstNameValidator,
  lastNameValidator,
  emailValidator,
  passwordValidator,
  async (req, res) => {
    const errors = validator.validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { firstName, lastName, password, email } = req.body;

    try {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: "An account with this email already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const admin = new User({
        firstName,
        lastName,
        password: hashedPassword,
        email,
        userType: "admin",
        isVerified: true,   
        otp: "",
        otpExpiry: Date.now(),
        resetToken: "",
        resetTokenExpiry: Date.now(),
      });
      await admin.save();
      await sendWelcomeAdminEmail(email, firstName, lastName);

      return res.status(200).json({
        success: true,
        message: "Admin added successfully",
        admin: { firstName, lastName, email },
      });
    } catch (err) {
      console.error("Error adding admin:", err);
      if (err.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "An account with this email already exists",
        });
      }
      return res.status(500).json({
        success: false,
        message: "An error occurred while adding the admin",
      });
    }
  },
];

const postDeleteAdmin = async (req, res) => {
  const { email } = req.params;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Admin email is required",
    });
  }

  try {
    const deleted = await User.findOneAndDelete({ email, userType: "admin" });
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Admin not found or already deleted",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Admin deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting admin:", err);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the admin",
    });
  }
};

module.exports = {
  getSuperuserMe,
  postLogin,
  getAdmins,
  postAddAdmin,
  postDeleteAdmin,
};
