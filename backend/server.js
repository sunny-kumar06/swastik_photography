require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const packageRoutes = require('./routes/packageRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const contactRoutes = require('./routes/contactRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

// Auto seed helper
const Admin = require('./models/Admin');
const Settings = require('./models/Settings');

const app = express();

// Connect to Database and Auto-Initialize defaults
connectDB().then(async () => {
  try {
    const { seedDefaultsIfEmpty } = require('./utils/seedData');
    await seedDefaultsIfEmpty();
  } catch (initErr) {
    console.warn('[Auto-Init Warning]:', initErr.message);
  }
});

// Security & Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads folder for images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limiters for public forms to prevent flooding
const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 submissions per 15 mins
  message: { success: false, message: 'Too many requests from this IP. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Ignore favicon requests
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Swastik Photography API',
    timestamp: new Date().toISOString(),
  });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', formLimiter, bookingRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/contact', formLimiter, contactRoutes);
app.use('/api/settings', settingsRoutes);

// Frontend static serving (if frontend dist exists in repo)
const frontendDist = path.join(__dirname, '../frontend/dist');
const fs = require('fs');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  // Root API Landing response
  app.get('/', (req, res) => {
    res.json({
      status: 'online',
      service: '📸 Swastik Photography API Server',
      message: 'Backend server is running live and connected to MongoDB!',
      endpoints: {
        health: '/api/health',
        bookings: '/api/bookings',
        gallery: '/api/gallery',
        services: '/api/services',
        packages: '/api/packages',
        settings: '/api/settings',
        contact: '/api/contact',
      },
      clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
      timestamp: new Date().toISOString(),
    });
  });
}

// Error handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`📸 SWASTIK PHOTOGRAPHY API SERVER RUNNING`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌍 Health: http://localhost:${PORT}/api/health`);
  console.log(`=================================================`);
});

module.exports = app;
