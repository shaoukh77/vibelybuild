#!/bin/bash
set -e

echo "Installing dependencies..."
npm install

echo "Building Next.js..."
npx next build

echo "Build complete!"
