const mongoose = require("mongoose");

const maintenanceModeSchema = new mongoose.Schema(
  {
    isActive: { type: Boolean, default: false },
    message: { type: String, default: "", trim: true },
    endsAt: {
      type: Date,
      default: null,
    },
    whitelistedIps: {
      type: [String],
      default: [],
    },
    activatedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

maintenanceModeSchema.statics.getState = async function () {
    let state = await this.findOne();
    if (!state) {
        state = await this.create({});
    }
    return state;
}

module.exports = mongoose.model("MaintenanceMode", maintenanceModeSchema);
