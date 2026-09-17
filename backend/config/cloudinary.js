const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const getCloudName = () => (process.env.CLOUDINARY_CLOUD_NAME || '').trim();
const getApiKey = () => (process.env.CLOUDINARY_API_KEY || '').trim();
const getApiSecret = () => (process.env.CLOUDINARY_API_SECRET || '').trim();

const isCloudinaryConfigured = () => {
  return Boolean(getCloudName() && getApiKey() && getApiSecret());
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: getCloudName(),
    api_key: getApiKey(),
    api_secret: getApiSecret(),
  });
  console.log('[Cloudinary]: Cloud storage successfully initialized for', getCloudName());
} else {
  console.warn('[Cloudinary Warning]: Cloudinary credentials not fully provided. Falling back to local disk.');
}

// Local storage fallback directory
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

let storage;
if (isCloudinaryConfigured()) {
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'swastik_photography',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1920, quality: 'auto', fetch_format: 'auto' }],
    },
  });
} else {
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, 'photo-' + uniqueSuffix + ext);
    },
  });
}

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only JPG, PNG, and WEBP are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter,
});

const deleteImage = async (publicId) => {
  if (isCloudinaryConfigured() && publicId && !publicId.startsWith('local_')) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      console.error('[Cloudinary Delete Error]:', err.message);
    }
  } else if (publicId && publicId.startsWith('local_')) {
    const filename = publicId.replace('local_', '');
    const filepath = path.join(uploadDir, filename);
    if (fs.existsSync(filepath)) {
      try {
        fs.unlinkSync(filepath);
      } catch (err) {
        console.error('[Local File Delete Error]:', err.message);
      }
    }
  }
};

module.exports = {
  cloudinary,
  upload,
  isCloudinaryConfigured,
  deleteImage,
};
