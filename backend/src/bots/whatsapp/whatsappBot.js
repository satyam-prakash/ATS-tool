const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const config = require('../../config/environment');
const resumeParser = require('../../services/resumeParser');
const atsScoreService = require('../../services/atsScoreService');
const fs = require('fs');
const path = require('path');

// Check if WhatsApp bot should be initialized
if (!config.whatsappSessionPath) {
  console.log('⚠️  WhatsApp session path not configured. Skipping WhatsApp bot initialization.');
  module.exports = null;
  return;
}

// Create WhatsApp client
const client = new Client({
  authStrategy: new LocalAuth({
    clientId: 'ats-resume-bot',
    dataPath: config.whatsappSessionPath,
  }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
});

// Store user states
const userStates = new Map();

console.log('🔄 Initializing WhatsApp bot...');

// QR Code event
client.on('qr', (qr) => {
  console.log('\n=================================');
  console.log('📱 WHATSAPP BOT QR CODE');
  console.log('=================================\n');
  console.log('Scan this QR code with WhatsApp:\n');
  qrcode.generate(qr, { small: true });
  console.log('\n=================================\n');
});

// Ready event
client.on('ready', () => {
  console.log('✅ WhatsApp Bot is ready!');
});

// Authenticated event
client.on('authenticated', () => {
  console.log('✅ WhatsApp Bot authenticated');
});

// Authentication failure event
client.on('auth_failure', (msg) => {
  console.error('❌ WhatsApp authentication failed:', msg);
});

// Disconnected event
client.on('disconnected', (reason) => {
  console.log('⚠️  WhatsApp Bot disconnected:', reason);
});

// Handle incoming messages
client.on('message', async (msg) => {
  const chat = await msg.getChat();
  const contact = await msg.getContact();
  const userId = contact.id._serialized;

  const text = msg.body.toLowerCase().trim();

  // Commands
  if (text === 'hi' || text === 'hello' || text === 'start') {
    await handleStart(chat);
    return;
  }

  if (text === 'help') {
    await handleHelp(chat);
    return;
  }

  if (text === 'analyze') {
    await handleAnalyzeStart(chat, userId);
    return;
  }

  if (text === 'cancel') {
    await handleCancel(chat, userId);
    return;
  }

  // Check if user has an active state
  const state = userStates.get(userId);

  if (!state) {
    // No active state, send help
    await chat.sendMessage(
      "Hi! 👋 Send 'analyze' to start analyzing your resume, or 'help' for more information."
    );
    return;
  }

  // Handle resume upload
  if (state.step === 'waiting_for_resume') {
    if (msg.hasMedia) {
      await handleResumeUpload(msg, chat, userId, state);
    } else {
      await chat.sendMessage(
        '❌ Please upload your resume file (PDF, DOC, or DOCX).\n\nOr send "cancel" to stop.'
      );
    }
    return;
  }

  // Handle job description
  if (state.step === 'waiting_for_job_description') {
    await handleJobDescription(msg, chat, userId, state);
    return;
  }
});

// Start command
async function handleStart(chat) {
  const welcomeMessage = `
🤖 *ATS Resume Optimizer Bot*

Welcome! I help you optimize your resume for Applicant Tracking Systems.

*How to use:*
1. Send *analyze* to start
2. Upload your resume (PDF/DOCX)
3. Send the job description
4. Get instant feedback!

*Commands:*
• *analyze* - Analyze your resume
• *help* - Show help message
• *cancel* - Cancel current operation

Ready? Send *analyze* to begin! 🚀
  `;

  await chat.sendMessage(welcomeMessage);
}

// Help command
async function handleHelp(chat) {
  const helpMessage = `
📖 *ATS Resume Optimizer - Help*

*What I analyze:*
✓ ATS compatibility score (0-100)
✓ Missing keywords
✓ Formatting issues
✓ Improvement suggestions

*Supported formats:*
PDF, DOC, DOCX (Max 10MB)

*Commands:*
• *analyze* - Start resume analysis
• *help* - Show this help
• *cancel* - Cancel operation

*Process:*
1. Send *analyze*
2. Upload resume file
3. Send job description
4. Receive detailed analysis

Questions? Just send *help*!
  `;

  await chat.sendMessage(helpMessage);
}

// Start analysis
async function handleAnalyzeStart(chat, userId) {
  userStates.set(userId, {
    step: 'waiting_for_resume',
    resumePath: null,
    jobDescription: null,
  });

  await chat.sendMessage(
    '📄 *Step 1/2: Upload Resume*\n\nPlease upload your resume file (PDF, DOC, or DOCX).\n\n_Max file size: 10MB_'
  );
}

// Cancel operation
async function handleCancel(chat, userId) {
  const state = userStates.get(userId);

  if (state) {
    // Clean up temp file if exists
    if (state.resumePath && fs.existsSync(state.resumePath)) {
      fs.unlinkSync(state.resumePath);
    }

    userStates.delete(userId);
    await chat.sendMessage('❌ Operation cancelled. Send *analyze* to start again.');
  } else {
    await chat.sendMessage('No active operation to cancel.');
  }
}

// Handle resume upload
async function handleResumeUpload(msg, chat, userId, state) {
  try {
    await chat.sendMessage('⏳ Downloading your resume...');

    const media = await msg.downloadMedia();

    if (!media) {
      await chat.sendMessage('❌ Failed to download file. Please try again.');
      return;
    }

    // Get file extension from mimetype
    let fileExt = '';
    if (media.mimetype === 'application/pdf') fileExt = '.pdf';
    else if (media.mimetype === 'application/msword') fileExt = '.doc';
    else if (
      media.mimetype ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )
      fileExt = '.docx';
    else {
      await chat.sendMessage('❌ Invalid file type. Please upload PDF, DOC, or DOCX.');
      return;
    }

    // Save file temporarily
    const tempDir = config.uploadDir;
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFilePath = path.join(tempDir, `whatsapp-${Date.now()}${fileExt}`);
    fs.writeFileSync(tempFilePath, media.data, { encoding: 'base64' });

    // Update state
    state.resumePath = tempFilePath;
    state.fileExt = fileExt.slice(1);
    state.step = 'waiting_for_job_description';
    userStates.set(userId, state);

    await chat.sendMessage(
      '✅ Resume received!\n\n📝 *Step 2/2: Job Description*\n\nPlease send the job description text.'
    );
  } catch (error) {
    console.error('WhatsApp resume upload error:', error);
    await chat.sendMessage('❌ Error processing resume. Please try again with *analyze*.');
    userStates.delete(userId);
  }
}

// Handle job description
async function handleJobDescription(msg, chat, userId, state) {
  const jobDescription = msg.body.trim();

  if (jobDescription.length < 100) {
    await chat.sendMessage(
      '⚠️ Job description is too short. Please provide at least 100 characters for accurate analysis.'
    );
    return;
  }

  try {
    state.jobDescription = jobDescription;
    userStates.set(userId, state);

    await chat.sendMessage('🔍 *Analyzing your resume...*\n\n_This may take a few moments._');

    // Parse resume
    const parsedData = await resumeParser.parseResume(state.resumePath, state.fileExt);

    // Analyze with ATS
    const analysis = await atsScoreService.analyzeResumeATS(parsedData, state.jobDescription);

    // Clean up temp file
    if (fs.existsSync(state.resumePath)) {
      fs.unlinkSync(state.resumePath);
    }

    // Clear user state
    userStates.delete(userId);

    // Send results
    await sendAnalysisResults(chat, analysis);
  } catch (error) {
    console.error('WhatsApp analysis error:', error);

    // Clean up
    if (state.resumePath && fs.existsSync(state.resumePath)) {
      fs.unlinkSync(state.resumePath);
    }
    userStates.delete(userId);

    await chat.sendMessage('❌ An error occurred during analysis. Please try again with *analyze*.');
  }
}

// Send analysis results
async function sendAnalysisResults(chat, analysis) {
  const { atsScore, scoreBreakdown, missingKeywords, suggestions, actionItems } = analysis;

  const scoreLabel = getScoreLabel(atsScore);
  const scoreEmoji = getScoreEmoji(atsScore);

  // Main score message
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

  await chat.sendMessage(message);

  // Missing keywords
  if (missingKeywords && missingKeywords.length > 0) {
    const keywordsMsg = `
🔑 *Missing Keywords (Top 15):*

${missingKeywords.slice(0, 15).join(', ')}

_Add these keywords to improve your ATS score._
    `;
    await chat.sendMessage(keywordsMsg);
  }

  // Suggestions
  if (suggestions && suggestions.length > 0) {
    let suggestionsMsg = '💡 *Top Suggestions:*\n\n';
    suggestions.slice(0, 5).forEach((s, i) => {
      const priority = s.priority === 'high' ? '🔴' : s.priority === 'medium' ? '🟡' : '🟢';
      suggestionsMsg += `${i + 1}. ${priority} ${s.suggestion}\n\n`;
    });

    await chat.sendMessage(suggestionsMsg);
  }

  // Action items
  if (actionItems && actionItems.length > 0) {
    let actionsMsg = '✅ *Quick Action Items:*\n\n';
    actionItems.slice(0, 5).forEach((item, i) => {
      actionsMsg += `${i + 1}. ${item}\n`;
    });

    await chat.sendMessage(actionsMsg);
  }

  // Final message
  await chat.sendMessage(
    '✨ *Analysis complete!*\n\nSend *analyze* to analyze another resume.'
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

// Initialize client
client.initialize().catch((err) => {
  console.error('❌ Failed to initialize WhatsApp bot:', err);
});

module.exports = client;
