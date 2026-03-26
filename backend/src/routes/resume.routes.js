const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const resumeParser = require('../services/resumeParser');
const Resume = require('../models/Resume');
const path = require('path');
const fs = require('fs');

/**
 * @route   POST /api/resume/upload
 * @desc    Upload and parse a resume
 * @access  Public
 */
router.post('/upload', upload.single('resume'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    const { path: filePath, originalname, mimetype } = req.file;
    const fileType = path.extname(originalname).slice(1).toLowerCase();

    console.log(`📄 Parsing resume: ${originalname}`);

    // Parse the resume
    const parsedData = await resumeParser.parseResume(filePath, fileType);

    // Save to database
    const resume = await Resume.create({
      fileName: originalname,
      fileType,
      filePath,
      parsedData,
    });

    res.status(201).json({
      success: true,
      message: 'Resume uploaded and parsed successfully',
      data: {
        resumeId: resume._id,
        fileName: resume.fileName,
        parsedData: resume.parsedData,
      },
    });
  } catch (error) {
    // Clean up uploaded file if parsing fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
});

/**
 * @route   GET /api/resume/:id
 * @desc    Get a resume by ID
 * @access  Public
 */
router.get('/:id', async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id).populate('jobDescriptionId');

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found',
      });
    }

    res.status(200).json({
      success: true,
      data: resume,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/resume/:id
 * @desc    Delete a resume
 * @access  Public
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found',
      });
    }

    // Delete file from filesystem
    if (fs.existsSync(resume.filePath)) {
      fs.unlinkSync(resume.filePath);
    }

    await resume.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/resume
 * @desc    Get all resumes
 * @access  Public
 */
router.get('/', async (req, res, next) => {
  try {
    const resumes = await Resume.find().sort({ createdAt: -1 }).limit(50);

    res.status(200).json({
      success: true,
      count: resumes.length,
      data: resumes,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
