const Settings = require('../models/Settings');

// Default initial settings
const DEFAULT_SETTINGS = {
  businessName: 'Swastik Photography',
  tagline: 'Premium Photography & Cinematic Videography',
  phone: '9608782890',
  email: 'sk61398sny@gmail.com',
  whatsapp: '9608782890',
  address: 'Studio Swastik, Main Road, City Center',
  socialLinks: {
    instagram: 'https://www.instagram.com/swastik__photography__?stkn=MW1iMGR6bDAxbWZudQ==',
    facebook: '',
    youtube: '',
  },
  heroHeading: 'Creating Memories That Last Forever',
  heroSubtitle: 'Premium Photography & Cinematic Videography for Weddings, Celebrations & Special Moments',
  aboutTitle: 'Capturing Timeless Stories With Cinematic Artistry',
  aboutText:
    'At Swastik Photography, we believe every frame tells a unique story. With years of passionate dedication, cutting-edge camera gear, and an editorial eye for raw emotion, we turn fleeting celebrations into timeless cinematic art. From intimate vows to grand weddings, we capture the soul of your most cherished moments.',
  experienceYears: 8,
  eventsCount: 650,
  happyClientsCount: 1200,
  cinematicFilmsCount: 250,
  footerText:
    'Swastik Photography — Transforming real emotions into everlasting visual legacies. Available worldwide for destination weddings and signature events.',
};

// @desc    Get website settings (Public)
// @route   GET /api/settings
// @access  Public
const getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(DEFAULT_SETTINGS);
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

// @desc    Update website settings (Admin)
// @route   PUT /api/settings
// @access  Private (Admin)
const updateSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = new Settings(DEFAULT_SETTINGS);
    }

    const {
      businessName,
      tagline,
      phone,
      email,
      whatsapp,
      address,
      socialLinks,
      heroHeading,
      heroSubtitle,
      aboutTitle,
      aboutText,
      experienceYears,
      eventsCount,
      happyClientsCount,
      cinematicFilmsCount,
      footerText,
    } = req.body;

    if (businessName) settings.businessName = businessName.trim();
    if (tagline) settings.tagline = tagline.trim();

    if (phone) {
      const cleanPhone = String(phone).replace(/\D/g, '');
      const finalPhone = cleanPhone.length === 12 && cleanPhone.startsWith('91') ? cleanPhone.slice(2) : cleanPhone;
      if (finalPhone.length !== 10) {
        return res.status(400).json({
          success: false,
          message: 'Primary phone number must be a valid 10-digit mobile number.',
        });
      }
      settings.phone = finalPhone;
    }

    if (whatsapp) {
      const cleanWhatsapp = String(whatsapp).replace(/\D/g, '');
      const finalWhatsapp = cleanWhatsapp.length === 12 && cleanWhatsapp.startsWith('91') ? cleanWhatsapp.slice(2) : cleanWhatsapp;
      if (finalWhatsapp.length !== 10) {
        return res.status(400).json({
          success: false,
          message: 'WhatsApp number must be a valid 10-digit mobile number.',
        });
      }
      settings.whatsapp = finalWhatsapp;
    }

    if (email) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(String(email).trim().toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid contact email address.',
        });
      }
      settings.email = email.toLowerCase().trim();
    }

    if (address) settings.address = address.trim();

    if (socialLinks) {
      settings.socialLinks = {
        instagram: socialLinks.instagram !== undefined ? socialLinks.instagram : settings.socialLinks.instagram,
        facebook: socialLinks.facebook !== undefined ? socialLinks.facebook : settings.socialLinks.facebook,
        youtube: socialLinks.youtube !== undefined ? socialLinks.youtube : settings.socialLinks.youtube,
      };
    }

    if (heroHeading) settings.heroHeading = heroHeading.trim();
    if (heroSubtitle) settings.heroSubtitle = heroSubtitle.trim();
    if (aboutTitle) settings.aboutTitle = aboutTitle.trim();
    if (aboutText) settings.aboutText = aboutText.trim();
    if (experienceYears !== undefined) settings.experienceYears = Number(experienceYears);
    if (eventsCount !== undefined) settings.eventsCount = Number(eventsCount);
    if (happyClientsCount !== undefined) settings.happyClientsCount = Number(happyClientsCount);
    if (cinematicFilmsCount !== undefined) settings.cinematicFilmsCount = Number(cinematicFilmsCount);
    if (footerText) settings.footerText = footerText.trim();

    const updatedSettings = await settings.save();

    res.json({
      success: true,
      message: 'Website settings updated successfully',
      data: updatedSettings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
