/**
 * Manual test script for BedrockService
 * Run with: npx ts-node src/services/bedrockService.test.ts
 * 
 * Prerequisites:
 * - AWS credentials configured (via ~/.aws/credentials or environment variables)
 * - Bedrock model access enabled in AWS account
 */

import { BedrockService, ClaudeModel, ClaudeMessage } from './bedrockService';

async function testBedrockService() {
  console.log('🧪 Testing BedrockService...\n');

  const service = new BedrockService('us-east-1');

  // Test 1: Simple invocation with Haiku (fast, cost-effective)
  console.log('Test 1: Simple question with Claude Haiku');
  try {
    const messages: ClaudeMessage[] = [
      {
        role: 'user',
        content: 'What is a binary search tree? Answer in 2 sentences.',
      },
    ];

    const response = await service.invokeClaude(messages, {
      model: ClaudeModel.HAIKU_3_5,
      temperature: 0.3,
      maxTokens: 200,
    });

    console.log('✅ Response:', response);
    console.log();
  } catch (error) {
    console.error('❌ Test 1 failed:', error);
  }

  // Test 2: Complex task with Sonnet
  console.log('Test 2: Code explanation with Claude Sonnet');
  try {
    const messages: ClaudeMessage[] = [
      {
        role: 'user',
        content: `Explain this Python code:
\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
\`\`\``,
      },
    ];

    const response = await service.invokeClaude(
      messages,
      {
        model: ClaudeModel.SONNET_3_5_V2,
        temperature: 0.2,
        maxTokens: 500,
      },
      'You are a computer science tutor. Explain code clearly and concisely.'
    );

    console.log('✅ Response:', response);
    console.log();
  } catch (error) {
    console.error('❌ Test 2 failed:', error);
  }

  // Test 3: Model selection helper
  console.log('Test 3: Model selection helper');
  const complexModel = BedrockService.selectModel(true);
  const simpleModel = BedrockService.selectModel(false);
  console.log('✅ Complex task model:', complexModel);
  console.log('✅ Simple task model:', simpleModel);
  console.log();

  // Test 4: Error handling (invalid model)
  console.log('Test 4: Error handling with invalid request');
  try {
    const messages: ClaudeMessage[] = [
      {
        role: 'user',
        content: 'Test',
      },
    ];

    // This should fail gracefully
    await service.invokeClaude(messages, {
      model: 'invalid-model' as ClaudeModel,
      maxTokens: 10,
    });

    console.log('❌ Should have thrown an error');
  } catch (error) {
    if (error instanceof Error) {
      console.log('✅ Error handled correctly:', error.message);
    }
  }

  console.log('\n✨ All tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  testBedrockService().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { testBedrockService };
