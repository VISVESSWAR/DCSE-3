const mongoose = require('mongoose');

const publicationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  authors: {
    type: [String],
    required: true
  },
  publicationDate: {
    type: Date,
    required: true
  },
  journal: {
    type: String,
    required: true,
    trim: true
  },
  doi: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Publication', publicationSchema);
