import { CodeAnalysisResponse } from '../shared/types';

export interface LogicExplanation {
  line: number;
  intent: string;
  logicCategory: 'initialization' | 'condition' | 'iteration' | 'computation' | 'output' | 'control_flow';
  complexity: string;
}

export interface DryRunStep {
  step: number;
  activeLine: number;
  variableChanges: { [key: string]: any };
  conditionState: boolean | null;
  output: string;
  explanation: string;
}

export interface EdgeCase {
  scenario: string;
  input: string;
  expectedBehavior: string;
  riskLevel: 'low' | 'medium' | 'high';
  mitigation: string;
}

export interface KnowledgeCheckQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ComplexityAnalysis {
  timeComplexity: string;
  spaceComplexity: string;
  realWorldImpact: string;
  comparisonData: {
    input_size: number[];
    current_algorithm: number[];
    optimal_algorithm: number[];
  };
}

export interface PedagogicalAnalysis {
  logicExplanations: LogicExplanation[];
  dryRunTable: DryRunStep[];
  complexityAnalysis: ComplexityAnalysis;
  edgeCases: EdgeCase[];
  knowledgeCheck: KnowledgeCheckQuestion[];
  algorithmType: string;
  coreLogic: string;
}

export class PedagogicalAnalyzer {
  
  analyzeCodeLogic(code: string, language: string): PedagogicalAnalysis {
    const algorithmType = this.detectAlgorithmType(code, language);
    const logicExplanations = this.generateLogicExplanations(code, language, algorithmType);
    const dryRunTable = this.generateDryRunTable(code, language, algorithmType);
    const complexityAnalysis = this.analyzeComplexity(code, algorithmType);
    const edgeCases = this.identifyEdgeCases(code, language, algorithmType);
    const knowledgeCheck = this.generateKnowledgeCheck(code, language, algorithmType);
    
    return {
      logicExplanations,
      dryRunTable,
      complexityAnalysis,
      edgeCases,
      knowledgeCheck,
      algorithmType,
      coreLogic: this.extractCoreLogic(code, algorithmType)
    };
  }

  private detectAlgorithmType(code: string, language: string): string {
    const normalizedCode = code.replace(/\s+/g, ' ');
    
    const patterns: { [key: string]: RegExp[] } = {
      'Binary Search': [
        /while.*left.*<=.*right|if.*mid.*==.*target/i,
        /while.*\(.*left.*<=.*right.*\)/i,
        /mid.*=.*(left.*\+.*right).*\/.*2/i,
        /\[mid\].*==.*target/i
      ],
      'Linear Search': [
        /for.*in.*range.*len|if.*arr\[.*\].*==.*target/i,
        /for.*\(.*int.*i.*=.*0.*i.*<.*length/i,
        /for.*\(.*i.*=.*0.*i.*<.*arr\.length/i,
        /if.*\[i\].*==.*target/i
      ],
      'Bubble Sort': [
        /for.*range.*len.*for.*range.*len/i,
        /for.*\(.*i.*=.*0.*i.*<.*n.*i\+\+.*\).*for.*\(.*j.*=.*0/i,
        /if.*\[j\].*>.*\[j.*\+.*1\]/i,
        /swap|temp.*=.*\[/i
      ],
      'Quick Sort': [
        /partition|pivot/i,
        /if.*\[.*\].*<=.*pivot/i
      ],
      'Merge Sort': [
        /merge.*\(.*left.*right/i,
        /left.*right.*mid/i
      ],
      'Factorial': [
        /factorial/i,
        /if.*n.*<=.*1.*return.*1/i,
        /return.*n.*\*.*factorial/i
      ],
      'Fibonacci': [
        /fib/i,
        /if.*n.*<=.*1.*return.*n/i,
        /return.*fib.*n.*-.*1.*\+.*fib.*n.*-.*2/i
      ]
    };

    for (const [type, patternList] of Object.entries(patterns)) {
      let matchCount = 0;
      for (const pattern of patternList) {
        if (pattern.test(normalizedCode)) {
          matchCount++;
        }
      }
      if (matchCount >= 2) {
        return type;
      }
    }
    return 'General Algorithm';
  }

  private generateLogicExplanations(code: string, language: string, algorithmType: string): LogicExplanation[] {
    const lines = code.split('\n');
    const explanations: LogicExplanation[] = [];

    const commentPatterns: { [key: string]: RegExp } = {
      python: /^\s*(#|'''|""")/,
      javascript: /^\s*(\/\/|\/\*|\*)/,
      java: /^\s*(\/\/|\/\*|\*)/,
      cpp: /^\s*(\/\/|\/\*|\*)/,
      c: /^\s*(\/\/|\/\*|\*)/
    };

    const commentPattern = commentPatterns[language] || /^\s*(#|\/\/|\/\*|\*)/;

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmedLine = line.trim();
      
      if (!trimmedLine || commentPattern.test(trimmedLine)) return;

      let intent = '';
      let logicCategory: LogicExplanation['logicCategory'] = 'computation';
      let complexity = 'O(1)';

      if (algorithmType === 'Binary Search') {
        if ((trimmedLine.includes('left') || trimmedLine.includes('low')) && 
            (trimmedLine.includes('right') || trimmedLine.includes('high')) && 
            trimmedLine.match(/=\s*0|=\s*len|=\s*length|=\s*arr\.length/)) {
          intent = 'Initialize search boundaries to cover the entire array space';
          logicCategory = 'initialization';
        } else if (trimmedLine.match(/while.*left.*<=.*right|while.*\(.*left.*<=.*right/i)) {
          intent = 'Continue searching as long as there are elements in the current search window';
          logicCategory = 'condition';
          complexity = 'O(log n)';
        } else if (trimmedLine.includes('mid') && (trimmedLine.includes('/') || trimmedLine.includes('>>'))) {
          intent = 'Calculate the middle point to divide the search space in half';
          logicCategory = 'computation';
        } else if (trimmedLine.match(/\[mid\].*==.*target|\[mid\].*==.*key/i)) {
          intent = 'Check if we found the target element at the middle position';
          logicCategory = 'condition';
        } else if (trimmedLine.match(/left.*=.*mid.*\+.*1/i)) {
          intent = 'Target is larger than middle element, search the right half';
          logicCategory = 'control_flow';
        } else if (trimmedLine.match(/right.*=.*mid.*-.*1/i)) {
          intent = 'Target is smaller than middle element, search the left half';
          logicCategory = 'control_flow';
        }
      } else if (algorithmType === 'Bubble Sort') {
        if (trimmedLine.match(/for.*\(.*i.*=.*0|for.*i.*in.*range/i)) {
          intent = 'Iterate through each position that needs to be sorted';
          logicCategory = 'iteration';
          complexity = 'O(n²)';
        } else if (trimmedLine.match(/if.*\[.*\].*>.*\[.*\+.*1\]/i)) {
          intent = 'Compare adjacent elements to determine if they need swapping';
          logicCategory = 'condition';
        } else if (trimmedLine.match(/swap|temp.*=|,.*=.*,/i)) {
          intent = 'Swap elements to move the larger element towards its correct position';
          logicCategory = 'computation';
        }
      } else if (algorithmType === 'Factorial') {
        if (trimmedLine.match(/if.*n.*<=.*1|if.*\(.*n.*<=.*1/i)) {
          intent = 'Base case: factorial of 0 or 1 is 1';
          logicCategory = 'condition';
        } else if (trimmedLine.match(/return.*n.*\*.*factorial/i)) {
          intent = 'Recursive case: multiply n by factorial of (n-1)';
          logicCategory = 'computation';
          complexity = 'O(n)';
        }
      } else if (algorithmType === 'Fibonacci') {
        if (trimmedLine.match(/if.*n.*<=.*1|if.*\(.*n.*<=.*1/i)) {
          intent = 'Base case: return n for fibonacci(0) and fibonacci(1)';
          logicCategory = 'condition';
        } else if (trimmedLine.match(/return.*fib.*\+.*fib/i)) {
          intent = 'Recursive case: sum of two previous Fibonacci numbers';
          logicCategory = 'computation';
          complexity = 'O(2^n)';
        }
      } else {
        if (trimmedLine.match(/def |function |public.*static|private.*static|int.*\w+\(|void.*\w+\(/i)) {
          intent = 'Define the main algorithm function with required parameters';
          logicCategory = 'initialization';
        } else if (trimmedLine.match(/if\s*\(|if\s+/i) && !trimmedLine.match(/elif|else if/i)) {
          intent = 'Check a condition to determine the next course of action';
          logicCategory = 'condition';
        } else if (trimmedLine.match(/for\s*\(|for\s+|while\s*\(|while\s+/i)) {
          intent = 'Repeat operations for multiple data elements or until a condition is met';
          logicCategory = 'iteration';
          complexity = 'O(n)';
        } else if (trimmedLine.match(/return/i)) {
          intent = 'Return the computed result to the calling function';
          logicCategory = 'output';
        } else if (trimmedLine.match(/print\(|console\.log|System\.out|cout|printf/i)) {
          intent = 'Display intermediate or final results for verification';
          logicCategory = 'output';
        } else if (trimmedLine.match(/=.*new |malloc|calloc|\[\]|vector|ArrayList/i)) {
          intent = 'Allocate memory for data structure';
          logicCategory = 'initialization';
        } else if (trimmedLine.match(/\+\+|--|=.*\+|=.*-/)) {
          intent = 'Update variable value based on computation';
          logicCategory = 'computation';
        }
      }

      if (intent) {
        explanations.push({
          line: lineNum,
          intent,
          logicCategory,
          complexity
        });
      }
    });

    return explanations;
  }

  private generateDryRunTable(code: string, language: string, algorithmType: string): DryRunStep[] {
    const steps: DryRunStep[] = [];
    
    if (algorithmType === 'Binary Search') {
      const sampleArray = [1, 3, 5, 7, 9, 11, 13];
      const target = 7;
      
      steps.push(
        {
          step: 1,
          activeLine: 2,
          variableChanges: { left: 0, right: 6, arr: sampleArray, target: target },
          conditionState: null,
          output: '',
          explanation: 'Initialize search boundaries'
        },
        {
          step: 2,
          activeLine: 4,
          variableChanges: { left: 0, right: 6 },
          conditionState: true,
          output: '',
          explanation: 'Check if search space is valid (0 <= 6)'
        },
        {
          step: 3,
          activeLine: 5,
          variableChanges: { mid: 3 },
          conditionState: null,
          output: '',
          explanation: 'Calculate middle index: (0 + 6) / 2 = 3'
        },
        {
          step: 4,
          activeLine: 7,
          variableChanges: { 'arr[mid]': 7 },
          conditionState: true,
          output: '',
          explanation: 'Compare arr[3] = 7 with target = 7'
        },
        {
          step: 5,
          activeLine: 8,
          variableChanges: {},
          conditionState: null,
          output: '3',
          explanation: 'Target found! Return index 3'
        }
      );
    } else if (algorithmType === 'Bubble Sort') {
      const sampleArray = [64, 34, 25];
      
      steps.push(
        {
          step: 1,
          activeLine: 2,
          variableChanges: { arr: [64, 34, 25], n: 3 },
          conditionState: null,
          output: '',
          explanation: 'Initialize with unsorted array'
        },
        {
          step: 2,
          activeLine: 3,
          variableChanges: { i: 0 },
          conditionState: true,
          output: '',
          explanation: 'Start first pass through array'
        },
        {
          step: 3,
          activeLine: 4,
          variableChanges: { j: 0 },
          conditionState: true,
          output: '',
          explanation: 'Compare first pair of elements'
        },
        {
          step: 4,
          activeLine: 5,
          variableChanges: {},
          conditionState: true,
          output: '',
          explanation: 'Check if 64 > 34 (True)'
        },
        {
          step: 5,
          activeLine: 6,
          variableChanges: { arr: [34, 64, 25] },
          conditionState: null,
          output: '',
          explanation: 'Swap 64 and 34'
        }
      );
    } else if (algorithmType === 'Factorial') {
      steps.push(
        {
          step: 1,
          activeLine: 1,
          variableChanges: { n: 5 },
          conditionState: null,
          output: '',
          explanation: 'Call factorial(5)'
        },
        {
          step: 2,
          activeLine: 2,
          variableChanges: { n: 5 },
          conditionState: false,
          output: '',
          explanation: 'Check if n <= 1 (False)'
        },
        {
          step: 3,
          activeLine: 4,
          variableChanges: { n: 4 },
          conditionState: null,
          output: '',
          explanation: 'Recursively call factorial(4)'
        },
        {
          step: 4,
          activeLine: 4,
          variableChanges: {},
          conditionState: null,
          output: '',
          explanation: 'Continue recursion until n = 1'
        },
        {
          step: 5,
          activeLine: 4,
          variableChanges: {},
          conditionState: null,
          output: '120',
          explanation: 'Return 5 * 4 * 3 * 2 * 1 = 120'
        }
      );
    } else if (algorithmType === 'Fibonacci') {
      steps.push(
        {
          step: 1,
          activeLine: 1,
          variableChanges: { n: 6 },
          conditionState: null,
          output: '',
          explanation: 'Call fibonacci(6)'
        },
        {
          step: 2,
          activeLine: 2,
          variableChanges: { n: 6 },
          conditionState: false,
          output: '',
          explanation: 'Check if n <= 1 (False)'
        },
        {
          step: 3,
          activeLine: 4,
          variableChanges: { 'fib(5)': '?', 'fib(4)': '?' },
          conditionState: null,
          output: '',
          explanation: 'Split into fibonacci(5) + fibonacci(4)'
        },
        {
          step: 4,
          activeLine: 4,
          variableChanges: { 'fib(5)': 5, 'fib(4)': 3 },
          conditionState: null,
          output: '',
          explanation: 'Recursively compute both branches'
        },
        {
          step: 5,
          activeLine: 4,
          variableChanges: {},
          conditionState: null,
          output: '8',
          explanation: 'Return 5 + 3 = 8'
        }
      );
    } else if (algorithmType === 'Linear Search') {
      const sampleArray = [10, 23, 45, 70, 11, 15];
      const target = 70;
      
      steps.push(
        {
          step: 1,
          activeLine: 2,
          variableChanges: { arr: sampleArray, target: target, i: 0 },
          conditionState: null,
          output: '',
          explanation: 'Start searching from first element'
        },
        {
          step: 2,
          activeLine: 3,
          variableChanges: { i: 0, 'arr[0]': 10 },
          conditionState: false,
          output: '',
          explanation: 'Check if arr[0] = 10 equals target = 70 (False)'
        },
        {
          step: 3,
          activeLine: 3,
          variableChanges: { i: 1, 'arr[1]': 23 },
          conditionState: false,
          output: '',
          explanation: 'Check if arr[1] = 23 equals target = 70 (False)'
        },
        {
          step: 4,
          activeLine: 3,
          variableChanges: { i: 3, 'arr[3]': 70 },
          conditionState: true,
          output: '',
          explanation: 'Check if arr[3] = 70 equals target = 70 (True)'
        },
        {
          step: 5,
          activeLine: 4,
          variableChanges: {},
          conditionState: null,
          output: '3',
          explanation: 'Target found! Return index 3'
        }
      );
    } else {
      // Generic dry run for any other algorithm
      steps.push(
        {
          step: 1,
          activeLine: 1,
          variableChanges: { 'input': 'sample_data' },
          conditionState: null,
          output: '',
          explanation: 'Function called with input parameters'
        },
        {
          step: 2,
          activeLine: 2,
          variableChanges: { 'variables': 'initialized' },
          conditionState: null,
          output: '',
          explanation: 'Initialize local variables and data structures'
        },
        {
          step: 3,
          activeLine: 3,
          variableChanges: { 'condition': 'evaluated' },
          conditionState: true,
          output: '',
          explanation: 'Evaluate condition to determine execution path'
        },
        {
          step: 4,
          activeLine: 4,
          variableChanges: { 'processing': 'in_progress' },
          conditionState: null,
          output: '',
          explanation: 'Process data according to algorithm logic'
        },
        {
          step: 5,
          activeLine: 5,
          variableChanges: {},
          conditionState: null,
          output: 'result',
          explanation: 'Return computed result to caller'
        }
      );
    }

    return steps;
  }

  private analyzeComplexity(code: string, algorithmType: string): ComplexityAnalysis {
    const complexityMap: { [key: string]: { time: string; space: string; impact: string } } = {
      'Binary Search': {
        time: 'O(log n)',
        space: 'O(1)',
        impact: 'In a database with 1 million records, this algorithm needs only ~20 comparisons vs 500,000 for linear search'
      },
      'Linear Search': {
        time: 'O(n)',
        space: 'O(1)',
        impact: 'Processing 1 million sensor readings would require checking each one sequentially'
      },
      'Bubble Sort': {
        time: 'O(n²)',
        space: 'O(1)',
        impact: 'Sorting 10,000 student records would take ~100 million comparisons vs ~133,000 for merge sort'
      },
      'Quick Sort': {
        time: 'O(n log n)',
        space: 'O(log n)',
        impact: 'Efficiently sorts large datasets - used in most programming language libraries'
      },
      'Merge Sort': {
        time: 'O(n log n)',
        space: 'O(n)',
        impact: 'Guaranteed performance makes it ideal for real-time systems processing continuous data'
      },
      'Factorial': {
        time: 'O(n)',
        space: 'O(n)',
        impact: 'For factorial(20), requires 20 recursive calls and stack frames'
      },
      'Fibonacci': {
        time: 'O(2^n)',
        space: 'O(n)',
        impact: 'Naive fibonacci(40) would take billions of operations - use dynamic programming instead'
      }
    };

    const analysis = complexityMap[algorithmType] || {
      time: 'O(n)',
      space: 'O(1)',
      impact: 'Performance depends on the specific operations within the algorithm'
    };

    const inputSizes = [10, 100, 1000, 10000];
    const currentAlgorithm = inputSizes.map(n => {
      if (analysis.time.includes('log n') && !analysis.time.includes('n log n')) return Math.log2(n);
      if (analysis.time.includes('n²')) return n * n;
      if (analysis.time.includes('n log n')) return n * Math.log2(n);
      if (analysis.time.includes('2^n')) return Math.pow(2, Math.min(n, 20));
      return n;
    });
    
    const optimalAlgorithm = inputSizes.map(n => Math.log2(n));

    return {
      timeComplexity: analysis.time,
      spaceComplexity: analysis.space,
      realWorldImpact: analysis.impact,
      comparisonData: {
        input_size: inputSizes,
        current_algorithm: currentAlgorithm,
        optimal_algorithm: optimalAlgorithm
      }
    };
  }

  private identifyEdgeCases(code: string, language: string, algorithmType: string): EdgeCase[] {
    const edgeCases: EdgeCase[] = [];

    if (algorithmType.includes('Search')) {
      edgeCases.push(
        {
          scenario: 'Empty Array',
          input: language === 'python' ? '[]' : language === 'java' ? 'new int[]{}' : '{}',
          expectedBehavior: 'Should return -1 or handle gracefully',
          riskLevel: 'high',
          mitigation: 'Add length check before processing'
        },
        {
          scenario: 'Single Element',
          input: language === 'python' ? '[5]' : language === 'java' ? 'new int[]{5}' : '{5}',
          expectedBehavior: 'Should correctly find or not find the target',
          riskLevel: 'medium',
          mitigation: 'Ensure loop conditions handle single element'
        },
        {
          scenario: 'Target Not Present',
          input: 'target = 99 in [1,2,3]',
          expectedBehavior: 'Should return -1 without infinite loop',
          riskLevel: 'medium',
          mitigation: 'Verify termination conditions'
        }
      );
    }

    if (algorithmType.includes('Sort')) {
      edgeCases.push(
        {
          scenario: 'Already Sorted Array',
          input: '[1, 2, 3, 4, 5]',
          expectedBehavior: 'Should complete efficiently without unnecessary swaps',
          riskLevel: 'low',
          mitigation: 'Consider early termination optimization'
        },
        {
          scenario: 'Reverse Sorted Array',
          input: '[5, 4, 3, 2, 1]',
          expectedBehavior: 'Worst-case scenario - maximum comparisons needed',
          riskLevel: 'medium',
          mitigation: 'Algorithm should still complete correctly'
        },
        {
          scenario: 'Duplicate Elements',
          input: '[3, 1, 3, 2, 3]',
          expectedBehavior: 'Should handle duplicates without errors',
          riskLevel: 'medium',
          mitigation: 'Ensure comparison logic handles equality'
        }
      );
    }

    if (algorithmType === 'Factorial' || algorithmType === 'Fibonacci') {
      edgeCases.push(
        {
          scenario: 'Negative Input',
          input: 'n = -5',
          expectedBehavior: 'Should handle or reject negative numbers',
          riskLevel: 'high',
          mitigation: 'Add input validation for n >= 0'
        },
        {
          scenario: 'Large Input',
          input: 'n = 1000',
          expectedBehavior: 'May cause stack overflow in recursive implementation',
          riskLevel: 'high',
          mitigation: 'Use iterative approach or add recursion depth limit'
        },
        {
          scenario: 'Zero Input',
          input: 'n = 0',
          expectedBehavior: 'Should return correct base case value',
          riskLevel: 'low',
          mitigation: 'Ensure base case handles n = 0'
        }
      );
    }

    const hasLengthCheck = code.match(/len\(|\.length|\.size\(\)/i);
    if (!hasLengthCheck && code.match(/\[.*\]/)) {
      edgeCases.push({
        scenario: 'Missing Bounds Check',
        input: 'Arrays of different sizes',
        expectedBehavior: 'May cause index out of bounds',
        riskLevel: 'high',
        mitigation: 'Add array length validation'
      });
    }

    return edgeCases;
  }

  private generateKnowledgeCheck(code: string, language: string, algorithmType: string): KnowledgeCheckQuestion[] {
    const questions: KnowledgeCheckQuestion[] = [];

    if (algorithmType === 'Binary Search') {
      questions.push(
        {
          question: 'What happens if we change the condition from "left <= right" to "left < right"?',
          options: [
            'The algorithm becomes more efficient',
            'The algorithm may miss the target when left equals right',
            'The algorithm will run infinitely',
            'No difference in behavior'
          ],
          correctAnswer: 1,
          explanation: 'Using "left < right" would skip checking the case where left equals right, potentially missing the target element.',
          difficulty: 'medium'
        },
        {
          question: 'Why do we calculate mid as "(left + right) / 2" instead of just using the middle index?',
          options: [
            'It is more efficient',
            'It prevents integer overflow and adapts to the current search window',
            'It makes the code more readable',
            'It is required by the language syntax'
          ],
          correctAnswer: 1,
          explanation: 'Calculating mid relative to the current left and right boundaries ensures we always check the middle of the remaining search space.',
          difficulty: 'hard'
        },
        {
          question: 'What is the key requirement for binary search to work correctly?',
          options: [
            'The array must be large',
            'The array must be sorted',
            'The array must contain unique elements',
            'The array must be of even length'
          ],
          correctAnswer: 1,
          explanation: 'Binary search relies on the sorted property to eliminate half of the search space in each iteration.',
          difficulty: 'easy'
        }
      );
    } else if (algorithmType === 'Bubble Sort') {
      questions.push(
        {
          question: 'After the first complete pass of bubble sort, what can we guarantee?',
          options: [
            'The array is completely sorted',
            'The smallest element is in its correct position',
            'The largest element is in its correct position',
            'Half the array is sorted'
          ],
          correctAnswer: 2,
          explanation: 'Bubble sort moves the largest element to the end in each pass, so after the first pass, the largest element is correctly positioned.',
          difficulty: 'medium'
        },
        {
          question: 'What is the time complexity of bubble sort in the worst case?',
          options: [
            'O(n)',
            'O(n log n)',
            'O(n²)',
            'O(2^n)'
          ],
          correctAnswer: 2,
          explanation: 'Bubble sort has nested loops that each iterate through the array, resulting in O(n²) time complexity.',
          difficulty: 'easy'
        }
      );
    } else if (algorithmType === 'Factorial') {
      questions.push(
        {
          question: 'What would happen if we remove the base case (n <= 1)?',
          options: [
            'The function would be more efficient',
            'The function would cause infinite recursion and stack overflow',
            'The function would return incorrect results',
            'No difference in behavior'
          ],
          correctAnswer: 1,
          explanation: 'Without a base case, the recursive function would call itself indefinitely, leading to a stack overflow error.',
          difficulty: 'easy'
        }
      );
    } else if (algorithmType === 'Fibonacci') {
      questions.push(
        {
          question: 'Why is the naive recursive Fibonacci implementation inefficient?',
          options: [
            'It uses too much memory',
            'It recalculates the same values multiple times',
            'It has incorrect logic',
            'It cannot handle large numbers'
          ],
          correctAnswer: 1,
          explanation: 'The naive recursive approach recalculates the same Fibonacci numbers many times, leading to exponential time complexity O(2^n).',
          difficulty: 'medium'
        }
      );
    }

    return questions;
  }

  private extractCoreLogic(code: string, algorithmType: string): string {
    const coreLogicMap: { [key: string]: string } = {
      'Binary Search': 'Divide the search space in half by comparing the target with the middle element',
      'Linear Search': 'Check each element sequentially until the target is found',
      'Bubble Sort': 'Repeatedly compare adjacent elements and swap them if they are in wrong order',
      'Quick Sort': 'Choose a pivot and partition elements around it, then recursively sort partitions',
      'Merge Sort': 'Divide array into halves, sort each half, then merge sorted halves',
      'Factorial': 'Multiply the number by the factorial of (number - 1)',
      'Fibonacci': 'Sum the two preceding numbers in the sequence'
    };

    return coreLogicMap[algorithmType] || 'Process data according to the algorithm specific logic';
  }
}
