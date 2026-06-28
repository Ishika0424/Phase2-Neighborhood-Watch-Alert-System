const mongoose = require('mongoose');

const skillRequestSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: [true, 'Please add a message with your request']
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Declined'],
      default: 'Pending'
    }
  },
  {
    timestamps: true
  }
);

const skillSchema = mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Please add a service title']
    },
    description: {
      type: String,
      required: [true, 'Please add a description']
    },
    category: {
      type: String,
      required: [true, 'Please specify a category'],
      enum: ['Tutoring', 'Technical Support', 'Home Maintenance', 'Mentorship', 'Other']
    },
    availability: {
      type: String,
      required: [true, 'Please state availability (e.g., weekends, evenings)']
    },
    requests: [skillRequestSchema]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Skill', skillSchema);
