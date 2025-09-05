#!/bin/bash

echo "🧪 Testing PWABuilder DevContainer Setup..."
echo "=========================================="

# Test .NET
echo "🔧 Testing .NET SDK..."
dotnet --version
if [ $? -eq 0 ]; then
    echo "✅ .NET SDK is working"
else
    echo "❌ .NET SDK failed"
fi

# Test Node.js
echo "🟢 Testing Node.js..."
node --version
if [ $? -eq 0 ]; then
    echo "✅ Node.js is working"
else
    echo "❌ Node.js failed"
fi

# Test npm
echo "📦 Testing npm..."
npm --version
if [ $? -eq 0 ]; then
    echo "✅ npm is working"
else
    echo "❌ npm failed"
fi

# Test Chrome/Puppeteer dependencies
echo "🤖 Testing Chrome installation..."
google-chrome-stable --version
if [ $? -eq 0 ]; then
    echo "✅ Chrome is installed"
else
    echo "❌ Chrome installation failed"
fi

# Test GitHub CLI
echo "🐙 Testing GitHub CLI..."
gh --version
if [ $? -eq 0 ]; then
    echo "✅ GitHub CLI is working"
else
    echo "❌ GitHub CLI failed"
fi

echo "=========================================="
echo "🎉 DevContainer test completed!"
