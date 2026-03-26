/**
 * Extract keywords from text using simple NLP techniques
 */
class KeywordExtractor {
  constructor() {
    // Common stop words to filter out
    this.stopWords = new Set([
      'the',
      'is',
      'at',
      'which',
      'on',
      'a',
      'an',
      'and',
      'or',
      'but',
      'in',
      'with',
      'to',
      'for',
      'of',
      'as',
      'by',
      'from',
      'be',
      'this',
      'that',
      'it',
      'are',
      'was',
      'will',
      'would',
      'should',
      'could',
      'has',
      'have',
      'had',
      'been',
      'being',
      'do',
      'does',
      'did',
      'can',
      'may',
      'might',
      'must',
      'shall',
      'their',
      'your',
      'our',
      'his',
      'her',
      'its',
      'we',
      'you',
      'they',
      'them',
      'these',
      'those',
      'able',
      'about',
      'all',
      'also',
      'am',
      'any',
      'both',
      'each',
      'few',
      'more',
      'most',
      'other',
      'some',
      'such',
      'than',
      'then',
      'there',
      'very',
      'well',
      'when',
      'where',
      'who',
      'why',
      'how',
    ]);

    // Technical skill patterns
    this.skillPatterns = [
      /\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)*\b/, // Capitalized words (e.g., "React", "Machine Learning")
      /\b[A-Z]{2,}\b/, // Acronyms (e.g., "AWS", "API")
      /\b\w+\.js\b/i, // JavaScript frameworks
      /\b\w+\+\+\b/, // Languages like C++
    ];
  }

  /**
   * Extract keywords from text
   * @param {string} text - Input text
   * @param {number} maxKeywords - Maximum number of keywords to return
   * @returns {Array<string>} - Array of keywords
   */
  extract(text, maxKeywords = 50) {
    if (!text || typeof text !== 'string') {
      return [];
    }

    // Extract all words
    const words = text
      .toLowerCase()
      .replace(/[^\w\s+.#]/g, ' ') // Keep +, ., # for tech terms
      .split(/\s+/)
      .filter((word) => word.length > 2);

    // Count word frequency
    const wordFreq = new Map();

    words.forEach((word) => {
      // Skip stop words
      if (this.stopWords.has(word)) return;

      // Increment count
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    });

    // Extract technical terms and proper nouns from original text
    const technicalTerms = this.extractTechnicalTerms(text);
    technicalTerms.forEach((term) => {
      const lower = term.toLowerCase();
      wordFreq.set(lower, (wordFreq.get(lower) || 0) + 2); // Boost technical terms
    });

    // Sort by frequency
    const sorted = Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxKeywords)
      .map(([word]) => word);

    return sorted;
  }

  /**
   * Extract technical terms and proper nouns
   * @param {string} text - Input text
   * @returns {Array<string>} - Technical terms
   */
  extractTechnicalTerms(text) {
    const terms = new Set();

    // Extract capitalized words and acronyms
    const capitalizedPattern = /\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)*\b/g;
    const acronymPattern = /\b[A-Z]{2,}\b/g;

    const capitalizedMatches = text.match(capitalizedPattern) || [];
    const acronyms = text.match(acronymPattern) || [];

    [...capitalizedMatches, ...acronyms].forEach((term) => {      // Filter out common non-technical capitalized words
      const lower = term.toLowerCase();
      if (!this.stopWords.has(lower) && term.length > 1) {
        terms.add(term);
      }
    });

    return Array.from(terms);
  }

  /**
   * Extract skills from resume text
   * @param {string} text - Resume text
   * @returns {Array<string>} - Extracted skills
   */
  extractSkills(text) {
    const commonSkills = [
      // Programming Languages
      'javascript', 'python', 'java', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin', 'go',
      'rust', 'typescript', 'sql', 'r', 'matlab', 'scala', 'perl',

      // Web Technologies
      'html', 'css', 'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask',
      'spring', 'asp.net', 'jquery', 'bootstrap', 'sass', 'webpack', 'babel',

      // Databases
      'mysql', 'postgresql', 'mongodb', 'redis', 'oracle', 'sql server', 'dynamodb',
      'cassandra', 'elasticsearch', 'firebase',

      // Cloud & DevOps
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'ci/cd', 'terraform',
      'ansible', 'linux', 'unix', 'nginx', 'apache',

      // Data Science & ML
      'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn',
      'pandas', 'numpy', 'data analysis', 'statistics', 'nlp', 'computer vision',

      // Other
      'agile', 'scrum', 'rest', 'api', 'microservices', 'graphql', 'redis', 'kafka',
      'rabbitmq', 'oauth', 'jwt', 'testing', 'unit testing', 'integration testing',
    ];

    const lowerText = text.toLowerCase();
    const foundSkills = [];

    commonSkills.forEach((skill) => {
      if (lowerText.includes(skill)) {
        foundSkills.push(skill);
      }
    });

    return foundSkills;
  }

  /**
   * Compare resume keywords with job description keywords
   * @param {string} resumeText - Resume text
   * @param {string} jobDescription - Job description text
   * @returns {Object} - Comparison result
   */
  compareKeywords(resumeText, jobDescription) {
    const resumeKeywords = new Set(this.extract(resumeText));
    const jdKeywords = new Set(this.extract(jobDescription));

    const matchingKeywords = [...resumeKeywords].filter((kw) => jdKeywords.has(kw));
    const missingKeywords = [...jdKeywords].filter((kw) => !resumeKeywords.has(kw));

    return {
      matchingKeywords,
      missingKeywords,
      matchPercentage:
        jdKeywords.size > 0 ? ((matchingKeywords.length / jdKeywords.size) * 100).toFixed(2) : 0,
      totalResumeKeywords: resumeKeywords.size,
      totalJobKeywords: jdKeywords.size,
    };
  }
}

module.exports = new KeywordExtractor();
