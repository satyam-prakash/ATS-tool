const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

class ResumeParser {
  /**
   * Parse resume file based on type
   * @param {string} filePath - Path to the resume file
   * @param {string} fileType - Type of file (pdf, doc, docx)
   * @returns {Promise<Object>} - Parsed resume data
   */
  async parseResume(filePath, fileType) {
    try {
      let rawText = '';

      if (fileType === 'pdf') {
        rawText = await this.parsePDF(filePath);
      } else if (fileType === 'docx' || fileType === 'doc') {
        rawText = await this.parseDOCX(filePath);
      } else {
        throw new Error(`Unsupported file type: ${fileType}`);
      }

      // Extract structured data from raw text
      const structuredData = this.extractStructuredData(rawText);

      return {
        rawText,
        ...structuredData,
      };
    } catch (error) {
      console.error('Error parsing resume:', error);
      throw new Error(`Failed to parse resume: ${error.message}`);
    }
  }

  /**
   * Parse PDF file
   * @param {string} filePath - Path to PDF file
   * @returns {Promise<string>} - Extracted text
   */
  async parsePDF(filePath) {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  }

  /**
   * Parse DOCX file
   * @param {string} filePath - Path to DOCX file
   * @returns {Promise<string>} - Extracted text
   */
  async parseDOCX(filePath) {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  /**
   * Extract structured data from raw text
   * @param {string} text - Raw text from resume
   * @returns {Object} - Structured resume data
   */
  extractStructuredData(text) {
    return {
      contactInfo: this.extractContactInfo(text),
      summary: this.extractSummary(text),
      experience: this.extractExperience(text),
      education: this.extractEducation(text),
      skills: this.extractSkills(text),
      certifications: this.extractCertifications(text),
      projects: this.extractProjects(text),
    };
  }

  /**
   * Extract contact information
   * @param {string} text - Resume text
   * @returns {Object} - Contact information
   */
  extractContactInfo(text) {
    const contactInfo = {
      name: null,
      email: null,
      phone: null,
      location: null,
      linkedin: null,
      github: null,
    };

    // Extract email
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const emailMatch = text.match(emailRegex);
    if (emailMatch) {
      contactInfo.email = emailMatch[0];
    }

    // Extract phone number (various formats)
    const phoneRegex = /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    const phoneMatch = text.match(phoneRegex);
    if (phoneMatch) {
      contactInfo.phone = phoneMatch[0];
    }

    // Extract LinkedIn
    const linkedinRegex = /(?:linkedin\.com\/in\/|linkedin\.com\/pub\/)([a-zA-Z0-9-]+)/i;
    const linkedinMatch = text.match(linkedinRegex);
    if (linkedinMatch) {
      contactInfo.linkedin = linkedinMatch[0];
    }

    // Extract GitHub
    const githubRegex = /(?:github\.com\/)([a-zA-Z0-9-]+)/i;
    const githubMatch = text.match(githubRegex);
    if (githubMatch) {
      contactInfo.github = githubMatch[0];
    }

    // Extract name (usually in the first few lines)
    const lines = text.split('\n').filter((line) => line.trim());
    if (lines.length > 0) {
      const firstLine = lines[0].trim();
      // Name is typically the first line if it's 2-4 words and doesn't contain special characters
      if (firstLine.split(' ').length <= 4 && !/[@\d().]/.test(firstLine)) {
        contactInfo.name = firstLine;
      }
    }

    return contactInfo;
  }

  /**
   * Extract professional summary
   * @param {string} text - Resume text
   * @returns {string|null} - Professional summary
   */
  extractSummary(text) {
    const summaryKeywords = [
      'summary',
      'profile',
      'objective',
      'about me',
      'professional summary',
      'career objective',
    ];

    const lines = text.split('\n');
    let summaryText = '';
    let capturing = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();

      // Check if line contains summary keywords
      if (summaryKeywords.some((keyword) => line.includes(keyword))) {
        capturing = true;
        continue;
      }

      // Stop capturing if we hit another section
      if (
        capturing &&
        (line.includes('experience') || line.includes('education') || line.includes('skills'))
      ) {
        break;
      }

      if (capturing && lines[i].trim()) {
        summaryText += lines[i].trim() + ' ';
      }
    }

    return summaryText.trim() || null;
  }

  /**
   * Extract work experience
   * @param {string} text - Resume text
   * @returns {Array} - Array of experience objects
   */
  extractExperience(text) {
    const experiences = [];
    const experienceKeywords = ['experience', 'work history', 'employment', 'work experience'];

    const lines = text.split('\n');
    let capturing = false;
    let currentExp = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();

      // Start capturing experience section
      if (!capturing && experienceKeywords.some((keyword) => line.includes(keyword))) {
        capturing = true;
        continue;
      }

      // Stop if we hit another major section
      if (
        capturing &&
        (line.includes('education') || line.includes('skills') || line.includes('certifications'))
      ) {
        if (currentExp) experiences.push(currentExp);
        break;
      }

      if (capturing && lines[i].trim()) {
        // Simple heuristic: if line has a year, it might be a job entry
        if (/\d{4}/.test(lines[i])) {
          if (currentExp) {
            experiences.push(currentExp);
          }
          currentExp = {
            company: '',
            position: lines[i].trim(),
            duration: '',
            description: '',
          };
        } else if (currentExp) {
          currentExp.description += lines[i].trim() + ' ';
        }
      }
    }

    if (currentExp) experiences.push(currentExp);

    return experiences;
  }

  /**
   * Extract education
   * @param {string} text - Resume text
   * @returns {Array} - Array of education objects
   */
  extractEducation(text) {
    const education = [];
    const educationKeywords = ['education', 'academic', 'qualification'];

    const lines = text.split('\n');
    let capturing = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();

      // Start capturing education section
      if (!capturing && educationKeywords.some((keyword) => line.includes(keyword))) {
        capturing = true;
        continue;
      }

      // Stop if we hit another major section
      if (capturing && (line.includes('experience') || line.includes('skills'))) {
        break;
      }

      if (capturing && lines[i].trim() && /\d{4}/.test(lines[i])) {
        education.push({
          institution: '',
          degree: lines[i].trim(),
          field: '',
          year: '',
        });
      }
    }

    return education;
  }

  /**
   * Extract skills
   * @param {string} text - Resume text
   * @returns {Array} - Array of skills
   */
  extractSkills(text) {
    const skills = [];
    const skillsKeywords = ['skills', 'technical skills', 'competencies', 'technologies'];

    const lines = text.split('\n');
    let capturing = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();

      // Start capturing skills section
      if (!capturing && skillsKeywords.some((keyword) => line.includes(keyword))) {
        capturing = true;
        continue;
      }

      // Stop if we hit another major section
      if (
        capturing &&
        (line.includes('experience') ||
          line.includes('education') ||
          line.includes('certification'))
      ) {
        break;
      }

      if (capturing && lines[i].trim()) {
        // Split by common delimiters
        const lineSkills = lines[i]
          .split(/[,;|•·]/)
          .map((s) => s.trim())
          .filter((s) => s);
        skills.push(...lineSkills);
      }
    }

    return skills;
  }

  /**
   * Extract certifications
   * @param {string} text - Resume text
   * @returns {Array} - Array of certifications
   */
  extractCertifications(text) {
    const certifications = [];
    const certKeywords = ['certification', 'certificates', 'licenses'];

    const lines = text.split('\n');
    let capturing = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();

      if (!capturing && certKeywords.some((keyword) => line.includes(keyword))) {
        capturing = true;
        continue;
      }

      if (
        capturing &&
        (line.includes('education') || line.includes('skills') || line.includes('project'))
      ) {
        break;
      }

      if (capturing && lines[i].trim()) {
        certifications.push(lines[i].trim());
      }
    }

    return certifications;
  }

  /**
   * Extract projects
   * @param {string} text - Resume text
   * @returns {Array} - Array of projects
   */
  extractProjects(text) {
    const projects = [];
    const projectKeywords = ['projects', 'personal projects', 'portfolio'];

    const lines = text.split('\n');
    let capturing = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();

      if (!capturing && projectKeywords.some((keyword) => line.includes(keyword))) {
        capturing = true;
        continue;
      }

      if (capturing && (line.includes('education') || line.includes('skills'))) {
        break;
      }

      if (capturing && lines[i].trim()) {
        projects.push({
          name: lines[i].trim(),
          description: '',
          technologies: [],
        });
      }
    }

    return projects;
  }
}

module.exports = new ResumeParser();
