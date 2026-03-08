import React from 'react';
import { X, BookOpen, Code, TrendingUp, Clock, Star, GraduationCap } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: 'concepts' | 'code-analysis' | 'study-mode') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, activeTab, onTabChange }) => {
  const popularTopics = [
    'Binary Search',
    'Recursion', 
    'Dynamic Programming',
    'Linked Lists',
    'Binary Trees',
    'Sorting Algorithms',
    'Hash Tables',
    'Graph Traversal'
  ];

  const recentTopics = [
    'Quick Sort',
    'Depth First Search',
    'Memoization'
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar - Enhanced Dark Theme */}
      <aside className={`
        fixed top-0 left-0 z-50 w-64 h-full sidebar-dark shadow-2xl transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-blue-500/20 lg:hidden">
            <h2 className="text-lg font-bold text-white">Menu</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-6">
            {/* Main Navigation */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-3">
                Tools
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    onTabChange('concepts');
                    onClose();
                  }}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all group ${
                    activeTab === 'concepts'
                      ? 'bg-gradient-to-r from-blue-600/20 to-violet-600/20 text-blue-400 border border-blue-500/30 neon-glow-blue'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <BookOpen className={`w-5 h-5 mr-3 ${activeTab === 'concepts' ? 'neon-icon' : 'group-hover:scale-110 transition-transform'}`} />
                  Concept Explainer
                </button>
                <button
                  onClick={() => {
                    onTabChange('code-analysis');
                    onClose();
                  }}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all group ${
                    activeTab === 'code-analysis'
                      ? 'bg-gradient-to-r from-violet-600/20 to-purple-600/20 text-violet-400 border border-violet-500/30 neon-glow-violet'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <Code className={`w-5 h-5 mr-3 ${activeTab === 'code-analysis' ? 'neon-icon' : 'group-hover:scale-110 transition-transform'}`} />
                  Code Analyzer
                </button>
                <button
                  onClick={() => {
                    onTabChange('study-mode');
                    onClose();
                  }}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all group ${
                    activeTab === 'study-mode'
                      ? 'bg-gradient-to-r from-orange-600/20 to-red-600/20 text-orange-400 border border-orange-500/30 neon-glow'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <GraduationCap className={`w-5 h-5 mr-3 ${activeTab === 'study-mode' ? 'neon-icon' : 'group-hover:scale-110 transition-transform'}`} />
                  Study Mode
                </button>
              </div>
            </div>

            {/* Popular Topics */}
            <div>
              <h3 className="flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                <TrendingUp className="w-3 h-3 mr-1" />
                Popular Topics
              </h3>
              <div className="space-y-1">
                {popularTopics.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => {
                      onTabChange('concepts');
                      // TODO: Auto-fill topic in concept explainer
                      onClose();
                    }}
                    className="w-full text-left px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Topics */}
            <div>
              <h3 className="flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                <Clock className="w-3 h-3 mr-1" />
                Recent
              </h3>
              <div className="space-y-1">
                {recentTopics.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => {
                      onTabChange('concepts');
                      onClose();
                    }}
                    className="w-full text-left px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center text-xs text-gray-500">
              <Star className="w-3 h-3 mr-1 text-yellow-500" />
              <span>AI-powered explanations</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};