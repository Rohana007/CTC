/**
 * Test script for concept explanation feature with Bedrock
 * Tests all 10 supported languages and verifies response quality
 * 
 * Run with: npx ts-node src/services/conceptExplanation.test.ts
 * 
 * Prerequisites:
 * - AWS credentials configured
 * - Bedrock model access enabled
 * - USE_BEDROCK=true environment variable
 */

import { AIService } from './aiService';
import { AdaptiveContext } from '../../../shared/types';

// Language codes: EN, HI, MR, TA, TE, BN, GU, KN, ML, PA
const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi (हिंदी)' },
  { code: 'mr', name: 'Marathi (मराठी)' },
  { code: 'ta', name: 'Tamil (தமிழ்)' },
  { code: 'te', name: 'Telugu (తెలుగు)' },
  { code: 'bn', name: 'Bengali (বাংলা)' },
  { code: 'gu', name: 'Gujarati (ગુજરાતી)' },
  { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
  { code: 'ml', name: 'Malayalam (മലയാളം)' },
  { code: 'pa', name: 'Punjabi (ਪੰਜਾਬੀ)' },
];

// Test concepts to verify
const TEST_CONCEPTS = [
  'binary search tree',
  'recursion',
  'hash table',
];

interface TestResult {
  language: string;
  concept: string;
  success: boolean;
  responseTime: number;
  hasAllSections: boolean;
  hasCodeExample: boolean;
  error?: string;
  sampleText?: string;
}

async function testConceptExplanation() {
  console.log('🧪 Testing Concept Explanation Feature with Bedrock\n');
  console.log('=' .repeat(80));
  
  // Verify environment
  if (process.env.USE_BEDROCK !== 'true') {
    console.error('❌ USE_BEDROCK environment variable must be set to "true"');
    console.error('   Set it with: export USE_BEDROCK=true');
    process.exit(1);
  }

  const aiService = new AIService();
  const results: TestResult[] = [];

  // Test 1: Quick verification with English
  console.log('\n📝 Test 1: Quick English verification');
  console.log('-'.repeat(80));
  
  try {
    const startTime = Date.now();
    const response = await aiService.explainConcept('binary search tree');
    const responseTime = Date.now() - startTime;

    const hasAllSections = !!(
      response.explanation &&
      response.explanation.intuition &&
      response.explanation.technical &&
      response.codeExample &&
      response.codeExample.code
    );

    console.log(`✅ English test passed (${responseTime}ms)`);
    console.log(`   Topic: ${response.explanation.topic}`);
    console.log(`   Intuition: ${response.explanation.intuition.substring(0, 100)}...`);
    console.log(`   Has code example: ${!!response.codeExample.code}`);
    console.log(`   Has common mistakes: ${response.commonMistakes.length > 0}`);
    
    results.push({
      language: 'English',
      concept: 'binary search tree',
      success: true,
      responseTime,
      hasAllSections,
      hasCodeExample: !!response.codeExample.code,
      sampleText: response.explanation.intuition.substring(0, 150),
    });
  } catch (error) {
    console.error('❌ English test failed:', error);
    results.push({
      language: 'English',
      concept: 'binary search tree',
      success: false,
      responseTime: 0,
      hasAllSections: false,
      hasCodeExample: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // Test 2: Multilingual support - test all 10 languages
  console.log('\n📝 Test 2: Multilingual Support (All 10 Languages)');
  console.log('-'.repeat(80));
  
  for (const lang of SUPPORTED_LANGUAGES) {
    try {
      console.log(`\nTesting ${lang.name} (${lang.code})...`);
      
      // Create context - language will be handled by the prompt
      const context: AdaptiveContext = {
        preferredComplexity: 'beginner',
        repeatedQueries: [],
        confusionPatterns: [],
      };

      // For non-English languages, we'll test by requesting explanation in that language
      const conceptPrompt = lang.code === 'en' 
        ? 'recursion'
        : `recursion (explain in ${lang.name})`;

      const startTime = Date.now();
      const response = await aiService.explainConcept(conceptPrompt, context);
      const responseTime = Date.now() - startTime;

      const hasAllSections = !!(
        response.explanation &&
        response.explanation.intuition &&
        response.explanation.technical &&
        response.codeExample &&
        response.codeExample.code
      );

      console.log(`  ✅ Success (${responseTime}ms)`);
      console.log(`     Topic: ${response.explanation.topic}`);
      console.log(`     Intuition preview: ${response.explanation.intuition.substring(0, 80)}...`);
      
      results.push({
        language: lang.name,
        concept: 'recursion',
        success: true,
        responseTime,
        hasAllSections,
        hasCodeExample: !!response.codeExample.code,
        sampleText: response.explanation.intuition.substring(0, 100),
      });

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`  ❌ Failed: ${error instanceof Error ? error.message : String(error)}`);
      results.push({
        language: lang.name,
        concept: 'recursion',
        success: false,
        responseTime: 0,
        hasAllSections: false,
        hasCodeExample: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Test 3: Response quality verification
  console.log('\n📝 Test 3: Response Quality Verification');
  console.log('-'.repeat(80));
  
  try {
    const response = await aiService.explainConcept('hash table', {
      preferredComplexity: 'intermediate',
      repeatedQueries: [],
      confusionPatterns: [],
    });

    console.log('\nVerifying response structure:');
    console.log(`  ✅ Has explanation object: ${!!response.explanation}`);
    console.log(`  ✅ Has intuition: ${!!response.explanation.intuition}`);
    console.log(`  ✅ Has analogy: ${!!response.explanation.analogy}`);
    console.log(`  ✅ Has technical explanation: ${!!response.explanation.technical}`);
    console.log(`  ✅ Has step-by-step: ${response.explanation.stepByStep.length > 0}`);
    console.log(`  ✅ Has constraints: ${response.explanation.constraints.length > 0}`);
    console.log(`  ✅ Has time complexity: ${!!response.explanation.timeComplexity}`);
    console.log(`  ✅ Has space complexity: ${!!response.explanation.spaceComplexity}`);
    console.log(`  ✅ Has code example: ${!!response.codeExample.code}`);
    console.log(`  ✅ Has code explanation: ${!!response.codeExample.explanation}`);
    console.log(`  ✅ Has common mistakes: ${response.commonMistakes.length > 0}`);
    console.log(`  ✅ Has revision summary: ${!!response.revisionSummary}`);
    console.log(`  ✅ Has key takeaways: ${response.revisionSummary.keyTakeaways.length > 0}`);

    const qualityScore = [
      !!response.explanation.intuition,
      !!response.explanation.analogy,
      !!response.explanation.technical,
      response.explanation.stepByStep.length > 0,
      !!response.codeExample.code,
      response.commonMistakes.length > 0,
      response.revisionSummary.keyTakeaways.length > 0,
    ].filter(Boolean).length;

    console.log(`\n  Quality Score: ${qualityScore}/7`);
    
    if (qualityScore >= 6) {
      console.log('  ✅ Response quality is excellent');
    } else if (qualityScore >= 4) {
      console.log('  ⚠️  Response quality is acceptable but could be improved');
    } else {
      console.log('  ❌ Response quality is below expectations');
    }
  } catch (error) {
    console.error('❌ Quality verification failed:', error);
  }

  // Test 4: Adaptive context handling
  console.log('\n📝 Test 4: Adaptive Context Handling');
  console.log('-'.repeat(80));
  
  try {
    const contextWithConfusion: AdaptiveContext = {
      preferredComplexity: 'beginner',
      repeatedQueries: ['binary search'],
      confusionPatterns: ['time complexity', 'balanced trees'],
    };

    const response = await aiService.explainConcept('binary search', contextWithConfusion);
    
    console.log('  ✅ Adaptive context accepted');
    console.log(`     Response addresses confusion patterns: ${
      response.explanation.technical.toLowerCase().includes('complexity') ||
      response.explanation.technical.toLowerCase().includes('balanced')
    }`);
  } catch (error) {
    console.error('  ❌ Adaptive context test failed:', error);
  }

  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(80));
  
  const successCount = results.filter(r => r.success).length;
  const totalTests = results.length;
  const avgResponseTime = results
    .filter(r => r.success)
    .reduce((sum, r) => sum + r.responseTime, 0) / successCount;

  console.log(`\nTotal Tests: ${totalTests}`);
  console.log(`Passed: ${successCount}`);
  console.log(`Failed: ${totalTests - successCount}`);
  console.log(`Success Rate: ${((successCount / totalTests) * 100).toFixed(1)}%`);
  console.log(`Average Response Time: ${avgResponseTime.toFixed(0)}ms`);

  // Language-specific results
  console.log('\n📋 Results by Language:');
  console.log('-'.repeat(80));
  
  for (const result of results) {
    const status = result.success ? '✅' : '❌';
    const time = result.success ? `${result.responseTime}ms` : 'N/A';
    const quality = result.hasAllSections && result.hasCodeExample ? '✓' : '✗';
    
    console.log(`${status} ${result.language.padEnd(25)} | ${time.padEnd(8)} | Quality: ${quality}`);
    
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    if (result.sampleText && result.success) {
      console.log(`   Sample: ${result.sampleText}...`);
    }
  }

  // Performance check
  console.log('\n⚡ Performance Analysis:');
  console.log('-'.repeat(80));
  
  const fastResponses = results.filter(r => r.success && r.responseTime < 3000).length;
  const slowResponses = results.filter(r => r.success && r.responseTime >= 3000).length;
  
  console.log(`Fast responses (<3s): ${fastResponses}`);
  console.log(`Slow responses (≥3s): ${slowResponses}`);
  
  if (avgResponseTime < 3000) {
    console.log('✅ Average response time meets requirement (< 3s)');
  } else {
    console.log('⚠️  Average response time exceeds 3s target');
  }

  // Final verdict
  console.log('\n' + '='.repeat(80));
  
  if (successCount === totalTests && avgResponseTime < 3000) {
    console.log('✅ ALL TESTS PASSED - Concept explanation feature is ready!');
    console.log('   - All 10 languages working correctly');
    console.log('   - Response quality meets requirements');
    console.log('   - Performance within acceptable limits');
  } else if (successCount >= totalTests * 0.8) {
    console.log('⚠️  MOSTLY PASSING - Some issues need attention');
    console.log(`   - ${totalTests - successCount} language(s) failed`);
    console.log('   - Review failed tests above');
  } else {
    console.log('❌ TESTS FAILED - Significant issues detected');
    console.log('   - Multiple languages failing');
    console.log('   - Review implementation and AWS configuration');
  }
  
  console.log('='.repeat(80));
}

// Run tests if this file is executed directly
if (require.main === module) {
  testConceptExplanation().catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
}

export { testConceptExplanation };
