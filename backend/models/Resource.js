const mongoose = require('mongoose');

const resourceSchema = mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: [true, 'Please add a resource name']
    },
    description: {
      type: String,
      required: [true, 'Please add a description']
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      enum: ['Tools', 'Books', 'Equipment', 'Electronics', 'Educational', 'Other']
    },
    availabilityStatus: {
      type: String,
      required: true,
      enum: ['Available', 'Requested', 'Borrowed'],
      default: 'Available'
    },
    location: {
      type: String,
      required: [true, 'Please specify resource location']
    },
    borrowedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    requests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Resource', resourceSchema);
