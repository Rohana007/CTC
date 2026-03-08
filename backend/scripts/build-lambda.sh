#!/bin/bash
# Lambda Build Script
# Compiles TypeScript and creates optimized deployment packages using esbuild

set -e

echo "🔨 Building Lambda functions with esbuild..."

# Clean previous build
echo "Cleaning previous build..."
rm -rf dist
rm -rf .aws-sam

# Run esbuild to create optimized bundles
echo "Running esbuild..."
node esbuild.config.js

# Build Lambda layer (optional - only if not already built)
if [ ! -f "lambda-layer.zip" ]; then
  echo "Building Lambda layer..."
  bash scripts/build-layer.sh
fi

echo "✅ Lambda build complete!"
echo "📦 Optimized deployment packages ready in dist/"
echo ""
echo "Cold start optimizations applied:"
echo "  ✓ Code bundled and minified with esbuild"
echo "  ✓ Tree-shaking removed unused code"
echo "  ✓ AWS SDK externalized (provided by Lambda layer)"
echo "  ✓ Separate bundles per function for minimal size"
