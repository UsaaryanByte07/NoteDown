const multer = require('multer');

const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({
                success: false,
                message: 'File is too large. Maximum file size is 25 MB.',
                errorCode: 'FILE_TOO_LARGE',
            });
        }
        return res.status(400).json({
            success: false,
            message: `Upload error: ${err.message}`,
            errorCode: 'MULTER_ERROR',
        });
    }
    if (err.message && err.message.includes('Invalid file type')) {
        return res.status(415).json({
            success: false,
            message: err.message,
            errorCode: 'INVALID_FILE_TYPE',
        });
    }
    next(err);
};


const pageNotFoundHandler = (req, res, next) => {
  res.status(404).json({ success: false, message: "Route not found" });
}

module.exports = {
    handleMulterError,
    pageNotFoundHandler,
};