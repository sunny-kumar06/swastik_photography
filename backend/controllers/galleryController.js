const Gallery = require('../models/Gallery');
const { deleteImage, isCloudinaryConfigured } = require('../config/cloudinary');

// @desc    Get all gallery photos (Public)
// @route   GET /api/gallery
// @access  Public
const getGalleryPhotos = async (req, res, next) => {
  try {
    const { category, featured } = req.query;
    const filter = {};

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (featured === 'true') {
      filter.isFeatured = true;
    }

    const photos = await Gallery.find(filter).sort({ order: 1, createdAt: -1 });

    res.json({
      success: true,
      count: photos.length,
      data: photos,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single gallery photo
// @route   GET /api/gallery/:id
// @access  Public
const getGalleryPhotoById = async (req, res, next) => {
  try {
    const photo = await Gallery.findById(req.params.id);
    if (!photo) {
      return res.status(404).json({ success: false, message: 'Photo not found' });
    }
    res.json({ success: true, data: photo });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload new gallery photo (Admin)
// @route   POST /api/gallery
// @access  Private (Admin)
const uploadPhoto = async (req, res, next) => {
  try {
    const { title, category, description, isFeatured, aspectRatio, customImageUrl } = req.body;

    let imageUrl = '';
    let cloudinaryId = '';

    if (req.file) {
      const filePath = req.file.path || req.file.secure_url;
      if (isCloudinaryConfigured() && filePath) {
        imageUrl = filePath;
        cloudinaryId = req.file.filename || '';
      } else {
        // Local file fallback
        imageUrl = `/uploads/${req.file.filename}`;
        cloudinaryId = `local_${req.file.filename}`;
      }
    } else if (customImageUrl && customImageUrl.trim()) {
      imageUrl = customImageUrl.trim();
      cloudinaryId = '';
    } else {
      return res.status(400).json({ success: false, message: 'Please upload an image file or provide an image URL' });
    }

    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const photo = await Gallery.create({
      title: title.trim(),
      category: category || 'Wedding',
      imageUrl,
      cloudinaryId,
      description: description ? description.trim() : '',
      isFeatured: isFeatured === true || isFeatured === 'true',
      aspectRatio: aspectRatio || 'landscape',
    });

    res.status(201).json({
      success: true,
      message: 'Photo uploaded successfully',
      data: photo,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update gallery photo details (Admin)
// @route   PUT /api/gallery/:id
// @access  Private (Admin)
const updatePhoto = async (req, res, next) => {
  try {
    const { title, category, description, isFeatured, aspectRatio, order, customImageUrl } = req.body;
    const photo = await Gallery.findById(req.params.id);

    if (!photo) {
      return res.status(404).json({ success: false, message: 'Photo not found' });
    }

    if (title !== undefined) photo.title = title.trim();
    if (category !== undefined) photo.category = category;
    if (description !== undefined) photo.description = description.trim();
    if (isFeatured !== undefined) photo.isFeatured = isFeatured === true || isFeatured === 'true';
    if (aspectRatio !== undefined) photo.aspectRatio = aspectRatio;
    if (order !== undefined) photo.order = Number(order);

    // If custom image URL is provided in edit
    if (customImageUrl && customImageUrl.trim()) {
      if (photo.cloudinaryId) {
        await deleteImage(photo.cloudinaryId);
      }
      photo.imageUrl = customImageUrl.trim();
      photo.cloudinaryId = '';
    }

    // If a new file was uploaded during edit
    if (req.file) {
      // Remove old image
      if (photo.cloudinaryId) {
        await deleteImage(photo.cloudinaryId);
      }
      const filePath = req.file.path || req.file.secure_url;
      if (isCloudinaryConfigured() && filePath) {
        photo.imageUrl = filePath;
        photo.cloudinaryId = req.file.filename || '';
      } else {
        photo.imageUrl = `/uploads/${req.file.filename}`;
        photo.cloudinaryId = `local_${req.file.filename}`;
      }
    }

    const updatedPhoto = await photo.save();

    res.json({
      success: true,
      message: 'Photo updated successfully',
      data: updatedPhoto,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete gallery photo (Admin)
// @route   DELETE /api/gallery/:id
// @access  Private (Admin)
const deletePhoto = async (req, res, next) => {
  try {
    const photo = await Gallery.findById(req.params.id);

    if (!photo) {
      return res.status(404).json({ success: false, message: 'Photo not found' });
    }

    if (photo.cloudinaryId) {
      await deleteImage(photo.cloudinaryId);
    }

    await photo.deleteOne();

    res.json({
      success: true,
      message: 'Photo deleted successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGalleryPhotos,
  getGalleryPhotoById,
  uploadPhoto,
  updatePhoto,
  deletePhoto,
};
