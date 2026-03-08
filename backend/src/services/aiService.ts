import { ConceptResponse, CodeAnalysisResponse, AdaptiveContext, EnhancedCodeAnalysisResponse } from '../shared/types';
import { BedrockService, ClaudeMessage } from './bedrockService';
import { PromptAdapter, PromptUseCase } from './promptAdapter';
import { ResponseParser } from './responseParser';
import { PedagogicalAnalyzer } from './pedagogicalAnalyzer';

export class AIService {
  private bedrock: BedrockService;
  private pedagogicalAnalyzer: PedagogicalAnalyzer;

  constructor() {
    // Initialize Bedrock client
    const region = process.env.AWS_REGION || 'us-east-1';
    this.bedrock = new BedrockService(region);
    
    // Initialize pedagogical analyzer
    this.pedagogicalAnalyzer = new PedagogicalAnalyzer();
    
    console.log('AIService initialized with Amazon Bedrock');
  }

  async explainConcept(
    topic: string, 
    context?: AdaptiveContext
  ): Promise<ConceptResponse> {
    return this.explainConceptWithBedrock(topic, context);
  }

  private async explainConceptWithBedrock(
    topic: string,
    context?: AdaptiveContext
  ): Promise<ConceptResponse> {
    const complexityLevel = context?.preferredComplexity || 'beginner';
    const isRepeatedQuery = context?.repeatedQueries.includes(topic) || false;

    const systemPrompt = this.buildConceptSystemPrompt(complexityLevel, isRepeatedQuery);
    const userPrompt = this.buildConceptUserPrompt(topic, context);

    try {
      // Adapt prompts for Claude format
      const adaptedPrompt = PromptAdapter.adaptPrompt(
        systemPrompt,
        userPrompt,
        PromptUseCase.CONCEPT_EXPLANATION
      );

      // Invoke Bedrock
      const responseText = await this.bedrock.invokeClaude(
        adaptedPrompt.messages,
        adaptedPrompt.config,
        adaptedPrompt.systemPrompt
      );

      // Parse response
      const parsedResponse = ResponseParser.parseConceptResponse(responseText);
      return parsedResponse.data;
    } catch (error) {
      console.error('Bedrock Service Error:', error);
      if (error instanceof Error && error.message.includes('rate limit')) {
        throw new Error('Bedrock API rate limit exceeded. Please try again in a few moments.');
      }
      throw new Error('Failed to generate concept explanation');
    }
  }

  async analyzeCode(code: string, language: string): Promise<EnhancedCodeAnalysisResponse> {
    return this.analyzeCodeWithBedrock(code, language);
  }

  private async analyzeCodeWithBedrock(code: string, language: string): Promise<EnhancedCodeAnalysisResponse> {
    const systemPrompt = `You are a code analysis expert focused on pedagogical understanding. Analyze the provided code and return a structured response with:
    1. High-level summary of what the code does
    2. Line-by-line explanation for understanding
    3. Issues (inefficiencies, logic problems, style issues)
    4. Optional simplified version if improvements are obvious

    Focus on educational value and clear explanations. Be precise and thorough.`;

    const userPrompt = `Analyze this ${language} code:

\`\`\`${language}
${code}
\`\`\`

Return your analysis in this JSON format:
{
  "summary": "Brief description of what the code does",
  "lineByLineExplanation": [
    {"line": 1, "explanation": "Explanation of line 1"},
    {"line": 2, "explanation": "Explanation of line 2"}
  ],
  "issues": [
    {"type": "inefficiency|logic|style", "description": "Issue description", "line": 5}
  ],
  "simplifiedVersion": "Optional simplified code if improvements are obvious"
}

CRITICAL: Return ONLY valid JSON. No additional text before or after.`;

    try {
      // Adapt prompts for Nova format
      const adaptedPrompt = PromptAdapter.adaptPrompt(
        systemPrompt,
        userPrompt,
        PromptUseCase.CODE_ANALYSIS
      );

      // Invoke Bedrock
      const responseText = await this.bedrock.invokeClaude(
        adaptedPrompt.messages,
        adaptedPrompt.config,
        adaptedPrompt.systemPrompt
      );

      // Parse response
      const parsedResponse = ResponseParser.parseCodeAnalysisResponse(responseText);
      const basicAnalysis = parsedResponse.data;

      // Generate pedagogical analysis using local analyzer
      // Check if code has loops or functions that warrant pedagogical analysis
      const hasLoops = /for\s*\(|while\s*\(|for\s+\w+\s+in|forEach/i.test(code);
      const hasFunctions = /def\s+\w+|function\s+\w+|public\s+\w+|private\s+\w+|int\s+\w+\s*\(|void\s+\w+\s*\(|double\s+\w+\s*\(|float\s+\w+\s*\(/i.test(code);
      
      let pedagogicalAnalysis = undefined;
      if (hasLoops || hasFunctions) {
        pedagogicalAnalysis = this.pedagogicalAnalyzer.analyzeCodeLogic(code, language);
      }

      return {
        ...basicAnalysis,
        pedagogicalAnalysis
      };
    } catch (error) {
      console.error('Bedrock Code Analysis Error:', error);
      throw new Error('Failed to analyze code');
    }
  }

  private buildConceptSystemPrompt(complexityLevel: string, isRepeated: boolean): string {
    const basePrompt = `You are a senior computer science tutor specializing in clear, layered explanations.

Your task is to explain concepts following this EXACT structure and return valid JSON:

{
  "explanation": {
    "topic": "The concept name",
    "intuition": "Simple, intuitive explanation in everyday language",
    "analogy": "Real-world analogy that makes the concept relatable", 
    "technical": "Formal technical explanation with proper terminology",
    "stepByStep": ["Step 1 description", "Step 2 description", "Step 3 description"],
    "constraints": ["Key constraint 1", "Key constraint 2"],
    "timeComplexity": "O(n) notation",
    "spaceComplexity": "O(n) notation"
  },
  "codeExample": {
    "language": "python",
    "code": "def example_function():\\n    # Implementation here\\n    pass",
    "explanation": "Clear explanation of what the code does",
    "annotations": [
      {"line": 1, "comment": "Explanation of line 1"},
      {"line": 2, "comment": "Explanation of line 2"}
    ]
  },
  "commonMistakes": [
    {
      "description": "Common mistake description",
      "incorrectExample": "# Wrong code here",
      "correctExample": "# Correct code here", 
      "explanation": "Why this mistake happens and how to avoid it"
    }
  ],
  "visualDiagram": {
    "type": "flowchart",
    "mermaidCode": "graph TD\\n    A[Start] --> B[Process]\\n    B --> C[End]",
    "description": "Description of what the diagram shows"
  },
  "revisionSummary": {
    "keyTakeaways": ["Key point 1", "Key point 2", "Key point 3"],
    "mentalModel": "Simple mental model to remember this concept",
    "examTraps": ["Common exam/interview trap 1", "Common trap 2"]
  }
}

Complexity level: ${complexityLevel}
${isRepeated ? 'This is a repeated query - rephrase explanations differently, focus on areas of confusion.' : ''}

CRITICAL: Return ONLY valid JSON. No additional text before or after.`;

    return basePrompt;
  }

  private buildConceptUserPrompt(topic: string, context?: AdaptiveContext): string {
    let prompt = `Explain the concept: "${topic}"`;
    
    if (context?.confusionPatterns.length) {
      prompt += `\n\nUser has shown confusion with: ${context.confusionPatterns.join(', ')}`;
      prompt += '\nAddress these confusion areas specifically.';
    }

    return prompt;
  }




  /**
   * Dictionary lookup - provides definitions, translations, and code examples
   */
  async lookupTerm(word: string, language: string = 'en'): Promise<any> {
    return this.lookupTermWithBedrock(word, language);
  }

  private async lookupTermWithBedrock(word: string, language: string): Promise<any> {
    const systemPrompt = `You are a technical dictionary providing instant term definitions and translations for programming concepts.

Your task is to provide a comprehensive dictionary entry with:
1. Simple definition (for beginners)
2. Technical definition (formal)
3. Real-world analogy
4. Code example with explanation
5. Related terms
6. Difficulty level
7. Category

Return your response in JSON format.`;

    const userPrompt = `Provide a dictionary entry for the programming term: "${word}"

${language !== 'en' ? `Include translation in language code: ${language}` : ''}

Return in this JSON format:
{
  "word": "${word}",
  "definition": "Simple definition in everyday language",
  "technicalDefinition": "Formal technical definition",
  "example": "Real-world analogy or example",
  "codeExample": "Code snippet demonstrating the concept",
  "codeExplanation": "Explanation of the code example",
  "relatedTerms": ["term1", "term2", "term3"],
  "difficulty": "beginner|intermediate|advanced",
  "category": "Programming Basics|Data Structures|Algorithms|etc",
  "translation": "Translation in requested language (if not English)"
}

CRITICAL: Return ONLY valid JSON. No additional text before or after.`;

    try {
      // Adapt prompts for Bedrock format
      const adaptedPrompt = PromptAdapter.adaptPrompt(
        systemPrompt,
        userPrompt,
        PromptUseCase.DICTIONARY
      );

      // Invoke Bedrock
      const responseText = await this.bedrock!.invokeClaude(
        adaptedPrompt.messages,
        adaptedPrompt.config,
        adaptedPrompt.systemPrompt
      );

      // Parse response
      const parsedResponse = ResponseParser.parseDictionaryResponse(responseText);
      return parsedResponse.data;
    } catch (error) {
      console.error('Bedrock Dictionary Lookup Error:', error);
      throw new Error('Failed to lookup term');
    }
  }

}