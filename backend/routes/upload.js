const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const stream = require('stream');
const mongoose = require('mongoose');
const { protect } = require('../middleware/authMiddleware');

// Lazy Cloudinary initialization helper
const getCloudinary = () => {
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    try {
      const cloudinary = require('cloudinary').v2;
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
        api_key: process.env.CLOUDINARY_API_KEY.trim(),
        api_secret: process.env.CLOUDINARY_API_SECRET.trim(),
        secure: true,
      });
      return cloudinary;
    } catch (err) {
      console.warn('Cloudinary package not available or misconfigured:', err.message);
      return null;
    }
  }
  return null;
};

// In-Memory storage (avoids ephemeral container disk data loss)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp|svg|mp4|webm|ogg|mov|avi|pdf|doc|docx|xls|xlsx|txt/i;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    return cb(new Error('Only images, videos and document files are allowed!'));
  }
});

// Helper to get MongoDB GridFS Bucket
const getGridFSBucket = () => {
  if (!mongoose.connection.db) {
    throw new Error('Database connection not established');
  }
  return new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'uploads'
  });
};

// @route   POST /api/upload
// @desc    Upload file to Cloudinary (if configured) or MongoDB GridFS (Persistent)
// @access  Private
router.post('/', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const originalName = req.file.originalname;
    const ext = path.extname(originalName);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const mimeType = req.file.mimetype || 'application/octet-stream';

    // 1. Cloudinary upload if configured
    const cloudinary = getCloudinary();
    if (cloudinary) {
      try {
        const uploadResult = await new Promise((resolve, reject) => {
          const isVideo = mimeType.startsWith('video/');
          const isDoc = !mimeType.startsWith('image/') && !mimeType.startsWith('video/');

          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: isDoc ? 'raw' : (isVideo ? 'video' : 'image'),
              folder: 'vinayaka-festival',
              public_id: path.parse(uniqueName).name,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          const bufferStream = new stream.PassThrough();
          bufferStream.end(req.file.buffer);
          bufferStream.pipe(uploadStream);
        });

        return res.status(201).json({
          message: 'File uploaded successfully to Cloudinary',
          fileUrl: uploadResult.secure_url,
          fileName: uniqueName,
          originalName: originalName,
          mimeType: mimeType,
          size: req.file.size,
          storage: 'cloudinary'
        });
      } catch (cloudErr) {
        console.warn('Cloudinary upload error, falling back to MongoDB GridFS:', cloudErr.message);
      }
    }

    // 2. Persistent MongoDB GridFS upload (Default & 100% persistent)
    const bucket = getGridFSBucket();
    const uploadStream = bucket.openUploadStream(uniqueName, {
      contentType: mimeType,
      metadata: {
        originalName: originalName,
        uploadedBy: req.user ? req.user.username : 'system',
        size: req.file.size,
      }
    });

    await new Promise((resolve, reject) => {
      uploadStream.on('finish', resolve);
      uploadStream.on('error', reject);
      uploadStream.end(req.file.buffer);
    });

    const fileUrl = `/api/upload/file/${uniqueName}`;

    res.status(201).json({
      message: 'File uploaded successfully to persistent database storage',
      fileUrl,
      fileName: uniqueName,
      originalName: originalName,
      mimeType: mimeType,
      size: req.file.size,
      storage: 'gridfs'
    });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ message: error.message || 'File upload failed' });
  }
});

// @route   GET /api/upload/file/:filename
// @desc    Stream file from MongoDB GridFS
// @access  Public
router.get('/file/:filename', async (req, res) => {
  try {
    const bucket = getGridFSBucket();
    const files = await bucket.find({ filename: req.params.filename }).toArray();

    if (!files || files.length === 0) {
      return res.status(404).json({ message: 'File not found' });
    }

    const file = files[0];
    res.set('Content-Type', file.contentType || 'application/octet-stream');
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    if (file.length) {
      res.set('Content-Length', file.length);
    }

    const downloadStream = bucket.openDownloadStreamByName(req.params.filename);
    downloadStream.on('error', () => {
      if (!res.headersSent) {
        res.status(404).json({ message: 'Error streaming file' });
      }
    });
    downloadStream.pipe(res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
