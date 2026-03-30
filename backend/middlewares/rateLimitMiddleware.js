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

module.exports = {
  uploadRateLimiter,
};
