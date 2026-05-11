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
    const docs = await this.find().sort({ updatedAt: -1 });
    if (docs.length === 0) {
        return await this.create({});
    }
    if (docs.length > 1) {
        const [latest, ...extras] = docs;
        await this.deleteMany({ _id: { $in: extras.map((d) => d._id) } });
        return latest;
    }
    return docs[0];
}

module.exports = mongoose.model("MaintenanceMode", maintenanceModeSchema);
