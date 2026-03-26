const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const config = require('./config/environment');
const connectDatabase = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDatabase();

// Security middleware
app.use(helmet());

// Enable CORS
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ATS Resume Tool API is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/resume', require('./routes/resume.routes'));
app.use('/api/ats', require('./routes/ats.routes'));
// app.use('/api/templates', require('./routes/template.routes'));
// app.use('/api/webhooks', require('./routes/webhook.routes'));

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'ATS Resume Optimization Tool API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      resume: '/api/resume',
      ats: '/api/ats',
      templates: '/api/templates',
    },
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════════════╗
  ║                                                       ║
  ║   🚀 ATS Resume Optimization Tool API                ║
  ║                                                       ║
  ║   Server running on port ${PORT}                         ║
  ║   Environment: ${config.nodeEnv}                      ║
  ║                                                       ║
  ║   API Endpoints:                                      ║
  ║   → Health Check: http://localhost:${PORT}/api/health ║
  ║   → Documentation: http://localhost:${PORT}/          ║
  ║                                                       ║
  ╚═══════════════════════════════════════════════════════╝
  `);
});

// Initialize bots if tokens are provided
if (config.discordBotToken) {
  console.log('🤖 Initializing Discord bot...');
  require('./bots/discord/discordBot');
}

if (config.telegramBotToken) {
  console.log('🤖 Initializing Telegram bot...');
  require('./bots/telegram/telegramBot');
}

// WhatsApp bot (comment out if not using)
// Note: WhatsApp bot requires QR code scanning on first run
// Uncomment the line below to enable WhatsApp bot
// require('./bots/whatsapp/whatsappBot');

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  // Close server & exit process in production
  // server.close(() => process.exit(1));
});

module.exports = app;
