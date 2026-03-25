const validator = require("express-validator");
const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const { sendOtpEmail } = require("../../utils/email-util");
const {
  passwordValidator,
  confirmPasswordValidator,
  emailValidator,
  firstNameValidator,
  lastNameValidator,
  termsValidator,
} = require("../../utils/validator-util");

const postSignup = [
  firstNameValidator,
  lastNameValidator,
  emailValidator,
  passwordValidator,
  confirmPasswordValidator,
  termsValidator,
  async (req, res, next) => {
    const {
      firstName,
      lastName,
      password,
      email,
      confirmPassword,
      terms,
    } = req.body;
    const errors = validator.validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }
    try {
      // Check for duplicate email across all user types (user or admin)
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: "An account with this email already exists. Please log in or use a different email.",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      const otpExpiry = Date.now() + 5 * 60 * 1000;
      const user = new User({
        firstName,
        lastName,
        password: hashedPassword,
        email,
        userType: 'user',
        otp,
        otpExpiry,
      });
      await user.save();
      await sendOtpEmail(email, firstName, lastName, otp);

      res.status(200).json({
        success: true,
        message: "Signup successful. Please verify your email.",
        redirectTo: `/verify-otp?email=${email}`,
      });
    } catch (err) {
      console.error("Critical Signup Error:", err);
      // Fallback duplicate key guard (race condition safety)
      if (err.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "An account with this email already exists. Please log in or use a different email.",
        });
      }
      return res.status(500).json({
        success: false,
        message: "An unexpected server error occurred. Please try again.",
      });
    }
  },
];

module.exports = {
  postSignup,
};
