const validator = require("express-validator");
const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const {
  sendForgotPasswordEmail,
  sendOtpEmail,
} = require("../../utils/email-util");
const crypto = require("crypto");
const {
  passwordValidator,
  confirmPasswordValidator,
} = require("../../utils/validator-util");

const getResetPassword = (req, res, next) => {
  const { token, email } = req.query;
  res.status(200).json({ success: true, token, email });
};

const postResetPassword = [
  passwordValidator,
  confirmPasswordValidator,
  async (req, res, next) => {
    const { email, token, password, confirmPassword } = req.body;
    const errors = validator.validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(422)
        .json({ success: false, errors: errors.array(), email, token });
    }

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found", email, token });
      }
      if (!user.resetToken || user.resetToken !== token) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Invalid reset token",
            email,
            token,
          });
      }
      if (user.resetTokenExpiry <= Date.now()) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Reset token has expired",
            email,
            token,
          });
      }
      const hashedPassword = await bcrypt.hash(password, 12);
      user.password = hashedPassword;
      user.resetToken = "";
      user.resetTokenExpiry = null;
      user.failedLoginAttempts = 0; // Clear lockout so the new password works immediately
      user.lockUntil = null;
      await user.save();
      return res.json({
        success: true,
        message: "Password has been reset successfully",
      });
    } catch (err) {
      return res
        .status(500)
        .json({
          success: false,
          message:
            "An error occurred while resetting the password. Please try again later.",
          email,
          token,
        });
    }
  },
];

const postForgotPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found", email });
    }

    if (user.resetTokenExpiry && user.resetTokenExpiry > Date.now()) {
      const remainingMs = user.resetTokenExpiry - Date.now();
      const remainingSecs = Math.ceil(remainingMs / 1000);

      return res.status(429).json({
        success: false,
        message: "Please wait before requesting a new reset link",
        cooldownRemaining: remainingSecs,
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 5 * 60 * 1000;
    await user.save();

    await sendForgotPasswordEmail(email, token);

    res
      .status(200)
      .json({
        success: true,
        message: "Password reset email sent successfully",
        cooldownRemaining: 300,
      });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({
        success: false,
        message: "An error occurred. Please try again later.",
      });
  }
};

const postResendOtp = async (req, res, next) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Email already verified" });
    }

    // THE COOLDOWN GATE: otpExpiry stores the time the current OTP expires.
    // We reuse this field as the cooldown start. If it's still in the future,
    // the user must wait. Math.ceil rounds up so we never show "0 seconds".
    if (user.otpExpiry && user.otpExpiry > Date.now()) {
      const remainingMs = user.otpExpiry - Date.now();
      const remainingSecs = Math.ceil(remainingMs / 1000);

      return res.status(429).json({
        // HTTP 429 = Too Many Requests
        success: false,
        message: "Please wait before requesting a new OTP",
        cooldownRemaining: remainingSecs, // Frontend countdown timer reads this
      });
    }

    // Generate a new 6-digit OTP and overwrite the old one
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes from now
    await user.save();

    await sendOtpEmail(email, user.firstName, user.lastName, otp);

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully",
      cooldownRemaining: 300, // 5-minute timer on the frontend
    });
  } catch (err) {
    console.error("Error resending OTP:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to resend OTP" });
  }
};

const getCooldownStatus = async (req, res, next) => {
  const {email, type} = req.query;

  if (!email || !type) {
    return res.status(400).json({ success: false, message: "Email and type are required" });
  }

  try {
        const user = await User.findOne({ email });
        if (!user) {
            // Unknown email is treat as no cooldown (don't confirm email existence either)
            return res.status(200).json({ success: true, cooldownRemaining: 0 });
        }

        const expiryField = type === 'otp' ? user.otpExpiry : user.resetTokenExpiry;

        if (expiryField && expiryField > Date.now()) {
            const remainingSecs = Math.ceil((expiryField - Date.now()) / 1000);
            return res.status(200).json({ success: true, cooldownRemaining: remainingSecs });
        }

        return res.status(200).json({ success: true, cooldownRemaining: 0 });
    } catch (err) {
        console.error('Error checking cooldown:', err);
        return res.status(500).json({ success: false, message: 'Failed to check cooldown' });
    }
}


// POST /api/auth/check-and-resend-otp
// Used by the "Verify existing account" flow on the Signup page.
// Smart cooldown: if a cooldown is still active, returns the remaining time
// WITHOUT sending a new email — preventing this flow from being used to reset/bypass cooldown.
const postCheckAndResendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email. Please sign up first.',
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'This account is already verified. Please log in.',
      });
    }

    // COOLDOWN CHECK — if still cooling down, redirect to verify page WITHOUT a new OTP.
    // This is the key security point: we can't let this endpoint be used to
    // reset the cooldown by just hitting "Verify Account" from signup page.
    if (user.otpExpiry && user.otpExpiry > Date.now()) {
      const remainingSecs = Math.ceil((user.otpExpiry - Date.now()) / 1000);
      return res.status(200).json({
        success: true,
        message: 'OTP already sent. Please check your email.',
        cooldownRemaining: remainingSecs,
        redirectTo: `/verify-otp?email=${email}`,
      });
    }

    // No cooldown — generate and send a fresh OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
    await user.save();

    await sendOtpEmail(email, user.firstName, user.lastName, otp);

    return res.status(200).json({
      success: true,
      message: 'A new OTP has been sent to your email.',
      cooldownRemaining: 300,
      redirectTo: `/verify-otp?email=${email}`,
    });
  } catch (err) {
    console.error('Error in check-and-resend-otp:', err);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

module.exports = {
  postForgotPassword,
  postResetPassword,
  getResetPassword,
  postResendOtp,
  getCooldownStatus,
  postCheckAndResendOtp,
};

