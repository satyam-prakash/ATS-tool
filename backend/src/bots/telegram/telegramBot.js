const TelegramBot = require('node-telegram-bot-api');
const config = require('../../config/environment');
const resumeParser = require('../../services/resumeParser');
const atsScoreService = require('../../services/atsScoreService');
const fs = require('fs');
const path = require('path');
const https = require('https');

if (!config.telegramBotToken) {
  console.log('⚠️  Telegram bot token not configured. Skipping Telegram bot initialization.');
  module.exports = null;
  return;
}

// Create bot instance
const bot = new TelegramBot(config.telegramBotToken, { polling: true });

// Store user states for multi-step interaction
const userStates = new Map();

console.log('✅ Telegram Bot initialized');

// Command handlers
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  const welcomeMessage = `
🤖 *Welcome to ATS Resume Optimizer Bot!*

I help you optimize your resume for Applicant Tracking Systems.

*How to use:*
1. Send /analyze to start
2. Upload your resume (PDF/DOCX)
3. Paste the job description
4. Get instant feedback!

*Commands:*
/analyze - Analyze your resume
/help - Show help message
/cancel - Cancel current operation

Let's get started! 🚀
  `;

  bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;

  const helpMessage = `
📖 *ATS Resume Optimizer - Help*

*What I analyze:*
• ATS compatibility score (0-100)
• Missing keywords from job description
• Formatting issues
• Actionable improvement suggestions

*Supported file formats:*
PDF, DOC, DOCX (Max 10MB)

*Commands:*
/analyze - Start resume analysis
/help - Show this help message
/cancel - Cancel current operation

*Process:*
1. Send /analyze
2. Upload your resume file
3. Paste the job description
4. Receive detailed analysis

Need help? Just send /help anytime!
  `;

  bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

bot.onText(/\/analyze/, (msg) => {
  const chatId = msg.chat.id;

  userStates.set(chatId, {
    step: 'waiting_for_resume',
    resumePath: null,
    jobDescription: null,
  });

  bot.sendMessage(
    chatId,
    '📄 *Step 1/2: Upload Resume*\n\nPlease upload your resume file (PDF, DOC, or DOCX).\n\nMax file size: 10MB',
    { parse_mode: 'Markdown' }
  );
});

bot.onText(/\/cancel/, (msg) => {
  const chatId = msg.chat.id;

  if (userStates.has(chatId)) {
    userStates.delete(chatId);
    bot.sendMessage(chatId, '❌ Operation cancelled. Send /analyze to start again.');
  } else {
    bot.sendMessage(chatId, 'No active operation to cancel.');
  }
});

// Handle document uploads
bot.on('document', async (msg) => {
  const chatId = msg.chat.id;
  const state = userStates.get(chatId);

  if (!state || state.step !== 'waiting_for_resume') {
    bot.sendMessage(chatId, 'Please send /analyze first to start the analysis process.');
    return;
  }

  try {
    const document = msg.document;
    const fileName = document.file_name;
    const fileSize = document.file_size;

    // Validate file type
    const validExtensions = ['.pdf', '.doc', '.docx'];
    const fileExt = path.extname(fileName).toLowerCase();

    if (!validExtensions.includes(fileExt)) {
      bot.sendMessage(
        chatId,
        '❌ Invalid file type. Please upload a PDF, DOC, or DOCX file.'
      );
      return;
    }

    // Validate file size (10MB)
    if (fileSize > 10 * 1024 * 1024) {
      bot.sendMessage(chatId, '❌ File too large. Maximum size is 10MB.');
      return;
    }

    // Download file
    await bot.sendMessage(chatId, '⏳ Downloading your resume...');

    const file = await bot.getFile(document.file_id);
    const fileUrl = `https://api.telegram.org/file/bot${config.telegramBotToken}/${file.file_path}`;

    // Save file temporarily
    const tempDir = config.uploadDir;
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFilePath = path.join(tempDir, `telegram-${Date.now()}${fileExt}`);

    await downloadFile(fileUrl, tempFilePath);

    // Update state
    state.resume = tempFilePath;
    state.fileExt = fileExt.slice(1);
    state.step = 'waiting_for_job_description';
    userStates.set(chatId, state);

    bot.sendMessage(
      chatId,
      '✅ Resume received!\n\n📝 *Step 2/2: Job Description*\n\nPlease paste the job description text.',
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[{ text: '❌ Cancel', callback_data: 'cancel' }]],
        },
      }
    );
  } catch (error) {
    console.error('Telegram document error:', error);
    bot.sendMessage(
      chatId,
      '❌ Error processing your resume. Please try again with /analyze.'
    );
    userStates.delete(chatId);
  }
});

// Handle text messages (job descriptions)
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Skip if it's a command
  if (text && text.startsWith('/')) return;

  // Skip if it's a document
  if (msg.document) return;

  const state = userStates.get(chatId);

  if (!state || state.step !== 'waiting_for_job_description') {
    return;
  }

  if (!text || text.trim().length < 100) {
    bot.sendMessage(
      chatId,
      '⚠️ Job description is too short. Please provide at least 100 characters for accurate analysis.'
    );
    return;
  }

  try {
    state.jobDescription = text;
    userStates.set(chatId, state);

    // Start analysis
    await bot.sendMessage(chatId, '🔍 *Analyzing your resume...*\n\nThis may take a few moments.', {
      parse_mode: 'Markdown',
    });

    // Parse resume
    const parsedData = await resumeParser.parseResume(state.resume, state.fileExt);

    // Analyze with ATS
    const analysis = await atsScoreService.analyzeResumeATS(parsedData, state.jobDescription);

    // Clean up temp file
    if (fs.existsSync(state.resume)) {
      fs.unlinkSync(state.resume);
    }

    // Clear user state
    userStates.delete(chatId);

    // Send results
    await sendAnalysisResults(chatId, analysis);
  } catch (error) {
    console.error('Telegram analysis error:', error);

    // Clean up
    if (state.resume && fs.existsSync(state.resume)) {
      fs.unlinkSync(state.resume);
    }
    userStates.delete(chatId);

    bot.sendMessage(
      chatId,
      '❌ An error occurred during analysis. Please try again with /analyze.'
    );
  }
});

// Handle callback queries (inline buttons)
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;

  if (query.data === 'cancel') {
    if (userStates.has(chatId)) {
      const state = userStates.get(chatId);
      if (state.resume && fs.existsSync(state.resume)) {
        fs.unlinkSync(state.resume);
      }
      userStates.delete(chatId);
    }

    bot.answerCallbackQuery(query.id);
    bot.sendMessage(chatId, '❌ Operation cancelled. Send /analyze to start again.');
  }
});

// Helper function to download file
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (response) => {
        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      })
      .on('error', (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
  });
}

// Helper function to send analysis results
async function sendAnalysisResults(chatId, analysis) {
  const { atsScore, scoreBreakdown, missingKeywords, suggestions, actionItems } = analysis;

  // Main score message
  const scoreLabel = getScoreLabel(atsScore);
  const scoreEmoji = getScoreEmoji(atsScore);

  let message = `
${scoreEmoji} *ATS Analysis Results*

*Score: ${atsScore}/100* - ${scoreLabel}

📈 *Score Breakdown:*
`;

  if (scoreBreakdown) {
    message += `• Keyword Match: ${scoreBreakdown.keywordMatch}/40\n`;
    message += `• Formatting: ${scoreBreakdown.formatting}/20\n`;
    message += `• Completeness: ${scoreBreakdown.completeness}/20\n`;
    message += `• Content Quality: ${scoreBreakdown.contentQuality}/20\n`;
  }

  await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });

  // Missing keywords
  if (missingKeywords && missingKeywords.length > 0) {
    const keywordsMsg = `
🔑 *Missing Keywords (Top 15):*

${missingKeywords.slice(0, 15).join(', ')}

Add these keywords to improve your ATS score.
    `;
    await bot.sendMessage(chatId, keywordsMsg, { parse_mode: 'Markdown' });
  }

  // Suggestions
  if (suggestions && suggestions.length > 0) {
    let suggestionsMsg = '💡 *Top Suggestions:*\n\n';
    suggestions.slice(0, 5).forEach((s, i) => {
      const priority = s.priority === 'high' ? '🔴' : s.priority === 'medium' ? '🟡' : '🟢';
      suggestionsMsg += `${i + 1}. ${priority} ${s.suggestion}\n\n`;
    });

    await bot.sendMessage(chatId, suggestionsMsg, { parse_mode: 'Markdown' });
  }

  // Action items
  if (actionItems && actionItems.length > 0) {
    let actionsMsg = '✅ *Quick Action Items:*\n\n';
    actionItems.slice(0, 5).forEach((item, i) => {
      actionsMsg += `${i + 1}. ${item}\n`;
    });

    await bot.sendMessage(chatId, actionsMsg, { parse_mode: 'Markdown' });
  }

  // Final message
  await bot.sendMessage(
    chatId,
    '✨ Analysis complete!\n\nSend /analyze to analyze another resume.',
    {
      reply_markup: {
        inline_keyboard: [[{ text: '🔄 New Analysis', callback_data: 'new_analysis' }]],
      },
    }
  );
}

// Helper functions
function getScoreEmoji(score) {
  if (score >= 80) return '🎉';
  if (score >= 60) return '👍';
  if (score >= 40) return '⚠️';
  return '❌';
}

function getScoreLabel(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Improvement';
}

module.exports = bot;
