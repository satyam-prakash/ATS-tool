const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: false, // Optional for now (no auth yet)
    },
    fileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ['pdf', 'docx', 'doc'],
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    parsedData: {
      contactInfo: {
        name: String,
        email: String,
        phone: String,
        location: String,
        linkedin: String,
        github: String,
      },
      summary: String,
      experience: [
        {
          company: String,
          position: String,
          duration: String,
          description: String,
        },
      ],
      education: [
        {
          institution: String,
          degree: String,
          field: String,
          year: String,
        },
      ],
      skills: [String],
      certifications: [String],
      projects: [
        {
          name: String,
          description: String,
          technologies: [String],
        },
      ],
      rawText: String, // Full extracted text
    },
    atsScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    suggestions: [
      {
        category: {
          type: String,
          enum: ['keywords', 'formatting', 'content', 'structure'],
        },
        priority: {
          type: String,
          enum: ['high', 'medium', 'low'],
        },
        suggestion: String,
      },
    ],
    jobDescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobDescription',
    },
  },
  {
    timestamps: true,
  }
);

// Clean up file when resume is deleted
resumeSchema.pre('remove', async function (next) {
  const fs = require('fs');
  if (fs.existsSync(this.filePath)) {
    fs.unlinkSync(this.filePath);
  }
  next();
});

module.exports = mongoose.model('Resume', resumeSchema);
