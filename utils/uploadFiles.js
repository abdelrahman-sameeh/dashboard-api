const multer = require("multer");
const path = require("path");
const fs = require("fs");

const ensureDirExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Set storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join("uploads", 'packages');
    
    ensureDirExists(uploadPath);
    cb(null, uploadPath); 
  },
  filename: (req, file, cb) => {
    const originalName = path.basename(file.originalname, path.extname(file.originalname));
    const fileExtension = path.extname(file.originalname);
    const timestamp = Date.now();
    cb(null, `${originalName}-${timestamp}${fileExtension}`);
  }
});

// Init multer upload
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    cb(null, true);
  }
});

module.exports = upload;
