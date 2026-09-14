require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Settings = require('../models/Settings');
const Service = require('../models/Service');
const Package = require('../models/Package');
const Gallery = require('../models/Gallery');
const Review = require('../models/Review');

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/swastik_photography';
    await mongoose.connect(mongoUri);
    console.log('[Seed]: Connected to MongoDB at', mongoUri);

    // 1. Seed Admin
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@swastikphotography.com').toLowerCase().trim();
    let admin = await Admin.findOne({ email: adminEmail });
    if (!admin) {
      admin = await Admin.create({
        name: 'Swastik Director',
        email: adminEmail,
        password: 'Swastik@Admin2026',
        role: 'superadmin',
      });
      console.log(`[Seed]: Default Admin created -> Email: ${adminEmail} | Password: Swastik@Admin2026`);
    } else {
      console.log(`[Seed]: Admin already exists (${admin.email})`);
    }

    // 2. Seed Settings
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        businessName: 'Swastik Photography',
        tagline: 'Premium Photography & Cinematic Videography',
        phone: '9608782890',
        email: 'sk61398sny@gmail.com',
        whatsapp: '9608782890',
        address: 'Swastik Studios, 4th Avenue, High Street, Jharkhand / Bihar',
        socialLinks: {
          instagram: 'https://www.instagram.com/swastik__photography__?stkn=MW1iMGR6bDAxbWZudQ==',
          facebook: '',
          youtube: '',
        },
        heroHeading: 'Creating Memories That Last Forever',
        heroSubtitle: 'Premium Photography & Cinematic Videography',
        aboutTitle: 'Capturing Timeless Stories With Cinematic Artistry',
        aboutText:
          'At Swastik Photography, we believe every frame tells a unique story. With over 8 years of passionate dedication, cutting-edge camera rigs, and an editorial eye for raw emotion, we turn fleeting celebrations into timeless cinematic art. From intimate vows to royal weddings, we capture the heart and soul of your most cherished moments.',
        experienceYears: 8,
        eventsCount: 650,
        happyClientsCount: 1200,
        cinematicFilmsCount: 250,
        footerText:
          'Swastik Photography — Transforming real emotions into everlasting visual legacies. Available worldwide for destination weddings and signature events.',
      });
      console.log('[Seed]: Settings seeded successfully');
    }

    // 3. Seed Services
    const serviceCount = await Service.countDocuments();
    if (serviceCount === 0) {
      await Service.insertMany([
        {
          title: 'Wedding Photography',
          description: 'Comprehensive candid and traditional wedding coverage capturing rituals, smiles, tears of joy, and every royal moment.',
          startingPrice: 25000,
          image: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop',
          category: 'Wedding',
          features: ['Two Senior Candid Photographers', 'Traditional Photo & Video', 'High-Res Edited Images', 'Luxury Wedding Album'],
          order: 1,
        },
        {
          title: 'Pre-Wedding Photography',
          description: 'Romantic, cinematic outdoor portraits and couple stories in breathtaking scenic landscapes and architectural wonders.',
          startingPrice: 18000,
          image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1200&auto=format&fit=crop',
          category: 'Pre-Wedding',
          features: ['Scenic Location Shoot', 'Drone Aerial Footage', 'Concept Styling & Direction', 'Cinematic 3-Minute Teaser'],
          order: 2,
        },
        {
          title: 'Birthday Photography',
          description: 'Lively, joyful documentation of milestone birthdays, children celebrations, cake smashing, and family gatherings.',
          startingPrice: 10000,
          image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=1200&auto=format&fit=crop',
          category: 'Birthday',
          features: ['Full Party Coverage', 'Candid Guest Moments', 'Same-Day Highlights Reel', 'Digital Gallery Access'],
          order: 3,
        },
        {
          title: 'Engagement Photography',
          description: 'Celebrate the ring ceremony and your first step toward forever with heartfelt, glamorous portraits and ring shots.',
          startingPrice: 15000,
          image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=1200&auto=format&fit=crop',
          category: 'Engagement',
          features: ['Ring & Detail Focus', 'Family Portraits', 'Fast Digital Delivery', 'Retouched Highlights'],
          order: 4,
        },
        {
          title: 'Cinematic Videography',
          description: '4K cinema-grade films, masterfully color-graded with custom sound design and emotional storytelling that moves your heart.',
          startingPrice: 35000,
          image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1200&auto=format&fit=crop',
          category: 'Cinematic',
          features: ['Cinema Prime Lenses & Gimbals', '4K Drone Aerial Coverage', 'Full Documentary Film', 'Instagram Reels & Trailers'],
          order: 5,
        },
        {
          title: 'Portrait Photography',
          description: 'High-fashion, corporate branding, and individual glamour portraits executed with precision studio lighting.',
          startingPrice: 8000,
          image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop',
          category: 'Portrait',
          features: ['Studio or Outdoor Setup', 'Magazine-Grade Retouching', 'Multiple Outfit Changes', 'High-Res Web & Print Files'],
          order: 6,
        },
      ]);
      console.log('[Seed]: Services seeded successfully');
    }

    // 4. Seed Packages
    const packageCount = await Package.countDocuments();
    if (packageCount === 0) {
      await Package.insertMany([
        {
          name: 'Wedding Basic',
          category: 'Wedding',
          price: 15000,
          description: 'Ideal for intimate ceremonies or single-day wedding events.',
          features: [
            '1 Senior Candid Photographer',
            '1 Traditional Videographer',
            'Full Day Event Coverage',
            'Up to 250 Color-Corrected High-Res Photos',
            'HD Highlight Video (5-7 mins)',
            'Standard Photo Book (20 Pages)',
            'Delivery within 20 days',
          ],
          isPopular: false,
          deliveryDays: 20,
          order: 1,
        },
        {
          name: 'Wedding Premium',
          category: 'Wedding',
          price: 25000,
          description: 'Our most requested signature coverage for grand wedding celebrations.',
          features: [
            '2 Senior Candid Photographers',
            '2 Cinematic Videographers (4K Setup)',
            'Drone Aerial Cinematography included',
            'Pre-Wedding Short Session included',
            '400+ Masterfully Retouched Photos',
            'Cinematic Wedding Teaser + Full Wedding Film',
            'Premium Leatherette Photobook (40 Pages)',
            'Delivery within 15 days',
          ],
          isPopular: true,
          deliveryDays: 15,
          order: 2,
        },
        {
          name: 'Wedding Luxury',
          category: 'Wedding',
          price: 40000,
          description: 'The pinnacle of bespoke royal photography for multi-day weddings.',
          features: [
            'Master Director + 3 Candid Photographers',
            '3 Cinematic Filmmakers with Gimbal & Prime Rigs',
            'Licensed FPV & 4K Drone Coverage',
            'Full Pre-Wedding Concept Shoot with Teaser',
            'Live Instagram Reels on Wedding Day',
            'Unlimited High-Res Retouched Photographs',
            'Luxury Hardcover Royal Album (60 Pages)',
            'Priority 10-Day Rush Delivery & Cloud Vault',
          ],
          isPopular: false,
          deliveryDays: 10,
          order: 3,
        },
        {
          name: 'Pre-Wedding Romantic',
          category: 'Pre-Wedding',
          price: 18000,
          description: 'Capture your love story in exotic locations before tying the knot.',
          features: [
            'Full Day Shoot (2 Scenic Locations)',
            'Up to 3 Outfit Changes',
            'Drone Aerial Drone Shots',
            '50 High-End Magazine Retouched Images',
            'Cinematic 3-Minute Love Story Video',
            'Delivery in 10 days',
          ],
          isPopular: false,
          deliveryDays: 10,
          order: 4,
        },
        {
          name: 'Birthday & Family Gala',
          category: 'Birthday',
          price: 12000,
          description: 'Full of vibrancy, fun, and natural laughter for your celebration.',
          features: [
            '4 Hours Continuous Coverage',
            'Candid & Group Portraits',
            'Cake Cutting Special Reel',
            '150+ Color-Graded Photos',
            'Digital Gallery with Online Download',
          ],
          isPopular: false,
          deliveryDays: 7,
          order: 5,
        },
      ]);
      console.log('[Seed]: Packages seeded successfully');
    }

    // 5. Seed Gallery
    const galleryCount = await Gallery.countDocuments();
    if (galleryCount === 0) {
      await Gallery.insertMany([
        {
          title: 'Royal Mandap Vows',
          category: 'Wedding',
          imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop',
          description: 'Heartfelt exchange of garlands under twilight glow.',
          isFeatured: true,
          aspectRatio: 'landscape',
          order: 1,
        },
        {
          title: 'Golden Hour Embrace',
          category: 'Pre-Wedding',
          imageUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1200&auto=format&fit=crop',
          description: 'Bespoke romantic pre-wedding editorial in hills.',
          isFeatured: true,
          aspectRatio: 'portrait',
          order: 2,
        },
        {
          title: 'Bridal Henna & Elegance',
          category: 'Wedding',
          imageUrl: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=1200&auto=format&fit=crop',
          description: 'Intricate mehendi patterns on bride before the ceremony.',
          isFeatured: true,
          aspectRatio: 'portrait',
          order: 3,
        },
        {
          title: 'First Dance Euphoria',
          category: 'Engagement',
          imageUrl: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=1200&auto=format&fit=crop',
          description: 'The magic of rings and celebratory sparklers.',
          isFeatured: false,
          aspectRatio: 'landscape',
          order: 4,
        },
        {
          title: 'Sparkler Birthday Joy',
          category: 'Birthday',
          imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=1200&auto=format&fit=crop',
          description: 'Laughter and glowing candles surrounded by loved ones.',
          isFeatured: false,
          aspectRatio: 'landscape',
          order: 5,
        },
        {
          title: 'Editorial Silhouette',
          category: 'Portrait',
          imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop',
          description: 'Studio fashion portrait featuring sharp dramatic rim light.',
          isFeatured: true,
          aspectRatio: 'portrait',
          order: 6,
        },
        {
          title: 'Cinematic Motion Sequence',
          category: 'Cinematic',
          imageUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1200&auto=format&fit=crop',
          description: '4K film still during the grand wedding baraat entrance.',
          isFeatured: true,
          aspectRatio: 'landscape',
          order: 7,
        },
        {
          title: 'Haldi Golden Laughter',
          category: 'Wedding',
          imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200&auto=format&fit=crop',
          description: 'Turmeric splashes and pure joy with cousins.',
          isFeatured: false,
          aspectRatio: 'landscape',
          order: 8,
        },
        {
          title: 'Sunset Lake Reflection',
          category: 'Pre-Wedding',
          imageUrl: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=1200&auto=format&fit=crop',
          description: 'Peaceful boat session at golden dusk.',
          isFeatured: false,
          aspectRatio: 'landscape',
          order: 9,
        },
      ]);
      console.log('[Seed]: Gallery seeded successfully');
    }

    // 6. Seed Reviews
    const reviewCount = await Review.countDocuments();
    if (reviewCount === 0) {
      await Review.insertMany([
        {
          customerName: 'Aarav & Priya Sharma',
          eventType: 'Wedding Photography',
          rating: 5,
          comment:
            'Swastik Photography turned our wedding into a cinematic masterpiece. The team was unobtrusive, deeply creative, and captured emotions we didn’t even realize occurred. Our wedding teaser went viral among family!',
          eventDate: 'November 2025',
          isFeatured: true,
        },
        {
          customerName: 'Rohan & Ananya Verma',
          eventType: 'Pre-Wedding Shoot',
          rating: 5,
          comment:
            'Hands down the most professional and artistic photographers in the region. The pre-wedding portraits look straight out of a Bollywood film. Every frame had stunning lighting!',
          eventDate: 'January 2026',
          isFeatured: true,
        },
        {
          customerName: 'Vikram Rajput',
          eventType: 'Birthday & Anniversary',
          rating: 5,
          comment:
            'From prompt communication to rapid high-resolution album delivery, Swastik Photography exceeded all our expectations. Thank you for preserving our family memories so beautifully.',
          eventDate: 'February 2026',
          isFeatured: true,
        },
        {
          customerName: 'Deepak & Sneha Kulkarni',
          eventType: 'Engagement & Ceremony',
          rating: 5,
          comment:
            'The ring ceremony shots and candid guest smiles were captured to perfection. The team is warm, energetic, and extremely dedicated. Highly recommended for any signature celebration!',
          eventDate: 'December 2025',
          isFeatured: true,
        },
      ]);
    console.log('[Seed]: Database initialized successfully with all default data!');
    return true;
  } catch (err) {
    console.error('[Seed Error]:', err);
    return false;
  }
};

if (require.main === module) {
  seedDB().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = { seedDefaultsIfEmpty: seedDB };
