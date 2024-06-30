const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

// setup disk storage

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/uploads");
  },
  filename: function (req, file, cb) {
    crypto.randomBytes(16, function (err, buf) {
      const fn = buf.toString("hex") + path.extname(file.originalname);
      cb(null, fn);
    });
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
