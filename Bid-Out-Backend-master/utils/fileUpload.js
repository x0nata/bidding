const multer = require("multer")

// Use memory storage for serverless environments like Vercel
// This stores files in memory instead of trying to write to disk
const storage = multer.memoryStorage()

function fileFilter(req, file, cb) {
  // Accept image files only for product uploads
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new Error('Only image files are allowed'), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
  }
})

module.exports = { upload }
