const User = require("../../models/User");

const getVerifyOtp = async (req, res, next) => {
  const { email } = req.query;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  res.status(200).json({ success: true, message: "OTP sent to email", email });
};

const postVerifyOtp = async (req, res, next) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (user.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "User already verified" });
    }
    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
    if (user.otpExpiry <= Date.now()) {
      return res.status(400).json({ success: false, message: "Expired OTP" });
    }
    user.isVerified = true;
    user.otp = "";
    await user.save();
    res
      .status(200)
      .json({ success: true, message: "OTP verified successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getVerifyOtp,
  postVerifyOtp,
};
