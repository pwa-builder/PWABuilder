#!/bin/bash

# PWABuilder Development Container Setup Script
echo "🚀 Setting up PWABuilder development environment..."

# Restore .NET dependencies
echo "📦 Restoring .NET dependencies..."
cd /workspaces/pwabuilder/apps/pwabuilder
dotnet restore

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd Frontend
npm install

# Install Puppeteer globally for development
echo "🤖 Installing Puppeteer..."
npm install -g puppeteer

# Set Puppeteer to skip downloading Chromium (we installed Chrome instead)
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Go back to workspace root
cd /workspaces/pwabuilder

# Trust the HTTPS development certificate
echo "🔒 Setting up HTTPS development certificate..."
dotnet dev-certs https --trust

# Make sure the setup script is executable for future runs
chmod +x .devcontainer/setup.sh

echo "✅ Setup complete! You can now:"
echo "   - Press F5 to start debugging"
echo "   - Run 'dotnet run' in apps/pwabuilder to start the backend"
echo "   - Run 'npm run dev' in apps/pwabuilder/Frontend to start the frontend dev server"
