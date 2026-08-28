const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/collections', require('./routes/collections'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/events', require('./routes/events'));
app.use('/api/volunteers', require('./routes/volunteers'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/gallery', require('./routes/gallery'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/logs', require('./routes/logs'));
app.use('/api/upload', require('./routes/upload'));

const mongoose = require('mongoose');

// Serve uploaded files statically from disk if present, or stream from MongoDB GridFS
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.get('/uploads/:filename', async (req, res, next) => {
  try {
    if (!mongoose.connection.db) {
      return res.status(404).send('File not found');
    }
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
    const files = await bucket.find({ filename: req.params.filename }).toArray();
    if (files && files.length > 0) {
      const file = files[0];
      res.set('Content-Type', file.contentType || 'application/octet-stream');
      res.set('Cache-Control', 'public, max-age=31536000, immutable');
      if (file.length) {
        res.set('Content-Length', file.length);
      }
      return bucket.openDownloadStreamByName(req.params.filename).pipe(res);
    }
    return res.status(404).send('File not found');
  } catch (err) {
    next(err);
  }
});

// Basic status check route
app.get('/', (req, res) => {
  res.send('Vinayaka Chavithi Festival Management System API is running...');
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
