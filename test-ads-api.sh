#!/bin/bash

# Test script for AI Ads Generator API
# Make sure to replace YOUR_FIREBASE_TOKEN with a real token

echo "🧪 Testing AI Ads Generator API"
echo "================================"
echo ""

# Get Firebase token from environment or use placeholder
FIREBASE_TOKEN="${FIREBASE_TOKEN:-YOUR_FIREBASE_TOKEN_HERE}"

if [ "$FIREBASE_TOKEN" = "YOUR_FIREBASE_TOKEN_HERE" ]; then
  echo "⚠️  WARNING: Using placeholder token. Set FIREBASE_TOKEN environment variable for real testing."
  echo ""
fi

echo "📝 Test 1: Generate Facebook Ads"
echo "---------------------------------"
curl -X POST http://localhost:3000/api/ads/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $FIREBASE_TOKEN" \
  -d '{
    "title": "Fitness Pro Launch",
    "description": "AI-powered fitness app with meal tracking and personalized workout plans for busy professionals",
    "audience": "busy professionals aged 25-40 who want to stay healthy",
    "platform": "Facebook"
  }' \
  -w "\n\nStatus Code: %{http_code}\n" \
  -s | jq '.' || echo "Response (raw): $(curl -s -X POST http://localhost:3000/api/ads/generate -H "Content-Type: application/json" -H "Authorization: Bearer $FIREBASE_TOKEN" -d '{"title":"Fitness Pro Launch","description":"AI-powered fitness app with meal tracking and personalized workout plans for busy professionals","audience":"busy professionals aged 25-40 who want to stay healthy","platform":"Facebook"}')"

echo ""
echo ""
echo "📝 Test 2: Missing Required Fields (should fail)"
echo "------------------------------------------------"
curl -X POST http://localhost:3000/api/ads/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $FIREBASE_TOKEN" \
  -d '{
    "title": "Test Product"
  }' \
  -w "\n\nStatus Code: %{http_code}\n" \
  -s | jq '.' || cat

echo ""
echo ""
echo "📝 Test 3: No Authentication (should fail)"
echo "------------------------------------------"
curl -X POST http://localhost:3000/api/ads/generate \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test",
    "description": "Test",
    "audience": "Test",
    "platform": "Facebook"
  }' \
  -w "\n\nStatus Code: %{http_code}\n" \
  -s | jq '.' || cat

echo ""
echo "✅ Tests complete!"
