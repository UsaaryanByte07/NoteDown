const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../../models/User");
const validator = require("express-validator");
const {
  firstNameValidator,
  lastNameValidator,
  passwordValidator,
  confirmPasswordValidator,
} = require("../../utils/validator-util");
const { sendOtpEmail } = require("../../utils/email-util");

const getProfile = async (req, res, next) => {
  try {
    /* The select here is used to exclude sensitive fields from the user document before returning the profile response. */
    const user = await User.findById(req.user._id).select(
      "-password -otp -otpExpiry -resetToken -resetTokenExpiry",
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    //The user's totalStorageUsed is updated on every upload/delete, so reading it fresh from the DB gives an accurate snapshot.
    let storage = null;
    if (user.userType === "user") {
      const MAX_USER_STORAGE = 100 * 1024 * 1024; // 100 MB in bytes
      storage = {
        used: user.totalStorageUsed,
        usedMB: (user.totalStorageUsed / (1024 * 1024)).toFixed(2),
        limitMB: "100.00",
        remainingMB: (
          (MAX_USER_STORAGE - user.totalStorageUsed) /
          (1024 * 1024)
        ).toFixed(2),
        percentage: ((user.totalStorageUsed / MAX_USER_STORAGE) * 100).toFixed(
          2,
        ),
      };
    }

    return res.status(200).json({
      success: true,
      profile: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType,
        storage, // null for admins, populated for regular users
        createdAt: user.createdAt, // Requires timestamps: true in User schema
      },
    });
  } catch (err) {
    console.error("Error fetching profile:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch profile" });
  }
};

const patchProfile = [
  firstNameValidator,
  lastNameValidator,
  async (req, res, next) => {
    const errors = validator.validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    try {
      const { firstName, lastName } = req.body;
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { firstName, lastName },
        { returnDocument: 'after', runValidators: true },
      ).select("-password -otp -otpExpiry -resetToken -resetTokenExpiry");

      // Build a new JWT payload with the updated name
      const payload = {
        _id: user._id,
        userType: user.userType,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
        expiresIn: "15d",
      });

      // Replace the cookie so the frontend immediately reflects the new name
      res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: 'none', 
        maxAge: 60000 * 60 * 24 * 15,
      });

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user: payload,
      });
    } catch (err) {
      console.error("Error updating profile:", err);
      return res
        .status(500)
        .json({ success: false, message: "Failed to update profile" });
    }
  },
];

const postRequestPasswordReset = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.otpExpiry && user.otpExpiry > Date.now()) {
      const remainingMs = user.otpExpiry - Date.now();
      const remainingSecs = Math.ceil(remainingMs / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${remainingSecs} seconds before requesting a new OTP`,
        cooldownRemaining: remainingSecs,
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
    await user.save();

    await sendOtpEmail(user.email, user.firstName, user.lastName, otp);

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email for password reset",
    });
  } catch (err) {
    console.error("Error requesting password reset:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to request password reset" });
  }
};

const postProfileResetPassword = [
  passwordValidator,
  confirmPasswordValidator,
  async (req, res, next) => {
    const errors = validator.validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }
    try {
      const { otp, password } = req.body;
      const user = await User.findById(req.user._id);

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      if (!user.otp || user.otp !== otp) {
        return res.status(400).json({ success: false, message: "Invalid OTP" });
      }

      if (user.otpExpiry <= Date.now()) {
        return res
          .status(400)
          .json({ success: false, message: "OTP has expired" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      user.password = hashedPassword;
      user.otp = ""; // Clear the OTP so it can't be reused
      user.otpExpiry = null;
      await user.save();

      // Also reset any login lockout (see 30-login-lockout-backend.md)
      await User.findByIdAndUpdate(user._id, {
        failedLoginAttempts: 0,
        lockUntil: null,
      });

      return res.status(200).json({
        success: true,
        message: "Password reset successfully",
      });
    } catch (err) {
      console.error("Error resetting password:", err);
      return res
        .status(500)
        .json({ success: false, message: "Failed to reset password" });
    }
  },
];

module.exports = {
  getProfile,
  patchProfile,
  postRequestPasswordReset,
  postProfileResetPassword,
};
