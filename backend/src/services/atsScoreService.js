const aiService = require('./aiService');

class ATSScoreService {
  /**
   * Analyze resume and calculate ATS score
   * @param {Object} resumeData - Parsed resume data
   * @param {string} jobDescription - Job description text
   * @returns {Promise<Object>} - Analysis result with score and suggestions
   */
  async analyzeResumeATS(resumeData, jobDescription) {
    try {
      console.log('🔍 Analyzing resume with AI...');

      // Use AI service to analyze
      const analysis = await aiService.analyzeResume(resumeData, jobDescription);

      // Validate score
      if (typeof analysis.atsScore !== 'number' || analysis.atsScore < 0 || analysis.atsScore > 100) {
        analysis.atsScore = this.calculateFallbackScore(resumeData, jobDescription);
      }

      return analysis;
    } catch (error) {
      console.error('Error in ATS analysis:', error);

      // Fallback to rule-based analysis if AI fails
      return this.fallbackAnalysis(resumeData, jobDescription);
    }
  }

  /**
   * Calculate fallback ATS score using rule-based approach
   * @param {Object} resumeData - Resume data
   * @param {string} jobDescription - Job description
   * @returns {number} - Score 0-100
   */
  calculateFallbackScore(resumeData, jobDescription) {
    let score = 0;

    // Contact info completeness (20 points)
    if (resumeData.contactInfo) {
      if (resumeData.contactInfo.email) score += 5;
      if (resumeData.contactInfo.phone) score += 5;
      if (resumeData.contactInfo.name) score += 5;
      if (resumeData.contactInfo.linkedin || resumeData.contactInfo.github) score += 5;
    }

    // Experience section (25 points)
    if (resumeData.experience && resumeData.experience.length > 0) {
      score += Math.min(25, resumeData.experience.length * 8);
    }

    // Education section (15 points)
    if (resumeData.education && resumeData.education.length > 0) {
      score += 15;
    }

    // Skills section (20 points)
    if (resumeData.skills && resumeData.skills.length > 0) {
      score += Math.min(20, resumeData.skills.length * 2);
    }

    // Keyword matching (20 points)
    const keywordScore = this.calculateKeywordMatch(resumeData, jobDescription);
    score += keywordScore;

    return Math.min(100, Math.round(score));
  }

  /**
   * Calculate keyword matching score
   * @param {Object} resumeData - Resume data
   * @param {string} jobDescription - Job description
   * @returns {number} - Keyword match score
   */
  calculateKeywordMatch(resumeData, jobDescription) {
    const jdWords = jobDescription.toLowerCase().split(/\s+/);
    const resumeText = JSON.stringify(resumeData).toLowerCase();

    // Extract important words from job description (length > 4)
    const importantWords = jdWords.filter((word) => word.length > 4 && /^[a-z]+$/.test(word));

    // Count matches
    let matches = 0;
    const uniqueWords = [...new Set(importantWords)];

    uniqueWords.forEach((word) => {
      if (resumeText.includes(word)) {
        matches++;
      }
    });

    // Calculate percentage and convert to 20-point scale
    const matchPercentage = uniqueWords.length > 0 ? matches / uniqueWords.length : 0;
    return Math.round(matchPercentage * 20);
  }

  /**
   * Fallback analysis when AI fails
   * @param {Object} resumeData - Resume data
   * @param {string} jobDescription - Job description
   * @returns {Object} - Basic analysis
   */
  fallbackAnalysis(resumeData, jobDescription) {
    const score = this.calculateFallbackScore(resumeData, jobDescription);

    return {
      atsScore: score,
      scoreBreakdown: {
        keywordMatch: this.calculateKeywordMatch(resumeData, jobDescription),
        formatting: resumeData.contactInfo?.email ? 20 : 10,
        completeness:
          (resumeData.experience?.length > 0 ? 10 : 0) + (resumeData.education?.length > 0 ? 10 : 0),
        contentQuality: resumeData.skills?.length > 5 ? 20 : 10,
      },
      missingKeywords: [],
      formattingIssues: [],
      suggestions: [
        {
          category: 'content',
          priority: 'high',
          suggestion:
            'AI analysis unavailable. Ensure your resume includes relevant keywords from the job description.',
        },
      ],
      actionItems: [
        'Add more relevant keywords from job description',
        'Include quantifiable achievements',
        'Use action verbs in experience descriptions',
      ],
      overallFeedback: `Your resume scored ${score}/100. This is a basic analysis. For detailed AI-powered suggestions, please configure an AI API key.`,
    };
  }
}

module.exports = new ATSScoreService();
