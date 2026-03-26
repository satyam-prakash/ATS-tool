#!/bin/bash

echo "=================================="
echo "ATS Resume Optimizer - Quick Setup"
echo "=================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18+ first."
    echo "   Download: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node --version) detected"
echo ""

# Backend setup
echo "📦 Setting up backend..."
cd backend || exit

if [ ! -f "package.json" ]; then
    echo "❌ Backend package.json not found!"
    exit 1
fi

echo "Installing backend dependencies..."
npm install

if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "⚠️  IMPORTANT: Edit backend/.env and add your API keys!"
    echo "   - Add OPENAI_API_KEY or GEMINI_API_KEY"
    echo "   - Update MONGODB_URI if using MongoDB Atlas"
fi

cd ..

# Frontend setup
echo ""
echo "📦 Setting up frontend..."
cd frontend || exit

if [ ! -f "package.json" ]; then
    echo "❌ Frontend package.json not found!"
    exit 1
fi

echo "Installing frontend dependencies..."
npm install

cd ..

echo ""
echo "=================================="
echo "✅ Setup Complete!"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. Edit backend/.env and add your API keys"
echo "2. Start MongoDB (or use MongoDB Atlas)"
echo "3. Run: cd backend && npm run dev"
echo "4. In new terminal: cd frontend && npm run dev"
echo ""
echo "See SETUP.md for detailed instructions!"
