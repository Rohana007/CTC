/**
 * Example usage of PromptAdapter
 * 
 * This file demonstrates how to use the PromptAdapter to convert
 * OpenAI-style prompts to Claude-optimized format for different use cases.
 */

import { PromptAdapter, PromptUseCase } from './promptAdapter';

// Example 1: Concept Explanation
function exampleConceptExplanation() {
  const systemPrompt = `You are a senior computer science tutor specializing in clear, layered explanations.

Your task is to explain concepts following this EXACT structure and return valid JSON:

{
  "explanation": {
    "topic": "The concept name",
    "intuition": "Simple, intuitive explanation",
    "technical": "Formal technical explanation"
  }
}

CRITICAL: Return ONLY valid JSON. No additional text before or after.`;

  const userPrompt = 'Explain the concept: "Binary Search Tree"';

  const adapted = PromptAdapter.adaptPrompt(
    systemPrompt,
    userPrompt,
    PromptUseCase.CONCEPT_EXPLANATION
  );

  console.log('=== Concept Explanation Example ===');
  console.log('Model:', adapted.config.model);
  console.log('Temperature:', adapted.config.temperature);
  console.log('Max Tokens:', adapted.config.maxTokens);
  console.log('\nSystem Prompt (first 200 chars):', adapted.systemPrompt?.substring(0, 200));
  console.log('\nUser Message:', adapted.messages[0].content.substring(0, 200));
}

// Example 2: Code Analysis
function exampleCodeAnalysis() {
  const systemPrompt = `You are a code analysis expert. Analyze the provided code and return a structured response with:
1. High-level summary
2. Line-by-line explanation
3. Issues (inefficiencies, logic problems, style issues)

Return your analysis in this JSON format:
{
  "summary": "Brief description",
  "lineByLineExplanation": [],
  "issues": []
}`;

  const userPrompt = `Analyze this Python code:

\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
\`\`\`

Return your analysis in JSON format.`;

  const adapted = PromptAdapter.adaptPrompt(
    systemPrompt,
    userPrompt,
    PromptUseCase.CODE_ANALYSIS
  );

  console.log('\n=== Code Analysis Example ===');
  console.log('Model:', adapted.config.model);
  console.log('Temperature:', adapted.config.temperature);
  console.log('Max Tokens:', adapted.config.maxTokens);
  console.log('\nSystem Prompt includes XML tags:', adapted.systemPrompt?.includes('<role>'));
  console.log('User prompt includes XML structure:', adapted.messages[0].content.includes('<analysis>'));
}

// Example 3: Viro Assistant (Socratic Method)
function exampleViroAssistant() {
  const systemPrompt = `You are an AI tutor using the Socratic method to guide learning.
Use questions to help the student discover answers themselves.
Maintain an encouraging, adaptive tone.`;

  const userPrompt = 'I don\'t understand how recursion works. Can you help me?';

  const adapted = PromptAdapter.adaptPrompt(
    systemPrompt,
    userPrompt,
    PromptUseCase.VIRO_ASSISTANT
  );

  console.log('\n=== Viro Assistant Example ===');
  console.log('Model:', adapted.config.model);
  console.log('Temperature:', adapted.config.temperature);
  console.log('Max Tokens:', adapted.config.maxTokens);
  console.log('Top P:', adapted.config.topP);
  console.log('\nUser prompt mentions Socratic:', adapted.messages[0].content.toLowerCase().includes('socratic'));
}

// Example 4: Dictionary Lookup
function exampleDictionary() {
  const systemPrompt = 'You are a technical dictionary providing instant term definitions and translations.';
  const userPrompt = 'Define "polymorphism" in programming and provide a translation in Hindi.';

  const adapted = PromptAdapter.adaptPrompt(
    systemPrompt,
    userPrompt,
    PromptUseCase.DICTIONARY
  );

  console.log('\n=== Dictionary Example ===');
  console.log('Model:', adapted.config.model);
  console.log('Temperature:', adapted.config.temperature);
  console.log('Max Tokens:', adapted.config.maxTokens);
  console.log('\nUser prompt includes concise instruction:', adapted.messages[0].content.toLowerCase().includes('concise'));
}

// Example 5: Auto-detect Use Case
function exampleAutoDetect() {
  const systemPrompt = 'You are a code analysis expert.';
  const userPrompt = 'Analyze this code and find issues.';

  const detectedUseCase = PromptAdapter.detectUseCase(systemPrompt, userPrompt);

  console.log('\n=== Auto-detect Use Case Example ===');
  console.log('System:', systemPrompt);
  console.log('User:', userPrompt);
  console.log('Detected Use Case:', detectedUseCase);
  console.log('Expected:', PromptUseCase.CODE_ANALYSIS);
}

// Example 6: Custom Configuration Override
function exampleCustomConfig() {
  const systemPrompt = 'You are a helpful assistant.';
  const userPrompt = 'Explain arrays.';

  const adapted = PromptAdapter.adaptPrompt(
    systemPrompt,
    userPrompt,
    PromptUseCase.CONCEPT_EXPLANATION,
    {
      temperature: 0.5, // Override default 0.3
      maxTokens: 3000,  // Override default 2000
    }
  );

  console.log('\n=== Custom Configuration Example ===');
  console.log('Default temperature for concept explanation: 0.3');
  console.log('Custom temperature:', adapted.config.temperature);
  console.log('Default max tokens: 2000');
  console.log('Custom max tokens:', adapted.config.maxTokens);
}

// Run all examples
if (require.main === module) {
  console.log('PromptAdapter Examples\n');
  exampleConceptExplanation();
  exampleCodeAnalysis();
  exampleViroAssistant();
  exampleDictionary();
  exampleAutoDetect();
  exampleCustomConfig();
  console.log('\n=== All Examples Complete ===');
}
