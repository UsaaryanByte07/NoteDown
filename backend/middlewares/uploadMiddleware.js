const multer = require("multer");
const path = require("path");
const fs = require("fs");

const QUARANTINE_DIR = path.join(__dirname, "../temp/quarantine");

if (!fs.existsSync(QUARANTINE_DIR)) {
  fs.mkdirSync(QUARANTINE_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userDir = path.join(QUARANTINE_DIR, req.user._id.toString());
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    cb(null, userDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const allowedMimeTypes = [
  "application/pdf", //.pdf
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "text/plain", // .txt
];

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Unsupported file type. Only PDF, Word, and Text files are allowed.",
      ),
      false,
    );
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024, files: 1 }, // 25MB
  fileFilter,
});

module.exports = { upload };
