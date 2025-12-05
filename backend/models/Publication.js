const mongoose = require("mongoose");

const publicationSchema = new mongoose.Schema({
  citation_id: {
    type: String,
    unique: true,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  authors: {
    type: [String],
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  month: {
    type: Number,
    min: 1,
    max: 12,
  },
  volume: {
    type: String,
    trim: true,
  },
  issue: {
    type: String,
    trim: true,
  },
  journal: {
    type: String,
    trim: true,
  },
  doi: {
    type: String,
    trim: true,
    unique: true,
    sparse: true,
  },
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: false,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Publication", publicationSchema);
