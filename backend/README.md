# CTC Tutor Backend

Express.js + TypeScript backend for the Concept-to-Code Tutor application.

## Features

- **AI Provider Flexibility**: Switch between Amazon Bedrock and OpenAI
- **RESTful API**: Clean endpoints for concept explanation, code analysis, and more
- **TypeScript**: Full type safety and IntelliSense support
- **Error Handling**: Comprehensive error handling and logging
- **CORS Support**: Configured for frontend integration

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

   Server runs on `http://localhost:3001`

## AI Provider Configuration

The backend supports two AI providers that can be switched via environment variable:

### Amazon Bedrock (Default)

```bash
USE_BEDROCK=true
AWS_REGION=us-east-1
PREFER_CLAUDE=false  # false for Nova, true for Claude
```

**Setup AWS credentials:**
```bash
aws configure
# or set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
```

### OpenAI

```bash
USE_BEDROCK=false
OPENAI_API_KEY=sk-...your-api-key...
```

### Switching Providers

See [Feature Flag Guide](./docs/FEATURE_FLAG_GUIDE.md) for detailed instructions on:
- How the feature flag works
- Step-by-step switching guide
- Rollback procedures
- Testing and monitoring
- Troubleshooting

## API Endpoints

### Concept Explanation
```
POST /api/concepts/explain
Body: { topic: string, context?: AdaptiveContext }
```

### Code Analysis
```
POST /api/code/analyze
Body: { code: string, language: string }
```

### Dictionary Lookup
```
POST /api/dictionary/lookup
Body: { word: string, language?: string }
```

### Viro Assistant (Socratic Tutor)
```
POST /api/viro/chat
Body: { message: string, conversationHistory?: Message[] }
```

### Vision Analysis
```
POST /api/vision/analyze
Body: { image: string (base64), prompt?: string }
```

## Project Structure

```
backend/
├── src/
│   ├── lambda/              # AWS Lambda handlers
│   │   ├── handlers/        # Individual Lambda functions
│   │   └── utils/           # Lambda utilities
│   ├── routes/              # Express route handlers
│   │   ├── conceptRoutes.ts
│   │   ├── codeAnalysisRoutes.ts
│   │   ├── dictionaryRoutes.ts
│   │   ├── viroRoutes.ts
│   │   └── visionRoutes.ts
│   ├── services/            # Business logic
│   │   ├── aiService.ts           # Main AI service (provider switching)
│   │   ├── bedrockService.ts      # Amazon Bedrock integration
│   │   ├── promptAdapter.ts       # Prompt formatting for different models
│   │   ├── responseParser.ts      # Response parsing and validation
│   │   ├── pedagogicalAnalyzer.ts # Code logic analysis
│   │   ├── adaptiveService.ts     # Learning adaptation
│   │   ├── viroService.ts         # Socratic tutoring
│   │   └── visionService.ts       # Image analysis
│   ├── shared/              # Shared types
│   │   └── types.ts
│   └── server.ts            # Express server setup
├── docs/                    # Documentation
│   └── FEATURE_FLAG_GUIDE.md
├── .env                     # Environment configuration
├── .env.production.template # Production template
├── package.json
└── tsconfig.json
```

## Development

### Scripts

```bash
# Start development server with hot reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Start production server
npm start
```

### Testing

```bash
# Test Bedrock service
npx ts-node src/services/bedrockService.test.ts

# Test feature flag switching
npx ts-node src/services/aiService.featureFlag.test.ts

# Test concept explanation
npx ts-node src/services/conceptExplanation.test.ts

# Test response parser
npx ts-node src/services/responseParser.test.ts
```

## Deployment Options

### Option 1: AWS Lambda (Primary)

The backend can be deployed as AWS Lambda functions for serverless operation.

**Build Lambda packages:**
```bash
npm run build:lambda
```

**Deploy with SAM:**
```bash
sam build
sam deploy --guided
```

See [AWS Bedrock Lambda Migration Spec](../.kiro/specs/aws-bedrock-lambda-migration/) for full deployment guide.

### Option 2: Railway (Backup/Recommended)

Deploy Express backend to Railway as a backup option.

**Quick deploy:**
```bash
# Bash
./deploy-railway.sh

# PowerShell
./deploy-railway.ps1
```

**Manual deploy:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Option 3: Vercel (Alternative Backup)

Deploy to Vercel (note: has limitations with AWS SDK).

**Quick deploy:**
```bash
./deploy-vercel.sh
```

**Manual deploy:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

**⚠️ Vercel Limitations:**
- 10s timeout on Hobby plan (60s on Pro)
- May not work well with AWS Bedrock
- Railway recommended for AWS integration

See [Backup Deployment Guide](./BACKUP_DEPLOYMENT_GUIDE.md) for detailed instructions on Railway and Vercel deployment.

## Environment Variables

### Required

```bash
# AI Provider Selection
USE_BEDROCK=true              # true for Bedrock, false for OpenAI

# Bedrock Configuration (when USE_BEDROCK=true)
AWS_REGION=us-east-1          # AWS region
PREFER_CLAUDE=false           # false for Nova, true for Claude

# OpenAI Configuration (when USE_BEDROCK=false)
OPENAI_API_KEY=sk-...         # OpenAI API key

# Server Configuration
PORT=3001                     # Server port
NODE_ENV=development          # development or production
```

### Optional

```bash
# CORS Configuration
FRONTEND_URL=http://localhost:3000  # Frontend URL for CORS
ALLOWED_ORIGINS=https://...         # Additional allowed origins

# AWS Credentials (if not using AWS CLI)
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

## Error Handling

The backend implements comprehensive error handling:

- **AI Service Errors**: Rate limits, quota exceeded, model unavailable
- **Validation Errors**: Invalid input parameters
- **Network Errors**: Timeout, connection issues
- **Authentication Errors**: Invalid API keys or AWS credentials

All errors are logged and return appropriate HTTP status codes with user-friendly messages.

## Logging

### Development
Console logs with detailed information about:
- AI provider initialization
- API requests and responses
- Error details and stack traces

### Production
Structured JSON logs for:
- CloudWatch integration (Lambda)
- Request/response metrics
- Token usage and costs
- Performance metrics

### Bedrock Metrics Example
```json
{
  "timestamp": "2026-03-07T13:06:49.295Z",
  "service": "bedrock",
  "operation": "invoke_model",
  "model": "us.amazon.nova-lite-v1:0",
  "inputTokens": 907,
  "outputTokens": 1099,
  "totalTokens": 2006,
  "latencyMs": 9019,
  "success": true
}
```

## Performance

### Response Times
- Concept Explanation: 3-10 seconds
- Code Analysis: 2-8 seconds
- Dictionary Lookup: 1-3 seconds
- Vision Analysis: 5-15 seconds

### Optimization
- Response caching for common queries
- Efficient prompt engineering
- Model selection based on task complexity
- Lambda cold start optimization

## Security

- **API Key Protection**: Never expose keys in frontend
- **CORS Configuration**: Restrict origins in production
- **Input Validation**: Sanitize all user inputs
- **Rate Limiting**: Prevent abuse
- **HTTPS Only**: Enforce secure connections in production

## Troubleshooting

### Common Issues

**"No AI service configured"**
- Check `USE_BEDROCK` value in `.env`
- Verify credentials (AWS or OpenAI)
- Restart the server

**"OPENAI_API_KEY is required"**
- Set `OPENAI_API_KEY` in `.env`
- Or switch to Bedrock: `USE_BEDROCK=true`

**Bedrock rate limiting**
- Implement caching
- Add rate limiting middleware
- Switch to OpenAI temporarily

**Different response quality**
- Adjust prompts via PromptAdapter
- Use appropriate model for task
- Fine-tune temperature and max_tokens

See [Feature Flag Guide](./docs/FEATURE_FLAG_GUIDE.md) for detailed troubleshooting.

## Documentation

- [Feature Flag Guide](./docs/FEATURE_FLAG_GUIDE.md) - AI provider switching
- [PromptAdapter Guide](./src/services/promptAdapter.README.md) - Prompt engineering
- [ResponseParser Guide](./src/services/responseParser.README.md) - Response parsing
- [Service Documentation](./src/services/README.md) - Service architecture

## Contributing

1. Follow TypeScript best practices
2. Add tests for new features
3. Update documentation
4. Test with both AI providers
5. Check error handling

## License

MIT License - see LICENSE file for details.
