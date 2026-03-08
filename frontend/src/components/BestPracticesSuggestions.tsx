import React from 'react';
import { Lightbulb, CheckCircle, AlertCircle } from 'lucide-react';

interface BestPracticesSuggestionsProps {
  language: string;
  code: string;
  issues: any[];
}

export const BestPracticesSuggestions: React.FC<BestPracticesSuggestionsProps> = ({ 
  language, 
  code, 
  issues 
}) => {
  const getBestPractices = () => {
    const practices = {
      python: [
        {
          title: 'Use descriptive variable names',
          description: 'Choose names that clearly indicate the purpose of the variable',
          example: 'user_count instead of n',
          priority: 'high'
        },
        {
          title: 'Follow PEP 8 style guide',
          description: 'Use snake_case for variables and functions, 4 spaces for indentation',
          example: 'def calculate_total(): instead of def calculateTotal():',
          priority: 'medium'
        },
        {
          title: 'Use list comprehensions when appropriate',
          description: 'More Pythonic and often more readable than traditional loops',
          example: '[x*2 for x in numbers] instead of a for loop',
          priority: 'low'
        },
        {
          title: 'Add docstrings to functions',
          description: 'Document what your functions do, their parameters, and return values',
          example: '"""Calculate the sum of two numbers."""',
          priority: 'medium'
        }
      ],
      javascript: [
        {
          title: 'Use const and let instead of var',
          description: 'Better scoping and prevents accidental reassignment',
          example: 'const name = "John"; let count = 0;',
          priority: 'high'
        },
        {
          title: 'Use arrow functions for callbacks',
          description: 'Cleaner syntax and lexical this binding',
          example: 'array.map(item => item.name)',
          priority: 'medium'
        },
        {
          title: 'Use template literals for string interpolation',
          description: 'More readable than string concatenation',
          example: '`Hello $' + '{name}` instead of "Hello " + name',
          priority: 'medium'
        },
        {
          title: 'Handle errors with try-catch',
          description: 'Always handle potential errors in your code',
          example: 'try { ... } catch (error) { console.error(error); }',
          priority: 'high'
        }
      ],
      java: [
        {
          title: 'Use meaningful class and method names',
          description: 'Names should clearly indicate purpose and functionality',
          example: 'UserManager instead of UM',
          priority: 'high'
        },
        {
          title: 'Follow Java naming conventions',
          description: 'camelCase for methods and variables, PascalCase for classes',
          example: 'getUserName() instead of get_user_name()',
          priority: 'medium'
        },
        {
          title: 'Use proper exception handling',
          description: 'Handle specific exceptions rather than generic Exception',
          example: 'catch (FileNotFoundException e) instead of catch (Exception e)',
          priority: 'high'
        },
        {
          title: 'Make fields private and use getters/setters',
          description: 'Encapsulation is a key principle of OOP',
          example: 'private String name; public String getName() { return name; }',
          priority: 'medium'
        }
      ],
      cpp: [
        {
          title: 'Use RAII (Resource Acquisition Is Initialization)',
          description: 'Manage resources automatically with constructors and destructors',
          example: 'Use smart pointers instead of raw pointers',
          priority: 'high'
        },
        {
          title: 'Prefer const correctness',
          description: 'Use const wherever possible to prevent accidental modifications',
          example: 'const int getValue() const { return value; }',
          priority: 'medium'
        },
        {
          title: 'Use range-based for loops',
          description: 'Cleaner and safer than traditional for loops',
          example: 'for (const auto& item : container)',
          priority: 'low'
        },
        {
          title: 'Initialize variables at declaration',
          description: 'Prevents undefined behavior from uninitialized variables',
          example: 'int count = 0; instead of int count;',
          priority: 'high'
        }
      ],
      c: [
        {
          title: 'Always initialize variables',
          description: 'Uninitialized variables can cause undefined behavior',
          example: 'int count = 0; instead of int count;',
          priority: 'high'
        },
        {
          title: 'Check return values of functions',
          description: 'Many C functions return error codes that should be checked',
          example: 'if (malloc(size) == NULL) { /* handle error */ }',
          priority: 'high'
        },
        {
          title: 'Use meaningful function and variable names',
          description: 'Code should be self-documenting',
          example: 'calculateAverage() instead of calc()',
          priority: 'medium'
        },
        {
          title: 'Free allocated memory',
          description: 'Always pair malloc/calloc with free to prevent memory leaks',
          example: 'free(ptr); ptr = NULL;',
          priority: 'high'
        }
      ]
    };

    return practices[language as keyof typeof practices] || practices.python;
  };

  const practices = getBestPractices();
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="w-4 h-4" />;
      case 'medium': return <Lightbulb className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center mb-4">
        <Lightbulb className="w-5 h-5 text-blue-500 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">
          Best Practices for {language.charAt(0).toUpperCase() + language.slice(1)}
        </h3>
      </div>
      
      <div className="space-y-4">
        {practices.map((practice, index) => (
          <div key={index} className={`border rounded-lg p-4 ${getPriorityColor(practice.priority)}`}>
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3 mt-0.5">
                {getPriorityIcon(practice.priority)}
              </div>
              <div className="flex-1">
                <h4 className="font-medium mb-2">{practice.title}</h4>
                <p className="text-sm mb-2">{practice.description}</p>
                <div className="bg-white bg-opacity-50 rounded p-2 text-xs font-mono">
                  {practice.example}
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                practice.priority === 'high' ? 'bg-red-100 text-red-800' :
                practice.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {practice.priority}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Summary */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">💡 Quick Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Focus on high-priority practices first</li>
          <li>• Consistent code style improves readability</li>
          <li>• Good practices prevent bugs and improve maintainability</li>
          <li>• Consider using linters and formatters for your language</li>
        </ul>
      </div>
    </div>
  );
};