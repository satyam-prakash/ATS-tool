const { Client, GatewayIntentBits, REST, Routes, AttachmentBuilder } = require('discord.js');
const config = require('../../config/environment');
const resumeParser = require('../../services/resumeParser');
const atsScoreService = require('../../services/atsScoreService');
const fs = require('fs');
const path = require('path');

if (!config.discordBotToken || !config.discordClientId) {
  console.log('⚠️  Discord bot tokens not configured. Skipping Discord bot initialization.');
  module.exports = null;
  return;
}

// Create Discord client
// We only need Guilds intent for slash commands
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
  ],
});

// Define slash commands
const commands = [
  {
    name: 'analyze',
    description: 'Analyze your resume against a job description',
    options: [
      {
        name: 'resume',
        type: 11, // ATTACHMENT
        description: 'Upload your resume (PDF or DOCX)',
        required: true,
      },
      {
        name: 'job_description',
        type: 3, // STRING
        description: 'Paste the job description',
        required: true,
      },
    ],
  },
  {
    name: 'help',
    description: 'Get help with using the ATS Resume Bot',
  },
];

// Register commands
const rest = new REST({ version: '10' }).setToken(config.discordBotToken);

(async () => {
  try {
    console.log('🔄 Registering Discord slash commands...');

    await rest.put(Routes.applicationCommands(config.discordClientId), {
      body: commands,
    });

    console.log('✅ Discord slash commands registered successfully');
  } catch (error) {
    console.error('❌ Error registering Discord commands:', error);
  }
})();

// Bot ready event
client.once('ready', () => {
  console.log(`✅ Discord Bot logged in as ${client.user.tag}`);
  client.user.setActivity('Optimizing resumes', { type: 'WATCHING' });
});

// Handle slash commands
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'help') {
    await handleHelp(interaction);
  } else if (commandName === 'analyze') {
    await handleAnalyze(interaction);
  }
});

// Help command handler
async function handleHelp(interaction) {
  const helpEmbed = {
    color: 0x1976d2,
    title: '🤖 ATS Resume Optimizer Bot',
    description: 'I help you optimize your resume for Applicant Tracking Systems!',
    fields: [
      {
        name: '/analyze',
        value: 'Upload your resume and provide a job description to get an ATS score and suggestions',
        inline: false,
      },
      {
        name: '/help',
        value: 'Display this help message',
        inline: false,
      },
      {
        name: '📊 What I Analyze',
        value: '• ATS compatibility score (0-100)\n• Missing keywords\n• Formatting issues\n• Actionable suggestions',
        inline: false,
      },
      {
        name: '📁 Supported Formats',
        value: 'PDF, DOC, DOCX (Max 10MB)',
        inline: false,
      },
    ],
    footer: {
      text: 'Powered by AI • Built with ❤️ for job seekers',
    },
  };

  await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
}

// Analyze command handler
async function handleAnalyze(interaction) {
  await interaction.deferReply();

  try {
    // Get attachment and job description
    const attachment = interaction.options.getAttachment('resume');
    const jobDescription = interaction.options.getString('job_description');

    if (!attachment) {
      await interaction.editReply('❌ Please upload your resume file.');
      return;
    }

    // Validate file type
    const validExtensions = ['.pdf', '.doc', '.docx'];
    const fileExt = path.extname(attachment.name).toLowerCase();

    if (!validExtensions.includes(fileExt)) {
      await interaction.editReply('❌ Invalid file type. Please upload a PDF, DOC, or DOCX file.');
      return;
    }

    // Validate file size (10MB)
    if (attachment.size > 10 * 1024 * 1024) {
      await interaction.editReply('❌ File too large. Maximum size is 10MB.');
      return;
    }

    // Download file
    await interaction.editReply('⏳ Downloading and parsing your resume...');

    const response = await fetch(attachment.url);
    const buffer = await response.arrayBuffer();

    // Save file temporarily
    const tempDir = config.uploadDir;
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFilePath = path.join(tempDir, `discord-${Date.now()}${fileExt}`);
    fs.writeFileSync(tempFilePath, Buffer.from(buffer));

    // Parse resume
    await interaction.editReply('📄 Parsing resume...');
    const parsedData = await resumeParser.parseResume(tempFilePath, fileExt.slice(1));

    // Analyze with ATS
    await interaction.editReply('🔍 Analyzing with ATS...');
    const analysis = await atsScoreService.analyzeResumeATS(parsedData, jobDescription);

    // Clean up temp file
    fs.unlinkSync(tempFilePath);

    // Create result embed
    const resultEmbed = {
      color: getScoreColor(analysis.atsScore),
      title: '📊 ATS Analysis Results',
      fields: [
        {
          name: '🎯 ATS Score',
          value: `**${analysis.atsScore}/100** - ${getScoreLabel(analysis.atsScore)}`,
          inline: false,
        },
        {
          name: '📈 Score Breakdown',
          value: analysis.scoreBreakdown
            ? `• Keyword Match: ${analysis.scoreBreakdown.keywordMatch}/40\n` +
              `• Formatting: ${analysis.scoreBreakdown.formatting}/20\n` +
              `• Completeness: ${analysis.scoreBreakdown.completeness}/20\n` +
              `• Content Quality: ${analysis.scoreBreakdown.contentQuality}/20`
            : 'N/A',
          inline: false,
        },
      ],
      footer: {
        text: `Analyzed: ${attachment.name}`,
      },
      timestamp: new Date(),
    };

    // Add missing keywords (top 10)
    if (analysis.missingKeywords && analysis.missingKeywords.length > 0) {
      resultEmbed.fields.push({
        name: '🔑 Missing Keywords (Top 10)',
        value: analysis.missingKeywords.slice(0, 10).join(', '),
        inline: false,
      });
    }

    // Add top suggestions (top 5)
    if (analysis.suggestions && analysis.suggestions.length > 0) {
      const topSuggestions = analysis.suggestions
        .slice(0, 5)
        .map((s, i) => `${i + 1}. ${s.suggestion}`)
        .join('\n');

      resultEmbed.fields.push({
        name: '💡 Top Suggestions',
        value: topSuggestions,
        inline: false,
      });
    }

    // Add action items
    if (analysis.actionItems && analysis.actionItems.length > 0) {
      const actions = analysis.actionItems
        .slice(0, 3)
        .map((a, i) => `${i + 1}. ${a}`)
        .join('\n');

      resultEmbed.fields.push({
        name: '✅ Action Items',
        value: actions,
        inline: false,
      });
    }

    await interaction.editReply({
      content: '✨ Analysis complete!',
      embeds: [resultEmbed],
    });
  } catch (error) {
    console.error('Discord bot error:', error);
    await interaction.editReply(
      '❌ An error occurred while analyzing your resume. Please try again later.'
    );
  }
}

// Helper functions
function getScoreColor(score) {
  if (score >= 80) return 0x2e7d32; // Green
  if (score >= 60) return 0xed6c02; // Orange
  return 0xd32f2f; // Red
}

function getScoreLabel(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Improvement';
}

// Login bot
client.login(config.discordBotToken);

module.exports = client;
