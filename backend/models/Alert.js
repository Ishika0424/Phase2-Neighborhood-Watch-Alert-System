const mongoose = require('mongoose');

const alertSchema = mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Please add a title']
    },
    description: {
      type: String,
      required: [true, 'Please add a description']
    },
    category: {
      type: String,
      required: [true, 'Please specify an alert category'],
      enum: ['Suspicious Activity', 'Theft', 'Road Accident', 'Water Leakage', 'Power Outage', 'Emergency', 'Announcement', 'Other']
    },
    severity: {
      type: String,
      required: [true, 'Please select severity level'],
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium'
    },
    status: {
      type: String,
      required: true,
      enum: ['Active', 'Investigating', 'Resolved'],
      default: 'Active'
    },
    // Geolocation fields
    latitude: {
      type: Number,
      required: [true, 'Please provide latitude coordinate']
    },
    longitude: {
      type: Number,
      required: [true, 'Please provide longitude coordinate']
    },
    locationName: {
      type: String,
      required: [true, 'Please provide location description / address']
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Alert', alertSchema);
