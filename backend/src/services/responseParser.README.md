# Response Parser

The Response Parser handles parsing of Claude responses from Amazon Bedrock, supporting both JSON and XML-formatted responses while maintaining backward compatibility with existing API response formats.

## Overview

Claude models on Bedrock can return responses in multiple formats:
- **JSON**: Structured data in JSON format
- **XML**: Claude's preferred format for structured output (using tags like `<response>`, `<explanation>`, etc.)
- **Plain Text**: Unstructured text with code blocks and sections

The Response Parser intelligently detects the format and extracts structured data accordingly.

## Features

- **Multi-format Support**: Handles JSON, XML, and plain text responses
- **Code Block Extraction**: Extracts code blocks from markdown (` ```language `) and XML (`<code>`) formats
- **Schema Validation**: Validates parsed responses against expected TypeScript interfaces
- **Round-trip Serialization**: Ensures parse → serialize → parse produces equivalent objects
- **Backward Compatibility**: Maintains existing API response format for frontend

## Usage

### Parsing Concept Responses

```typescript
import { ResponseParser } from './responseParser';

// Parse a Claude response (auto-detects format)
const result = ResponseParser.parseConceptResponse(claudeResponseText);

console.log(result.data.explanation.topic);
console.log(result.data.codeExample.code);
console.log(result.metadata.format); // 'json', 'xml', or 'text'
```

### Parsing Code Analysis Responses

```typescript
const result = ResponseParser.parseCodeAnalysisResponse(claudeResponseText);

console.log(result.data.summary);
console.log(result.data.lineByLineExplanation);
console.log(result.data.issues);
```

### Extracting Code Blocks

```typescript
const codeBlocks = ResponseParser.extractCodeBlocks(responseText);

codeBlocks.forEach(block => {
  console.log(`Language: ${block.language}`);
  console.log(`Code: ${block.code}`);
});
```

### Validating Response Structure

```typescript
const isValid = ResponseParser.validateResponseStructure(
  parsedData,
  'concept' // or 'codeAnalysis'
);
```

## Response Formats

### JSON Format

Claude can return JSON directly:

```json
{
  "explanation": {
    "topic": "Binary Search",
    "intuition": "Divide and conquer search",
    "analogy": "Like finding a word in a dictionary",
    "technical": "O(log n) search algorithm",
    "stepByStep": ["Step 1", "Step 2"],
    "constraints": ["Array must be sorted"]
  },
  "codeExample": {
    "language": "python",
    "code": "def binary_search(arr, target): pass",
    "explanation": "Implementation"
  }
}
```

### XML Format (Claude's Preference)

Claude prefers XML tags for structured output:

```xml
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
  </explanation>
  <code_example>
    <language>python</language>
    <code>def binary_search(arr, target): pass</code>
  </code_example>
</response>
```

### Plain Text Format

When Claude returns unstructured text:

```
Topic: Binary Search

Intuition: This is a divide and conquer search algorithm.

Technical: Binary search has O(log n) time complexity.

```python
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    return -1
```

Key Takeaways:
- Fast search algorithm
- Requires sorted array
```

## Serialization

The `ResponseSerializer` class formats parsed data for API responses:

```typescript
import { ResponseSerializer } from './responseParser';

// Serialize for API response
const apiResponse = ResponseSerializer.serializeConceptResponse(parsedData);

// Test round-trip integrity
const isValid = ResponseSerializer.testRoundTrip(originalText, 'concept');
```

## Round-trip Property

The parser implements a round-trip property (Requirement 12.9):

```
parse(serialize(parse(response))) ≡ parse(response)
```

This ensures data integrity through the parse → serialize → parse cycle.

## Testing

Run the test suite:

```bash
npx ts-node src/services/responseParser.test.ts
```

Tests cover:
- JSON parsing for concept and code analysis responses
- XML parsing for concept and code analysis responses
- Plain text parsing with code block extraction
- Code block extraction (markdown and XML)
- Response structure validation
- Round-trip serialization integrity

## Integration with Bedrock

The Response Parser is designed to work with the BedrockService:

```typescript
import { BedrockService } from './bedrockService';
import { PromptAdapter } from './promptAdapter';
import { ResponseParser } from './responseParser';

// 1. Adapt prompt
const adapted = PromptAdapter.adaptPrompt(
  systemPrompt,
  userPrompt,
  PromptUseCase.CONCEPT_EXPLANATION
);

// 2. Invoke Bedrock
const bedrockService = new BedrockService();
const responseText = await bedrockService.invokeClaude(
  adapted.messages,
  adapted.config,
  adapted.systemPrompt
);

// 3. Parse response
const parsed = ResponseParser.parseConceptResponse(responseText);

// 4. Return to frontend
return parsed.data;
```

## Error Handling

The parser handles malformed responses gracefully:

- **JSON parsing fails**: Falls back to XML parsing
- **XML parsing fails**: Falls back to text extraction
- **Text extraction**: Always succeeds with best-effort parsing

Errors are logged but don't crash the application:

```typescript
try {
  const data = this.parseConceptFromJson(responseText);
  return { data, metadata, rawText: responseText };
} catch (error) {
  console.warn('JSON parsing failed, trying XML:', error);
  // Continue with XML parsing...
}
```

## Requirements Satisfied

This implementation satisfies the following requirements:

- **12.1**: Parse Bedrock JSON responses into typed TypeScript objects
- **12.2**: Handle Claude's XML-formatted responses
- **12.3**: Extract code blocks, explanations, and metadata
- **12.4**: Validate response structure against expected schema
- **12.5**: Log errors and handle malformed responses
- **12.6**: Format parsed data into API response structure
- **12.7**: Maintain backward compatibility with current API format
- **12.9**: Implement round-trip serialization property

## Future Enhancements

- Support for streaming responses (Requirement 12.10)
- Enhanced pedagogical analysis parsing
- Custom validation schemas
- Performance optimizations for large responses
