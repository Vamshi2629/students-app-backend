const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "subjects", // Folder name in Cloudinary
    resource_type: "raw", // Allows PDFs
  },
});

const upload = multer({ storage });

module.exports = upload;
