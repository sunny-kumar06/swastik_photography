# 📸 SWASTIK PHOTOGRAPHY — Production Platform

A complete, production-ready, full-stack photography business website with luxury cinematic branding, integrated multi-step booking engine with slot conflict prevention, automated Nodemailer notifications, Cloudinary image upload, and a secured Admin Management Portal.

---

## 🌟 Features Overview

- **Cinematic Luxury Branding**: Staggered letter reveal, glowing light movement, deep navy & dark slate palette with ruby red and warm gold accents.
- **Dynamic Content & Settings**: All business details (Phone `9608782890`, Email `sk61398sny@gmail.com`, WhatsApp, addresses, social channels, hero headlines, and statistics) are managed via MongoDB and update everywhere on the public site in real-time.
- **Interactive Multi-Step Booking**:
  - Step 1: Event Selection (Wedding, Pre-Wedding, Birthday, Engagement, Portrait, Cinematic)
  - Step 2: Dynamic Package Selection with live pricing and deliverables
  - Step 3: Calendar Date Picker (past date restriction) & Time Slot selector with real-time double-booking prevention
  - Step 4: Client contact and event venue details
  - Step 5: Summary review with instant reference code generation (`SWK-YYYY-XXXXX`) & confetti animation
- **Dynamic Portfolio Gallery**:
  - Category filters (Wedding, Pre-Wedding, Birthday, Engagement, Portrait, Cinematic)
  - Masonry grid with hover zoom effects
  - Integrated Lightbox modal (Full-screen view, Previous/Next navigation, captions)
- **Services & Packages Showcases**:
  - Curated services with price tags and direct booking triggers
  - Flexible packages with delivery turnaround estimates
- **Customer Testimonials Carousel**: Auto-rotating verified reviews with star ratings.
- **Contact System**: Lead capture with immediate email dispatch to `sk61398sny@gmail.com`.
- **Secured Admin Portal (`/admin/login`)**:
  - Protected by JWT and bcrypt password hashing
  - Interactive Dashboard with KPI counters (Total Bookings, Pending, Confirmed, Completed, Photos, Messages)
  - Booking Management: Search, status updater (`Pending` → `Confirmed` → `Completed` / `Rejected`), conflict protection
  - Gallery Manager: Upload photos (Cloudinary + MongoDB), edit details, delete with file cleanup
  - Service & Package CRUD: Modify pricing, active visibility, and feature lists
  - Review & Message Management: Read inquiries, manage testimonials
  - Settings Manager: Change phone, email, and copy on the fly without touching code

---

## 📁 Project Architecture

```
swastik-photography/
├── backend/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection
│   │   └── cloudinary.js         # Cloudinary + Multer storage
│   ├── controllers/
│   │   ├── authController.js     # Admin JWT auth
│   │   ├── bookingController.js  # Booking & double-booking logic
│   │   ├── galleryController.js  # Photo management
│   │   ├── serviceController.js  # Service CRUD
│   │   ├── packageController.js  # Package CRUD
│   │   ├── reviewController.js   # Review CRUD
│   │   ├── contactController.js  # Enquiry submissions
│   │   └── settingsController.js # Dynamic site configuration
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT token verification
│   │   └── errorHandler.js       # Centralized error handler
│   ├── models/
│   │   ├── Admin.js
│   │   ├── Booking.js
│   │   ├── Gallery.js
│   │   ├── Service.js
│   │   ├── Package.js
│   │   ├── Review.js
│   │   ├── Contact.js
│   │   └── Settings.js
│   ├── routes/                   # Express REST routes
│   ├── utils/
│   │   ├── emailService.js       # Nodemailer notification service
│   │   └── seedData.js           # Database seed script
│   ├── server.js                 # Express server entry
│   ├── .env                      # Environment configuration
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/client.js         # Axios client with interceptors
    │   ├── components/
    │   │   ├── common/           # Navbar, Footer, AnimatedBrand, Lightbox, Toast, WhatsApp
    │   │   ├── home/             # Hero, About, WhyChooseUs, Services, Packages, Gallery, Reviews, Contact
    │   │   ├── booking/          # 5-step booking engine
    │   │   └── admin/            # Admin Layout, ProtectedRoute, Dashboard modals
    │   ├── context/
    │   │   ├── AuthContext.jsx   # Admin session state
    │   │   └── SettingsContext.jsx # Live site copy & contact state
    │   ├── pages/
    │   │   ├── HomePage.jsx
    │   │   ├── NotFoundPage.jsx
    │   │   └── admin/            # Dashboard, Bookings, Gallery, Services, Packages, Reviews, Messages, Settings
    │   ├── App.jsx               # React router
    │   └── index.css             # Tailwind glassmorphism & typography
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v22 installed)
- **MongoDB**: Local MongoDB server or MongoDB Atlas URI

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies (already completed)
npm install

# Seed default data & admin user
npm run seed

# Run backend development server
npm run dev
# (Server runs at http://localhost:5000)
```

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (already completed)
npm install

# Start Vite development server
npm run dev
# (Runs at http://localhost:5173)
```

---

## 🔑 Default Admin Credentials

- **Admin Login URL**: `http://localhost:5173/admin/login`
- **Email**: `sk61398sny@gmail.com` (or `admin@swastikphotography.com`)
- **Password**: `Swastik@Admin2026`

*(Admin credentials can be modified anytime in Admin Settings)*

---

## ⚙️ Environment Variables (`backend/.env`)

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/swastik_photography
JWT_SECRET=swastik_photography_super_secret_jwt_key_2026

# Cloudinary (Optional - curated CDN fallback is active)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email / SMTP (Optional - console preview active when empty)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=sk61398sny@gmail.com
SMTP_PASS=your_gmail_app_password
ADMIN_EMAIL=sk61398sny@gmail.com

CLIENT_URL=http://localhost:5173
```
