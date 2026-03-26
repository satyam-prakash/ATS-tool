const mongoose = require('mongoose');

const jobDescriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: false, // Optional for now (no auth yet)
    },
    title: {
      type: String,
      required: true,
    },
    company: {
      type: String,
    },
    description: {
      type: String,
      required: true,
    },
    keywords: [String], // Extracted keywords
    requiredSkills: [String],
    preferredSkills: [String],
    experience: String,
    location: String,
    jobType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship', 'remote'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('JobDescription', jobDescriptionSchema);
