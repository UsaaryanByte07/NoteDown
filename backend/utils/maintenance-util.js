const MaintenanceMode = require("../models/MaintenanceMode");

const activateMaintenance = async ({
  message = "",
  endsAt = null,
  whitelistedIps = [],
} = {}) => {
  const state = await MaintenanceMode.getState();
  await MaintenanceMode.findByIdAndUpdate(state._id, {
    isActive: true,
    message: message.trim(),
    endsAt,
    whitelistedIps,
    activatedAt: new Date(),
  });
};

const deactivateMaintenance = async () => {
  const state = await MaintenanceMode.getState();
  await MaintenanceMode.findByIdAndUpdate(state._id, {
    isActive: false,
    endsAt: null,
    activatedAt: null,
  });
};

module.exports = { activateMaintenance, deactivateMaintenance };
