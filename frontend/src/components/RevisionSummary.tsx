import React from 'react';
import { BookMarked, Brain, AlertCircle } from 'lucide-react';

interface RevisionSummaryProps {
  summary: {
    keyTakeaways: string[];
    mentalModel: string;
    examTraps: string[];
  };
}

export const RevisionSummary: React.FC<RevisionSummaryProps> = ({ summary }) => {
  // Ensure summary has all required properties with defaults
  const safeSummary = {
    keyTakeaways: summary?.keyTakeaways || [],
    mentalModel: summary?.mentalModel || 'No mental model available',
    examTraps: summary?.examTraps || []
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-200">
        <div className="flex items-center">
          <BookMarked className="w-5 h-5 text-indigo-500 mr-2" />
          <h3 className="text-lg font-semibold text-indigo-900">Revision Summary</h3>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Key Takeaways */}
          <div className="space-y-3">
            <div className="flex items-center text-green-600 mb-3">
              <Brain className="w-4 h-4 mr-2" />
              <h4 className="font-semibold">Key Takeaways</h4>
            </div>
            <ul className="space-y-2">
              {safeSummary.keyTakeaways.map((takeaway, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-sm text-gray-700">{takeaway}</span>
                </li>
              ))}
              {safeSummary.keyTakeaways.length === 0 && (
                <li className="text-sm text-gray-500 italic">No key takeaways available</li>
              )}
            </ul>
          </div>

          {/* Mental Model */}
          <div className="space-y-3">
            <div className="flex items-center text-blue-600 mb-3">
              <Brain className="w-4 h-4 mr-2" />
              <h4 className="font-semibold">Mental Model</h4>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 leading-relaxed">
                {safeSummary.mentalModel}
              </p>
            </div>
          </div>

          {/* Exam Traps */}
          <div className="space-y-3">
            <div className="flex items-center text-red-600 mb-3">
              <AlertCircle className="w-4 h-4 mr-2" />
              <h4 className="font-semibold">Interview/Exam Traps</h4>
            </div>
            <ul className="space-y-2">
              {safeSummary.examTraps.map((trap, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 w-5 h-5 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                    !
                  </span>
                  <span className="text-sm text-gray-700">{trap}</span>
                </li>
              ))}
              {safeSummary.examTraps.length === 0 && (
                <li className="text-sm text-gray-500 italic">No exam traps identified</li>
              )}
            </ul>
          </div>
        </div>

        {/* Quick Recall Section */}
        <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
          <h4 className="font-semibold text-purple-900 mb-2">🧠 Quick Recall Test</h4>
          <p className="text-sm text-purple-800 mb-3">
            Can you explain this concept in 30 seconds without looking at the notes above?
          </p>
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors">
              ✅ I can explain it
            </button>
            <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors">
              🤔 Need more practice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};