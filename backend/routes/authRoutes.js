const express = require("express");
const authRoutes = express.Router();
const {
  getResetPassword,
  postForgotPassword,
  postResetPassword,
} = require("../controllers/auth/forgetPasswordController");
const {
  getMe,
  postLogin,
  postLogout,
} = require("../controllers/auth/loginController");
const {
  getVerifyOtp,
  postVerifyOtp,
} = require("../controllers/auth/verifyOtpController");
const { postSignup } = require("../controllers/auth/signupController");
const {
  postProfileResetPassword,
  postRequestPasswordReset,
  patchProfile,
  getProfile,
} = require("../controllers/auth/profileController");
const { requireNotLoggedIn, requireLogin } = require("../middlewares/authMiddleware");

// Profile routes (require user to be logged in)
authRoutes.get("/profile", requireLogin, getProfile);
authRoutes.patch("/profile", requireLogin, patchProfile);
authRoutes.post(
    "/profile/request-password-reset",
    requireLogin,
    postRequestPasswordReset,
);
authRoutes.post(
    "/profile/reset-password",
    requireLogin,
    postProfileResetPassword,
);

// This route is used by the frontend to get the current user's profile information (like name and email) to display in the UI, such as in a navbar or profile page. It ensures that the user is authenticated before allowing access to their profile data.
authRoutes.get("/me", requireLogin, getMe);

// Signup and OTP verification routes
authRoutes.post("/signup", requireNotLoggedIn, postSignup);
authRoutes.get("/verify-otp", getVerifyOtp);
authRoutes.post("/verify-otp", postVerifyOtp);

// Password reset routes for users who are not logged in (forgot password flow)
authRoutes.get("/reset-password", getResetPassword);
authRoutes.post("/reset-password", postResetPassword);
authRoutes.post("/forgot-password", postForgotPassword);

// Login and Logout routes
authRoutes.post("/login", requireNotLoggedIn, postLogin);
authRoutes.post("/logout", postLogout);

module.exports = {
  authRoutes,
};
