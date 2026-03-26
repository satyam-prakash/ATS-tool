# ATS Resume Optimization Tool - Complete Setup Guide

## 🎯 Quick Start (5 Minutes)

The fastest way to get started:

```bash
# 1. Install backend dependencies
cd backend
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env and add your OpenAI or Gemini API key

# 3. Start MongoDB (local or use MongoDB Atlas)
# For MongoDB Atlas, update MONGODB_URI in .env

# 4. Run backend
npm run dev

# Backend will be running on http://localhost:5000

# 5. In a new terminal, install frontend dependencies
cd frontend
npm install

# 6. Run frontend
npm run dev

# Frontend will be running on http://localhost:5173
```

## 🚀 Complete Setup Instructions

### Prerequisites

1. **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
2. **MongoDB**
   - Local: [Download](https://www.mongodb.com/try/download/community)
   - Cloud: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Recommended - Free tier available)
3. **AI API Key** (Choose one):
   - **OpenAI**: [Get API Key](https://platform.openai.com/api-keys)
   - **Google Gemini**: [Get API Key](https://makersuite.google.com/app/apikey)

### 1. Backend Setup

#### Install Dependencies

```bash
cd backend
npm install
```

#### Configure Environment

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` file and configure:

```env
# Required: Add your AI API key
OPENAI_API_KEY=sk-your-openai-key-here
# OR
GEMINI_API_KEY=your-gemini-key-here

# Database (local MongoDB)
MONGODB_URI=mongodb://localhost:27017/ats-resume-tool

# Or use MongoDB Atlas (cloud)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ats-resume-tool

# Optional: Bot tokens (only if using bots)
DISCORD_BOT_TOKEN=your-discord-token
DISCORD_CLIENT_ID=your-discord-client-id
TELEGRAM_BOT_TOKEN=your-telegram-token
```

#### Start MongoDB

**Option A: Local MongoDB**
```bash
# Windows
mongod

# Mac/Linux
sudo systemctl start mongod
```

**Option B: MongoDB Atlas (Recommended)**
1. Create free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

#### Run Backend

```bash
npm run dev
```

✅ Backend should be running on http://localhost:5000

Test it:
```bash
curl http://localhost:5000/api/health
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

✅ Frontend should be running on http://localhost:5173

Open http://localhost:5173 in your browser!

### 3. Bot Setup (Optional)

#### Discord Bot

1. **Create Discord App:**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Click "New Application"
   - Give it a name (e.g., "ATS Resume Bot")

2. **Create Bot:**
   - Go to "Bot" section
   - Click "Add Bot"
   - Copy the bot token
   - Add to `.env` as `DISCORD_BOT_TOKEN`

3. **Get Client ID:**
   - Go to "OAuth2" section
   - Copy "Client ID"
   - Add to `.env` as `DISCORD_CLIENT_ID`

4. **Invite Bot to Server:**
   - Go to OAuth2 → URL Generator
   - Select scopes: `bot`, `applications.commands`
   - Select bot permissions: `Send Messages`, `Attach Files`, `Use Slash Commands`
   - Copy generated URL and open in browser
   - Select server and authorize

5. **Restart Backend** - Bot will automatically register commands

6. **Test Bot:**
   - In Discord: `/analyze` - Upload resume and job description
   - In Discord: `/help` - See help message

#### Telegram Bot

1. **Create Bot:**
   - Open Telegram
   - Search for [@BotFather](https://t.me/botfather)
   - Send `/newbot`
   - Follow instructions
   - Copy bot token
   - Add to `.env` as `TELEGRAM_BOT_TOKEN`

2. **Restart Backend** - Bot will start automatically

3. **Test Bot:**
   - Find your bot in Telegram
   - Send `/start`
   - Send `/analyze` to start analysis

#### WhatsApp Bot

**⚠️ Note:** WhatsApp bot requires QR code scanning

1. **Enable in Code:**
   - Edit `backend/src/server.js`
   - Uncomment the WhatsApp bot line:
   ```javascript
   require('./bots/whatsapp/whatsappBot');
   ```

2. **Start Backend:**
   ```bash
   npm run dev
   ```

3. **Scan QR Code:**
   - QR code will appear in terminal
   - Open WhatsApp on phone
   - Go to Settings → Linked Devices
   - Scan QR code

4. **Test Bot:**
   - Send "hi" to the bot number
   - Send "analyze" to start analysis

## 🧪 Testing the Application

### Test Backend API

```bash
# Health check
curl http://localhost:5000/api/health

# Upload resume (replace path with your resume)
curl -X POST http://localhost:5000/api/resume/upload \
  -F "resume=@/path/to/your/resume.pdf"

# Analyze (use resumeId from upload response)
curl -X POST http://localhost:5000/api/ats/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "resumeId": "your-resume-id",
    "jobDescription": "We are looking for a Full Stack Developer with React and Node.js experience..."
  }'
```

### Test Web App

1. Open http://localhost:5173
2. Click "Start Optimizing"
3. Upload a resume (PDF or DOCX)
4. Paste a job description
5. Click "Analyze Resume"
6. View results!

### Test Discord Bot

1. Invite bot to your server (see Discord setup above)
2. Use `/analyze` command
3. Upload resume file
4. Paste job description
5. Receive analysis results

### Test Telegram Bot

1. Start chat with your bot
2. Send `/start`
3. Send `/analyze`
4. Upload resume file
5. Send job description text
6. Receive analysis results

### Test WhatsApp Bot

1. Scan QR code (see WhatsApp setup above)
2. Send "hi" to bot
3. Send "analyze"
4. Upload resume file
5. Send job description text
6. Receive analysis results

## 📊 Sample Usage Flow

### Web App Example

```
1. User visits http://localhost:5173
2. Clicks "Start Optimizing"
3. Uploads resume.pdf
4. Enters job description
5. Clicks "Analyze"
6. Sees:
   - ATS Score: 72/100
   - Missing Keywords: "React", "TypeScript", "AWS"
   - Suggestions: "Add quantifiable achievements"
   - Action Items: "Include metrics in experience section"
```

### Discord Bot Example

```
1. User types /analyze in Discord
2. Attaches resume.pdf
3. Pastes job description in text field
4. Bot responds with embedded message showing:
   - Score: 75/100
   - Breakdown by category
   - Missing keywords
   - Top 5 suggestions
```

## 🐛 Troubleshooting

### Backend won't start

**Problem:** MongoDB connection error
```
Solution:
- Check if MongoDB is running
- Verify MONGODB_URI in .env
- For Atlas, check if IP is whitelisted
```

**Problem:** AI API key error
```
Solution:
- Verify API key in .env
- Check key is valid on provider's website
- Ensure no extra spaces in key
```

### Frontend won't start

**Problem:** Port 5173 in use
```bash
Solution:
# Kill process on port 5173
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5173 | xargs kill -9
```

**Problem:** Cannot connect to backend
```
Solution:
- Ensure backend is running on port 5000
- Check CORS settings in backend
- Verify proxy in vite.config.js
```

### Discord Bot Issues

**Problem:** Slash commands not appearing
```
Solution:
- Wait a few minutes (can take time to register)
- Kick and re-invite bot
- Check bot has proper permissions
- Verify CLIENT_ID is correct
```

**Problem:** Bot not responding
```
Solution:
- Check BOT_TOKEN in .env
- Verify bot is online in Discord
- Check terminal for errors
- Restart backend
```

### Telegram Bot Issues

**Problem:** Bot not responding
```
Solution:
- Verify bot token in .env
- Check if polling is enabled
- Restart backend
- Send /start to reset bot state
```

### WhatsApp Bot Issues

**Problem:** QR code not showing
```
Solution:
- Verify WhatsApp bot is uncommented in server.js
- Check puppeteer dependencies are installed
- Restart backend
```

**Problem:** Session expired
```
Solution:
- Delete whatsapp-session folder
- Restart backend
- Scan QR code again
```

## 🚀 Deployment

### Backend Deployment (Railway/Heroku/Render)

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Deploy to Railway (Recommended)**
   - Go to [Railway.app](https://railway.app/)
   - Import GitHub repo
   - Add environment variables
   - Deploy!

3. **Set Environment Variables:**
   - `MONGODB_URI` - MongoDB Atlas connection string
   - `OPENAI_API_KEY` - Your API key
   - `NODE_ENV` - production
   - `FRONTEND_URL` - Your frontend URL

### Frontend Deployment (Vercel/Netlify)

1. **Deploy to Vercel (Recommended)**
```bash
cd frontend
npm install -g vercel
vercel
```

2. **Set Environment Variable:**
   - `VITE_API_URL` - Your backend URL

## 📝 Environment Variables Reference

### Backend (.env)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PORT` | No | Server port | `5000` |
| `NODE_ENV` | No | Environment | `development` |
| `MONGODB_URI` | Yes | MongoDB connection | `mongodb://localhost:27017/ats` |
| `OPENAI_API_KEY` | Yes* | OpenAI API key | `sk-...` |
| `GEMINI_API_KEY` | Yes* | Gemini API key | `...` |
| `DISCORD_BOT_TOKEN` | No | Discord bot token | `...` |
| `DISCORD_CLIENT_ID` | No | Discord client ID | `...` |
| `TELEGRAM_BOT_TOKEN` | No | Telegram bot token | `...` |
| `WHATSAPP_SESSION_PATH` | No | WhatsApp session path | `./whatsapp-session` |

*At least one AI API key required

## 📚 Additional Resources

- **OpenAI Documentation**: https://platform.openai.com/docs
- **Discord.js Guide**: https://discordjs.guide/
- **Telegram Bot API**: https://core.telegram.org/bots/api
- **WhatsApp Web.js**: https://wwebjs.dev/
- **MongoDB Atlas**: https://docs.atlas.mongodb.com/

## 🤝 Support

If you encounter issues:
1. Check this guide's troubleshooting section
2. Review error messages in terminal
3. Check browser console (F12)
4. Verify all environment variables are set correctly

## 🎉 Success!

You should now have:
✅ Backend API running on http://localhost:5000
✅ Frontend app running on http://localhost:5173
✅ Bots connected (if configured)
✅ Ability to analyze resumes and get ATS scores!

**Next Steps:**
- Upload a test resume
- Try different job descriptions
- Test bot integrations
- Deploy to production
- Share with job seekers!
