import express from 'express';
import { AIService } from '../services/aiService';

const router = express.Router();
const aiService = new AIService();

interface DictionaryEntry {
  word: string;
  definition: string;
  technicalDefinition: string;
  example: string;
  codeExample?: string;
  codeExplanation?: string;
  relatedTerms: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  translation?: string;
}

// Mock dictionary database
const dictionaryDatabase: Record<string, DictionaryEntry> = {
  'variable': {
    word: 'Variable',
    definition: 'A named storage location in memory that holds a value',
    technicalDefinition: 'A symbolic name associated with a memory location that contains a value which can be changed during program execution',
    example: 'Think of a variable like a labeled box where you can store things and change what\'s inside',
    codeExample: 'let age = 25;\nage = 26; // Variable value changed',
    relatedTerms: ['constant', 'data type', 'assignment', 'declaration'],
    difficulty: 'beginner',
    category: 'Programming Basics'
  },
  'function': {
    word: 'Function',
    definition: 'A reusable block of code that performs a specific task',
    technicalDefinition: 'A named sequence of statements that performs a computation and optionally returns a value',
    example: 'Like a machine that takes inputs, processes them, and gives you an output',
    codeExample: 'function add(a, b) {\n  return a + b;\n}\nconst result = add(5, 3); // result = 8',
    relatedTerms: ['parameter', 'argument', 'return', 'scope'],
    difficulty: 'beginner',
    category: 'Programming Basics'
  },
  'array': {
    word: 'Array',
    definition: 'A collection of items stored in a single variable',
    technicalDefinition: 'A data structure consisting of a collection of elements, each identified by an array index',
    example: 'Like a row of mailboxes, each with a number and containing something',
    codeExample: 'const fruits = ["apple", "banana", "orange"];\nconsole.log(fruits[0]); // "apple"',
    relatedTerms: ['list', 'index', 'element', 'iteration'],
    difficulty: 'beginner',
    category: 'Data Structures'
  },
  'loop': {
    word: 'Loop',
    definition: 'A way to repeat code multiple times',
    technicalDefinition: 'A control flow statement that executes a block of code repeatedly until a specified condition is met',
    example: 'Like doing homework problems - repeat the same process for each problem',
    codeExample: 'for (let i = 0; i < 5; i++) {\n  console.log(i); // Prints 0, 1, 2, 3, 4\n}',
    relatedTerms: ['iteration', 'while', 'for', 'break', 'continue'],
    difficulty: 'beginner',
    category: 'Control Flow'
  },
  'algorithm': {
    word: 'Algorithm',
    definition: 'A step-by-step procedure to solve a problem',
    technicalDefinition: 'A finite sequence of well-defined instructions to solve a class of problems or perform a computation',
    example: 'Like a recipe for cooking - follow steps in order to get the result',
    codeExample: '// Binary Search Algorithm\nfunction binarySearch(arr, target) {\n  let left = 0, right = arr.length - 1;\n  while (left <= right) {\n    let mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}',
    relatedTerms: ['complexity', 'efficiency', 'data structure', 'optimization'],
    difficulty: 'intermediate',
    category: 'Algorithms'
  },
  'recursion': {
    word: 'Recursion',
    definition: 'A function that calls itself to solve smaller instances of the same problem',
    technicalDefinition: 'A programming technique where a function invokes itself as part of its execution, with a base case to prevent infinite loops',
    example: 'Like Russian nesting dolls - each doll contains a smaller version of itself',
    codeExample: 'function factorial(n) {\n  if (n <= 1) return 1; // Base case\n  return n * factorial(n - 1); // Recursive call\n}',
    relatedTerms: ['base case', 'stack', 'iteration', 'divide and conquer'],
    difficulty: 'intermediate',
    category: 'Programming Concepts'
  },
  'class': {
    word: 'Class',
    definition: 'A blueprint for creating objects with properties and methods',
    technicalDefinition: 'A template definition of the methods and variables in a particular kind of object',
    example: 'Like a cookie cutter - it defines the shape, and you can make many cookies from it',
    codeExample: 'class Car {\n  constructor(brand) {\n    this.brand = brand;\n  }\n  drive() {\n    console.log(`${this.brand} is driving`);\n  }\n}\nconst myCar = new Car("Toyota");',
    relatedTerms: ['object', 'instance', 'constructor', 'method', 'inheritance'],
    difficulty: 'intermediate',
    category: 'Object-Oriented Programming'
  },
  'api': {
    word: 'API',
    definition: 'Application Programming Interface - a way for programs to talk to each other',
    technicalDefinition: 'A set of protocols, tools, and definitions for building application software and enabling communication between different systems',
    example: 'Like a waiter in a restaurant - takes your order to the kitchen and brings back your food',
    codeExample: 'fetch("https://api.example.com/data")\n  .then(response => response.json())\n  .then(data => console.log(data));',
    relatedTerms: ['REST', 'endpoint', 'HTTP', 'request', 'response'],
    difficulty: 'intermediate',
    category: 'Web Development'
  },
  'database': {
    word: 'Database',
    definition: 'An organized collection of data stored electronically',
    technicalDefinition: 'A structured set of data held in a computer system, typically accessed and managed through a database management system (DBMS)',
    example: 'Like a digital filing cabinet where you can store, organize, and retrieve information',
    codeExample: '// SQL Query Example\nSELECT name, age FROM users WHERE age > 18;',
    relatedTerms: ['SQL', 'table', 'query', 'CRUD', 'schema'],
    difficulty: 'intermediate',
    category: 'Data Management'
  },
  'async': {
    word: 'Asynchronous',
    definition: 'Code that doesn\'t wait for operations to complete before moving on',
    technicalDefinition: 'A programming paradigm where operations can occur independently of the main program flow, allowing non-blocking execution',
    example: 'Like ordering food delivery - you don\'t wait at the door, you do other things until it arrives',
    codeExample: 'async function fetchData() {\n  const response = await fetch("/api/data");\n  const data = await response.json();\n  return data;\n}',
    relatedTerms: ['promise', 'await', 'callback', 'synchronous'],
    difficulty: 'advanced',
    category: 'Programming Concepts'
  }
};

// Dictionary lookup endpoint - now uses AI service (Bedrock or OpenAI)
router.post('/lookup', async (req, res) => {
  try {
    const { word, language } = req.body;

    if (!word) {
      return res.status(400).json({ error: 'Word is required' });
    }

    const normalizedWord = word.toLowerCase().trim();
    
    // Check if word exists in static database first (for common terms, faster response)
    const staticEntry = dictionaryDatabase[normalizedWord];
    
    if (staticEntry && !language) {
      // Return static entry for English requests
      return res.json({ entry: staticEntry, source: 'static' });
    }

    // Use AI service for dynamic lookup (supports all languages)
    try {
      const aiEntry = await aiService.lookupTerm(word, language || 'en');
      return res.json({ entry: aiEntry, source: 'ai' });
    } catch (aiError) {
      console.error('AI lookup failed, falling back to static:', aiError);
      
      // Fallback to static entry if AI fails
      if (staticEntry) {
        return res.json({ entry: staticEntry, source: 'static_fallback' });
      }

      // Return generic entry if both AI and static fail
      return res.json({
        entry: {
          word: word,
          definition: `Definition for "${word}" - A programming term`,
          technicalDefinition: `Technical definition for "${word}"`,
          example: 'Example usage in context',
          relatedTerms: [],
          difficulty: 'beginner',
          category: 'General'
        },
        source: 'generic'
      });
    }
  } catch (error) {
    console.error('Dictionary lookup error:', error);
    res.status(500).json({ error: 'Failed to lookup word' });
  }
});

// Get all dictionary entries
router.get('/all', (req, res) => {
  try {
    const entries = Object.values(dictionaryDatabase);
    res.json({ entries });
  } catch (error) {
    console.error('Error fetching dictionary:', error);
    res.status(500).json({ error: 'Failed to fetch dictionary' });
  }
});

// Get entries by category
router.get('/category/:category', (req, res) => {
  try {
    const { category } = req.params;
    const entries = Object.values(dictionaryDatabase).filter(
      entry => entry.category.toLowerCase() === category.toLowerCase()
    );
    res.json({ entries });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

export const dictionaryRoutes = router;
