import React from 'react';
import { AlertTriangle, X, Check } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CommonMistake } from '../../../shared/types';

interface CommonMistakesProps {
  mistakes: CommonMistake[];
}

export const CommonMistakes: React.FC<CommonMistakesProps> = ({ mistakes }) => {
  if (!mistakes || mistakes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="bg-yellow-50 px-6 py-4 border-b border-yellow-200">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
            <h3 className="text-lg font-semibold text-yellow-900">Common Mistakes</h3>
          </div>
        </div>
        <div className="p-6">
          <p className="text-gray-500 italic">No common mistakes identified for this concept.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="bg-red-50 px-6 py-4 border-b border-red-200">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
          <h3 className="text-lg font-semibold text-red-900">Common Mistakes to Avoid</h3>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-8">
          {mistakes.map((mistake, index) => (
            <div key={index} className="border-l-4 border-red-300 pl-6">
              <h4 className="text-md font-semibold text-gray-900 mb-3">
                {mistake.description || `Common Mistake ${index + 1}`}
              </h4>
              
              {mistake.explanation && (
                <p className="text-gray-700 mb-4 leading-relaxed">
                  {mistake.explanation}
                </p>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Incorrect Example */}
                {mistake.incorrectExample && (
                  <div className="space-y-2">
                    <div className="flex items-center text-red-600 mb-2">
                      <X className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">Incorrect Approach</span>
                    </div>
                    <div className="code-block">
                      <SyntaxHighlighter
                        language="python"
                        style={vscDarkPlus}
                        customStyle={{
                          margin: 0,
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      >
                        {mistake.incorrectExample}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                )}

                {/* Correct Example */}
                {mistake.correctExample && (
                  <div className="space-y-2">
                    <div className="flex items-center text-green-600 mb-2">
                      <Check className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">Correct Approach</span>
                    </div>
                    <div className="code-block">
                      <SyntaxHighlighter
                        language="python"
                        style={vscDarkPlus}
                        customStyle={{
                          margin: 0,
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      >
                        {mistake.correctExample}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Tips Section */}
        <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h4 className="text-md font-semibold text-yellow-900 mb-2">💡 Pro Tips</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Always test your code with edge cases</li>
            <li>• Draw out the problem before coding</li>
            <li>• Double-check your loop conditions and base cases</li>
            <li>• Use debugger or print statements to trace execution</li>
          </ul>
        </div>
      </div>
    </div>
  );
};