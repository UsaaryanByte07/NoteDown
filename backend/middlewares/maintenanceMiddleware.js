const MaintainanceMode = require("../models/MaintenanceMode");

const maintenanceMiddleware = async (req, res, next) => {
  try {
    const state = await MaintainanceMode.getState();

    if (!state.isActive) {
      return next();
    }

    if (state.endsAt && new Date() > state.endsAt) {
      await MaintainanceMode.findByIdAndUpdate(state._id, {
        isActive: false,
        endsAt: null,
        activatedAt: null,
      });
      return next();
    }

    if (req.path.startsWith("/root")) {
      return next();
    }

    const clientIp =
      req.ip ||
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress;

    if (state.whitelistedIps.includes(clientIp)) {
      return next();
    }

    if (req.path.startsWith("/api/")) {
      return res.status(503).json({
        success: false,
        maintenance: true,
        message:
          state.message ||
          "The website is currently under maintenance. Please try again later.",
        endsAt: state.endsAt,
      });
    }

    return res.status(503).json({
      success: false,
      maintenance: true,
      message:
        state.message ||
        "The website is currently under maintenance. Please try again later.",
      endsAt: state.endsAt,
    });
  } catch (err) {
    console.error("Maintenance middleware error:", err);
    next();
  }
};

module.exports = {maintenanceMiddleware};
