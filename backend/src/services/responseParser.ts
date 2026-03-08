/**
 * ResponseParser handles parsing of Claude responses from Amazon Bedrock.
 * Supports both JSON and XML-formatted responses, extracting structured data
 * for the frontend while maintaining backward compatibility with existing API formats.
 */

import {
  ConceptResponse,
  CodeAnalysisResponse,
  EnhancedCodeAnalysisResponse,
  PedagogicalAnalysis,
} from '../shared/types';

/**
 * Parsed response metadata
 */
export interface ParsedResponseMetadata {
  format: 'json' | 'xml' | 'text';
  hasCodeBlocks: boolean;
  codeBlockCount: number;
}

/**
 * Generic parsed response with metadata
 */
export interface ParsedResponse<T> {
  data: T;
  metadata: ParsedResponseMetadata;
  rawText: string;
}

/**
 * ResponseParser provides methods to parse Claude responses into typed TypeScript objects.
 * Handles both JSON and XML formats, with fallback to text parsing.
 */
export class ResponseParser {
  /**
   * Parses a Claude response into a ConceptResponse object.
   * Attempts JSON first, then XML, then structured text parsing.
   * 
   * @param responseText - Raw text response from Claude
   * @returns Parsed ConceptResponse with metadata
   * @throws Error if response cannot be parsed into expected structure
   */
  static parseConceptResponse(responseText: string): ParsedResponse<ConceptResponse> {
    const metadata = this.analyzeResponse(responseText);

    // Try JSON parsing first
    if (this.looksLikeJson(responseText)) {
      try {
        const data = this.parseConceptFromJson(responseText);
        return { data, metadata, rawText: responseText };
      } catch (error) {
        console.warn('JSON parsing failed, trying XML:', error);
      }
    }

    // Try XML parsing
    if (this.looksLikeXml(responseText)) {
      try {
        const data = this.parseConceptFromXml(responseText);
        return { data, metadata, rawText: responseText };
      } catch (error) {
        console.warn('XML parsing failed, trying text extraction:', error);
      }
    }

    // Fallback to text extraction
    const data = this.parseConceptFromText(responseText);
    return { data, metadata, rawText: responseText };
  }

  /**
   * Parses a Claude response into a CodeAnalysisResponse object.
   * 
   * @param responseText - Raw text response from Claude
   * @returns Parsed CodeAnalysisResponse with metadata
   * @throws Error if response cannot be parsed into expected structure
   */
  static parseCodeAnalysisResponse(responseText: string): ParsedResponse<CodeAnalysisResponse> {
    const metadata = this.analyzeResponse(responseText);

    if (this.looksLikeJson(responseText)) {
      try {
        const data = this.parseCodeAnalysisFromJson(responseText);
        return { data, metadata, rawText: responseText };
      } catch (error) {
        console.warn('JSON parsing failed, trying XML:', error);
      }
    }

    if (this.looksLikeXml(responseText)) {
      try {
        const data = this.parseCodeAnalysisFromXml(responseText);
        return { data, metadata, rawText: responseText };
      } catch (error) {
        console.warn('XML parsing failed, trying text extraction:', error);
      }
    }

    const data = this.parseCodeAnalysisFromText(responseText);
    return { data, metadata, rawText: responseText };
  }

  /**
   * Parses a Claude response into an EnhancedCodeAnalysisResponse with pedagogical analysis.
   * 
   * @param responseText - Raw text response from Claude
   * @returns Parsed EnhancedCodeAnalysisResponse with metadata
   */
  static parseEnhancedCodeAnalysisResponse(
    responseText: string
  ): ParsedResponse<EnhancedCodeAnalysisResponse> {
    const metadata = this.analyzeResponse(responseText);

    if (this.looksLikeJson(responseText)) {
      try {
        const data = this.parseEnhancedCodeAnalysisFromJson(responseText);
        return { data, metadata, rawText: responseText };
      } catch (error) {
        console.warn('JSON parsing failed, trying XML:', error);
      }
    }

    if (this.looksLikeXml(responseText)) {
      try {
        const data = this.parseEnhancedCodeAnalysisFromXml(responseText);
        return { data, metadata, rawText: responseText };
      } catch (error) {
        console.warn('XML parsing failed:', error);
      }
    }

    // Fallback: parse as basic code analysis
    const basicData = this.parseCodeAnalysisFromText(responseText);
    return { data: basicData, metadata, rawText: responseText };
  }

  /**
   * Extracts code blocks from response text.
   * Handles both markdown-style code blocks and XML code tags.
   * 
   * @param responseText - Raw text response
   * @returns Array of code blocks with language and content
   */
  static extractCodeBlocks(responseText: string): Array<{ language: string; code: string }> {
    const codeBlocks: Array<{ language: string; code: string }> = [];

    // Extract markdown code blocks (```language\ncode\n```)
    const markdownRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;
    while ((match = markdownRegex.exec(responseText)) !== null) {
      codeBlocks.push({
        language: match[1] || 'text',
        code: match[2].trim(),
      });
    }

    // Extract XML code tags (<code>...</code>)
    const xmlCodeRegex = /<code[^>]*>([\s\S]*?)<\/code>/g;
    while ((match = xmlCodeRegex.exec(responseText)) !== null) {
      codeBlocks.push({
        language: 'text',
        code: match[1].trim(),
      });
    }

    return codeBlocks;
  }

  /**
   * Validates response structure against expected schema.
   * 
   * @param data - Parsed data object
   * @param schema - Expected schema type
   * @returns true if valid, false otherwise
   */
  static validateResponseStructure(data: any, schema: 'concept' | 'codeAnalysis'): boolean {
    if (!data || typeof data !== 'object') {
      return false;
    }

    switch (schema) {
      case 'concept':
        return (
          data.explanation &&
          typeof data.explanation === 'object' &&
          data.codeExample &&
          typeof data.codeExample === 'object'
        );
      case 'codeAnalysis':
        return (
          typeof data.summary === 'string' &&
          Array.isArray(data.lineByLineExplanation) &&
          Array.isArray(data.issues)
        );
      default:
        return false;
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Analyzes response to determine format and characteristics.
   */
  private static analyzeResponse(responseText: string): ParsedResponseMetadata {
    const codeBlocks = this.extractCodeBlocks(responseText);
    
    let format: 'json' | 'xml' | 'text' = 'text';
    if (this.looksLikeJson(responseText)) {
      format = 'json';
    } else if (this.looksLikeXml(responseText)) {
      format = 'xml';
    }

    return {
      format,
      hasCodeBlocks: codeBlocks.length > 0,
      codeBlockCount: codeBlocks.length,
    };
  }

  /**
   * Checks if response looks like JSON.
   */
  private static looksLikeJson(text: string): boolean {
    const trimmed = text.trim();
    return (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
           (trimmed.startsWith('[') && trimmed.endsWith(']'));
  }

  /**
   * Checks if response looks like XML.
   */
  private static looksLikeXml(text: string): boolean {
    return text.includes('<response>') || text.includes('<explanation>') || text.includes('<analysis>');
  }

  /**
   * Parses ConceptResponse from JSON.
   */
  private static parseConceptFromJson(jsonText: string): ConceptResponse {
    const parsed = JSON.parse(jsonText);
    
    // Validate and transform to ConceptResponse format
    if (!this.validateResponseStructure(parsed, 'concept')) {
      throw new Error('Invalid concept response structure');
    }

    return parsed as ConceptResponse;
  }

  /**
   * Parses ConceptResponse from XML.
   */
  private static parseConceptFromXml(xmlText: string): ConceptResponse {
    const explanation = {
      topic: this.cleanXmlTags(this.extractXmlTag(xmlText, 'topic') || ''),
      intuition: this.cleanXmlTags(this.extractXmlTag(xmlText, 'intuition') || ''),
      analogy: this.cleanXmlTags(this.extractXmlTag(xmlText, 'analogy') || ''),
      technical: this.cleanXmlTags(this.extractXmlTag(xmlText, 'technical') || ''),
      stepByStep: this.extractXmlArray(xmlText, 'step').map(s => this.cleanXmlTags(s)),
      constraints: this.extractXmlArray(xmlText, 'constraint').map(c => this.cleanXmlTags(c)),
      timeComplexity: this.cleanXmlTags(this.extractXmlTag(xmlText, 'time_complexity') || ''),
      spaceComplexity: this.cleanXmlTags(this.extractXmlTag(xmlText, 'space_complexity') || ''),
    };

    const codeExample = {
      language: this.cleanXmlTags(this.extractXmlTag(xmlText, 'language', 'code_example') || 'python'),
      code: this.cleanXmlTags(this.extractXmlTag(xmlText, 'code', 'code_example') || ''),
      explanation: this.cleanXmlTags(this.extractXmlTag(xmlText, 'explanation', 'code_example') || ''),
      annotations: this.extractAnnotations(xmlText),
      timeComplexity: this.cleanXmlTags(this.extractXmlTag(xmlText, 'time_complexity', 'code_example') || ''),
      spaceComplexity: this.cleanXmlTags(this.extractXmlTag(xmlText, 'space_complexity', 'code_example') || ''),
    };

    const commonMistakes = this.extractCommonMistakes(xmlText);

    const revisionSummary = {
      keyTakeaways: this.extractXmlArray(xmlText, 'takeaway').map(t => this.cleanXmlTags(t)),
      mentalModel: this.cleanXmlTags(this.extractXmlTag(xmlText, 'mental_model') || ''),
      examTraps: this.extractXmlArray(xmlText, 'trap').map(t => this.cleanXmlTags(t)),
    };

    return {
      explanation,
      codeExample,
      commonMistakes,
      revisionSummary,
    };
  }

  /**
   * Remove XML tags from text content and decode HTML entities
   */
  private static cleanXmlTags(text: string): string {
    if (!text) return '';
    // Remove XML tags
    let cleaned = text.replace(/<[^>]+>/g, '');
    // Decode common HTML entities
    cleaned = cleaned
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    return cleaned.trim();
  }

  /**
   * Parses ConceptResponse from plain text.
   */
  private static parseConceptFromText(text: string): ConceptResponse {
    // Extract code blocks
    const codeBlocks = this.extractCodeBlocks(text);
    const firstCodeBlock = codeBlocks[0] || { language: 'python', code: '' };

    // Basic text parsing - extract sections
    const explanation = {
      topic: this.extractSection(text, ['Topic:', 'Concept:']) || 'Concept Explanation',
      intuition: this.extractSection(text, ['Intuition:', 'Simple Explanation:']) || '',
      analogy: this.extractSection(text, ['Analogy:', 'Real-world Example:']) || '',
      technical: this.extractSection(text, ['Technical:', 'Formal Definition:']) || text.substring(0, 500),
      stepByStep: this.extractListItems(text, ['Step-by-step:', 'Steps:']),
      constraints: this.extractListItems(text, ['Constraints:', 'Limitations:']),
      timeComplexity: this.extractComplexity(text, 'time'),
      spaceComplexity: this.extractComplexity(text, 'space'),
    };

    const codeExample = {
      language: firstCodeBlock.language,
      code: firstCodeBlock.code,
      explanation: this.extractSection(text, ['Code Explanation:', 'Example:']) || '',
      annotations: [],
    };

    return {
      explanation,
      codeExample,
      commonMistakes: [],
      revisionSummary: {
        keyTakeaways: this.extractListItems(text, ['Key Takeaways:', 'Summary:']),
        mentalModel: '',
        examTraps: [],
      },
    };
  }

  /**
   * Parses a Claude response into a dictionary entry object.
   * 
   * @param responseText - Raw text response from Claude
   * @returns Parsed dictionary entry with metadata
   * @throws Error if response cannot be parsed into expected structure
   */
  static parseDictionaryResponse(responseText: string): ParsedResponse<any> {
    const metadata = this.analyzeResponse(responseText);

    if (this.looksLikeJson(responseText)) {
      try {
        const data = JSON.parse(responseText);
        return { data, metadata, rawText: responseText };
      } catch (error) {
        console.warn('JSON parsing failed for dictionary response:', error);
      }
    }

    if (this.looksLikeXml(responseText)) {
      try {
        const data = this.parseDictionaryFromXml(responseText);
        return { data, metadata, rawText: responseText };
      } catch (error) {
        console.warn('XML parsing failed for dictionary response:', error);
      }
    }

    // Fallback to text extraction
    const data = this.parseDictionaryFromText(responseText);
    return { data, metadata, rawText: responseText };
  }

  /**
   * Parses a Claude response into a vision analysis result object.
   * 
   * @param responseText - Raw text response from Claude
   * @returns Parsed vision analysis result with metadata
   * @throws Error if response cannot be parsed into expected structure
   */
  static parseVisionResponse(responseText: string): ParsedResponse<any> {
    const metadata = this.analyzeResponse(responseText);

    if (this.looksLikeJson(responseText)) {
      try {
        const data = JSON.parse(responseText);
        // Ensure all required fields exist
        return {
          data: {
            digitizedContent: data.digitizedContent || '',
            visualInsights: data.visualInsights || '',
            educationalBreakdown: data.educationalBreakdown || '',
            confidenceScore: data.confidenceScore || 75,
            detectedLanguage: data.detectedLanguage || 'unknown',
            corrections: data.corrections || [],
            warnings: data.warnings || []
          },
          metadata,
          rawText: responseText
        };
      } catch (error) {
        console.warn('JSON parsing failed for vision response:', error);
      }
    }

    if (this.looksLikeXml(responseText)) {
      try {
        const data = this.parseVisionFromXml(responseText);
        return { data, metadata, rawText: responseText };
      } catch (error) {
        console.warn('XML parsing failed for vision response:', error);
      }
    }

    // Fallback to text extraction
    const data = this.parseVisionFromText(responseText);
    return { data, metadata, rawText: responseText };
  }

  /**
   * Parses vision analysis from XML.
   */
  private static parseVisionFromXml(xmlText: string): any {
    return {
      digitizedContent: this.extractXmlTag(xmlText, 'digitizedContent') || this.extractXmlTag(xmlText, 'digitized_content') || '',
      visualInsights: this.extractXmlTag(xmlText, 'visualInsights') || this.extractXmlTag(xmlText, 'visual_insights') || '',
      educationalBreakdown: this.extractXmlTag(xmlText, 'educationalBreakdown') || this.extractXmlTag(xmlText, 'educational_breakdown') || '',
      confidenceScore: parseInt(this.extractXmlTag(xmlText, 'confidenceScore') || this.extractXmlTag(xmlText, 'confidence_score') || '75', 10),
      detectedLanguage: this.extractXmlTag(xmlText, 'detectedLanguage') || this.extractXmlTag(xmlText, 'detected_language') || 'unknown',
      corrections: this.extractXmlArray(xmlText, 'correction'),
      warnings: this.extractXmlArray(xmlText, 'warning')
    };
  }

  /**
   * Parses vision analysis from plain text.
   */
  private static parseVisionFromText(text: string): any {
    return {
      digitizedContent: this.extractSection(text, ['Digitized Content:', 'Content:', 'Code:']) || text.substring(0, 500),
      visualInsights: this.extractSection(text, ['Visual Insights:', 'Visual Analysis:', 'Structure:']) || '',
      educationalBreakdown: this.extractSection(text, ['Educational Breakdown:', 'Analysis:', 'Explanation:']) || '',
      confidenceScore: 75,
      detectedLanguage: this.detectLanguageFromText(text),
      corrections: this.extractListItems(text, ['Corrections:', 'Fixes:']),
      warnings: this.extractListItems(text, ['Warnings:', 'Notes:'])
    };
  }

  /**
   * Detects programming language from text content.
   */
  private static detectLanguageFromText(text: string): string {
    if (/def\s+\w+\(/.test(text)) return 'python';
    if (/function\s+\w+\(/.test(text)) return 'javascript';
    if (/public\s+static\s+\w+/.test(text)) return 'java';
    if (/#include\s+</.test(text)) return 'cpp';
    if (/int\s+main\s*\(/.test(text)) return 'c';
    if (/START|END|IF|THEN|ELSE/.test(text)) return 'pseudocode';
    return 'unknown';
  }

  /**
   * Parses dictionary entry from XML.
   */
  private static parseDictionaryFromXml(xmlText: string): any {
    return {
      word: this.cleanXmlTags(this.extractXmlTag(xmlText, 'word') || ''),
      definition: this.cleanXmlTags(this.extractXmlTag(xmlText, 'definition') || ''),
      technicalDefinition: this.cleanXmlTags(this.extractXmlTag(xmlText, 'technicalDefinition') || this.extractXmlTag(xmlText, 'technical_definition') || ''),
      example: this.cleanXmlTags(this.extractXmlTag(xmlText, 'example') || ''),
      codeExample: this.cleanXmlTags(this.extractXmlTag(xmlText, 'codeExample') || this.extractXmlTag(xmlText, 'code_example') || ''),
      codeExplanation: this.cleanXmlTags(this.extractXmlTag(xmlText, 'codeExplanation') || this.extractXmlTag(xmlText, 'code_explanation') || ''),
      relatedTerms: this.extractXmlArray(xmlText, 'term').map(t => this.cleanXmlTags(t)),
      difficulty: this.cleanXmlTags(this.extractXmlTag(xmlText, 'difficulty') || 'beginner'),
      category: this.cleanXmlTags(this.extractXmlTag(xmlText, 'category') || 'General'),
      translation: this.cleanXmlTags(this.extractXmlTag(xmlText, 'translation') || ''),
    };
  }

  /**
   * Parses dictionary entry from plain text.
   */
  private static parseDictionaryFromText(text: string): any {
    return {
      word: this.extractSection(text, ['Word:', 'Term:']) || '',
      definition: this.extractSection(text, ['Definition:', 'Simple Definition:']) || text.substring(0, 200),
      technicalDefinition: this.extractSection(text, ['Technical Definition:', 'Formal Definition:']) || '',
      example: this.extractSection(text, ['Example:', 'Analogy:']) || '',
      codeExample: this.extractCodeBlocks(text)[0]?.code || '',
      codeExplanation: this.extractSection(text, ['Code Explanation:', 'Example Explanation:']) || '',
      relatedTerms: this.extractListItems(text, ['Related Terms:', 'See Also:']),
      difficulty: 'beginner',
      category: 'General',
    };
  }

  /**
   * Parses CodeAnalysisResponse from JSON.
   */
  private static parseCodeAnalysisFromJson(jsonText: string): CodeAnalysisResponse {
    const parsed = JSON.parse(jsonText);
    
    if (!this.validateResponseStructure(parsed, 'codeAnalysis')) {
      throw new Error('Invalid code analysis response structure');
    }

    return parsed as CodeAnalysisResponse;
  }

  /**
   * Parses CodeAnalysisResponse from XML.
   */
  private static parseCodeAnalysisFromXml(xmlText: string): CodeAnalysisResponse {
    const summary = this.cleanXmlTags(this.extractXmlTag(xmlText, 'summary') || '');
    const lineByLineExplanation = this.extractLineByLine(xmlText);
    const issues = this.extractIssues(xmlText);
    const simplifiedVersion = this.cleanXmlTags(this.extractXmlTag(xmlText, 'simplified_version') || '');

    return {
      summary,
      lineByLineExplanation,
      issues,
      simplifiedVersion,
    };
  }

  /**
   * Parses CodeAnalysisResponse from plain text.
   */
  private static parseCodeAnalysisFromText(text: string): CodeAnalysisResponse {
    const summary = this.extractSection(text, ['Summary:', 'Analysis:']) || text.substring(0, 200);
    
    return {
      summary,
      lineByLineExplanation: [],
      issues: [],
    };
  }

  /**
   * Parses EnhancedCodeAnalysisResponse from JSON.
   */
  private static parseEnhancedCodeAnalysisFromJson(jsonText: string): EnhancedCodeAnalysisResponse {
    const parsed = JSON.parse(jsonText);
    return parsed as EnhancedCodeAnalysisResponse;
  }

  /**
   * Parses EnhancedCodeAnalysisResponse from XML.
   */
  private static parseEnhancedCodeAnalysisFromXml(xmlText: string): EnhancedCodeAnalysisResponse {
    const basic = this.parseCodeAnalysisFromXml(xmlText);
    
    // Extract pedagogical analysis if present
    const pedagogicalAnalysis = this.extractPedagogicalAnalysis(xmlText);

    return {
      ...basic,
      pedagogicalAnalysis,
    };
  }

  // ============================================================================
  // XML Extraction Helpers
  // ============================================================================

  /**
   * Extracts content from an XML tag.
   */
  private static extractXmlTag(xml: string, tagName: string, parentTag?: string): string | undefined {
    let searchText = xml;
    
    // If parent tag specified, search within parent
    if (parentTag) {
      const parentRegex = new RegExp(`<${parentTag}[^>]*>([\\s\\S]*?)<\\/${parentTag}>`, 'i');
      const parentMatch = parentRegex.exec(xml);
      if (parentMatch) {
        searchText = parentMatch[1];
      }
    }

    const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
    const match = regex.exec(searchText);
    return match ? match[1].trim() : undefined;
  }

  /**
   * Extracts array of items from repeated XML tags.
   */
  private static extractXmlArray(xml: string, tagName: string): string[] {
    const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'gi');
    const items: string[] = [];
    let match;
    
    while ((match = regex.exec(xml)) !== null) {
      items.push(match[1].trim());
    }
    
    return items;
  }

  /**
   * Extracts code annotations from XML.
   */
  private static extractAnnotations(xml: string): Array<{ line: number; comment: string }> {
    const annotations: Array<{ line: number; comment: string }> = [];
    const regex = /<annotation\s+line="(\d+)"[^>]*>([^<]*)<\/annotation>/gi;
    let match;
    
    while ((match = regex.exec(xml)) !== null) {
      annotations.push({
        line: parseInt(match[1], 10),
        comment: match[2].trim(),
      });
    }
    
    return annotations;
  }

  /**
   * Extracts common mistakes from XML.
   */
  private static extractCommonMistakes(xml: string): Array<{
    description: string;
    incorrectExample: string;
    correctExample: string;
    explanation: string;
  }> {
    const mistakes: Array<any> = [];
    const mistakeRegex = /<mistake[^>]*>([\s\S]*?)<\/mistake>/gi;
    let match;
    
    while ((match = mistakeRegex.exec(xml)) !== null) {
      const mistakeXml = match[1];
      mistakes.push({
        description: this.extractXmlTag(mistakeXml, 'description') || '',
        incorrectExample: this.extractXmlTag(mistakeXml, 'incorrect_example') || '',
        correctExample: this.extractXmlTag(mistakeXml, 'correct_example') || '',
        explanation: this.extractXmlTag(mistakeXml, 'explanation') || '',
      });
    }
    
    return mistakes;
  }

  /**
   * Extracts line-by-line explanations from XML.
   */
  private static extractLineByLine(xml: string): Array<{ line: number; explanation: string }> {
    const explanations: Array<{ line: number; explanation: string }> = [];
    const regex = /<line\s+number="(\d+)"[^>]*>([\s\S]*?)<\/line>/gi;
    let match;
    
    while ((match = regex.exec(xml)) !== null) {
      const lineNum = parseInt(match[1], 10);
      const lineXml = match[2];
      const explanation = this.extractXmlTag(lineXml, 'explanation') || lineXml.trim();
      
      explanations.push({
        line: lineNum,
        explanation,
      });
    }
    
    return explanations;
  }

  /**
   * Extracts issues from XML.
   */
  private static extractIssues(xml: string): Array<{
    type: 'inefficiency' | 'logic' | 'style';
    description: string;
    line?: number;
  }> {
    const issues: Array<any> = [];
    const regex = /<issue\s+type="(\w+)"(?:\s+line="(\d+)")?\s*>([\s\S]*?)<\/issue>/gi;
    let match;
    
    while ((match = regex.exec(xml)) !== null) {
      const type = match[1] as 'inefficiency' | 'logic' | 'style';
      const line = match[2] ? parseInt(match[2], 10) : undefined;
      const issueXml = match[3];
      const description = this.extractXmlTag(issueXml, 'description') || issueXml.trim();
      
      issues.push({
        type,
        description,
        line,
      });
    }
    
    return issues;
  }

  /**
   * Extracts pedagogical analysis from XML.
   */
  private static extractPedagogicalAnalysis(xml: string): PedagogicalAnalysis | undefined {
    // Check if pedagogical analysis section exists
    if (!xml.includes('<pedagogical_analysis>') && !xml.includes('<logic_explanations>')) {
      return undefined;
    }

    // This is a simplified extraction - full implementation would parse all fields
    return {
      logicExplanations: [],
      dryRunTable: [],
      complexityAnalysis: {
        timeComplexity: this.extractXmlTag(xml, 'time_complexity') || 'O(n)',
        spaceComplexity: this.extractXmlTag(xml, 'space_complexity') || 'O(1)',
        realWorldImpact: '',
        comparisonData: {
          input_size: [],
          current_algorithm: [],
          optimal_algorithm: [],
        },
      },
      edgeCases: [],
      knowledgeCheck: [],
      algorithmType: this.extractXmlTag(xml, 'algorithm_type') || '',
      coreLogic: this.extractXmlTag(xml, 'core_logic') || '',
    };
  }

  // ============================================================================
  // Text Extraction Helpers
  // ============================================================================

  /**
   * Extracts a section from text based on header patterns.
   */
  private static extractSection(text: string, headers: string[]): string | undefined {
    for (const header of headers) {
      const regex = new RegExp(`${header}\\s*([^\\n]+)`, 'i');
      const match = regex.exec(text);
      if (match) {
        return match[1].trim();
      }
    }
    return undefined;
  }

  /**
   * Extracts list items from text.
   */
  private static extractListItems(text: string, headers: string[]): string[] {
    const section = this.extractSection(text, headers);
    if (!section) return [];

    // Extract numbered or bulleted list items
    const items: string[] = [];
    const lines = section.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      // Match numbered lists (1. item) or bulleted lists (- item, * item)
      const match = trimmed.match(/^(?:\d+\.|[-*])\s+(.+)$/);
      if (match) {
        items.push(match[1].trim());
      }
    }
    
    return items;
  }

  /**
   * Extracts complexity notation from text.
   */
  private static extractComplexity(text: string, type: 'time' | 'space'): string | undefined {
    const pattern = type === 'time' ? 'time complexity' : 'space complexity';
    const regex = new RegExp(`${pattern}[:\\s]*(O\\([^)]+\\))`, 'i');
    const match = regex.exec(text);
    return match ? match[1] : undefined;
  }
}

/**
 * ResponseSerializer formats parsed data into API response structure.
 * Maintains backward compatibility with existing frontend expectations.
 */
export class ResponseSerializer {
  /**
   * Serializes a ConceptResponse for API response.
   * 
   * @param data - Parsed ConceptResponse
   * @returns Serialized response ready for frontend
   */
  static serializeConceptResponse(data: ConceptResponse): ConceptResponse {
    // Currently just returns the data as-is since it matches the expected format
    // Future: Add transformations if API format diverges from internal format
    return data;
  }

  /**
   * Serializes a CodeAnalysisResponse for API response.
   * 
   * @param data - Parsed CodeAnalysisResponse
   * @returns Serialized response ready for frontend
   */
  static serializeCodeAnalysisResponse(data: CodeAnalysisResponse): CodeAnalysisResponse {
    return data;
  }

  /**
   * Serializes an EnhancedCodeAnalysisResponse for API response.
   * 
   * @param data - Parsed EnhancedCodeAnalysisResponse
   * @returns Serialized response ready for frontend
   */
  static serializeEnhancedCodeAnalysisResponse(
    data: EnhancedCodeAnalysisResponse
  ): EnhancedCodeAnalysisResponse {
    return data;
  }

  /**
   * Round-trip test: parse -> serialize -> parse should produce equivalent object.
   * This is used for testing and validation.
   * 
   * @param originalText - Original response text
   * @param parseMethod - Parser method to use
   * @returns true if round-trip produces equivalent object
   */
  static testRoundTrip(
    originalText: string,
    parseMethod: 'concept' | 'codeAnalysis'
  ): boolean {
    try {
      let parsed1: any;
      let serialized: any;
      let parsed2: any;

      if (parseMethod === 'concept') {
        parsed1 = ResponseParser.parseConceptResponse(originalText);
        serialized = this.serializeConceptResponse(parsed1.data);
        // For round-trip, we serialize to JSON and parse back
        const jsonText = JSON.stringify(serialized);
        parsed2 = ResponseParser.parseConceptResponse(jsonText);
        
        return this.deepEqual(parsed1.data, parsed2.data);
      } else {
        parsed1 = ResponseParser.parseCodeAnalysisResponse(originalText);
        serialized = this.serializeCodeAnalysisResponse(parsed1.data);
        const jsonText = JSON.stringify(serialized);
        parsed2 = ResponseParser.parseCodeAnalysisResponse(jsonText);
        
        return this.deepEqual(parsed1.data, parsed2.data);
      }
    } catch (error) {
      console.error('Round-trip test failed:', error);
      return false;
    }
  }

  /**
   * Deep equality check for objects.
   */
  private static deepEqual(obj1: any, obj2: any): boolean {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }
}
