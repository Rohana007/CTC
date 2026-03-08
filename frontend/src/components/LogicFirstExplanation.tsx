import React, { useState } from 'react';
import { Brain, Code, Zap, Target, RotateCcw, ArrowRight } from 'lucide-react';
import { LogicExplanation } from '../../../shared/types';
import { VoiceAssist } from './VoiceAssist';

interface LogicFirstExplanationProps {
  explanations: LogicExplanation[];
  coreLogic: string;
  algorithmType: string;
}

export const LogicFirstExplanation: React.FC<LogicFirstExplanationProps> = ({
  explanations,
  coreLogic,
  algorithmType
}) => {
  const [voiceText, setVoiceText] = useState<string>('');

  const getCategoryIcon = (category: LogicExplanation['logicCategory']) => {
    switch (category) {
      case 'initialization': return <Target className="w-4 h-4" />;
      case 'condition': return <Brain className="w-4 h-4" />;
      case 'iteration': return <RotateCcw className="w-4 h-4" />;
      case 'computation': return <Zap className="w-4 h-4" />;
      case 'output': return <ArrowRight className="w-4 h-4" />;
      case 'control_flow': return <Code className="w-4 h-4" />;
      default: return <Code className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: LogicExplanation['logicCategory']) => {
    const colors = {
      initialization: 'bg-blue-50 text-blue-700 border-blue-200',
      condition: 'bg-purple-50 text-purple-700 border-purple-200',
      iteration: 'bg-orange-50 text-orange-700 border-orange-200',
      computation: 'bg-green-50 text-green-700 border-green-200',
      output: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      control_flow: 'bg-red-50 text-red-700 border-red-200'
    };
    return colors[category] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Brain className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Logic-First Analysis</h3>
          </div>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
            {algorithmType}
          </span>
        </div>
      </div>

      <div className="p-6">
        {/* Voice Assist */}
        <div className="mb-6">
          <VoiceAssist 
            text={`Logic First Analysis for ${algorithmType}. Core Logic: ${coreLogic}. ${explanations.map(e => `Line ${e.line}: ${e.intent}`).join('. ')}`}
          />
        </div>

        {/* Core Logic Summary */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">🎯 Core Algorithm Logic</h4>
          <p className="text-blue-800 leading-relaxed">{coreLogic}</p>
        </div>

        {/* Logic Explanations */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 mb-3">Line-by-Line Intent Analysis</h4>
          {explanations.map((explanation, index) => (
            <div key={index} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
              {/* Line Number */}
              <div className="flex-shrink-0 w-8 h-8 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center text-sm font-mono font-medium">
                {explanation.line}
              </div>

              {/* Category Badge */}
              <div className={`flex-shrink-0 flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(explanation.logicCategory)}`}>
                {getCategoryIcon(explanation.logicCategory)}
                <span className="ml-1 capitalize">{explanation.logicCategory.replace('_', ' ')}</span>
              </div>

              {/* Intent Explanation */}
              <div className="flex-1">
                <p className="text-gray-800 leading-relaxed">{explanation.intent}</p>
                {explanation.complexity !== 'O(1)' && (
                  <div className="mt-2 flex items-center">
                    <span className="text-xs text-gray-500 mr-2">Complexity:</span>
                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-mono rounded">
                      {explanation.complexity}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Logic Flow Summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-3">🔄 Logic Flow Pattern</h4>
          <div className="flex flex-wrap gap-2">
            {explanations.map((exp, index) => (
              <React.Fragment key={index}>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(exp.logicCategory)}`}>
                  {exp.logicCategory.replace('_', ' ')}
                </span>
                {index < explanations.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-gray-400 self-center" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};