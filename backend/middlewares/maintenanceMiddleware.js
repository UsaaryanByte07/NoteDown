const MaintainanceMode = require("../models/MaintenanceMode");
const { getClientIp } = require("../utils/getClientIp");

const maintenanceMiddleware = async (req, res, next) => {
  try {
    const state = await MaintainanceMode.getState();

    if (!state.isActive) {
      return next();
    }

    // Always allow these public endpoints through even during maintenance
    if (req.path === '/api/maintenance-status' || req.path === '/api/my-ip') {
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

    // Use shared helper: handles CF-Connecting-IP → X-Forwarded-For → socket fallback
    const clientIp = getClientIp(req);

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

    // Non-API paths (static files, HTML) pass through so the React app
    // can load and display its own MaintenancePage component
    return next();
  } catch (err) {
    console.error("Maintenance middleware error:", err);
    next();
  }
};

module.exports = {maintenanceMiddleware};
