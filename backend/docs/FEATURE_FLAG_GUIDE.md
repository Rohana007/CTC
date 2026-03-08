# Feature Flag Guide: AI Provider Switching

## Overview

The CTC Tutor backend supports switching between two AI providers:
- **Amazon Bedrock** (AWS-native, Claude/Nova models)
- **OpenAI** (GPT-3.5/GPT-4 models)

This feature flag system enables quick rollback to OpenAI if Bedrock issues arise, or vice versa.

## Configuration

### Environment Variable

The provider is controlled by the `USE_BEDROCK` environment variable in `backend/.env`:

```bash
# Use Amazon Bedrock
USE_BEDROCK=true

# Use OpenAI
USE_BEDROCK=false
```

### Required Configuration for Each Provider

#### Amazon Bedrock Configuration

When `USE_BEDROCK=true`, ensure these are set:

```bash
USE_BEDROCK=true
AWS_REGION=us-east-1  # or your preferred region
PREFER_CLAUDE=false   # true for Claude, false for Nova
```

**AWS Credentials**: Configure via one of these methods:
- AWS CLI: `aws configure`
- Environment variables: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- IAM role (for Lambda/EC2 deployments)

#### OpenAI Configuration

When `USE_BEDROCK=false`, ensure this is set:

```bash
USE_BEDROCK=false
OPENAI_API_KEY=sk-...your-api-key...
```

## How It Works

### Implementation Details

The `AIService` class checks the `USE_BEDROCK` flag during initialization:

```typescript
constructor() {
  this.useBedrock = process.env.USE_BEDROCK === 'true';
  
  if (this.useBedrock) {
    this.bedrock = new BedrockService(region);
    console.log('AIService initialized with Amazon Bedrock');
  } else {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    console.log('AIService initialized with OpenAI');
  }
}
```

### Method Routing

All AI methods check the flag and route to the appropriate provider:

```typescript
async explainConcept(topic: string, context?: AdaptiveContext): Promise<ConceptResponse> {
  if (this.useBedrock && this.bedrock) {
    return this.explainConceptWithBedrock(topic, context);
  } else if (this.openai) {
    return this.explainConceptWithOpenAI(topic, context);
  } else {
    throw new Error('No AI service configured');
  }
}
```

### Affected Methods

The feature flag controls these AI operations:
- `explainConcept()` - Concept explanations
- `analyzeCode()` - Code analysis
- `lookupTerm()` - Dictionary lookups
- All Viro assistant interactions
- Vision analysis (image understanding)

## Switching Providers

### Step-by-Step Guide

#### Switch to Bedrock

1. Edit `backend/.env`:
   ```bash
   USE_BEDROCK=true
   AWS_REGION=us-east-1
   ```

2. Ensure AWS credentials are configured:
   ```bash
   aws configure
   # or set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
   ```

3. Restart the backend server:
   ```bash
   npm run dev
   ```

4. Verify in logs:
   ```
   AIService initialized with Amazon Bedrock
   ```

#### Switch to OpenAI

1. Edit `backend/.env`:
   ```bash
   USE_BEDROCK=false
   OPENAI_API_KEY=sk-...your-key...
   ```

2. Restart the backend server:
   ```bash
   npm run dev
   ```

3. Verify in logs:
   ```
   AIService initialized with OpenAI
   ```

### No Code Changes Required

The feature flag is purely configuration-based. No code changes are needed to switch providers.

## Testing the Feature Flag

### Manual Testing

Run the feature flag test script:

```bash
cd backend
npx ts-node src/services/aiService.featureFlag.test.ts
```

This will:
1. Show current provider configuration
2. Test concept explanation
3. Test code analysis
4. Test dictionary lookup
5. Display switching instructions

### Expected Output

With Bedrock:
```
✅ AIService initialized successfully
AIService initialized with Amazon Bedrock
✅ Concept explanation successful
✅ Code analysis successful
✅ Dictionary lookup successful
```

With OpenAI:
```
✅ AIService initialized successfully
AIService initialized with OpenAI
✅ Concept explanation successful
✅ Code analysis successful
✅ Dictionary lookup successful
```

## Rollback Scenarios

### When to Rollback

Consider switching providers if:
- **Bedrock Issues**: Model unavailability, rate limits, regional outages
- **OpenAI Issues**: API quota exceeded, service degradation
- **Cost Concerns**: One provider becomes more expensive
- **Quality Issues**: Response quality degrades for specific use cases

### Quick Rollback Procedure

1. **Identify the issue**: Check CloudWatch logs (Bedrock) or OpenAI dashboard
2. **Update environment**: Change `USE_BEDROCK` in `.env`
3. **Restart service**: `npm run dev` (local) or redeploy Lambda (production)
4. **Verify**: Check logs for successful initialization
5. **Monitor**: Watch for errors and response quality

### Production Rollback

For Lambda deployments:

1. Update environment variable in AWS Console:
   - Go to Lambda function configuration
   - Edit environment variables
   - Change `USE_BEDROCK` value
   - Save

2. Or update via AWS CLI:
   ```bash
   aws lambda update-function-configuration \
     --function-name your-function-name \
     --environment Variables={USE_BEDROCK=false,OPENAI_API_KEY=sk-...}
   ```

3. No redeployment needed - Lambda picks up new env vars immediately

## Error Handling

### Provider-Specific Errors

The system handles errors gracefully for each provider:

**Bedrock Errors**:
- Rate limiting: "Bedrock API rate limit exceeded. Please try again in a few moments."
- Model unavailable: "Failed to generate concept explanation"
- Invalid credentials: AWS SDK error messages

**OpenAI Errors**:
- Quota exceeded: "OpenAI API quota exceeded. Please check your billing details."
- Invalid API key: "OPENAI_API_KEY is required"
- Network issues: "Failed to generate concept explanation"

### Fallback Behavior

If both providers fail:
```typescript
throw new Error('No AI service configured');
```

This ensures the application fails fast rather than silently producing incorrect results.

## Monitoring

### Log Messages

Watch for these initialization messages:

```bash
# Bedrock
AIService initialized with Amazon Bedrock

# OpenAI
AIService initialized with OpenAI
```

### Bedrock Metrics

Bedrock logs include detailed metrics:
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

### OpenAI Metrics

OpenAI calls are logged with error details when issues occur.

## Best Practices

### Development

- Use Bedrock for development (free tier, no API key management)
- Test both providers regularly to ensure compatibility
- Keep prompts provider-agnostic where possible

### Production

- Use Bedrock for production (better cost, AWS integration)
- Keep OpenAI configured as backup
- Monitor costs and performance for both providers
- Set up CloudWatch alarms for error rates

### Cost Optimization

- **Bedrock**: Use Nova models (cheaper) for simple tasks, Claude for complex tasks
- **OpenAI**: Use GPT-3.5-turbo for most tasks, GPT-4 only when needed
- Cache responses to reduce API calls
- Monitor token usage via logs

## Troubleshooting

### Issue: "No AI service configured"

**Cause**: Both providers are unavailable or misconfigured

**Solution**:
1. Check `USE_BEDROCK` value
2. Verify credentials (AWS or OpenAI)
3. Check network connectivity
4. Review error logs

### Issue: "OPENAI_API_KEY is required"

**Cause**: OpenAI selected but no API key provided

**Solution**:
1. Set `OPENAI_API_KEY` in `.env`
2. Or switch to Bedrock: `USE_BEDROCK=true`

### Issue: Bedrock rate limiting

**Cause**: Too many requests to Bedrock

**Solution**:
1. Implement request caching
2. Add rate limiting middleware
3. Switch to OpenAI temporarily
4. Request quota increase from AWS

### Issue: Different response quality

**Cause**: Models have different strengths

**Solution**:
1. Adjust prompts for each provider (PromptAdapter handles this)
2. Use appropriate model for task complexity
3. Test with sample queries
4. Fine-tune temperature and max_tokens

## Related Documentation

- [BedrockService Documentation](../src/services/README.md)
- [PromptAdapter Guide](../src/services/promptAdapter.README.md)
- [ResponseParser Guide](../src/services/responseParser.README.md)
- [AWS Bedrock Lambda Migration Spec](../../.kiro/specs/aws-bedrock-lambda-migration/)

## Support

For issues or questions:
1. Check CloudWatch logs (Bedrock) or OpenAI dashboard
2. Review error messages in application logs
3. Test with the feature flag test script
4. Consult AWS Bedrock documentation or OpenAI API docs
