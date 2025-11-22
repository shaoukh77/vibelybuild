#!/usr/bin/env bash
# Render build script for VibelyBuild
# Installs Chromium dependencies for Puppeteer

set -e

echo "📦 Installing Node.js dependencies..."
npm install

echo "🎨 Building Next.js application..."
npm run build

echo "✅ Build complete!"
