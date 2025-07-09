const multer = require("multer")

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads")
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname) // 23/08/2022
  },
})

function fileFilter(req, file, cb) {
  // Accept all files to prevent "Unexpected field" errors
  // We'll validate file types in the controller if needed
  cb(null, true)
}

const upload = multer({ storage, fileFilter })

module.exports = { upload }
