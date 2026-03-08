import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Code2, Copy, Check, Clock, HardDrive } from 'lucide-react';
import { CodeExample as CodeExampleType } from '../../../shared/types';

interface CodeExampleProps {
  codeExample: CodeExampleType;
}

export const CodeExample: React.FC<CodeExampleProps> = ({ codeExample }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeExample.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Code2 className="w-5 h-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Code Implementation</h3>
            <span className="ml-2 px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-full">
              {codeExample.language}
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-1" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Code Block */}
        <div className="code-block mb-6">
          <SyntaxHighlighter
            language={codeExample.language}
            style={vscDarkPlus}
            showLineNumbers={true}
            wrapLines={true}
            lineProps={(lineNumber) => {
              const annotation = codeExample.annotations.find(a => a.line === lineNumber);
              return annotation ? {
                style: { backgroundColor: 'rgba(59, 130, 246, 0.1)' }
              } : {};
            }}
          >
            {codeExample.code}
          </SyntaxHighlighter>
        </div>

        {/* Code Explanation */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-900 mb-3">Explanation</h4>
          <p className="text-gray-700 leading-relaxed">
            {codeExample.explanation}
          </p>
        </div>

        {/* Line Annotations */}
        {codeExample.annotations.length > 0 && (
          <div className="mb-6">
            <h4 className="text-md font-semibold text-gray-900 mb-3">Line-by-Line Breakdown</h4>
            <div className="space-y-2">
              {codeExample.annotations.map((annotation, index) => (
                <div key={index} className="flex items-start p-3 bg-blue-50 rounded-lg">
                  <span className="flex-shrink-0 w-8 h-6 bg-blue-500 text-white text-xs font-mono rounded flex items-center justify-center mr-3">
                    {annotation.line}
                  </span>
                  <p className="text-sm text-gray-700">{annotation.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Complexity Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center p-3 bg-green-50 rounded-lg">
            <Clock className="w-5 h-5 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-green-900">Time Complexity</p>
              <p className="text-sm text-green-700">{codeExample.timeComplexity || 'Not specified'}</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-purple-50 rounded-lg">
            <HardDrive className="w-5 h-5 text-purple-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-purple-900">Space Complexity</p>
              <p className="text-sm text-purple-700">{codeExample.spaceComplexity || 'Not specified'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};