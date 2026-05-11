const MaintainanceMode = require("../models/MaintenanceMode");

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

    // Normalize the client IP: strip IPv6-mapped IPv4 prefix (::ffff:x.x.x.x → x.x.x.x)
    // so that whitelist entries always work regardless of whether the OS uses IPv4 or IPv6 sockets
    const rawIp =
      req.ip ||
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress;
    const clientIp = rawIp?.startsWith("::ffff:") ? rawIp.slice(7) : rawIp;

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
