# ATS Resume Optimization Tool

A comprehensive AI-powered resume optimization tool that helps job seekers improve their resumes based on job descriptions. Supports multiple platforms including Web App, Discord Bot, Telegram Bot, and WhatsApp Bot.

## 🌟 Features

- **Resume Parsing**: Upload resumes in PDF or DOCX format
- **ATS Score Analysis**: Get AI-powered ATS scores (0-100) with detailed breakdown
- **Smart Suggestions**: Receive actionable recommendations to improve your resume
- **Keyword Analysis**: Identify missing keywords from job descriptions
- **Multi-Platform Support**: Access via Web, Discord, Telegram, or WhatsApp
- **AI-Powered**: Uses OpenAI or Google Gemini for intelligent analysis
- **Template System**: Choose from multiple resume format templates

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **AI**: OpenAI API / Google Gemini
- **File Parsing**: pdf-parse, mammoth
- **Bots**: discord.js, node-telegram-bot-api, whatsapp-web.js

### Frontend
- **Framework**: React 18+ with Vite
- **UI Library**: Material-UI / Tailwind CSS
- **HTTP Client**: Axios
- **Charts**: Recharts

## 📋 Prerequisites

- Node.js v18 or higher
- MongoDB (local or Atlas)
- OpenAI API Key or Google Gemini API Key
- (Optional) Bot tokens for Discord/Telegram/WhatsApp

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

**Windows:**
```bash
setup.bat
```

**Mac/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

Then:
1. Edit `backend/.env` and add your API keys
2. Start backend: `cd backend && npm run dev`
3. Start frontend: `cd frontend && npm run dev`

### Option 2: Manual Setup

**1. Install all dependencies:**
```bash
npm run install-all
```

**2. Configure environment:**
```bash
cd backend
cp .env.example .env
# Edit .env and add:
# - OPENAI_API_KEY or GEMINI_API_KEY (Required)
# - MONGODB_URI (local or Atlas)
```

**3. Start both servers:**
```bash
# From root directory
npm run dev
```

Or start them separately:
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**✅ Done!**
- Backend: http://localhost:5000
- Frontend: http://localhost:5173

📖 **[See detailed setup guide →](SETUP.md)**

## 📡 API Endpoints

### Resume Management
- `POST /api/resume/upload` - Upload and parse resume
- `GET /api/resume/:id` - Get resume by ID
- `GET /api/resume` - Get all resumes
- `DELETE /api/resume/:id` - Delete resume

### ATS Analysis
- `POST /api/ats/analyze` - Analyze resume against job description
- `POST /api/ats/improve` - Get AI improvement suggestions
- `POST /api/ats/keywords` - Extract keywords from job description
- `POST /api/ats/compare` - Compare resume vs job keywords
- `GET /api/ats/score/:resumeId` - Get ATS score

### Templates (Coming Soon)
- `GET /api/templates` - List available templates
- `POST /api/templates/apply` - Apply template to resume

### Health Check
- `GET /api/health` - API health status

## 🤖 Bot Setup

### Discord Bot

1. Create a bot at [Discord Developer Portal](https://discord.com/developers/applications)
2. Add `DISCORD_BOT_TOKEN` and `DISCORD_CLIENT_ID` to `.env`
3. Invite bot to your server
4. Use slash commands:
   - `/analyze` - Analyze resume
   - `/help` - Get help

### Telegram Bot

1. Create a bot via [@BotFather](https://t.me/botfather)
2. Add `TELEGRAM_BOT_TOKEN` to `.env`
3. Start the bot and use:
   - `/start` - Welcome message
   - `/analyze` - Analyze resume

### WhatsApp Bot

1. Add `WHATSAPP_SESSION_PATH` to `.env`
2. Scan QR code on first run
3. Send resume file to analyze

## 📊 Example API Usage

### Upload Resume
```bash
curl -X POST http://localhost:5000/api/resume/upload \
  -F "resume=@/path/to/resume.pdf"
```

### Analyze Resume
```bash
curl -X POST http://localhost:5000/api/ats/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "resumeId": "your-resume-id",
    "jobDescription": "Your job description here..."
  }'
```

## 🎨 Resume Templates

The tool offers 4 resume templates:
1. **Modern** - Clean, minimalist design
2. **Classic** - Traditional, formal layout
3. **Professional** - Corporate style
4. **Creative** - Colorful, unique design

## 🔒 Environment Variables

```env
# Backend
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ats-resume-tool

# AI Services (choose one)
OPENAI_API_KEY=sk-your-key-here
GEMINI_API_KEY=your-key-here

# Bot Tokens (optional)
DISCORD_BOT_TOKEN=your-token
DISCORD_CLIENT_ID=your-client-id
TELEGRAM_BOT_TOKEN=your-token
WHATSAPP_SESSION_PATH=./whatsapp-session

# File Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# CORS
FRONTEND_URL=http://localhost:5173
```

## 📈 Project Status

### ✅ Completed
- [x] Backend infrastructure and Express server
- [x] MongoDB models and database connection
- [x] Resume parser for PDF and DOCX files
- [x] AI service integration (OpenAI & Gemini)
- [x] ATS scoring algorithm (AI + Rule-based)
- [x] Keyword extraction and analysis
- [x] API endpoints for resume and ATS analysis
- [x] React frontend with Material-UI
- [x] Resume upload with drag-and-drop
- [x] Job description input
- [x] ATS score visualization
- [x] Suggestions and recommendations display
- [x] Discord bot with slash commands
- [x] Telegram bot with interactive flow
- [x] WhatsApp bot with QR code auth

### 🚧 In Progress
- [ ] Resume template system (JSON-based templates)
- [ ] PDF generation with templates

### 📅 Planned
- [ ] User authentication & accounts
- [ ] Resume history tracking
- [ ] Email notifications
- [ ] Export to various formats
- [ ] Advanced analytics dashboard
- [ ] Resume comparison feature
- [ ] Job board integration

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT License

## 🙏 Acknowledgments

- OpenAI for GPT models
- Google for Gemini AI
- All open-source libraries used in this project

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Email: support@example.com

---

**Built with ❤️ for job seekers worldwide**
