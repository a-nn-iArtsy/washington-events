#!/bin/bash
# Deployment script for Washington Events

echo "🚀 Deploying Washington Events..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in the right directory. Run this from the project root."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build client
echo "🏗️ Building React frontend..."
cd client
npm install
npm run build
cd ..

# Run database setup
echo "🗄️ Setting up database..."
node scripts/setup-database.js

# Start the server
echo "🚀 Starting Washington Events server..."
npm start
