const Service = require('../models/Service');
const { deleteImage, isCloudinaryConfigured } = require('../config/cloudinary');

// @desc    Get all active services (Public)
// @route   GET /api/services
// @access  Public
const getServices = async (req, res, next) => {
  try {
    const services = await Service.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
    res.json({ success: true, count: services.length, data: services });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all services including inactive (Admin)
// @route   GET /api/services/admin/all
// @access  Private (Admin)
const getAllServicesAdmin = async (req, res, next) => {
  try {
    const services = await Service.find().sort({ order: 1, createdAt: 1 });
    res.json({ success: true, count: services.length, data: services });
  } catch (error) {
    next(error);
  }
};

// @desc    Create service (Admin)
// @route   POST /api/services
// @access  Private (Admin)
const createService = async (req, res, next) => {
  try {
    const { title, description, startingPrice, category, features, isActive, order, customImage } = req.body;

    let image = customImage || 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop';
    let cloudinaryId = '';

    if (req.file) {
      const filePath = req.file.path || req.file.secure_url;
      if (isCloudinaryConfigured() && filePath) {
        image = filePath;
        cloudinaryId = req.file.filename || '';
      } else {
        image = `/uploads/${req.file.filename}`;
        cloudinaryId = `local_${req.file.filename}`;
      }
    }

    if (!title || !description || startingPrice === undefined) {
      return res.status(400).json({ success: false, message: 'Title, description, and starting price are required' });
    }

    let parsedFeatures = [];
    if (Array.isArray(features)) {
      parsedFeatures = features;
    } else if (typeof features === 'string') {
      parsedFeatures = features.split(',').map((f) => f.trim()).filter(Boolean);
    }

    const service = await Service.create({
      title: title.trim(),
      description: description.trim(),
      startingPrice: Number(startingPrice),
      image,
      cloudinaryId,
      category: category || 'Photography',
      features: parsedFeatures,
      isActive: isActive !== undefined ? (isActive === true || isActive === 'true') : true,
      order: order ? Number(order) : 0,
    });

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update service (Admin)
// @route   PUT /api/services/:id
// @access  Private (Admin)
const updateService = async (req, res, next) => {
  try {
    const { title, description, startingPrice, category, features, isActive, order, customImage } = req.body;
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    if (title) service.title = title.trim();
    if (description) service.description = description.trim();
    if (startingPrice !== undefined) service.startingPrice = Number(startingPrice);
    if (category) service.category = category;
    if (isActive !== undefined) service.isActive = isActive === true || isActive === 'true';
    if (order !== undefined) service.order = Number(order);

    if (features !== undefined) {
      if (Array.isArray(features)) {
        service.features = features;
      } else if (typeof features === 'string') {
        service.features = features.split(',').map((f) => f.trim()).filter(Boolean);
      }
    }

    if (req.file) {
      if (service.cloudinaryId) {
        await deleteImage(service.cloudinaryId);
      }
      const filePath = req.file.path || req.file.secure_url;
      if (isCloudinaryConfigured() && filePath) {
        service.image = filePath;
        service.cloudinaryId = req.file.filename || '';
      } else {
        service.image = `/uploads/${req.file.filename}`;
        service.cloudinaryId = `local_${req.file.filename}`;
      }
    } else if (customImage && customImage.trim()) {
      if (service.cloudinaryId) {
        await deleteImage(service.cloudinaryId);
      }
      service.image = customImage.trim();
      service.cloudinaryId = '';
    }

    const updatedService = await service.save();

    res.json({
      success: true,
      message: 'Service updated successfully',
      data: updatedService,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete service (Admin)
// @route   DELETE /api/services/:id
// @access  Private (Admin)
const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    if (service.cloudinaryId) {
      await deleteImage(service.cloudinaryId);
    }

    await service.deleteOne();

    res.json({
      success: true,
      message: 'Service deleted successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getServices,
  getAllServicesAdmin,
  createService,
  updateService,
  deleteService,
};
