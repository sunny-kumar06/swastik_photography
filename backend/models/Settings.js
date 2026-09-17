const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      default: 'Swastik Photography',
      required: true,
      trim: true,
    },
    tagline: {
      type: String,
      default: 'Premium Photography & Cinematic Videography',
    },
    phone: {
      type: String,
      default: '9608782890',
      required: true,
      trim: true,
    },
    email: {
      type: String,
      default: 'sk61398sny@gmail.com',
      required: true,
      trim: true,
      lowercase: true,
    },
    whatsapp: {
      type: String,
      default: '9608782890',
      trim: true,
    },
    address: {
      type: String,
      default: 'Studio Swastik, Main Road, City Center',
      trim: true,
    },
    socialLinks: {
      instagram: {
        type: String,
        default: 'https://www.instagram.com/swastik__photography__?stkn=MW1iMGR6bDAxbWZudQ==',
      },
      facebook: {
        type: String,
        default: '',
      },
      youtube: {
        type: String,
        default: '',
      },
    },
    heroHeading: {
      type: String,
      default: 'Creating Memories That Last Forever',
    },
    heroSubtitle: {
      type: String,
      default: 'Premium Photography & Cinematic Videography for Weddings, Celebrations & Special Moments',
    },
    aboutTitle: {
      type: String,
      default: 'Capturing Timeless Stories With Cinematic Artistry',
    },
    aboutText: {
      type: String,
      default: 'At Swastik Photography, we believe every frame tells a unique story. With years of passionate dedication, cutting-edge camera gear, and an editorial eye for raw emotion, we turn fleeting celebrations into timeless cinematic art. From intimate vows to grand weddings, we capture the soul of your most cherished moments.',
    },
    aboutImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?auto=format&fit=crop&q=75&w=1000',
    },
    heroImage: {
      type: String,
      default: '',
    },
    experienceYears: {
      type: Number,
      default: 8,
    },
    eventsCount: {
      type: Number,
      default: 650,
    },
    happyClientsCount: {
      type: Number,
      default: 1200,
    },
    cinematicFilmsCount: {
      type: Number,
      default: 250,
    },
    footerText: {
      type: String,
      default: 'Swastik Photography — Transforming real emotions into everlasting visual legacies. Available worldwide for destination weddings and signature events.',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
