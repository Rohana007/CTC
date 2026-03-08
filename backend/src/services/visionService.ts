import { BedrockService, ClaudeModel, ClaudeMessage } from './bedrockService';
import { PromptAdapter, PromptUseCase } from './promptAdapter';
import { ResponseParser } from './responseParser';

export interface VisionAnalysisResult {
  digitizedContent: string;
  visualInsights: string;
  educationalBreakdown: string;
  confidenceScore: number;
  detectedLanguage: string;
  corrections: string[];
  warnings: string[];
}

export class VisionService {
  private bedrock: BedrockService | null = null;
  private useBedrock: boolean;

  constructor() {
    // Feature flag to switch between mock and Bedrock
    this.useBedrock = process.env.USE_BEDROCK === 'true';

    if (this.useBedrock) {
      const region = process.env.AWS_REGION || 'us-east-1';
      this.bedrock = new BedrockService(region);
      console.log('VisionService initialized with Amazon Bedrock');
    } else {
      console.log('VisionService initialized with mock data');
    }
  }
  
  async analyzeImage(imageBase64: string): Promise<VisionAnalysisResult> {
    if (this.useBedrock && this.bedrock) {
      return this.analyzeImageWithBedrock(imageBase64);
    } else {
      return this.analyzeImageWithMock(imageBase64);
    }
  }

  private async analyzeImageWithBedrock(imageBase64: string): Promise<VisionAnalysisResult> {
    const systemPrompt = `You are a vision analysis expert specializing in code and diagram interpretation for educational purposes.

Your task is to analyze images containing:
- Handwritten code
- Flowcharts and diagrams
- Textbook pages with programming problems
- Screenshots of code

Provide a comprehensive analysis with:
1. Digitized content (OCR + interpretation)
2. Visual insights (structure, layout, quality)
3. Educational breakdown (algorithm explanation, concepts, complexity)
4. Confidence score (0-100)
5. Detected language (python, javascript, java, pseudocode, etc.)
6. Corrections made (OCR fixes, formatting)
7. Warnings (ambiguous characters, unclear sections)

Return your response in JSON format.`;

    const userPrompt = `Analyze this image and provide a detailed educational analysis.

Return in this JSON format:
{
  "digitizedContent": "The extracted and cleaned code/text/diagram content",
  "visualInsights": "Analysis of visual structure, layout, handwriting quality, diagram elements",
  "educationalBreakdown": "Explanation of algorithm/concept, key components, complexity analysis, educational notes",
  "confidenceScore": 85,
  "detectedLanguage": "python|javascript|java|cpp|pseudocode|problem_statement",
  "corrections": ["List of OCR corrections made", "Formatting fixes"],
  "warnings": ["Ambiguous characters or unclear sections"]
}

CRITICAL: Return ONLY valid JSON. No additional text before or after.`;

    try {
      // Prepare image content for Bedrock
      // Note: Claude 3 models support vision, Nova models also support vision
      const messages: ClaudeMessage[] = [
        {
          role: 'user',
          content: [
            {
              text: userPrompt
            }
          ]
        }
      ];

      // For now, we'll use text-only analysis since image support requires different API format
      // TODO: Implement proper image support with Claude 3 vision API
      // This is a placeholder that analyzes based on image metadata
      const imageInfo = this.extractImageInfo(imageBase64);
      const contextPrompt = `${userPrompt}\n\nImage metadata: ${imageInfo}`;

      const adaptedPrompt = PromptAdapter.adaptPrompt(
        systemPrompt,
        contextPrompt,
        PromptUseCase.VISION
      );

      const responseText = await this.bedrock!.invokeClaude(
        adaptedPrompt.messages,
        adaptedPrompt.config,
        adaptedPrompt.systemPrompt
      );

      // Parse response
      const parsedResponse = ResponseParser.parseVisionResponse(responseText);
      return parsedResponse.data;
    } catch (error) {
      console.error('Bedrock Vision Analysis Error:', error);
      // Fallback to mock analysis
      console.warn('Falling back to mock vision analysis');
      return this.analyzeImageWithMock(imageBase64);
    }
  }

  private extractImageInfo(imageBase64: string): string {
    // Extract basic image metadata
    const sizeKB = Math.round((imageBase64.length * 3) / 4 / 1024);
    const format = this.detectImageFormat(imageBase64);
    
    return `Format: ${format}, Size: ~${sizeKB}KB`;
  }

  private detectImageFormat(imageBase64: string): string {
    if (imageBase64.startsWith('/9j/')) return 'JPEG';
    if (imageBase64.startsWith('iVBORw0KGgo')) return 'PNG';
    if (imageBase64.startsWith('R0lGOD')) return 'GIF';
    return 'Unknown';
  }

  private async analyzeImageWithMock(imageBase64: string): Promise<VisionAnalysisResult> {
    // Simulate image analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock OCR and analysis
    // In production, this would use Google Vision API, AWS Rekognition, or Tesseract.js
    const mockResult = this.generateMockAnalysis(imageBase64);
    
    return mockResult;
  }

  private generateMockAnalysis(imageBase64: string): VisionAnalysisResult {
    // Simulate different types of content based on image characteristics
    const analysisType = this.detectContentType(imageBase64);

    if (analysisType === 'handwritten_code') {
      return this.analyzeHandwrittenCode();
    } else if (analysisType === 'diagram') {
      return this.analyzeDiagram();
    } else {
      return this.analyzeTextbook();
    }
  }

  private detectContentType(imageBase64: string): 'handwritten_code' | 'diagram' | 'textbook' {
    // Simple heuristic based on image data
    // In production, use ML model for classification
    const random = Math.random();
    if (random < 0.4) return 'handwritten_code';
    if (random < 0.7) return 'diagram';
    return 'textbook';
  }

  private analyzeHandwrittenCode(): VisionAnalysisResult {
    return {
      digitizedContent: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1

# Test the function
numbers = [1, 3, 5, 7, 9, 11, 13]
result = binary_search(numbers, 7)
print(f"Found at index: {result}")`,
      visualInsights: `Handwriting Analysis:
- Clear block structure detected with consistent 4-space indentation
- Function definition starts at line 1
- While loop body properly indented (lines 4-12)
- Conditional statements (if/elif/else) correctly structured
- Return statements aligned with function scope
- Test code section clearly separated with comment`,
      educationalBreakdown: `Algorithm Identified: Binary Search

Core Logic:
This is a classic binary search implementation that efficiently finds a target value in a sorted array by repeatedly dividing the search space in half.

Key Components:
1. Initialization (line 2): Sets left and right pointers to array boundaries
2. Loop Condition (line 4): Continues while search space is valid
3. Midpoint Calculation (line 5): Finds middle index to divide search space
4. Comparison Logic (lines 7-12): Determines which half to search next
5. Return Value (line 13): Returns -1 if target not found

Time Complexity: O(log n)
Space Complexity: O(1)

Educational Note: This algorithm only works on sorted arrays and is much more efficient than linear search for large datasets.`,
      confidenceScore: 92,
      detectedLanguage: 'python',
      corrections: [
        'Line 9: Added colon after "elif" statement (was missing in handwriting)',
        'Line 2: Corrected "len" spelling (appeared as "1en" in image)',
        'Standardized indentation to 4 spaces throughout'
      ],
      warnings: [
        'Line 5: Character "0" in "left + right" could be letter "O" - interpreted as zero based on context',
        'Line 13: Return value "-1" slightly unclear - confirmed as negative one'
      ]
    };
  }

  private analyzeDiagram(): VisionAnalysisResult {
    return {
      digitizedContent: `# Flowchart Logic Converted to Pseudocode

START
  INPUT: array, target
  
  SET left = 0
  SET right = length(array) - 1
  
  WHILE left <= right DO
    SET mid = (left + right) / 2
    
    IF array[mid] == target THEN
      RETURN mid
    ELSE IF array[mid] < target THEN
      SET left = mid + 1
    ELSE
      SET right = mid - 1
    END IF
  END WHILE
  
  RETURN -1
END`,
      visualInsights: `Diagram Analysis:

Node Mapping:
- Start Node: Oval shape at top
- Input Node: Parallelogram showing "array, target"
- Process Nodes: 2 rectangles for initialization (left=0, right=len-1)
- Decision Node: Diamond shape for "left <= right" condition
- Calculation Node: Rectangle for mid calculation
- Nested Decision: Diamond for target comparison
- Process Nodes: 3 rectangles for left/right updates and return
- End Node: Oval shape at bottom

Edge Flow:
- Main loop: Decision → Calculation → Comparison → Update → Back to Decision
- Exit conditions: Two paths leading to return statements
- True/False branches clearly marked with arrows

Algorithm Type: Binary Search (Divide and Conquer)`,
      educationalBreakdown: `Flowchart Represents: Binary Search Algorithm

Visual Structure Analysis:
The diagram shows a classic iterative binary search pattern with:

1. Initialization Phase (Top):
   - Two parallel process boxes setting up search boundaries
   - Clear entry point with input parameters

2. Main Loop Structure (Middle):
   - Loop guard condition in diamond shape
   - Midpoint calculation in rectangular process box
   - Three-way decision tree for comparison

3. Update Logic (Branches):
   - Left branch: Increases left pointer (search right half)
   - Right branch: Decreases right pointer (search left half)
   - Center branch: Returns found index

4. Termination (Bottom):
   - Loop exit leads to "not found" return
   - Success path exits early with index

Educational Insight:
This visual representation clearly shows how binary search eliminates half the search space in each iteration, making it logarithmic in time complexity. The diamond shapes represent decision points, while rectangles show state changes.`,
      confidenceScore: 88,
      detectedLanguage: 'pseudocode',
      corrections: [
        'Converted visual flowchart to structured pseudocode',
        'Standardized decision node labels for clarity',
        'Added explicit START/END markers'
      ],
      warnings: [
        'Arrow direction between "mid calculation" and "comparison" node slightly unclear - assumed downward flow',
        'Loop back arrow could indicate either WHILE or DO-WHILE - interpreted as WHILE based on guard position'
      ]
    };
  }

  private analyzeTextbook(): VisionAnalysisResult {
    return {
      digitizedContent: `Problem Statement (from textbook page):

"Given a sorted array of integers and a target value, implement an efficient algorithm to find the index of the target. If the target is not present, return -1."

Example:
Input: arr = [1, 3, 5, 7, 9], target = 7
Output: 3

Constraints:
- 1 ≤ arr.length ≤ 10^4
- -10^4 ≤ arr[i] ≤ 10^4
- Array is sorted in ascending order
- -10^4 ≤ target ≤ 10^4

Follow-up: Can you solve it in O(log n) time?`,
      visualInsights: `Textbook Page Analysis:

Layout Structure:
- Problem title at top in bold
- Problem statement in regular text (3 lines)
- Example section with input/output format
- Constraints section with bullet points
- Follow-up question in italics at bottom

Visual Elements:
- Array notation using square brackets
- Mathematical notation for constraints (≤, ≥)
- Superscript notation for powers (10^4)
- Clear section separators

Text Quality:
- High contrast, printed text
- Standard textbook font (likely Times New Roman or similar)
- No handwritten annotations visible`,
      educationalBreakdown: `Problem Analysis:

Type: Search Algorithm Problem
Difficulty: Easy to Medium
Topic: Binary Search / Array Manipulation

Key Observations:
1. Array is SORTED - This is crucial! Suggests binary search approach
2. Time complexity hint in follow-up: O(log n) confirms binary search
3. Return -1 for not found - Standard convention

Solution Approach:
Since the array is sorted, we can use binary search:
- Start with left=0, right=length-1
- Calculate mid = (left + right) / 2
- Compare arr[mid] with target
- Adjust search boundaries based on comparison
- Repeat until found or search space exhausted

Why Binary Search?
- Linear search would be O(n) - too slow for large arrays
- Binary search achieves O(log n) by eliminating half the search space each iteration
- For array of 10,000 elements, binary search needs max 14 comparisons vs 10,000 for linear

Implementation Considerations:
- Handle edge cases: empty array, single element
- Prevent integer overflow in mid calculation
- Ensure loop termination condition is correct (left <= right)

Related Concepts:
- Divide and Conquer algorithms
- Logarithmic time complexity
- Array indexing and bounds checking`,
      confidenceScore: 95,
      detectedLanguage: 'problem_statement',
      corrections: [
        'Converted mathematical symbols to text equivalents',
        'Preserved array notation and formatting',
        'Maintained constraint structure'
      ],
      warnings: []
    };
  }

  // Helper method to detect programming language from code
  detectLanguage(code: string): string {
    if (/def\s+\w+\(/.test(code)) return 'python';
    if (/function\s+\w+\(/.test(code)) return 'javascript';
    if (/public\s+static\s+\w+/.test(code)) return 'java';
    if (/#include\s+</.test(code)) return 'cpp';
    if (/int\s+main\s*\(/.test(code)) return 'c';
    return 'unknown';
  }

  // Helper method to calculate confidence based on various factors
  calculateConfidence(factors: {
    textClarity: number;
    structureDetection: number;
    syntaxValidity: number;
  }): number {
    const weights = {
      textClarity: 0.4,
      structureDetection: 0.3,
      syntaxValidity: 0.3
    };

    return Math.round(
      factors.textClarity * weights.textClarity +
      factors.structureDetection * weights.structureDetection +
      factors.syntaxValidity * weights.syntaxValidity
    );
  }
}
