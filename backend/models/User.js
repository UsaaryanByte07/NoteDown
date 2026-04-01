const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, required: true, enum: ["user", "admin"] },
  otp: {type: String, default: ""},
  otpExpiry: {type: Date, default: Date.now},
  isVerified: {type: Boolean, default: false},
  resetToken: {type: String, default: ''},
  resetTokenExpiry: {type: Date, default: Date.now},
  totalStorageUsed: { type: Number, default: 0 }, // in bytes
}, {
    timestamps: true, // Adds createdAt and updatedAt automatically
});

module.exports = mongoose.model("User", userSchema);