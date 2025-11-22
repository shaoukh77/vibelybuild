#!/usr/bin/env bash
# VibelyBuild.AI - Render.com Production Build Script
# Installs dependencies and builds the Next.js application

set -e

echo "========================================="
echo "VibelyBuild.AI - Render Build"
echo "========================================="

echo ""
echo "📦 Step 1/3: Installing Node.js dependencies..."
npm ci --production=false

echo ""
echo "🏗️  Step 2/3: Building Next.js application..."
npm run build

echo ""
echo "🔧 Step 3/3: Installing production dependencies..."
npm prune --production

echo ""
echo "========================================="
echo "✅ Build Complete!"
echo "========================================="
echo ""
echo "Installed packages:"
echo "  - puppeteer-core (serverless browser)"
echo "  - @sparticuz/chromium (headless Chrome)"
echo "  - archiver (ZIP bundling)"
echo ""
echo "Ready for deployment! 🚀"
echo ""
