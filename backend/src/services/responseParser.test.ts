/**
 * Manual test script for ResponseParser
 * Run with: npx ts-node src/services/responseParser.test.ts
 */

import { ResponseParser, ResponseSerializer } from './responseParser';

async function testResponseParser() {
  console.log('🧪 Testing ResponseParser...\n');

  let passedTests = 0;
  let failedTests = 0;

  // Test 1: Parse JSON concept response
  console.log('Test 1: Parse JSON concept response');
  try {
    const jsonResponse = JSON.stringify({
      explanation: {
        topic: 'Binary Search',
        intuition: 'Divide and conquer search',
        analogy: 'Like finding a word in a dictionary',
        technical: 'O(log n) search algorithm',
        stepByStep: ['Step 1', 'Step 2'],
        constraints: ['Array must be sorted'],
        timeComplexity: 'O(log n)',
        spaceComplexity: 'O(1)',
      },
      codeExample: {
        language: 'python',
        code: 'def binary_search(arr, target): pass',
        explanation: 'Implementation of binary search',
        annotations: [{ line: 1, comment: 'Function definition' }],
      },
      commonMistakes: [],
      revisionSummary: {
        keyTakeaways: ['Fast search', 'Requires sorted array'],
        mentalModel: 'Divide and conquer',
        examTraps: ['Forgetting to sort'],
      },
    });

    const result = ResponseParser.parseConceptResponse(jsonResponse);
    
    if (result.data.explanation.topic === 'Binary Search' &&
        result.data.codeExample.language === 'python' &&
        result.metadata.format === 'json') {
      console.log('✅ Test 1 passed');
      passedTests++;
    } else {
      console.log('❌ Test 1 failed: Unexpected result');
      failedTests++;
    }
  } catch (error) {
    console.error('❌ Test 1 failed:', error);
    failedTests++;
  }
  console.log();

  // Test 2: Parse XML concept response
  console.log('Test 2: Parse XML concept response');
  try {
    const xmlResponse = `
      <response>
        <explanation>
          <topic>Binary Search</topic>
          <intuition>Divide and conquer search</intuition>
          <analogy>Like finding a word in a dictionary</analogy>
          <technical>O(log n) search algorithm</technical>
          <step_by_step>
            <step>Find middle element</step>
            <step>Compare with target</step>
          </step_by_step>
          <constraints>
            <constraint>Array must be sorted</constraint>
          </constraints>
          <time_complexity>O(log n)</time_complexity>
          <space_complexity>O(1)</space_complexity>
        </explanation>
        <code_example>
          <language>python</language>
          <code>def binary_search(arr, target): pass</code>
          <explanation>Implementation of binary search</explanation>
        </code_example>
        <revision_summary>
          <key_takeaways>
            <takeaway>Fast search</takeaway>
            <takeaway>Requires sorted array</takeaway>
          </key_takeaways>
          <mental_model>Divide and conquer</mental_model>
        </revision_summary>
      </response>
    `;

    const result = ResponseParser.parseConceptResponse(xmlResponse);
    
    if (result.data.explanation.topic === 'Binary Search' &&
        result.data.explanation.stepByStep.length === 2 &&
        result.data.codeExample.language === 'python' &&
        result.metadata.format === 'xml') {
      console.log('✅ Test 2 passed');
      passedTests++;
    } else {
      console.log('❌ Test 2 failed: Unexpected result');
      console.log('Topic:', result.data.explanation.topic);
      console.log('Steps:', result.data.explanation.stepByStep.length);
      console.log('Format:', result.metadata.format);
      failedTests++;
    }
  } catch (error) {
    console.error('❌ Test 2 failed:', error);
    failedTests++;
  }
  console.log();

  // Test 3: Parse plain text concept response
  console.log('Test 3: Parse plain text concept response');
  try {
    const textResponse = `
      Topic: Binary Search
      
      Intuition: This is a divide and conquer search algorithm.
      
      Technical: Binary search has O(log n) time complexity.
      
      \`\`\`python
      def binary_search(arr, target):
          left, right = 0, len(arr) - 1
          return -1
      \`\`\`
      
      Key Takeaways:
      - Fast search algorithm
      - Requires sorted array
    `;

    const result = ResponseParser.parseConceptResponse(textResponse);
    
    if (result.data.explanation.topic === 'Binary Search' &&
        result.data.codeExample.code.includes('binary_search') &&
        result.metadata.hasCodeBlocks === true) {
      console.log('✅ Test 3 passed');
      passedTests++;
    } else {
      console.log('❌ Test 3 failed: Unexpected result');
      failedTests++;
    }
  } catch (error) {
    console.error('❌ Test 3 failed:', error);
    failedTests++;
  }
  console.log();

  // Test 4: Parse JSON code analysis response
  console.log('Test 4: Parse JSON code analysis response');
  try {
    const jsonResponse = JSON.stringify({
      summary: 'This code implements a sorting algorithm',
      lineByLineExplanation: [
        { line: 1, explanation: 'Function definition' },
        { line: 2, explanation: 'Loop through array' },
      ],
      issues: [
        { type: 'inefficiency', description: 'Could use built-in sort', line: 2 },
      ],
      simplifiedVersion: 'arr.sort()',
    });

    const result = ResponseParser.parseCodeAnalysisResponse(jsonResponse);
    
    if (result.data.summary === 'This code implements a sorting algorithm' &&
        result.data.lineByLineExplanation.length === 2 &&
        result.data.issues.length === 1 &&
        result.metadata.format === 'json') {
      console.log('✅ Test 4 passed');
      passedTests++;
    } else {
      console.log('❌ Test 4 failed: Unexpected result');
      failedTests++;
    }
  } catch (error) {
    console.error('❌ Test 4 failed:', error);
    failedTests++;
  }
  console.log();

  // Test 5: Parse XML code analysis response
  console.log('Test 5: Parse XML code analysis response');
  try {
    const xmlResponse = `
      <analysis>
        <summary>This code implements a sorting algorithm</summary>
        <line_by_line>
          <line number="1">
            <explanation>Function definition</explanation>
          </line>
          <line number="2">
            <explanation>Loop through array</explanation>
          </line>
        </line_by_line>
        <issues>
          <issue type="inefficiency" line="2">
            <description>Could use built-in sort</description>
          </issue>
        </issues>
        <simplified_version>arr.sort()</simplified_version>
      </analysis>
    `;

    const result = ResponseParser.parseCodeAnalysisResponse(xmlResponse);
    
    if (result.data.summary === 'This code implements a sorting algorithm' &&
        result.data.lineByLineExplanation.length === 2 &&
        result.data.issues.length === 1 &&
        result.data.issues[0].type === 'inefficiency' &&
        result.metadata.format === 'xml') {
      console.log('✅ Test 5 passed');
      passedTests++;
    } else {
      console.log('❌ Test 5 failed: Unexpected result');
      failedTests++;
    }
  } catch (error) {
    console.error('❌ Test 5 failed:', error);
    failedTests++;
  }
  console.log();

  // Test 6: Extract code blocks
  console.log('Test 6: Extract code blocks');
  try {
    const text = `
      Here is some code:
      \`\`\`python
      def hello():
          print("Hello")
      \`\`\`
      
      And another:
      \`\`\`javascript
      console.log("Hello");
      \`\`\`
    `;

    const blocks = ResponseParser.extractCodeBlocks(text);
    
    if (blocks.length === 2 &&
        blocks[0].language === 'python' &&
        blocks[0].code.includes('def hello()') &&
        blocks[1].language === 'javascript' &&
        blocks[1].code.includes('console.log')) {
      console.log('✅ Test 6 passed');
      passedTests++;
    } else {
      console.log('❌ Test 6 failed: Unexpected result');
      failedTests++;
    }
  } catch (error) {
    console.error('❌ Test 6 failed:', error);
    failedTests++;
  }
  console.log();

  // Test 7: Validate response structure
  console.log('Test 7: Validate response structure');
  try {
    const validConcept = {
      explanation: { topic: 'Test' },
      codeExample: { code: 'test' },
    };

    const invalidConcept = {
      explanation: 'not an object',
    };

    const validAnalysis = {
      summary: 'Test summary',
      lineByLineExplanation: [],
      issues: [],
    };

    if (ResponseParser.validateResponseStructure(validConcept, 'concept') === true &&
        ResponseParser.validateResponseStructure(invalidConcept, 'concept') === false &&
        ResponseParser.validateResponseStructure(validAnalysis, 'codeAnalysis') === true) {
      console.log('✅ Test 7 passed');
      passedTests++;
    } else {
      console.log('❌ Test 7 failed: Validation not working correctly');
      failedTests++;
    }
  } catch (error) {
    console.error('❌ Test 7 failed:', error);
    failedTests++;
  }
  console.log();

  // Test 8: Round-trip serialization for concept response
  console.log('Test 8: Round-trip serialization for concept response');
  try {
    const jsonResponse = JSON.stringify({
      explanation: {
        topic: 'Binary Search',
        intuition: 'Divide and conquer',
        analogy: 'Dictionary lookup',
        technical: 'O(log n) algorithm',
        stepByStep: ['Step 1', 'Step 2'],
        constraints: ['Sorted array'],
      },
      codeExample: {
        language: 'python',
        code: 'def search(): pass',
        explanation: 'Search function',
        annotations: [],
      },
      commonMistakes: [],
      revisionSummary: {
        keyTakeaways: ['Fast', 'Efficient'],
        mentalModel: 'Divide and conquer',
        examTraps: [],
      },
    });

    const result = ResponseSerializer.testRoundTrip(jsonResponse, 'concept');
    
    if (result === true) {
      console.log('✅ Test 8 passed - Round-trip maintains data integrity');
      passedTests++;
    } else {
      console.log('❌ Test 8 failed: Round-trip lost data');
      failedTests++;
    }
  } catch (error) {
    console.error('❌ Test 8 failed:', error);
    failedTests++;
  }
  console.log();

  // Test 9: Round-trip serialization for code analysis response
  console.log('Test 9: Round-trip serialization for code analysis response');
  try {
    const jsonResponse = JSON.stringify({
      summary: 'Code analysis',
      lineByLineExplanation: [
        { line: 1, explanation: 'Line 1' },
      ],
      issues: [
        { type: 'style', description: 'Style issue' },
      ],
    });

    const result = ResponseSerializer.testRoundTrip(jsonResponse, 'codeAnalysis');
    
    if (result === true) {
      console.log('✅ Test 9 passed - Round-trip maintains data integrity');
      passedTests++;
    } else {
      console.log('❌ Test 9 failed: Round-trip lost data');
      failedTests++;
    }
  } catch (error) {
    console.error('❌ Test 9 failed:', error);
    failedTests++;
  }
  console.log();

  // Summary
  console.log('═══════════════════════════════════════');
  console.log(`✨ Test Summary: ${passedTests} passed, ${failedTests} failed`);
  console.log('═══════════════════════════════════════\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testResponseParser().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { testResponseParser };
