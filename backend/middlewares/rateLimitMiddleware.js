const rateLimit = require("express-rate-limit");

const uploadRateLimiter = rateLimit({
  windowMs: 5 * 24 * 60 * 60 * 1000, // 5 days
  max: 5, // limit each IP to 5 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 5 days",
    errorCode: 'RATE_LIMIT_EXCEEDED',
  },
});

// Signup Rate Limiter
const signupRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 2,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many signup attempts from this IP. Please try again in an hour.',
        errorCode: 'RATE_LIMIT_EXCEEDED',
    },
});

// Login Rate Limiter
const loginRateLimiter = rateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many login attempts from this IP. Please try again later.',
        errorCode: 'RATE_LIMIT_EXCEEDED',
    },
});

//Forgot Password Rate Limiter
const forgotPasswordRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many password reset requests from this IP. Please try again later.',
        errorCode: 'RATE_LIMIT_EXCEEDED',
    },
});

// Resend OTP Rate Limiter
const resendOtpRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many OTP resend requests from this IP. Please try again later.',
        errorCode: 'RATE_LIMIT_EXCEEDED',
    },
});

// Reset Password Rate Limiter
const resetPasswordRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 2,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many password reset submissions from this IP. Please try again later.',
        errorCode: 'RATE_LIMIT_EXCEEDED',
    },
});

// OTP Verification Rate Limiter
const verifyOtpRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many OTP verification attempts from this IP. Please try again later.',
        errorCode: 'RATE_LIMIT_EXCEEDED',
    },
});

// Cooldown Status Check Rate Limiter
const cooldownStatusRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests from this IP. Please try again later.',
        errorCode: 'RATE_LIMIT_EXCEEDED',
    },
});

// Profile Password Reset Rate Limiter
const profileResetRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many profile password reset requests. Please try again later.',
        errorCode: 'RATE_LIMIT_EXCEEDED',
    },
});

module.exports = {
  uploadRateLimiter,
  signupRateLimiter,
  loginRateLimiter,
  forgotPasswordRateLimiter,
  resendOtpRateLimiter,
  resetPasswordRateLimiter,
  verifyOtpRateLimiter,
  cooldownStatusRateLimiter,
  profileResetRateLimiter
};
