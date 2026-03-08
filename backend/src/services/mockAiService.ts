import { ConceptResponse, CodeAnalysisResponse, AdaptiveContext, EnhancedCodeAnalysisResponse } from '../shared/types';
import { PedagogicalAnalyzer } from './pedagogicalAnalyzer';

export class MockAIService {
  private pedagogicalAnalyzer: PedagogicalAnalyzer;

  constructor() {
    this.pedagogicalAnalyzer = new PedagogicalAnalyzer();
  }
  async explainConcept(
    topic: string, 
    context?: AdaptiveContext
  ): Promise<ConceptResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const sampleResponses: { [key: string]: ConceptResponse } = {
      'binary search': {
        explanation: {
          topic: 'Binary Search',
          intuition: 'Binary search is like looking up a word in a dictionary. You don\'t start from page 1 - you open to the middle, see if your word comes before or after, then eliminate half the pages and repeat.',
          analogy: 'Imagine you\'re playing a number guessing game where someone picks a number between 1-100. Instead of guessing randomly, you always guess the middle number, then use "higher" or "lower" hints to eliminate half the remaining possibilities each time.',
          technical: 'Binary search is a divide-and-conquer algorithm that finds a target value in a sorted array by repeatedly dividing the search interval in half. It compares the target with the middle element and eliminates half of the remaining elements based on the comparison.',
          stepByStep: [
            'Start with the entire sorted array',
            'Find the middle element',
            'Compare target with middle element',
            'If equal, return the index',
            'If target is smaller, search left half',
            'If target is larger, search right half',
            'Repeat until found or array is empty'
          ],
          constraints: [
            'Array must be sorted beforehand',
            'Only works on arrays with random access',
            'Target must be comparable with array elements'
          ],
          timeComplexity: 'O(log n)',
          spaceComplexity: 'O(1) iterative, O(log n) recursive'
        },
        codeExample: {
          language: 'python',
          code: `def binary_search(arr, target):
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

# Example usage
numbers = [1, 3, 5, 7, 9, 11, 13, 15]
result = binary_search(numbers, 7)
print(f"Found at index: {result}")  # Output: Found at index: 3`,
          explanation: 'This implementation uses two pointers (left and right) to track the current search range. In each iteration, we calculate the middle index and compare the middle element with our target. Based on the comparison, we eliminate half of the remaining elements.',
          annotations: [
            { line: 1, comment: 'Function takes sorted array and target value' },
            { line: 2, comment: 'Initialize left and right pointers to array bounds' },
            { line: 4, comment: 'Continue while search space is valid' },
            { line: 5, comment: 'Calculate middle index (avoid overflow with //)' },
            { line: 7, comment: 'Target found! Return the index' },
            { line: 9, comment: 'Target is larger, search right half' },
            { line: 11, comment: 'Target is smaller, search left half' },
            { line: 13, comment: 'Target not found in array' }
          ],
          timeComplexity: 'O(log n)',
          spaceComplexity: 'O(1)'
        },
        commonMistakes: [
          {
            description: 'Off-by-one error in loop condition',
            incorrectExample: 'while left < right:',
            correctExample: 'while left <= right:',
            explanation: 'Using < instead of <= will miss the case where left equals right, potentially skipping the last element to check.'
          },
          {
            description: 'Integer overflow in mid calculation',
            incorrectExample: 'mid = (left + right) / 2',
            correctExample: 'mid = left + (right - left) // 2',
            explanation: 'In languages like Java/C++, left + right might overflow. Python handles big integers automatically, but // ensures integer division.'
          }
        ],
        visualDiagram: {
          type: 'flowchart',
          mermaidCode: `flowchart TD
    A["Start: Array and Target"] --> B["Set left=0, right=len-1"]
    B --> C{"left <= right?"}
    C -->|No| D["Return -1: Not Found"]
    C -->|Yes| E["Calculate mid = (left + right) // 2"]
    E --> F{"arr[mid] == target?"}
    F -->|Yes| G["Return mid: Found!"]
    F -->|No| H{"arr[mid] < target?"}
    H -->|Yes| I["left = mid + 1"]
    H -->|No| J["right = mid - 1"]
    I --> C
    J --> C`,
          description: 'This flowchart shows the binary search decision process. Each iteration eliminates half the search space by comparing with the middle element.'
        },
        revisionSummary: {
          keyTakeaways: [
            'Always works on sorted arrays only',
            'Eliminates half the search space each iteration',
            'Time complexity is O(log n) - very efficient',
            'Space complexity is O(1) for iterative version'
          ],
          mentalModel: 'Think of it as the "dictionary lookup" algorithm - always go to the middle and eliminate half based on comparison.',
          examTraps: [
            'Forgetting that array must be sorted first',
            'Off-by-one errors in loop conditions',
            'Confusing when to use < vs <= in while loop',
            'Not handling the "not found" case properly'
          ]
        }
      },
      'recursion': {
        explanation: {
          topic: 'Recursion',
          intuition: 'Recursion is like Russian nesting dolls - each doll contains a smaller version of itself. A recursive function calls itself with a smaller problem until it reaches the simplest case.',
          analogy: 'Imagine you\'re looking for your keys in a messy house. You check each room, and if a room has closets, you recursively search each closet. You stop when you find the keys (base case) or when there are no more places to search.',
          technical: 'Recursion is a programming technique where a function calls itself to solve smaller instances of the same problem. It requires a base case to stop the recursion and a recursive case that breaks the problem down.',
          stepByStep: [
            'Define the base case (when to stop)',
            'Define the recursive case (how to break down the problem)',
            'Make sure each recursive call gets closer to the base case',
            'Combine results from recursive calls if needed'
          ],
          constraints: [
            'Must have a base case to avoid infinite recursion',
            'Each recursive call should work on a smaller problem',
            'Can consume more memory due to call stack'
          ],
          timeComplexity: 'Varies by problem (often O(2^n) for naive approaches)',
          spaceComplexity: 'O(n) for call stack in most cases'
        },
        codeExample: {
          language: 'python',
          code: `def factorial(n):
    # Base case
    if n <= 1:
        return 1
    
    # Recursive case
    return n * factorial(n - 1)

def fibonacci(n):
    # Base cases
    if n <= 1:
        return n
    
    # Recursive case
    return fibonacci(n - 1) + fibonacci(n - 2)

# Example usage
print(factorial(5))    # Output: 120
print(fibonacci(6))    # Output: 8`,
          explanation: 'These examples show classic recursive functions. Factorial multiplies n by the factorial of (n-1), while Fibonacci adds the two previous Fibonacci numbers.',
          annotations: [
            { line: 2, comment: 'Base case: stop when n is 0 or 1' },
            { line: 6, comment: 'Recursive case: n * factorial(n-1)' },
            { line: 10, comment: 'Fibonacci base cases for 0 and 1' },
            { line: 14, comment: 'Sum of two previous Fibonacci numbers' }
          ],
          timeComplexity: 'O(n) for factorial, O(2^n) for naive fibonacci',
          spaceComplexity: 'O(n) for call stack depth'
        },
        commonMistakes: [
          {
            description: 'Missing base case leads to infinite recursion',
            incorrectExample: `def factorial(n):
    return n * factorial(n - 1)  # No base case!`,
            correctExample: `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)`,
            explanation: 'Without a base case, the function will call itself forever, eventually causing a stack overflow.'
          }
        ],
        visualDiagram: {
          type: 'flowchart',
          mermaidCode: `flowchart TD
    A["factorial(5)"] --> B["5 * factorial(4)"]
    B --> C["5 * 4 * factorial(3)"]
    C --> D["5 * 4 * 3 * factorial(2)"]
    D --> E["5 * 4 * 3 * 2 * factorial(1)"]
    E --> F["5 * 4 * 3 * 2 * 1"]
    F --> G["120"]`,
          description: 'This shows how factorial(5) recursively breaks down into smaller problems until reaching the base case.'
        },
        revisionSummary: {
          keyTakeaways: [
            'Always define a clear base case',
            'Each recursive call should be on a smaller problem',
            'Recursion uses the call stack for memory',
            'Can often be converted to iterative solutions'
          ],
          mentalModel: 'Think of recursion as "solving a big problem by solving smaller versions of the same problem".',
          examTraps: [
            'Forgetting the base case',
            'Not making progress toward the base case',
            'Stack overflow from too many recursive calls',
            'Inefficient recursive solutions (like naive Fibonacci)'
          ]
        }
      }
    };

    const normalizedTopic = topic.toLowerCase();
    const response = sampleResponses[normalizedTopic];

    if (response) {
      return response;
    }

    // Generic response for unknown topics
    return {
      explanation: {
        topic: topic,
        intuition: `${topic} is a fundamental concept in computer science that helps solve specific types of problems efficiently.`,
        analogy: `Think of ${topic} like organizing your daily tasks - there's usually a systematic approach that makes everything more manageable.`,
        technical: `${topic} is an algorithmic technique that follows specific principles and patterns to achieve optimal solutions.`,
        stepByStep: [
          'Understand the problem requirements',
          'Identify the key patterns',
          'Apply the systematic approach',
          'Verify the solution works correctly'
        ],
        constraints: [
          'Must understand the problem context',
          'Requires practice to master',
          'May have specific input requirements'
        ],
        timeComplexity: 'Varies by implementation',
        spaceComplexity: 'Depends on approach used'
      },
      codeExample: {
        language: 'python',
        code: `# Example implementation for ${topic}
def solve_problem(input_data):
    # Process the input
    result = process_data(input_data)
    return result

def process_data(data):
    # Apply ${topic} technique
    return "Solution using " + "${topic}"

# Example usage
example_input = "sample data"
output = solve_problem(example_input)
print(output)`,
        explanation: `This is a basic template showing how ${topic} might be implemented. The actual implementation would depend on the specific problem requirements.`,
        annotations: [
          { line: 2, comment: 'Main function that applies the technique' },
          { line: 4, comment: 'Process input using the specific method' },
          { line: 7, comment: 'Helper function with the core logic' }
        ],
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)'
      },
      commonMistakes: [
        {
          description: 'Not understanding the core concept',
          incorrectExample: '# Trying to apply without understanding',
          correctExample: '# First learn the fundamentals',
          explanation: 'Make sure you understand the underlying principles before implementing the solution.'
        }
      ],
      visualDiagram: {
        type: 'flowchart',
        mermaidCode: `flowchart TD
    A["Input"] --> B["Process with ${topic}"]
    B --> C["Output"]`,
        description: `Basic flow diagram for ${topic} application.`
      },
      revisionSummary: {
        keyTakeaways: [
          `${topic} is an important algorithmic concept`,
          'Practice is key to mastering the technique',
          'Understanding the fundamentals is crucial'
        ],
        mentalModel: `Think of ${topic} as a systematic approach to solving specific types of problems.`,
        examTraps: [
          'Not practicing enough examples',
          'Forgetting edge cases',
          'Misunderstanding the core concept'
        ]
      }
    };
  }

  async analyzeCode(code: string, language: string): Promise<EnhancedCodeAnalysisResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Enhanced code analysis based on actual code content
    const lines = code.split('\n').filter(line => line.trim().length > 0);
    const codeLength = code.length;
    const hasComments = code.includes('//') || code.includes('#') || code.includes('/*');
    const hasLoops = /for|while|forEach/.test(code);
    const hasFunctions = /def |function |func |public |private/.test(code);
    const hasConditionals = /if|else|switch|case/.test(code);

    // Generate detailed line-by-line explanations
    const lineExplanations = lines.map((line, index) => {
      const lineNum = index + 1;
      const trimmedLine = line.trim();
      
      let explanation = '';
      
      if (trimmedLine.startsWith('def ') || trimmedLine.startsWith('function ')) {
        explanation = 'Function definition - declares a reusable block of code';
      } else if (trimmedLine.includes('=') && !trimmedLine.includes('==')) {
        explanation = 'Variable assignment - stores a value in memory';
      } else if (trimmedLine.startsWith('if ')) {
        explanation = 'Conditional statement - executes code based on a condition';
      } else if (trimmedLine.startsWith('for ') || trimmedLine.startsWith('while ')) {
        explanation = 'Loop statement - repeats code execution';
      } else if (trimmedLine.startsWith('return ')) {
        explanation = 'Return statement - exits function and optionally returns a value';
      } else if (trimmedLine.startsWith('print(') || trimmedLine.startsWith('console.log')) {
        explanation = 'Output statement - displays information to the user';
      } else if (trimmedLine.startsWith('#') || trimmedLine.startsWith('//')) {
        explanation = 'Comment - documentation that doesn\'t affect code execution';
      } else if (trimmedLine.includes('import ') || trimmedLine.includes('from ')) {
        explanation = 'Import statement - brings in external libraries or modules';
      } else if (trimmedLine === '' || trimmedLine.length === 0) {
        explanation = 'Empty line - used for code readability and organization';
      } else {
        explanation = 'Code statement - performs a specific operation or computation';
      }
      
      return { line: lineNum, explanation };
    });

    // Identify potential issues
    const issues = [];
    
    if (!hasComments && lines.length > 5) {
      issues.push({
        type: 'style' as const,
        description: 'Consider adding comments to explain complex logic and improve code readability',
        line: 1
      });
    }
    
    if (code.includes('var ') && language === 'javascript') {
      issues.push({
        type: 'style' as const,
        description: 'Consider using "let" or "const" instead of "var" for better scoping',
        line: code.split('\n').findIndex(line => line.includes('var ')) + 1
      });
    }
    
    if (lines.some(line => line.length > 100)) {
      issues.push({
        type: 'style' as const,
        description: 'Some lines are very long. Consider breaking them into multiple lines for better readability',
      });
    }
    
    if (language === 'python' && code.includes('range(len(')) {
      issues.push({
        type: 'inefficiency' as const,
        description: 'Consider using "enumerate()" instead of "range(len())" for more Pythonic code',
        line: code.split('\n').findIndex(line => line.includes('range(len(')) + 1
      });
    }

    // Generate summary based on code analysis
    let summary = `This ${language} code contains ${lines.length} lines of executable code. `;
    
    if (hasFunctions) {
      summary += 'It defines one or more functions, which promotes code reusability. ';
    }
    
    if (hasLoops) {
      summary += 'The code includes loop structures for iterative operations. ';
    }
    
    if (hasConditionals) {
      summary += 'It uses conditional logic to make decisions during execution. ';
    }
    
    if (hasComments) {
      summary += 'The code includes comments for documentation. ';
    }
    
    summary += `The code follows ${language} syntax conventions and appears to be well-structured.`;

    // Generate improved version if issues are found
    let simplifiedVersion = undefined;
    if (issues.length > 0) {
      simplifiedVersion = generateImprovedCode(code, language, issues);
    }

    // Generate pedagogical analysis for all languages with loops or functions
    let pedagogicalAnalysis = undefined;
    if (hasLoops || hasFunctions) {
      pedagogicalAnalysis = this.pedagogicalAnalyzer.analyzeCodeLogic(code, language);
    }

    return {
      summary,
      lineByLineExplanation: lineExplanations,
      issues,
      simplifiedVersion,
      pedagogicalAnalysis
    };
  }
}

// Helper function to generate improved code
function generateImprovedCode(originalCode: string, language: string, issues: any[]): string {
  let improvedCode = originalCode;
  
  // Add comments if missing
  if (issues.some(issue => issue.description.includes('comments'))) {
    const lines = improvedCode.split('\n');
    if (language === 'python') {
      lines.unshift('# Improved version with better documentation');
      lines.unshift('"""');
      lines.unshift('Enhanced code with improved readability and documentation');
      lines.unshift('"""');
    } else if (language === 'javascript') {
      lines.unshift('// Improved version with better documentation');
      lines.unshift('/**');
      lines.unshift(' * Enhanced code with improved readability and documentation');
      lines.unshift(' */');
    }
    improvedCode = lines.join('\n');
  }
  
  // Fix var to let/const in JavaScript
  if (language === 'javascript' && issues.some(issue => issue.description.includes('var'))) {
    improvedCode = improvedCode.replace(/var /g, 'let ');
  }
  
  // Fix range(len()) in Python
  if (language === 'python' && issues.some(issue => issue.description.includes('enumerate'))) {
    improvedCode = improvedCode.replace(/for\s+(\w+)\s+in\s+range\(len\((\w+)\)\):/g, 'for $1, item in enumerate($2):');
  }
  
  return improvedCode;
}