#!/bin/bash
set -e

echo "Installing dependencies..."
npm install

echo "Building Next.js..."
npm run build

echo "Build complete!"
