import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface CodeComplexityMeterProps {
  code: string;
  language: string;
}

export const CodeComplexityMeter: React.FC<CodeComplexityMeterProps> = ({ code, language }) => {
  const calculateComplexity = () => {
    const lines = code.split('\n').filter(line => line.trim().length > 0);
    let complexity = 1; // Base complexity
    
    // Count decision points
    const decisionPatterns = [
      /if\s*\(/g,
      /else\s*if/g,
      /while\s*\(/g,
      /for\s*\(/g,
      /switch\s*\(/g,
      /case\s+/g,
      /catch\s*\(/g,
      /\?\s*.*\s*:/g, // ternary operator
    ];
    
    decisionPatterns.forEach(pattern => {
      const matches = code.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    });
    
    // Nested structures increase complexity
    const nestingLevel = Math.max(...lines.map(line => {
      const leading = line.match(/^[\s\t]*/);
      return leading ? leading[0].length : 0;
    }));
    
    complexity += Math.floor(nestingLevel / 4); // Every 4 spaces/1 tab adds complexity
    
    return Math.min(complexity, 20); // Cap at 20 for display
  };
  
  const complexity = calculateComplexity();
  
  const getComplexityLevel = () => {
    if (complexity <= 5) return { level: 'Low', color: 'green', icon: TrendingDown };
    if (complexity <= 10) return { level: 'Medium', color: 'yellow', icon: Minus };
    return { level: 'High', color: 'red', icon: TrendingUp };
  };
  
  const { level, color, icon: Icon } = getComplexityLevel();
  
  const colorClasses = {
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: 'text-green-600',
      bar: 'bg-green-500'
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: 'text-yellow-600',
      bar: 'bg-yellow-500'
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: 'text-red-600',
      bar: 'bg-red-500'
    }
  };
  
  const classes = colorClasses[color as keyof typeof colorClasses];
  
  return (
    <div className={`${classes.bg} ${classes.border} border rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <Icon className={`w-5 h-5 ${classes.icon} mr-2`} />
          <h4 className={`font-semibold ${classes.text}`}>Code Complexity</h4>
        </div>
        <div className="flex items-center">
          <span className={`text-2xl font-bold ${classes.text}`}>{complexity}</span>
          <span className={`text-sm ${classes.text} ml-1`}>/ 20</span>
        </div>
      </div>
      
      {/* Complexity Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div 
          className={`${classes.bar} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${(complexity / 20) * 100}%` }}
        />
      </div>
      
      <div className="flex items-center justify-between text-sm">
        <span className={classes.text}>Complexity Level: {level}</span>
        <span className="text-gray-600">
          {complexity <= 5 ? 'Easy to maintain' : 
           complexity <= 10 ? 'Moderate complexity' : 
           'Consider refactoring'}
        </span>
      </div>
      
      {/* Recommendations */}
      {complexity > 10 && (
        <div className="mt-3 p-3 bg-white rounded border">
          <h5 className="text-sm font-medium text-gray-900 mb-2">💡 Complexity Reduction Tips:</h5>
          <ul className="text-xs text-gray-700 space-y-1">
            <li>• Break large functions into smaller ones</li>
            <li>• Reduce nesting levels using early returns</li>
            <li>• Consider using switch statements for multiple conditions</li>
            <li>• Extract complex logic into separate functions</li>
          </ul>
        </div>
      )}
    </div>
  );
};