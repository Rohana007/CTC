# Prompt Adapter for Claude Format

## Overview

The `PromptAdapter` converts OpenAI-style prompts to Claude-optimized format for use with Amazon Bedrock. This adapter is a critical component of the AWS Bedrock Lambda migration, ensuring that prompts are structured in a way that maximizes Claude's performance.

## Key Features

### 1. **Use Case-Specific Optimization**
The adapter supports five distinct use cases, each with optimized model selection and parameters:

| Use Case | Model | Temperature | Max Tokens | Top P | Purpose |
|----------|-------|-------------|------------|-------|---------|
| Concept Explanation | Haiku 3.5 | 0.3 | 2000 | 1.0 | Cost-effective explanations |
| Code Analysis | Sonnet 3.5 v2 | 0.2 | 1500 | 1.0 | Complex pedagogical analysis |
| Viro Assistant | Sonnet 3.5 v2 | 0.7 | 1000 | 0.95 | Socratic method tutoring |
| Dictionary | Haiku 3.5 | 0.1 | 800 | 1.0 | Quick term lookups |
| Vision | Sonnet 3.5 v2 | 0.3 | 1500 | 1.0 | Image/diagram analysis |

### 2. **JSON to XML Conversion**
Claude performs better with XML tags for structured output rather than JSON. The adapter automatically:
- Detects JSON format requests in prompts
- Converts them to XML tag instructions
- Provides XML structure templates for each use case

**Example:**
```typescript
// OpenAI prompt requesting JSON
"Return your response in this JSON format: { 'summary': '...', 'issues': [] }"

// Converted to Claude-optimized XML
"Structure your analysis with these XML tags:
<analysis>
  <summary>brief description</summary>
  <issues>
    <issue type='...' line='5'>
      <description>issue description</description>
    </issue>
  </issues>
</analysis>"
```

### 3. **Role/Task/Format Structure**
Claude performs better with clear role definition, task description, and output format. The adapter restructures system prompts to follow this pattern:

```xml
<role>
You are [role description].
</role>

<task>
[Task instructions and requirements]
</task>

<output_format>
[Expected output structure]
</output_format>
```

### 4. **Auto-Detection**
The adapter can automatically detect the appropriate use case from prompt content:

```typescript
const useCase = PromptAdapter.detectUseCase(systemPrompt, userPrompt);
// Detects: VIRO_ASSISTANT, CODE_ANALYSIS, DICTIONARY, VISION, or CONCEPT_EXPLANATION
```

## Usage

### Basic Usage

```typescript
import { PromptAdapter, PromptUseCase } from './promptAdapter';

// Adapt a prompt for concept explanation
const adapted = PromptAdapter.adaptPrompt(
  systemPrompt,
  userPrompt,
  PromptUseCase.CONCEPT_EXPLANATION
);

// Use with BedrockService
const bedrockService = new BedrockService('us-east-1');
const response = await bedrockService.invokeClaude(
  adapted.messages,
  adapted.config,
  adapted.systemPrompt
);
```

### Custom Configuration

```typescript
// Override default parameters
const adapted = PromptAdapter.adaptPrompt(
  systemPrompt,
  userPrompt,
  PromptUseCase.CONCEPT_EXPLANATION,
  {
    temperature: 0.5,  // Override default 0.3
    maxTokens: 3000,   // Override default 2000
    model: ClaudeModel.SONNET_3_5_V2  // Use Sonnet instead of Haiku
  }
);
```

### Auto-Detection

```typescript
// Let the adapter detect the use case
const useCase = PromptAdapter.detectUseCase(systemPrompt, userPrompt);
const adapted = PromptAdapter.adaptPrompt(systemPrompt, userPrompt, useCase);
```

### Get Configuration Info

```typescript
// Get configuration for a specific use case
const config = PromptAdapter.getUseCaseConfig(PromptUseCase.CODE_ANALYSIS);
console.log(config.model);        // anthropic.claude-3-5-sonnet-20241022-v2:0
console.log(config.temperature);  // 0.2
console.log(config.maxTokens);    // 1500
```

## Use Case Details

### Concept Explanation
- **Model**: Claude 3.5 Haiku (cost-effective)
- **Temperature**: 0.3 (balanced creativity)
- **Purpose**: Educational explanations with intuition, analogies, and examples
- **XML Structure**: Provides comprehensive tags for explanation, code examples, common mistakes, and revision summary

### Code Analysis
- **Model**: Claude 3.5 Sonnet v2 (complex reasoning)
- **Temperature**: 0.2 (precise analysis)
- **Purpose**: Pedagogical code analysis with dry-run tables and complexity assessment
- **XML Structure**: Tags for summary, line-by-line explanation, issues, and simplified version

### Viro Assistant
- **Model**: Claude 3.5 Sonnet v2 (Socratic method)
- **Temperature**: 0.7 (conversational)
- **Top P**: 0.95 (diverse responses)
- **Purpose**: AI tutor using Socratic questioning with RTF framework
- **Enhancement**: Adds Socratic method guidance to maintain teaching approach

### Dictionary
- **Model**: Claude 3.5 Haiku (fast lookups)
- **Temperature**: 0.1 (factual)
- **Purpose**: Quick technical term definitions and translations
- **Enhancement**: Emphasizes concise, structured responses

### Vision
- **Model**: Claude 3.5 Sonnet v2 (image understanding)
- **Temperature**: 0.3 (balanced)
- **Purpose**: Analyze uploaded images, extract text, interpret diagrams
- **Enhancement**: Adds image analysis guidance

## Design Decisions

### Why XML over JSON?
Claude models are trained to work better with XML tags for structured output. XML provides:
- Clearer hierarchical structure
- Better handling of nested content
- More natural for Claude's training data
- Easier to parse when mixed with natural language

### Why Different Models per Use Case?
- **Haiku**: Fast, cost-effective for simple tasks (concept explanations, dictionary lookups)
- **Sonnet**: More capable reasoning for complex tasks (code analysis, Socratic tutoring, vision)
- This balances quality and cost, meeting Requirement 7 (Cost Optimization)

### Why Different Temperature Settings?
- **Low (0.1-0.2)**: Factual, precise tasks (dictionary, code analysis)
- **Medium (0.3)**: Balanced creativity (concept explanation, vision)
- **High (0.7)**: Conversational, adaptive (Viro assistant)

## Requirements Satisfied

This implementation satisfies the following requirements from the spec:

- **11.4**: Adapt existing OpenAI prompts to Claude's prompt format and best practices ✓
- **11.5**: Include system prompts that specify role, task, and output format (RTF framework) ✓
- **11.6**: Handle Claude's XML tag preferences for structured output ✓
- **11.8**: Set appropriate temperature, top_p, and max_tokens parameters for each use case ✓
- **11.10**: Maintain a prompt library with versioning for each feature ✓

## Testing

Run the example file to see the adapter in action:

```bash
cd backend
npx ts-node src/services/promptAdapter.example.ts
```

This demonstrates:
- All five use cases
- JSON to XML conversion
- Role/task/format structuring
- Auto-detection
- Custom configuration overrides

## Integration with BedrockService

The adapter is designed to work seamlessly with `BedrockService`:

```typescript
import { BedrockService } from './bedrockService';
import { PromptAdapter, PromptUseCase } from './promptAdapter';

// Create services
const bedrock = new BedrockService('us-east-1');

// Adapt prompt
const adapted = PromptAdapter.adaptPrompt(
  systemPrompt,
  userPrompt,
  PromptUseCase.CODE_ANALYSIS
);

// Invoke Claude
const response = await bedrock.invokeClaude(
  adapted.messages,
  adapted.config,
  adapted.systemPrompt
);
```

## Next Steps

After implementing the prompt adapter, the next tasks are:

1. **Task 2.4**: Implement response parser for Bedrock outputs
2. **Task 3.1**: Update aiService.ts to use BedrockClient
3. **Task 3.2-3.6**: Migrate each feature to use Bedrock with adapted prompts

## File Structure

```
backend/src/services/
├── bedrockService.ts          # Bedrock client wrapper
├── promptAdapter.ts           # This adapter (Task 2.3)
├── promptAdapter.example.ts   # Usage examples
├── promptAdapter.README.md    # This documentation
└── responseParser.ts          # Next: Task 2.4
```

## References

- [Claude Prompt Engineering Guide](https://docs.anthropic.com/claude/docs/prompt-engineering)
- [AWS Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- Requirements: `.kiro/specs/aws-bedrock-lambda-migration/requirements.md`
- Design: `.kiro/specs/aws-bedrock-lambda-migration/design.md`
