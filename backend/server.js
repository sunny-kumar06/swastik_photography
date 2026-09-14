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

// Connect to Database
connectDB().then(async () => {
  // Ensure default admin exists
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@swastikphotography.com').toLowerCase().trim();
    const adminExists = await Admin.findOne({ email: adminEmail });
    if (!adminExists) {
      await Admin.create({
        name: 'Swastik Admin',
        email: adminEmail,
        password: 'Swastik@Admin2026',
        role: 'superadmin',
      });
      console.log(`[Auto-Init]: Admin initialized -> ${adminEmail} (Swastik@Admin2026)`);
    }

    // Ensure default settings exist
    const settingsExist = await Settings.findOne();
    if (!settingsExist) {
      await Settings.create({
        businessName: 'Swastik Photography',
        tagline: 'Premium Photography & Cinematic Videography',
        phone: '9608782890',
        email: 'sk61398sny@gmail.com',
        whatsapp: '9608782890',
      });
      console.log('[Auto-Init]: Initial settings registered.');
    }
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Swastik Photography API',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', formLimiter, bookingRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/contact', formLimiter, contactRoutes);
app.use('/api/settings', settingsRoutes);

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
