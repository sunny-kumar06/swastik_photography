const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    eventType: {
      type: String,
      required: [true, 'Event type is required'],
      enum: ['Wedding', 'Pre-Wedding', 'Birthday', 'Engagement', 'Portrait', 'Cinematic', 'Custom', 'Custom Event', 'Other'],
    },
    isCustomEvent: {
      type: Boolean,
      default: false,
    },
    customEventName: {
      type: String,
      default: '',
      trim: true,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package',
      required: false,
    },
    packageName: {
      type: String,
      required: [true, 'Package name is required'],
    },
    packagePrice: {
      type: Number,
      required: [true, 'Package price is required'],
      default: 0,
    },
    isMultiDay: {
      type: Boolean,
      default: false,
    },
    totalDays: {
      type: Number,
      default: 1,
      min: 1,
    },
    eventDates: {
      type: [String], // Array of YYYY-MM-DD
      default: [],
    },
    dayShifts: [
      {
        date: { type: String, required: true },
        timeSlot: { type: String, required: true },
      },
    ],
    eventDate: {
      type: String, // Format: YYYY-MM-DD (Primary / Start date)
      required: [true, 'Event date is required'],
    },
    eventTimeSlot: {
      type: String, // e.g. "Morning (08:00 AM - 01:00 PM)", "Evening (04:00 PM - 10:00 PM)", "Full Day (All Day Coverage)", or "Multi-Shift Schedule"
      required: [true, 'Time slot is required'],
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    customerPhone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    customerEmail: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
    },
    eventLocation: {
      type: String,
      required: [true, 'Event location is required'],
      trim: true,
    },
    additionalMessage: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rejected'],
      default: 'Pending',
    },
    adminNotes: {
      type: String,
      default: '',
    },
    isBlockedDate: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Helpful index to quickly check date and slot conflicts
bookingSchema.index({ eventDate: 1, eventTimeSlot: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
