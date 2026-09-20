const Package = require('../models/Package');

// @desc    Get active packages for public site (filter by category if query provided)
// @route   GET /api/packages
// @access  Public
const getPackages = async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = { isActive: true };

    if (category && category !== 'All') {
      filter.category = category;
    }

    const packages = await Package.find(filter).sort({ order: 1, price: 1 }).lean();
    res.setHeader('Cache-Control', 'public, max-age=120, stale-while-revalidate=600');
    res.json({ success: true, count: packages.length, data: packages });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all packages including inactive (Admin)
// @route   GET /api/packages/admin/all
// @access  Private (Admin)
const getAllPackagesAdmin = async (req, res, next) => {
  try {
    const packages = await Package.find().sort({ order: 1, price: 1 });
    res.json({ success: true, count: packages.length, data: packages });
  } catch (error) {
    next(error);
  }
};

// @desc    Create package (Admin)
// @route   POST /api/packages
// @access  Private (Admin)
const createPackage = async (req, res, next) => {
  try {
    const { name, category, price, priceUnit = 'fixed', description, features, isPopular, isActive, deliveryDays, order } = req.body;

    if (!name || price === undefined || !description) {
      return res.status(400).json({ success: false, message: 'Package name, price, and description are required' });
    }

    let parsedFeatures = [];
    if (Array.isArray(features)) {
      parsedFeatures = features;
    } else if (typeof features === 'string') {
      parsedFeatures = features.split('\n').map((f) => f.trim()).filter(Boolean);
    }

    // Normalize priceUnit
    let validUnit = 'fixed';
    if (priceUnit === 'per_day' || priceUnit === 'per day') validUnit = 'per_day';
    else if (priceUnit === 'per_hour' || priceUnit === 'per hour' || priceUnit === 'per_hr') validUnit = 'per_hour';

    const newPackage = await Package.create({
      name: name.trim(),
      category: category || 'Wedding',
      price: Number(price),
      priceUnit: validUnit,
      description: description.trim(),
      features: parsedFeatures,
      isPopular: isPopular === true || isPopular === 'true',
      isActive: isActive !== undefined ? (isActive === true || isActive === 'true') : true,
      deliveryDays: deliveryDays ? Number(deliveryDays) : 15,
      order: order ? Number(order) : 0,
    });

    res.status(201).json({
      success: true,
      message: 'Package created successfully',
      data: newPackage,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update package (Admin)
// @route   PUT /api/packages/:id
// @access  Private (Admin)
const updatePackage = async (req, res, next) => {
  try {
    const { name, category, price, priceUnit, description, features, isPopular, isActive, deliveryDays, order } = req.body;
    const pkg = await Package.findById(req.params.id);

    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    if (name) pkg.name = name.trim();
    if (category) pkg.category = category;
    if (price !== undefined) pkg.price = Number(price);
    if (priceUnit !== undefined) {
      let validUnit = 'fixed';
      if (priceUnit === 'per_day' || priceUnit === 'per day') validUnit = 'per_day';
      else if (priceUnit === 'per_hour' || priceUnit === 'per hour' || priceUnit === 'per_hr') validUnit = 'per_hour';
      pkg.priceUnit = validUnit;
    }
    if (description) pkg.description = description.trim();
    if (isPopular !== undefined) pkg.isPopular = isPopular === true || isPopular === 'true';
    if (isActive !== undefined) pkg.isActive = isActive === true || isActive === 'true';
    if (deliveryDays !== undefined) pkg.deliveryDays = Number(deliveryDays);
    if (order !== undefined) pkg.order = Number(order);

    if (features !== undefined) {
      if (Array.isArray(features)) {
        pkg.features = features;
      } else if (typeof features === 'string') {
        pkg.features = features.split('\n').map((f) => f.trim()).filter(Boolean);
      }
    }

    const updatedPackage = await pkg.save();

    res.json({
      success: true,
      message: 'Package updated successfully',
      data: updatedPackage,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete package (Admin)
// @route   DELETE /api/packages/:id
// @access  Private (Admin)
const deletePackage = async (req, res, next) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    await pkg.deleteOne();

    res.json({
      success: true,
      message: 'Package deleted successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPackages,
  getAllPackagesAdmin,
  createPackage,
  updatePackage,
  deletePackage,
};
