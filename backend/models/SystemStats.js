const mongoose = require('mongoose');

const systemStatsSchema = new mongoose.Schema({
    globalStorageUsed: { type: Number, default: 0 }, // in bytes
    totalNotesUploaded: { type: Number, default: 0 },
    isUploadEnabled: { type: Boolean, default: true },
})

/* Mongoose static methods need to be declared using a regular function() syntax rather than an arrow function () => {} because arrow functions do not have their own this binding. They inherit this from the surrounding scope, meaning this.findOne and this.create fail because this does not refer to the Mongoose model */
systemStatsSchema.statics.getStats = async function() {
    let stats = await this.findOne();

    if (!stats) {
        stats = await this.create({});
    }

    return stats;
}

module.exports = mongoose.model('SystemStats', systemStatsSchema);