const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/environment');

class AIService {
  constructor() {
    // Initialize OpenAI
    if (config.openaiApiKey) {
      this.openai = new OpenAI({
        apiKey: config.openaiApiKey,
      });
      this.aiProvider = 'openai';
      console.log('✅ OpenAI initialized');
    }
    // Initialize Gemini as fallback
    else if (config.geminiApiKey) {
      this.gemini = new GoogleGenerativeAI(config.geminiApiKey);
      this.geminiModel = this.gemini.getGenerativeModel({ model: 'gemini-2.5-flash' });
      this.aiProvider = 'gemini';
      console.log('✅ Gemini AI initialized');
    } else {
      console.warn('⚠️  No AI API keys configured. AI features will not work.');
      this.aiProvider = null;
    }
  }

  /**
   * Generate AI response using configured provider
   * @param {string} prompt - The prompt to send to AI
   * @param {object} options - Additional options
   * @returns {Promise<string>} - AI response
   */
  async generateResponse(prompt, options = {}) {
    if (!this.aiProvider) {
      throw new Error('No AI provider configured. Please set OPENAI_API_KEY or GEMINI_API_KEY');
    }

    try {
      if (this.aiProvider === 'openai') {
        return await this.generateOpenAIResponse(prompt, options);
      } else {
        return await this.generateGeminiResponse(prompt, options);
      }
    } catch (error) {
      console.error(`AI Service Error (${this.aiProvider}):`, error.message);
      throw new Error(`Failed to generate AI response: ${error.message}`);
    }
  }

  /**
   * Generate response using OpenAI
   * @param {string} prompt - The prompt
   * @param {object} options - Options
   * @returns {Promise<string>} - Response
   */
  async generateOpenAIResponse(prompt, options = {}) {
    const response = await this.openai.chat.completions.create({
      model: options.model || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert ATS (Applicant Tracking System) resume analyzer and career coach. Provide detailed, actionable feedback to help job seekers optimize their resumes.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2000,
    });

    return response.choices[0].message.content;
  }

  /**
   * Generate response using Gemini
   * @param {string} prompt - The prompt
   * @param {object} options - Options
   * @returns {Promise<string>} - Response
   */
  async generateGeminiResponse(prompt, options = {}) {
    const systemPrompt =
      'You are an expert ATS (Applicant Tracking System) resume analyzer and career coach. Provide detailed, actionable feedback to help job seekers optimize their resumes.';
    const fullPrompt = `${systemPrompt}\n\n${prompt}`;

    const result = await this.geminiModel.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  }

  /**
   * Analyze resume and calculate ATS score
   * @param {Object} resumeData - Parsed resume data
   * @param {string} jobDescription - Job description text
   * @returns {Promise<Object>} - ATS analysis result
   */
  async analyzeResume(resumeData, jobDescription) {
    const prompt = `
Analyze this resume against the job description and provide a comprehensive ATS (Applicant Tracking System) score and feedback.

**Job Description:**
${jobDescription}

**Resume Content:**
Name: ${resumeData.contactInfo?.name || 'Not provided'}
Email: ${resumeData.contactInfo?.email || 'Not provided'}
Skills: ${resumeData.skills?.join(', ') || 'Not provided'}
Experience: ${JSON.stringify(resumeData.experience) || 'Not provided'}
Education: ${JSON.stringify(resumeData.education) || 'Not provided'}
Summary: ${resumeData.summary || 'Not provided'}

**Analysis Requirements:**
1. Calculate an ATS Score (0-100) based on:
   - Keyword matching with job description (40%)
   - Formatting and ATS-friendliness (20%)
   - Section completeness and structure (20%)
   - Content quality and relevance (20%)

2. Identify missing keywords from the job description

3. List formatting issues that might hurt ATS parsing

4. Provide section-by-section improvement suggestions with specific priorities

5. Give specific action items to increase the score

**Respond in the following JSON format:**
{
  "atsScore": <number between 0-100>,
  "scoreBreakdown": {
    "keywordMatch": <number>,
    "formatting": <number>,
    "completeness": <number>,
    "contentQuality": <number>
  },
  "missingKeywords": ["keyword1", "keyword2", ...],
  "formattingIssues": ["issue1", "issue2", ...],
  "suggestions": [
    {
      "category": "keywords|formatting|content|structure",
      "priority": "high|medium|low",
      "suggestion": "specific suggestion text"
    }
  ],
  "actionItems": ["action1", "action2", ...],
  "overallFeedback": "comprehensive feedback paragraph"
}
`;

    const response = await this.generateResponse(prompt);

    // Parse JSON response
    try {
      // Extract JSON from markdown code blocks if present
      let jsonText = response;
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }

      return JSON.parse(jsonText);
    } catch (error) {
      console.error('Failed to parse AI response as JSON:', error);
      // Return a fallback structure
      return {
        atsScore: 50,
        scoreBreakdown: {
          keywordMatch: 50,
          formatting: 50,
          completeness: 50,
          contentQuality: 50,
        },
        missingKeywords: [],
        formattingIssues: [],
        suggestions: [
          {
            category: 'content',
            priority: 'high',
            suggestion: 'Error parsing AI response. Please try again.',
          },
        ],
        actionItems: ['Retry analysis'],
        overallFeedback: response,
      };
    }
  }

  /**
   * Generate improved resume content
   * @param {Object} resumeData - Parsed resume data
   * @param {string} jobDescription - Job description
   * @param {number} currentScore - Current ATS score
   * @returns {Promise<Object>} - Improved resume suggestions
   */
  async improveResume(resumeData, jobDescription, currentScore) {
    const prompt = `
As an expert resume writer, improve this resume to better match the job description and increase its ATS score from ${currentScore}/100.

**Job Description:**
${jobDescription}

**Current Resume Content:**
${JSON.stringify(resumeData, null, 2)}

**Instructions:**
1. Naturally incorporate relevant keywords from the job description
2. Improve bullet points with strong action verbs and quantifiable metrics
3. Ensure ATS-friendly formatting
4. Optimize content for the specific role
5. Maintain the original structure and authenticity

**Provide improved versions of:**
- Professional Summary
- Experience bullet points (for each role)
- Skills list (optimized and organized)
- Specific keyword additions

**Respond in JSON format:**
{
  "improvedSummary": "enhanced summary text",
  "improvedExperience": [
    {
      "position": "role title",
      "bulletPoints": ["improved bullet 1", "improved bullet 2", ...]
    }
  ],
  "improvedSkills": ["skill1", "skill2", ...],
  "keywordAdditions": ["keyword1", "keyword2", ...],
  "improvementNotes": "notes on what was changed and why"
}
`;

    const response = await this.generateResponse(prompt, { maxTokens: 3000 });

    try {
      let jsonText = response;
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }

      return JSON.parse(jsonText);
    } catch (error) {
      console.error('Failed to parse improvement response:', error);
      return {
        improvedSummary: resumeData.summary || '',
        improvedExperience: resumeData.experience || [],
        improvedSkills: resumeData.skills || [],
        keywordAdditions: [],
        improvementNotes: 'Error generating improvements. Please try again.',
      };
    }
  }

  /**
   * Extract keywords from job description
   * @param {string} jobDescription - Job description text
   * @returns {Promise<Array>} - Array of keywords
   */
  async extractKeywords(jobDescription) {
    const prompt = `
Extract the most important keywords, skills, technologies, and qualifications from this job description.
Focus on:
- Technical skills and tools
- Required qualifications
- Soft skills
- Industry-specific terms
- Action verbs
- Certifications

Job Description:
${jobDescription}

Return only a JSON array of keywords: ["keyword1", "keyword2", ...]
`;

    const response = await this.generateResponse(prompt, { maxTokens: 500 });

    try {
      let jsonText = response;
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }

      return JSON.parse(jsonText);
    } catch (error) {
      console.error('Failed to parse keywords:', error);
      // Fallback: extract words that look like skills/keywords
      const words = jobDescription
        .split(/[\s,.:;!?()]+/)
        .filter((word) => word.length > 3)
        .slice(0, 20);
      return words;
    }
  }
}

module.exports = new AIService();
