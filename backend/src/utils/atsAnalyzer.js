const keywordExtractor = require('./keywordExtractor');

/**
 * ATS Analyzer - Rule-based ATS scoring
 */
class ATSAnalyzer {
  /**
   * Analyze resume for ATS compatibility
   * @param {Object} resumeData - Parsed resume data
   * @param {string} jobDescription - Job description text
   * @returns {Object} - ATS analysis result
   */
  analyze(resumeData, jobDescription) {
    const scores = {
      keywordMatch: this.scoreKeywordMatch(resumeData, jobDescription),
      formatting: this.scoreFormatting(resumeData),
      completeness: this.scoreCompleteness(resumeData),
      contentQuality: this.scoreContentQuality(resumeData),
    };

    const totalScore = Math.round(
      scores.keywordMatch * 0.4 +
        scores.formatting * 0.2 +
        scores.completeness * 0.2 +
        scores.contentQuality * 0.2
    );

    return {
      atsScore: totalScore,
      scoreBreakdown: scores,
      issues: this.identifyIssues(resumeData, scores),
      suggestions: this.generateSuggestions(resumeData, scores, jobDescription),
    };
  }

  /**
   * Score keyword matching with job description
   * @param {Object} resumeData - Resume data
   * @param {string} jobDescription - Job description
   * @returns {number} - Score 0-100
   */
  scoreKeywordMatch(resumeData, jobDescription) {
    const resumeText = this.resumeToText(resumeData);
    const comparison = keywordExtractor.compareKeywords(resumeText, jobDescription);

    // Score based on match percentage
    return Math.min(100, parseInt(comparison.matchPercentage) + (comparison.matchingKeywords.length > 10 ? 20 : 0));
  }

  /**
   * Score resume formatting for ATS compatibility
   * @param {Object} resumeData - Resume data
   * @returns {number} - Score 0-100
   */
  scoreFormatting(resumeData) {
    let score = 100;

    // Check contact info clarity
    if (!resumeData.contactInfo?.email) score -= 15;
    if (!resumeData.contactInfo?.phone) score -= 10;
    if (!resumeData.contactInfo?.name) score -= 15;

    // Check for common ATS-unfriendly elements (we can't detect from text, so assume good)
    // In a real implementation, you'd check the original file

    return Math.max(0, score);
  }

  /**
   * Score completeness of resume sections
   * @param {Object} resumeData - Resume data
   * @returns {number} - Score 0-100
   */
  scoreCompleteness(resumeData) {
    let score = 0;

    // Contact info (25 points)
    if (resumeData.contactInfo?.name) score += 10;
    if (resumeData.contactInfo?.email) score += 10;
    if (resumeData.contactInfo?.phone) score += 5;

    // Experience section (30 points)
    if (resumeData.experience && resumeData.experience.length > 0) {
      score += 20;
      if (resumeData.experience.length >= 2) score += 10;
    }

    // Education section (20 points)
    if (resumeData.education && resumeData.education.length > 0) {
      score += 20;
    }

    // Skills section (15 points)
    if (resumeData.skills && resumeData.skills.length > 0) {
      score += 10;
      if (resumeData.skills.length >= 5) score += 5;
    }

    // Summary/Objective (10 points)
    if (resumeData.summary) score += 10;

    return Math.min(100, score);
  }

  /**
   * Score content quality
   * @param {Object} resumeData - Resume data
   * @returns {number} - Score 0-100
   */
  scoreContentQuality(resumeData) {
    let score = 60; // Base score

    // Check for action verbs in experience
    const actionVerbs = [
      'led',
      'managed',
      'developed',
      'created',
      'implemented',
      'designed',
      'built',
      'improved',
      'increased',
      'decreased',
      'achieved',
      'delivered',
      'established',
      'launched',
    ];

    const experienceText = JSON.stringify(resumeData.experience || []).toLowerCase();
    const verbCount = actionVerbs.filter((verb) => experienceText.includes(verb)).length;
    score += Math.min(20, verbCount * 3);

    // Check for metrics (numbers)
    const hasMetrics = /\d+%|\$\d+|\d+\+/.test(experienceText);
    if (hasMetrics) score += 20;

    return Math.min(100, score);
  }

  /**
   * Identify specific issues in resume
   * @param {Object} resumeData - Resume data
   * @param {Object} scores - Score breakdown
   * @returns {Array} - Array of issues
   */
  identifyIssues(resumeData, scores) {
    const issues = [];

    if (!resumeData.contactInfo?.email) {
      issues.push({ severity: 'high', issue: 'Missing email address' });
    }

    if (!resumeData.contactInfo?.phone) {
      issues.push({ severity: 'medium', issue: 'Missing phone number' });
    }

    if (!resumeData.experience || resumeData.experience.length === 0) {
      issues.push({ severity: 'high', issue: 'No work experience listed' });
    }

    if (!resumeData.skills || resumeData.skills.length < 5) {
      issues.push({ severity: 'medium', issue: 'Limited skills listed' });
    }

    if (!resumeData.summary) {
      issues.push({ severity: 'low', issue: 'No professional summary' });
    }

    if (scores.keywordMatch < 50) {
      issues.push({ severity: 'high', issue: 'Low keyword match with job description' });
    }

    return issues;
  }

  /**
   * Generate actionable suggestions
   * @param {Object} resumeData - Resume data
   * @param {Object} scores - Score breakdown
   * @param {string} jobDescription - Job description
   * @returns {Array} - Array of suggestions
   */
  generateSuggestions(resumeData, scores, jobDescription) {
    const suggestions = [];

    if (scores.keywordMatch < 70) {
      const comparison = keywordExtractor.compareKeywords(
        this.resumeToText(resumeData),
        jobDescription
      );

      suggestions.push({
        category: 'keywords',
        priority: 'high',
        suggestion: `Add these missing keywords: ${comparison.missingKeywords.slice(0, 10).join(', ')}`,
      });
    }

    if (!resumeData.summary || resumeData.summary.length < 100) {
      suggestions.push({
        category: 'content',
        priority: 'high',
        suggestion: 'Add a compelling professional summary that highlights your key qualifications',
      });
    }

    if (resumeData.experience && resumeData.experience.length > 0) {
      const hasMetrics = /\d+%|\$\d+|\d+\+/.test(JSON.stringify(resumeData.experience));
      if (!hasMetrics) {
        suggestions.push({
          category: 'content',
          priority: 'high',
          suggestion: 'Add quantifiable achievements to your experience (e.g., "Increased sales by 25%")',
        });
      }
    }

    if (!resumeData.skills || resumeData.skills.length < 10) {
      suggestions.push({
        category: 'content',
        priority: 'medium',
        suggestion: 'Expand your skills section with relevant technical and soft skills',
      });
    }

    if (scores.formatting < 80) {
      suggestions.push({
        category: 'formatting',
        priority: 'medium',
        suggestion: 'Ensure your resume uses a clean, ATS-friendly format with clear section headers',
      });
    }

    if (!resumeData.contactInfo?.linkedin && !resumeData.contactInfo?.github) {
      suggestions.push({
        category: 'structure',
        priority: 'low',
        suggestion: 'Add LinkedIn profile or GitHub link to showcase your professional presence',
      });
    }

    return suggestions;
  }

  /**
   * Convert resume data to plain text for analysis
   * @param {Object} resumeData - Resume data
   * @returns {string} - Plain text
   */
  resumeToText(resumeData) {
    return [
      resumeData.summary || '',
      JSON.stringify(resumeData.skills || []),
      JSON.stringify(resumeData.experience || []),
      JSON.stringify(resumeData.education || []),
      resumeData.rawText || '',
    ].join(' ');
  }
}

module.exports = new ATSAnalyzer();
