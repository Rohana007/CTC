#!/bin/bash
# Lambda Layer Build Script
# Creates a Lambda layer with shared dependencies (AWS SDK)

set -e

echo "🔨 Building Lambda layer..."

# Clean previous layer build
echo "Cleaning previous layer build..."
rm -rf layer
mkdir -p layer/nodejs

# Create package.json for layer with only AWS SDK dependencies
echo "Creating layer package.json..."
cat > layer/nodejs/package.json << 'EOF'
{
  "name": "ctc-tutor-lambda-layer",
  "version": "1.0.0",
  "description": "Shared dependencies for CTC Tutor Lambda functions",
  "dependencies": {
    "@aws-sdk/client-bedrock-runtime": "^3.1000.0"
  }
}
EOF

# Install dependencies in layer
echo "Installing layer dependencies..."
cd layer/nodejs
npm install --production --no-optional --no-audit
cd ../..

# Create layer zip
echo "Creating layer zip..."
cd layer
zip -r ../lambda-layer.zip . -x "*.git*" -x "*node_modules/.cache*"
cd ..

echo "✅ Lambda layer built successfully!"
echo "📦 Layer package: lambda-layer.zip"
echo "📊 Layer size: $(du -h lambda-layer.zip | cut -f1)"
