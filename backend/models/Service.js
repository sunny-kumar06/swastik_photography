const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Service title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    startingPrice: {
      type: Number,
      required: [true, 'Starting price is required'],
    },
    image: {
      type: String,
      required: [true, 'Service image is required'],
    },
    cloudinaryId: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: true,
      default: 'Photography',
    },
    features: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', serviceSchema);
