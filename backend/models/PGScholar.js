const mongoose = require('mongoose');

const pgScholarSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  registrationNumber: {
    type: String,
    required: true,
    unique: true
  },
  contactInfo: {
    email: {
      type: String,
      required: false,
      trim: true
    },
    phone: {
      type: String,
      required: false,
      trim: true
    }
  },
  areaOfResearch: {
    type: String,
    required: true,
    trim: true
  },
  supervisor: {
    type: String,
    default: '' // optional now, link to faculty ID later
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PGScholar', pgScholarSchema);
