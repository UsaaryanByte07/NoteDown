const mongoose = require('mongoose');

const systemStatsSchema = new mongoose.Schema({
    globalStorageUsed: { type: Number, default: 0 }, // in bytes
    totalNotesUploaded: { type: Number, default: 0 },
    isUploadEnabled: { type: Boolean, default: true },
})

systemStatsSchema.statics.getStats = async function() {
    let stats = await this.findOne();

    if (!stats) {
        stats = await this.create({});
    }

    return stats;
}

module.exports = mongoose.model('SystemStats', systemStatsSchema);