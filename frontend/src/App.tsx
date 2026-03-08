import React, { useState } from 'react';
import { ConceptExplainer } from './components/ConceptExplainer';
import { CodeAnalyzer } from './components/CodeAnalyzer';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { StudyMode } from './components/StudyMode';
import { Dictionary } from './components/Dictionary';
import { GlobalVoiceControl } from './components/GlobalVoiceControl';
import { ViroAssistant } from './components/ViroAssistant';
import { LanguageProvider } from './contexts/LanguageContext';
import { BookOpen, Code, GraduationCap, Book } from 'lucide-react';

type ActiveTab = 'concepts' | 'code-analysis' | 'study-mode' | 'dictionary';

function AppContent() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('concepts');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [studyModeActive, setStudyModeActive] = useState(false);

  const handleVoiceNavigate = (tab: string) => {
    setActiveTab(tab as ActiveTab);
  };

  const handleVoiceAction = (action: string) => {
    // Handle voice actions like analyze, explain, etc.
    console.log('Voice action:', action);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex">
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        <main className="flex-1 p-6 lg:ml-64">
          <div className="max-w-7xl mx-auto">
            {/* Tab Navigation */}
            <div className="mb-6">
              <nav className="flex space-x-1 bg-gray-800/50 backdrop-blur-sm rounded-xl p-1 shadow-lg border border-gray-700/50">
                <button
                  onClick={() => setActiveTab('concepts')}
                  className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'concepts'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Concept Explainer
                </button>
                <button
                  onClick={() => setActiveTab('code-analysis')}
                  className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'code-analysis'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <Code className="w-4 h-4 mr-2" />
                  Code Analyzer
                </button>
                <button
                  onClick={() => setActiveTab('study-mode')}
                  className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'study-mode'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Study Mode
                </button>
                <button
                  onClick={() => setActiveTab('dictionary')}
                  className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'dictionary'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <Book className="w-4 h-4 mr-2" />
                  Dictionary
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'concepts' && <ConceptExplainer />}
            {activeTab === 'code-analysis' && <CodeAnalyzer />}
            {activeTab === 'study-mode' && (
              <StudyMode 
                isActive={studyModeActive} 
                onToggle={() => setStudyModeActive(!studyModeActive)} 
              />
            )}
            {activeTab === 'dictionary' && <Dictionary />}
          </div>
        </main>
      </div>

      {/* Global Voice Control */}
      <GlobalVoiceControl 
        onNavigate={handleVoiceNavigate}
        onAction={handleVoiceAction}
      />

      {/* Viro AI Assistant */}
      <ViroAssistant />
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;