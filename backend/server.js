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
const bootstrapRoutes = require('./routes/bootstrapRoutes');

// Auto seed helper
const Admin = require('./models/Admin');
const Settings = require('./models/Settings');

const app = express();

// Trust proxy for reverse proxies (Render, Vercel, Heroku) so req.ip and rate limiters work properly
app.set('trust proxy', 1);

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
    crossOriginOpenerPolicy: false,
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow all origins (including null, localhost, Vercel preview & prod URLs, Render)
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads folder for images (with explicit cross-origin access)
app.use(
  '/uploads',
  (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
    next();
  },
  express.static(path.join(__dirname, 'uploads'))
);

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
app.use('/api/bookings', bookingRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/bootstrap', bootstrapRoutes);

// Frontend static serving (from public folder or frontend/dist)
const fs = require('fs');
const publicFolder = path.join(__dirname, 'public');
const distFolder = path.join(__dirname, '../frontend/dist');
const staticDir = fs.existsSync(publicFolder) ? publicFolder : (fs.existsSync(distFolder) ? distFolder : null);

if (staticDir) {
  app.use(express.static(staticDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(staticDir, 'index.html'));
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
