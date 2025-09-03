const express = require('express');
const multer = require('multer');
const ImageController = require('../controllers/imageController');

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Process images with effects
router.post('/process', upload.array('images', 10), ImageController.processImages);

// Get processing status
router.get('/status/:jobId', ImageController.getProcessingStatus);

module.exports = router;