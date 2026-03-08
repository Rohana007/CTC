# BedrockService Documentation

## Overview

The `BedrockService` provides a robust wrapper around AWS Bedrock Runtime Client with support for Claude 3 models. It includes comprehensive error handling, automatic retry logic with exponential backoff, and model selection helpers.

## Features

- ✅ Support for Claude 3.5 Sonnet v2, Claude 3.7 Sonnet, and Claude 3.5 Haiku
- ✅ Automatic retry logic with exponential backoff for transient failures
- ✅ Comprehensive error handling for throttling, timeouts, and model unavailability
- ✅ User-friendly error messages
- ✅ Model selection helper for task complexity
- ✅ TypeScript type safety

## Installation

The service requires the AWS SDK for Bedrock Runtime:

```bash
npm install @aws-sdk/client-bedrock-runtime
```

## Prerequisites

### AWS Credentials

Configure AWS credentials using one of these methods:

1. **AWS CLI Configuration** (recommended for development):
   ```bash
   aws configure
   ```

2. **Environment Variables**:
   ```bash
   export AWS_ACCESS_KEY_ID=your_access_key
   export AWS_SECRET_ACCESS_KEY=your_secret_key
   export AWS_REGION=us-east-1
   ```

3. **IAM Role** (recommended for Lambda/EC2):
   - Attach an IAM role with Bedrock permissions to your Lambda function or EC2 instance

### IAM Permissions

The service requires the following IAM permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel"
      ],
      "Resource": [
        "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-5-sonnet-20241022-v2:0",
        "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-7-sonnet-20250219-v1:0",
        "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-5-haiku-20241022-v1:0"
      ]
    }
  ]
}
```

### Model Access

Enable model access in AWS Bedrock console:
1. Go to AWS Bedrock console
2. Navigate to "Model access"
3. Request access to Claude 3 models
4. Wait for approval (usually instant for Claude models)

## Usage

### Basic Usage

```typescript
import { BedrockService, ClaudeModel, ClaudeMessage } from './services/bedrockService';

const service = new BedrockService('us-east-1');

const messages: ClaudeMessage[] = [
  {
    role: 'user',
    content: 'Explain binary search in simple terms.',
  },
];

const response = await service.invokeClaude(messages, {
  model: ClaudeModel.HAIKU_3_5,
  temperature: 0.3,
  maxTokens: 500,
});

console.log(response);
```

### With System Prompt

```typescript
const response = await service.invokeClaude(
  messages,
  {
    model: ClaudeModel.SONNET_3_5_V2,
    temperature: 0.2,
    maxTokens: 1000,
  },
  'You are a helpful computer science tutor. Explain concepts clearly and provide examples.'
);
```

### Model Selection Helper

```typescript
// Automatically select model based on task complexity
const model = BedrockService.selectModel(isComplexTask);

const response = await service.invokeClaude(messages, {
  model,
  temperature: 0.3,
  maxTokens: 1000,
});
```

### Multi-turn Conversation

```typescript
const messages: ClaudeMessage[] = [
  {
    role: 'user',
    content: 'What is recursion?',
  },
  {
    role: 'assistant',
    content: 'Recursion is when a function calls itself...',
  },
  {
    role: 'user',
    content: 'Can you show me an example?',
  },
];

const response = await service.invokeClaude(messages, {
  model: ClaudeModel.SONNET_3_5_V2,
  maxTokens: 1000,
});
```

### Custom Retry Configuration

```typescript
const service = new BedrockService('us-east-1', {
  maxRetries: 5,
  initialDelayMs: 500,
  maxDelayMs: 15000,
  backoffMultiplier: 2.5,
});
```

## Model Selection Guide

### Claude 3.5 Haiku (`HAIKU_3_5`)
- **Use for**: Simple tasks, quick responses, cost-sensitive operations
- **Examples**: Dictionary lookups, simple explanations, translations
- **Cost**: Lowest
- **Speed**: Fastest
- **Quality**: Good for straightforward tasks

### Claude 3.5 Sonnet v2 (`SONNET_3_5_V2`)
- **Use for**: Complex reasoning, code analysis, detailed explanations
- **Examples**: Code analysis, Viro assistant, pedagogical explanations
- **Cost**: Medium
- **Speed**: Medium
- **Quality**: Excellent for complex tasks

### Claude 3.7 Sonnet (`SONNET_3_7`)
- **Use for**: Most advanced reasoning, complex multi-step tasks
- **Examples**: Advanced code generation, complex problem solving
- **Cost**: Highest
- **Speed**: Slower
- **Quality**: Best available

## Error Handling

The service handles various error types:

### Retryable Errors (Automatic Retry)
- `ThrottlingException`: Rate limit exceeded
- `ModelTimeoutException`: Request timeout
- `ServiceUnavailableException`: Temporary service issues
- `ModelNotReadyException`: Model is loading
- Network errors (ECONNRESET, ECONNREFUSED, etc.)

### Non-Retryable Errors (Immediate Failure)
- `AccessDeniedException`: IAM permissions issue
- `ValidationException`: Invalid request parameters
- Invalid model ID
- Malformed request body

### Error Messages

The service provides user-friendly error messages:

```typescript
try {
  const response = await service.invokeClaude(messages, config);
} catch (error) {
  // Error messages are enhanced for better UX:
  // - "Bedrock API rate limit exceeded. Please try again in a few moments."
  // - "The requested model is not ready. Please try again in a few moments."
  // - "Access denied to Bedrock model. Please check IAM permissions."
  console.error(error.message);
}
```

## Configuration Options

### ClaudeInvocationConfig

```typescript
interface ClaudeInvocationConfig {
  model: ClaudeModel;           // Required: Model to use
  temperature?: number;         // Optional: 0.0-1.0, default 0.7
  maxTokens?: number;          // Optional: Max output tokens, default 2000
  topP?: number;               // Optional: Nucleus sampling, default 1.0
  stopSequences?: string[];    // Optional: Stop generation at these sequences
}
```

### RetryConfig

```typescript
interface RetryConfig {
  maxRetries: number;          // Default: 3
  initialDelayMs: number;      // Default: 1000ms
  maxDelayMs: number;          // Default: 10000ms
  backoffMultiplier: number;   // Default: 2
}
```

## Testing

Run the test script to verify your setup:

```bash
npx ts-node src/services/bedrockService.test.ts
```

The test script will:
1. Test simple invocation with Haiku
2. Test complex task with Sonnet
3. Test model selection helper
4. Test error handling

## Performance Considerations

### Cold Start Optimization
- The BedrockRuntimeClient is initialized once per service instance
- Reuse the service instance across requests to avoid initialization overhead
- In Lambda, initialize the service outside the handler function

### Token Usage
- Haiku: ~$0.25 per 1M input tokens, ~$1.25 per 1M output tokens
- Sonnet v2: ~$3 per 1M input tokens, ~$15 per 1M output tokens
- Use `maxTokens` to control costs
- Cache responses when possible

### Latency
- Haiku: ~1-2 seconds typical response time
- Sonnet: ~2-4 seconds typical response time
- Network latency: ~100-200ms (us-east-1)
- Use Haiku for latency-sensitive operations

## Best Practices

1. **Model Selection**: Use Haiku for simple tasks, Sonnet for complex reasoning
2. **Error Handling**: Always wrap invocations in try-catch blocks
3. **Retry Logic**: Use default retry config for most cases
4. **System Prompts**: Provide clear system prompts for better results
5. **Token Limits**: Set appropriate `maxTokens` to control costs and latency
6. **Temperature**: Use lower values (0.2-0.3) for factual tasks, higher (0.7-0.9) for creative tasks
7. **Logging**: Log invocations for monitoring and debugging
8. **Caching**: Cache responses for repeated queries to reduce costs

## Troubleshooting

### "Access denied to Bedrock model"
- Check IAM permissions
- Verify model access is enabled in Bedrock console
- Ensure correct region (us-east-1)

### "The requested model is not ready"
- Wait a few moments and retry
- Model may be loading (first invocation)
- Check model ID is correct

### "Bedrock API rate limit exceeded"
- Implement request throttling in your application
- Use exponential backoff (built-in)
- Consider upgrading AWS account limits

### High latency
- Use Haiku instead of Sonnet for simple tasks
- Reduce `maxTokens`
- Check network connectivity
- Consider using provisioned throughput (enterprise feature)

## Migration from OpenAI

Key differences when migrating from OpenAI:

1. **Message Format**: Similar to OpenAI, but uses `anthropic_version`
2. **System Prompts**: Separate parameter instead of system message
3. **Model Names**: Use `ClaudeModel` enum instead of string literals
4. **Error Types**: Different exception types (use built-in error handling)
5. **Retry Logic**: Built-in (no need for external retry libraries)

Example migration:

```typescript
// Before (OpenAI)
const completion = await openai.chat.completions.create({
  model: "gpt-3.5-turbo",
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Hello!" }
  ],
});
const response = completion.choices[0].message.content;

// After (Bedrock)
const response = await bedrockService.invokeClaude(
  [{ role: "user", content: "Hello!" }],
  { model: ClaudeModel.HAIKU_3_5, maxTokens: 500 },
  "You are a helpful assistant."
);
```

## Support

For issues or questions:
- Check AWS Bedrock documentation: https://docs.aws.amazon.com/bedrock/
- Review Claude API documentation: https://docs.anthropic.com/claude/reference/
- Check AWS service health: https://status.aws.amazon.com/
