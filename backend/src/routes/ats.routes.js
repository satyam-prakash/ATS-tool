const express = require('express');
const router = express.Router();
const atsScoreService = require('../services/atsScoreService');
const aiService = require('../services/aiService');
const Resume = require('../models/Resume');
const JobDescription = require('../models/JobDescription');
const keywordExtractor = require('../utils/keywordExtractor');

/**
 * @route   POST /api/ats/analyze
 * @desc    Analyze resume against job description and calculate ATS score
 * @access  Public
 */
router.post('/analyze', async (req, res, next) => {
  try {
    const { resumeId, jobDescription } = req.body;

    if (!resumeId) {
      return res.status(400).json({
        success: false,
        error: 'Resume ID is required',
      });
    }

    if (!jobDescription) {
      return res.status(400).json({
        success: false,
        error: 'Job description is required',
      });
    }

    // Get resume from database
    const resume = await Resume.findById(resumeId);

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found',
      });
    }

    console.log(`📊 Analyzing resume ${resumeId} against job description...`);

    // Perform ATS analysis
    const analysis = await atsScoreService.analyzeResumeATS(resume.parsedData, jobDescription);

    // Update resume with score and suggestions
    resume.atsScore = analysis.atsScore;
    resume.suggestions = analysis.suggestions || [];

    // Save job description
    const jobDescriptionDoc = await JobDescription.create({
      title: 'Job Application',
      description: jobDescription,
      keywords: analysis.missingKeywords || [],
    });

    resume.jobDescriptionId = jobDescriptionDoc._id;
    await resume.save();

    res.status(200).json({
      success: true,
      message: 'ATS analysis completed',
      data: {
        resumeId: resume._id,
        atsScore: analysis.atsScore,
        scoreBreakdown: analysis.scoreBreakdown,
        missingKeywords: analysis.missingKeywords,
        formattingIssues: analysis.formattingIssues,
        suggestions: analysis.suggestions,
        actionItems: analysis.actionItems,
        overallFeedback: analysis.overallFeedback,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/ats/improve
 * @desc    Get AI-powered suggestions to improve resume
 * @access  Public
 */
router.post('/improve', async (req, res, next) => {
  try {
    const { resumeId, jobDescription } = req.body;

    if (!resumeId || !jobDescription) {
      return res.status(400).json({
        success: false,
        error: 'Resume ID and job description are required',
      });
    }

    const resume = await Resume.findById(resumeId);

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found',
      });
    }

    console.log(`✨ Generating improvement suggestions for resume ${resumeId}...`);

    // Generate improvements using AI
    const improvements = await aiService.improveResume(
      resume.parsedData,
      jobDescription,
      resume.atsScore || 50
    );

    res.status(200).json({
      success: true,
      message: 'Resume improvements generated',
      data: improvements,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/ats/keywords
 * @desc    Extract keywords from job description
 * @access  Public
 */
router.post('/keywords', async (req, res, next) => {
  try {
    const { jobDescription } = req.body;

    if (!jobDescription) {
      return res.status(400).json({
        success: false,
        error: 'Job description is required',
      });
    }

    let keywords;

    // Try AI extraction first, fallback to rule-based
    try {
      keywords = await aiService.extractKeywords(jobDescription);
    } catch (error) {
      console.log('AI keyword extraction failed, using rule-based approach');
      keywords = keywordExtractor.extract(jobDescription, 30);
    }

    res.status(200).json({
      success: true,
      data: {
        keywords,
        count: keywords.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/ats/compare
 * @desc    Compare resume keywords with job description keywords
 * @access  Public
 */
router.post('/compare', async (req, res, next) => {
  try {
    const { resumeId, jobDescription } = req.body;

    if (!resumeId || !jobDescription) {
      return res.status(400).json({
        success: false,
        error: 'Resume ID and job description are required',
      });
    }

    const resume = await Resume.findById(resumeId);

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found',
      });
    }

    const resumeText = JSON.stringify(resume.parsedData);
    const comparison = keywordExtractor.compareKeywords(resumeText, jobDescription);

    res.status(200).json({
      success: true,
      data: comparison,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/ats/score/:resumeId
 * @desc    Get ATS score for a specific resume
 * @access  Public
 */
router.get('/score/:resumeId', async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.resumeId).populate('jobDescriptionId');

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        resumeId: resume._id,
        fileName: resume.fileName,
        atsScore: resume.atsScore,
        suggestions: resume.suggestions,
        jobDescription: resume.jobDescriptionId,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
