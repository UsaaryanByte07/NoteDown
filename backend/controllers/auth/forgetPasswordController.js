const validator = require("express-validator");
const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const { sendForgotPasswordEmail } = require("../../utils/email-util");
const crypto = require("crypto");
const {passwordValidator, confirmPasswordValidator} =  require('../../utils/validator-util')

const getResetPassword = (req, res, next) => {
  const { token, email } = req.query;
  res.status(200).json({success: true, token, email });
};

const postResetPassword = [
  passwordValidator,
  confirmPasswordValidator,
  async (req, res, next) => {
    const { email, token, password, confirmPassword} = req.body;
    const errors = validator.validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array(), email, token });
    }

    try {
      const user = await User.findOne({ email });
      if(!user) {
        return res.status(404).json({ success: false, message: "User not found", email, token });
      }
      if(!user.resetToken || user.resetToken !== token) {
        return res.status(400).json({ success: false, message: "Invalid reset token", email, token });
      }
      if (user.resetTokenExpiry <= Date.now()) {
        return res.status(400).json({ success: false, message: "Reset token has expired", email, token });
      }
      const hashedPassword = await bcrypt.hash(password, 12);
      user.password = hashedPassword;
      user.resetToken = "";
      await user.save();
      return res.json({ success: true, message: "Password has been reset successfully"});
      }catch (err) {
      return res.status(500).json({ success: false, message: "An error occurred while resetting the password. Please try again later.", email, token });
    }
  },
];

const postForgotPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found", email });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 5 * 60 * 1000;
    await user.save();

    await sendForgotPasswordEmail(email, token);

    res.status(200).json({ success: true, message: "Password reset email sent successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "An error occurred. Please try again later." });
  }
};

module.exports = {
    postForgotPassword,
    postResetPassword,
    getResetPassword,
};