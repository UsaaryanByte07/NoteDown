const Note = require("../../models/Note");
const SystemStats = require("../../models/SystemStats");

const getSystemStats = async (req, res) => {
    try {
        const stats = await SystemStats.getStats();
        const totalNotes = await Note.countDocuments();
        const pendingCount = await Note.countDocuments({ status: 'pending' });
        const approvedCount = await Note.countDocuments({ status: 'approved' });
        const rejectedCount = await Note.countDocuments({ status: 'rejected' });

        return res.status(200).json({
            success: true,
            stats: {
                globalStorageUsed: stats.globalStorageUsed,
                globalStorageUsedMB: (stats.globalStorageUsed / (1024 * 1024)).toFixed(2),
                globalStorageLimitMB: (4 * 1024).toFixed(2), // 4 GB in MB
                globalStoragePercentage: ((stats.globalStorageUsed / (4 * 1024 * 1024 * 1024)) * 100).toFixed(2),
                isUploadEnabled: stats.isUploadEnabled,
                totalNotesUploaded: stats.totalNotesUploaded,
                totalNotes,
                pendingCount,
                approvedCount,
                rejectedCount,
            },
        });
    } catch (err) {
        console.error('Error fetching system stats:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch system statistics.',
        });
    }
};

module.exports = {
  getSystemStats,
};
