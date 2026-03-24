
const express = require('express')
const authRoutes = express.Router();
const { getResetPassword, postForgotPassword, postResetPassword} = require('../controllers/auth/forgetPasswordController');
const {getMe, postLogin, postLogout} = require('../controllers/auth/loginController');
const {getVerifyOtp, postVerifyOtp} = require('../controllers/auth/verifyOtpController');
const {postSignup} = require('../controllers/auth/signupController');
const { requireNotLoggedIn } = require('../middlewares/authMiddleware');

authRoutes.get('/me', getMe);

authRoutes.post('/signup',requireNotLoggedIn,postSignup);

authRoutes.get('/verify-otp', getVerifyOtp);

authRoutes.post('/verify-otp', postVerifyOtp);

authRoutes.get('/reset-password', getResetPassword)

authRoutes.post('/reset-password', postResetPassword)

authRoutes.post('/forgot-password', postForgotPassword)

authRoutes.post('/login',requireNotLoggedIn,postLogin);

authRoutes.post('/logout',postLogout);


module.exports = {
    authRoutes,
}
