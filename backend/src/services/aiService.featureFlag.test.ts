/**
 * Manual test script for AIService Feature Flag
 * Run with: npx ts-node src/services/aiService.featureFlag.test.ts
 * 
 * Tests the ability to switch between Bedrock and OpenAI providers
 * using the USE_BEDROCK environment variable
 */

import { AIService } from './aiService';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testFeatureFlag() {
  console.log('🧪 Testing AIService Feature Flag System...\n');

  // Test 1: Verify current provider
  console.log('Test 1: Check current provider configuration');
  console.log('USE_BEDROCK =', process.env.USE_BEDROCK);
  console.log('AWS_REGION =', process.env.AWS_REGION);
  console.log('OPENAI_API_KEY =', process.env.OPENAI_API_KEY ? '***configured***' : 'not set');
  console.log();

  try {
    const aiService = new AIService();
    console.log('✅ AIService initialized successfully');
    console.log();

    // Test 2: Test concept explanation with current provider
    console.log('Test 2: Test concept explanation with current provider');
    try {
      const result = await aiService.explainConcept('binary search', {
        preferredComplexity: 'beginner',
        repeatedQueries: [],
        confusionPatterns: []
      });
      console.log('✅ Concept explanation successful');
      console.log('Topic:', result.explanation.topic);
      console.log('Intuition:', result.explanation.intuition.substring(0, 100) + '...');
      console.log();
    } catch (error) {
      console.error('❌ Concept explanation failed:', error instanceof Error ? error.message : error);
      console.log();
    }

    // Test 3: Test code analysis with current provider
    console.log('Test 3: Test code analysis with current provider');
    try {
      const testCode = `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n-1)`;
      
      const result = await aiService.analyzeCode(testCode, 'python');
      console.log('✅ Code analysis successful');
      console.log('Summary:', result.summary);
      console.log('Issues found:', result.issues?.length || 0);
      console.log();
    } catch (error) {
      console.error('❌ Code analysis failed:', error instanceof Error ? error.message : error);
      console.log();
    }

    // Test 4: Test dictionary lookup with current provider
    console.log('Test 4: Test dictionary lookup with current provider');
    try {
      const result = await aiService.lookupTerm('recursion', 'en');
      console.log('✅ Dictionary lookup successful');
      console.log('Word:', result.word);
      console.log('Definition:', result.definition.substring(0, 100) + '...');
      console.log();
    } catch (error) {
      console.error('❌ Dictionary lookup failed:', error instanceof Error ? error.message : error);
      console.log();
    }

  } catch (error) {
    console.error('❌ AIService initialization failed:', error instanceof Error ? error.message : error);
    console.log();
  }

  // Test 5: Instructions for switching providers
  console.log('Test 5: How to switch providers');
  console.log('To switch to Bedrock:');
  console.log('  1. Set USE_BEDROCK=true in backend/.env');
  console.log('  2. Ensure AWS_REGION is set (e.g., us-east-1)');
  console.log('  3. Configure AWS credentials via AWS CLI or IAM role');
  console.log();
  console.log('To switch to OpenAI:');
  console.log('  1. Set USE_BEDROCK=false in backend/.env');
  console.log('  2. Ensure OPENAI_API_KEY is set with valid API key');
  console.log();
  console.log('Current configuration:');
  console.log('  Provider:', process.env.USE_BEDROCK === 'true' ? 'Amazon Bedrock' : 'OpenAI');
  console.log();

  console.log('✨ Feature flag tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  testFeatureFlag().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { testFeatureFlag };
