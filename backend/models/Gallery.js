const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Photo title is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Wedding', 'Pre-Wedding', 'Birthday', 'Engagement', 'Portrait', 'Cinematic', 'Other'],
      default: 'Wedding',
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    cloudinaryId: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    aspectRatio: {
      type: String,
      enum: ['portrait', 'landscape', 'square'],
      default: 'landscape',
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

gallerySchema.index({ category: 1, isFeatured: 1, createdAt: -1 });
gallerySchema.index({ order: 1, createdAt: -1 });

module.exports = mongoose.model('Gallery', gallerySchema);
