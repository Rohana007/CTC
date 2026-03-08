import { ClaudeModel, ClaudeInvocationConfig, ClaudeMessage } from './bedrockService';

/**
 * Use case types for prompt adaptation
 */
export enum PromptUseCase {
  CONCEPT_EXPLANATION = 'concept_explanation',
  CODE_ANALYSIS = 'code_analysis',
  VIRO_ASSISTANT = 'viro_assistant',
  DICTIONARY = 'dictionary',
  VISION = 'vision',
}

/**
 * Configuration for each use case
 */
interface UseCaseConfig {
  model: ClaudeModel;
  temperature: number;
  maxTokens: number;
  topP: number;
}

/**
 * Use case configurations optimized for each feature
 * Model selection is controlled by PREFER_CLAUDE environment variable
 */
const getUseCaseConfigs = (): Record<PromptUseCase, UseCaseConfig> => {
  const preferClaude = process.env.PREFER_CLAUDE === 'true';
  const complexModel = preferClaude ? ClaudeModel.CLAUDE_3_5_SONNET : ClaudeModel.NOVA_LITE;
  const simpleModel = preferClaude ? ClaudeModel.CLAUDE_3_HAIKU : ClaudeModel.NOVA_LITE;

  return {
    [PromptUseCase.CONCEPT_EXPLANATION]: {
      model: complexModel, // Complex explanations benefit from better models
      temperature: 0.3,
      maxTokens: 2000,
      topP: 1.0,
    },
    [PromptUseCase.CODE_ANALYSIS]: {
      model: complexModel, // Code analysis needs good reasoning
      temperature: 0.2,
      maxTokens: 1500,
      topP: 1.0,
    },
    [PromptUseCase.VIRO_ASSISTANT]: {
      model: complexModel, // Socratic tutoring needs nuanced responses
      temperature: 0.7,
      maxTokens: 1000,
      topP: 0.95,
    },
    [PromptUseCase.DICTIONARY]: {
      model: simpleModel, // Simple lookups can use cheaper model
      temperature: 0.1,
      maxTokens: 800,
      topP: 1.0,
    },
    [PromptUseCase.VISION]: {
      model: complexModel, // Vision analysis needs good understanding
      temperature: 0.3,
      maxTokens: 1500,
      topP: 1.0,
    },
  };
};

/**
 * Adapted prompt structure for Claude
 */
export interface AdaptedPrompt {
  messages: ClaudeMessage[];
  config: ClaudeInvocationConfig;
  systemPrompt?: string;
}

/**
 * PromptAdapter converts OpenAI-style prompts to Claude-optimized format.
 * 
 * Key adaptations:
 * - Converts JSON output requests to XML tag format (Claude's preference)
 * - Restructures system prompts to Claude's role/task/format structure
 * - Sets appropriate model and parameters for each use case
 * - Handles multilingual content appropriately
 */
export class PromptAdapter {
  /**
   * Adapts an OpenAI-style prompt to Claude format for a specific use case.
   * 
   * @param systemPrompt - The system prompt defining the AI's role and task
   * @param userPrompt - The user's input/question
   * @param useCase - The type of task being performed
   * @param customConfig - Optional overrides for model configuration
   * @returns Adapted prompt ready for Bedrock invocation
   */
  static adaptPrompt(
    systemPrompt: string,
    userPrompt: string,
    useCase: PromptUseCase,
    customConfig?: Partial<UseCaseConfig>
  ): AdaptedPrompt {
    // Get base configuration for use case
    const USE_CASE_CONFIGS = getUseCaseConfigs();
    const baseConfig = USE_CASE_CONFIGS[useCase];
    const config: ClaudeInvocationConfig = {
      model: customConfig?.model || baseConfig.model,
      temperature: customConfig?.temperature ?? baseConfig.temperature,
      maxTokens: customConfig?.maxTokens || baseConfig.maxTokens,
      topP: customConfig?.topP ?? baseConfig.topP,
    };

    // Adapt system prompt to Claude's preferred structure
    const adaptedSystemPrompt = this.adaptSystemPrompt(systemPrompt, useCase);

    // Adapt user prompt (convert JSON requests to XML)
    const adaptedUserPrompt = this.adaptUserPrompt(userPrompt, useCase);

    // Create messages array
    const messages: ClaudeMessage[] = [
      {
        role: 'user',
        content: adaptedUserPrompt,
      },
    ];

    return {
      messages,
      config,
      systemPrompt: adaptedSystemPrompt,
    };
  }

  /**
   * Adapts system prompt to Claude's role/task/format structure.
   * Claude performs better with clear role definition, task description, and output format.
   * 
   * @param systemPrompt - Original system prompt
   * @param useCase - The use case type
   * @returns Adapted system prompt
   */
  private static adaptSystemPrompt(systemPrompt: string, useCase: PromptUseCase): string {
    // Skip XML conversion for Viro - it needs strict JSON format
    if (useCase === PromptUseCase.VIRO_ASSISTANT) {
      return systemPrompt;
    }

    // Convert JSON output instructions to XML format for other use cases
    let adapted = this.convertJsonToXmlInstructions(systemPrompt);

    // Add Claude-specific structure if not already present
    if (!adapted.includes('<role>') && !adapted.includes('Your role:')) {
      adapted = this.addRoleTaskFormatStructure(adapted, useCase);
    }

    return adapted;
  }

  /**
   * Adds role/task/format structure to system prompt.
   * 
   * @param prompt - Original prompt
   * @param useCase - The use case type
   * @returns Structured prompt
   */
  private static addRoleTaskFormatStructure(prompt: string, useCase: PromptUseCase): string {
    // Extract role if mentioned in prompt
    const roleMatch = prompt.match(/You are (?:a |an )?([^.]+)/i);
    const role = roleMatch ? roleMatch[1] : this.getDefaultRole(useCase);

    return `<role>
You are ${role}.
</role>

<task>
${prompt}
</task>`;
  }

  /**
   * Gets default role for a use case.
   * 
   * @param useCase - The use case type
   * @returns Default role description
   */
  private static getDefaultRole(useCase: PromptUseCase): string {
    switch (useCase) {
      case PromptUseCase.CONCEPT_EXPLANATION:
        return 'a senior computer science tutor specializing in clear, layered explanations';
      case PromptUseCase.CODE_ANALYSIS:
        return 'a code analysis expert focused on pedagogical understanding';
      case PromptUseCase.VIRO_ASSISTANT:
        return 'an AI tutor using the Socratic method to guide learning';
      case PromptUseCase.DICTIONARY:
        return 'a technical dictionary providing instant term definitions and translations';
      case PromptUseCase.VISION:
        return 'a vision analysis expert for code and diagram interpretation';
      default:
        return 'an AI assistant';
    }
  }

  /**
   * Converts JSON output format instructions to XML format (Claude's preference).
   * 
   * Claude performs better with XML tags for structured output rather than JSON.
   * This method identifies JSON format requests and converts them to XML equivalents.
   * 
   * @param prompt - Prompt potentially containing JSON format instructions
   * @returns Prompt with XML format instructions
   */
  private static convertJsonToXmlInstructions(prompt: string): string {
    // Check if prompt requests JSON output
    if (!prompt.toLowerCase().includes('json')) {
      return prompt;
    }

    // Replace JSON format instructions with XML equivalents
    let adapted = prompt;

    // Replace "return valid JSON" with XML instruction
    adapted = adapted.replace(
      /return (?:ONLY )?valid JSON/gi,
      'return your response using XML tags'
    );

    // Replace "JSON format" with "XML format"
    adapted = adapted.replace(/JSON format/gi, 'XML format');

    // Add XML format guidance if JSON structure is shown
    if (prompt.includes('{') && prompt.includes('}')) {
      adapted += '\n\n<output_format>\nUse XML tags to structure your response. For example:\n';
      adapted += '<response>\n  <field_name>value</field_name>\n  <nested_field>\n    <item>value</item>\n  </nested_field>\n</response>\n';
      adapted += '</output_format>';
    }

    return adapted;
  }

  /**
   * Adapts user prompt for Claude.
   * 
   * @param userPrompt - Original user prompt
   * @param useCase - The use case type
   * @returns Adapted user prompt
   */
  private static adaptUserPrompt(userPrompt: string, useCase: PromptUseCase): string {
    // Skip XML conversion for Viro - it needs strict JSON format
    if (useCase === PromptUseCase.VIRO_ASSISTANT) {
      return this.enhanceViroPrompt(userPrompt);
    }

    // Convert JSON format requests to XML for other use cases
    let adapted = this.convertJsonToXmlInstructions(userPrompt);

    // Add use-case specific enhancements
    switch (useCase) {
      case PromptUseCase.CONCEPT_EXPLANATION:
        adapted = this.enhanceConceptPrompt(adapted);
        break;
      case PromptUseCase.CODE_ANALYSIS:
        adapted = this.enhanceCodeAnalysisPrompt(adapted);
        break;
      case PromptUseCase.DICTIONARY:
        adapted = this.enhanceDictionaryPrompt(adapted);
        break;
      case PromptUseCase.VISION:
        adapted = this.enhanceVisionPrompt(adapted);
        break;
    }

    return adapted;
  }

  /**
   * Enhances concept explanation prompts for Claude.
   * 
   * @param prompt - Original prompt
   * @returns Enhanced prompt
   */
  private static enhanceConceptPrompt(prompt: string): string {
    // Add XML structure guidance for concept explanations
    if (!prompt.includes('<explanation>')) {
      return `${prompt}

Please structure your response with these XML tags:
<response>
  <explanation>
    <topic>concept name</topic>
    <intuition>simple explanation</intuition>
    <analogy>real-world analogy</analogy>
    <technical>formal explanation</technical>
    <step_by_step>
      <step>step 1</step>
      <step>step 2</step>
    </step_by_step>
    <constraints>
      <constraint>constraint 1</constraint>
    </constraints>
    <time_complexity>O(n)</time_complexity>
    <space_complexity>O(1)</space_complexity>
  </explanation>
  <code_example>
    <language>python</language>
    <code>code here</code>
    <explanation>explanation</explanation>
    <annotations>
      <annotation line="1">comment</annotation>
    </annotations>
  </code_example>
  <common_mistakes>
    <mistake>
      <description>description</description>
      <incorrect_example>wrong code</incorrect_example>
      <correct_example>right code</correct_example>
      <explanation>why and how to avoid</explanation>
    </mistake>
  </common_mistakes>
  <revision_summary>
    <key_takeaways>
      <takeaway>point 1</takeaway>
    </key_takeaways>
    <mental_model>simple model</mental_model>
    <exam_traps>
      <trap>trap 1</trap>
    </exam_traps>
  </revision_summary>
</response>`;
    }
    return prompt;
  }

  /**
   * Enhances code analysis prompts for Claude.
   * 
   * @param prompt - Original prompt
   * @returns Enhanced prompt
   */
  private static enhanceCodeAnalysisPrompt(prompt: string): string {
    // Add XML structure for code analysis
    if (!prompt.includes('<analysis>')) {
      return `${prompt}

Structure your analysis with these XML tags:
<analysis>
  <summary>brief description</summary>
  <line_by_line>
    <line number="1">
      <explanation>explanation text</explanation>
    </line>
  </line_by_line>
  <issues>
    <issue type="inefficiency|logic|style" line="5">
      <description>issue description</description>
    </issue>
  </issues>
  <simplified_version>optional improved code</simplified_version>
</analysis>`;
    }
    return prompt;
  }

  /**
   * Enhances Viro assistant prompts for Claude.
   * Viro uses Socratic method with RTF (Role/Task/Format) framework.
   * 
   * @param prompt - Original prompt
   * @returns Enhanced prompt
   */
  private static enhanceViroPrompt(prompt: string): string {
    // Viro prompts should maintain conversational flow and JSON format
    // Do NOT convert to XML for Viro - it needs strict JSON
    if (!prompt.toLowerCase().includes('socratic')) {
      return `${prompt}

Remember to use the Socratic method: guide the learner with questions rather than direct answers. Maintain an encouraging tone and adapt to the learner's level.`;
    }
    return prompt;
  }

  /**
   * Enhances dictionary lookup prompts for Claude.
   * 
   * @param prompt - Original prompt
   * @returns Enhanced prompt
   */
  private static enhanceDictionaryPrompt(prompt: string): string {
    // Add concise output instruction for dictionary lookups
    if (!prompt.toLowerCase().includes('concise')) {
      return `${prompt}

Provide a concise, structured response with definition, translation, and a brief code example.`;
    }
    return prompt;
  }

  /**
   * Enhances vision analysis prompts for Claude.
   * 
   * @param prompt - Original prompt
   * @returns Enhanced prompt
   */
  private static enhanceVisionPrompt(prompt: string): string {
    // Add guidance for image analysis
    if (!prompt.toLowerCase().includes('image') && !prompt.toLowerCase().includes('diagram')) {
      return `${prompt}

Analyze the provided image carefully. Extract any text, code, or diagrams. Describe the structure and content clearly.`;
    }
    return prompt;
  }

  /**
   * Helper method to get configuration for a specific use case.
   * Useful for external callers who need to know the configuration.
   * 
   * @param useCase - The use case type
   * @returns Configuration for the use case
   */
  static getUseCaseConfig(useCase: PromptUseCase): UseCaseConfig {
    const USE_CASE_CONFIGS = getUseCaseConfigs();
    return { ...USE_CASE_CONFIGS[useCase] };
  }

  /**
   * Helper method to determine the appropriate use case from context.
   * 
   * @param systemPrompt - The system prompt
   * @param userPrompt - The user prompt
   * @returns Detected use case
   */
  static detectUseCase(systemPrompt: string, userPrompt: string): PromptUseCase {
    const combined = (systemPrompt + ' ' + userPrompt).toLowerCase();

    if (combined.includes('viro') || combined.includes('socratic')) {
      return PromptUseCase.VIRO_ASSISTANT;
    }
    if (combined.includes('analyze') && combined.includes('code')) {
      return PromptUseCase.CODE_ANALYSIS;
    }
    if (combined.includes('dictionary') || combined.includes('definition') || combined.includes('translation')) {
      return PromptUseCase.DICTIONARY;
    }
    if (combined.includes('image') || combined.includes('vision') || combined.includes('diagram')) {
      return PromptUseCase.VISION;
    }
    // Default to concept explanation
    return PromptUseCase.CONCEPT_EXPLANATION;
  }
}
