#!/bin/bash
# Master AWS Deployment Script
# Deploys full CTC Tutor stack to AWS

set -e

STACK_NAME="ctc-tutor-stack"
ENVIRONMENT="dev"
AWS_REGION="us-east-1"

echo "🚀 Starting AWS deployment..."
echo "Stack: $STACK_NAME"
echo "Environment: $ENVIRONMENT"
echo "Region: $AWS_REGION"
echo ""

# Step 1: Build Lambda functions
echo "📦 Step 1/6: Building Lambda functions..."
cd backend
chmod +x scripts/build-lambda.sh
./scripts/build-lambda.sh
cd ..

# Step 2: Deploy SAM stack
echo "☁️  Step 2/6: Deploying SAM stack..."
cd backend
sam deploy \
  --template-file template.yaml \
  --stack-name $STACK_NAME \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides Environment=$ENVIRONMENT \
  --region $AWS_REGION \
  --no-confirm-changeset \
  --resolve-s3

# Get outputs
echo "📋 Step 3/6: Retrieving stack outputs..."
API_URL=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --region $AWS_REGION \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiGatewayUrl`].OutputValue' \
  --output text)

CLOUDFRONT_URL=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --region $AWS_REGION \
  --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontUrl`].OutputValue' \
  --output text)

BUCKET_NAME=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --region $AWS_REGION \
  --query 'Stacks[0].Outputs[?OutputKey==`FrontendBucketName`].OutputValue' \
  --output text)

cd ..

# Step 4: Build frontend
echo "🎨 Step 4/6: Building frontend..."
cd frontend
export API_GATEWAY_URL="$API_URL"
chmod +x scripts/build-production.sh
./scripts/build-production.sh
cd ..

# Step 5: Upload frontend to S3
echo "📤 Step 5/6: Uploading frontend to S3..."
aws s3 sync frontend/build/ s3://$BUCKET_NAME/ \
  --region $AWS_REGION \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "index.html" \
  --exclude "service-worker.js"

# Upload index.html and service-worker.js with no-cache
aws s3 cp frontend/build/index.html s3://$BUCKET_NAME/index.html \
  --region $AWS_REGION \
  --cache-control "no-cache, no-store, must-revalidate"

if [ -f frontend/build/service-worker.js ]; then
  aws s3 cp frontend/build/service-worker.js s3://$BUCKET_NAME/service-worker.js \
    --region $AWS_REGION \
    --cache-control "no-cache, no-store, must-revalidate"
fi

# Step 6: Invalidate CloudFront cache
echo "🔄 Step 6/6: Invalidating CloudFront cache..."
DISTRIBUTION_ID=$(aws cloudfront list-distributions \
  --region $AWS_REGION \
  --query "DistributionList.Items[?contains(Origins.Items[0].DomainName, '$BUCKET_NAME')].Id" \
  --output text)

if [ -n "$DISTRIBUTION_ID" ]; then
  aws cloudfront create-invalidation \
    --distribution-id $DISTRIBUTION_ID \
    --paths "/*" \
    --region $AWS_REGION
  echo "✅ CloudFront cache invalidated"
else
  echo "⚠️  Could not find CloudFront distribution ID"
fi

# Print deployment URLs
echo ""
echo "✨ Deployment complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📍 API Gateway URL: $API_URL"
echo "🌐 CloudFront URL: https://$CLOUDFRONT_URL"
echo "🪣 S3 Bucket: $BUCKET_NAME"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎯 Next steps:"
echo "  1. Test the application at: https://$CLOUDFRONT_URL"
echo "  2. Monitor logs in CloudWatch"
echo "  3. Check the dashboard: https://console.aws.amazon.com/cloudwatch/home?region=$AWS_REGION#dashboards:name=$STACK_NAME-Dashboard"
echo ""
