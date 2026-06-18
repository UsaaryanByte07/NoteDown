const { cloudinary } = require("../config/cloudinary_config");
const path = require("path");

const uploadToCloudinary = async (filePath, publicId) => {
    // Cloudinary handles raw file extensions separately from the public_id.
    // If the public_id contains an extension (e.g., "notes/user/file.docx"),
    // Cloudinary strips it internally, causing URL mismatches and 404s.
    // Fix: remove the extension from public_id and let Cloudinary manage it.
    const publicIdWithoutExt = publicId.replace(/\.[^/.]+$/, "");

    const result = await cloudinary.uploader.upload(filePath, {
        resource_type: "raw",
        public_id: publicIdWithoutExt,
        overwrite: false,
    });

    return {
        url: result.secure_url,
        publicId: result.public_id,
    };
};

const deleteFromCloudinary = async (publicId) => {
    await cloudinary.uploader.destroy(publicId, {
        resource_type: "raw",
    });
};

module.exports = {
    uploadToCloudinary,
    deleteFromCloudinary,
};