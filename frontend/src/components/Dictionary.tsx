import React, { useState, useEffect } from 'react';
import { Book, Search, Star, Volume2, BookMarked, Sparkles, Zap, Brain, Mic, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { apiClient } from '../services/api';

interface DictionaryEntry {
  word: string;
  definition: string;
  technicalDefinition: string;
  example: string;
  codeExample?: string;
  relatedTerms: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
}

interface VocabularyCard {
  id: string;
  word: string;
  definition: string;
  mastered: boolean;
  reviewCount: number;
  lastReviewed: Date;
}

export const Dictionary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedWords, setSavedWords] = useState<VocabularyCard[]>([]);
  const [activeTab, setActiveTab] = useState<'search' | 'vocabulary' | 'flashcards'>('search');
  const [currentFlashcard, setCurrentFlashcard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  
  const { t, language } = useLanguage();
  
  const { isListening, transcript, error: voiceError, startListening, stopListening } = useVoiceInput({
    language: language === 'hi' ? 'hi-IN' : 'en-US',
    onResult: (result) => {
      setSearchTerm(result);
      handleSearch(result);
    }
  });

  // Load saved words from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('vocabularyCards');
    if (saved) {
      setSavedWords(JSON.parse(saved));
    }
  }, []);

  const handleSearch = async (term?: string) => {
    const searchWord = term || searchTerm;
    if (!searchWord.trim()) return;

    setLoading(true);
    try {
      const data = await apiClient.post('/api/dictionary/lookup', {
        word: searchWord,
        language
      });
      // API returns the entry directly, not wrapped in { entry: ... }
      setSelectedEntry(data);
    } catch (error) {
      console.error('Dictionary lookup failed:', error);
      // Fallback to mock data
      setSelectedEntry(getMockEntry(searchWord));
    } finally {
      setLoading(false);
    }
  };

  const getMockEntry = (word: string): DictionaryEntry => {
    const mockEntries: Record<string, DictionaryEntry> = {
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
      }
    };

    return mockEntries[word.toLowerCase()] || {
      word: word,
      definition: `Definition for "${word}" - A programming term`,
      technicalDefinition: `Technical definition for "${word}"`,
      example: 'Example usage in context',
      relatedTerms: ['related1', 'related2'],
      difficulty: 'beginner',
      category: 'General'
    };
  };

  const saveToVocabulary = () => {
    if (!selectedEntry) return;
    
    const newCard: VocabularyCard = {
      id: Date.now().toString(),
      word: selectedEntry.word,
      definition: selectedEntry.definition,
      mastered: false,
      reviewCount: 0,
      lastReviewed: new Date()
    };

    const updated = [...savedWords, newCard];
    setSavedWords(updated);
    localStorage.setItem('vocabularyCards', JSON.stringify(updated));
  };

  const markAsMastered = (id: string) => {
    const updated = savedWords.map(card => 
      card.id === id ? { ...card, mastered: !card.mastered, reviewCount: card.reviewCount + 1 } : card
    );
    setSavedWords(updated);
    localStorage.setItem('vocabularyCards', JSON.stringify(updated));
  };

  const speakWord = (text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    const synth = window.speechSynthesis;
    
    // Cancel any ongoing speech
    synth.cancel();

    // Wait a bit for cancel to complete
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Load voices and select appropriate one
      const voices = synth.getVoices();
      if (voices.length > 0) {
        // Try to find a voice matching the language
        const matchingVoice = voices.find(voice => 
          voice.lang.startsWith(language === 'hi' ? 'hi' : 'en')
        );
        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }
      }

      utterance.onstart = () => {
        console.log('Speech started:', text);
      };

      utterance.onend = () => {
        console.log('Speech ended');
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        alert(`Voice output error: ${event.error}. Please check your system audio settings.`);
      };

      console.log('Speaking:', text, 'with voice:', utterance.voice?.name || 'default');
      synth.speak(utterance);
    }, 100);
  };

  const nextFlashcard = () => {
    setShowAnswer(false);
    setCurrentFlashcard((prev) => (prev + 1) % savedWords.length);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400';
      case 'intermediate': return 'text-yellow-400';
      case 'advanced': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
            <Book className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">One-Tap Dictionary</h1>
            <p className="text-purple-100">Technical terms explained in simple language</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-2 bg-gray-800/50 backdrop-blur-sm p-2 rounded-xl">
        <button
          onClick={() => setActiveTab('search')}
          className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'search'
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
              : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
          }`}
        >
          <Search className="w-5 h-5" />
          <span>Search</span>
        </button>
        <button
          onClick={() => setActiveTab('vocabulary')}
          className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'vocabulary'
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
              : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
          }`}
        >
          <BookMarked className="w-5 h-5" />
          <span>My Vocabulary ({savedWords.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('flashcards')}
          className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'flashcards'
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
              : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
          }`}
        >
          <Zap className="w-5 h-5" />
          <span>Flashcards</span>
        </button>
      </div>

      {/* Search Tab */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <div className="relative bg-gray-800/50 backdrop-blur-sm rounded-xl border-2 border-transparent bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-1">
              <div className="bg-gray-900 rounded-lg flex items-center">
                <Search className="w-5 h-5 text-gray-400 ml-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search for any programming term..."
                  className="flex-1 bg-transparent px-4 py-4 text-white placeholder-gray-500 focus:outline-none"
                />
                <button
                  onClick={() => isListening ? stopListening() : startListening()}
                  className={`mr-2 p-3 rounded-lg transition-all ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Mic className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleSearch()}
                  disabled={loading}
                  className="mr-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
          </div>

          {/* Voice Input Error Display */}
          {voiceError && (
            <div className="bg-yellow-900/50 border border-yellow-600/50 rounded-lg p-3">
              <div className="flex items-center">
                <AlertTriangle className="w-4 h-4 text-yellow-400 mr-2" />
                <p className="text-sm text-yellow-200">{voiceError}</p>
              </div>
            </div>
          )}

          {/* Search Result */}
          {selectedEntry && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-xl">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <h2 className="text-3xl font-bold text-white">{selectedEntry.word}</h2>
                  <button
                    onClick={() => speakWord(selectedEntry.word)}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all"
                  >
                    <Volume2 className="w-5 h-5 text-blue-400" />
                  </button>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(selectedEntry.difficulty)}`}>
                    {selectedEntry.difficulty}
                  </span>
                </div>
                <button
                  onClick={saveToVocabulary}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
                >
                  <Star className="w-4 h-4" />
                  <span>Save</span>
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-lg font-semibold text-white">Simple Definition</h3>
                  </div>
                  <p className="text-gray-300">{selectedEntry.definition}</p>
                </div>

                <div className="bg-gray-900/50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Brain className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-semibold text-white">Technical Definition</h3>
                  </div>
                  <p className="text-gray-300">{selectedEntry.technicalDefinition}</p>
                </div>

                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Real-World Example</h3>
                  <p className="text-gray-300 italic">{selectedEntry.example}</p>
                </div>

                {selectedEntry.codeExample && (
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">Code Example</h3>
                    <pre className="bg-black/50 rounded-lg p-4 overflow-x-auto">
                      <code className="text-green-400 text-sm">{selectedEntry.codeExample}</code>
                    </pre>
                  </div>
                )}

                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Related Terms</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedEntry.relatedTerms.map((term, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSearchTerm(term);
                          handleSearch(term);
                        }}
                        className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg text-sm transition-all"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Vocabulary Tab */}
      {activeTab === 'vocabulary' && (
        <div className="space-y-4">
          {savedWords.length === 0 ? (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-12 text-center border border-gray-700/50">
              <BookMarked className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No saved words yet</h3>
              <p className="text-gray-500">Search for terms and save them to build your vocabulary</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedWords.map((card) => (
                <div
                  key={card.id}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-white">{card.word}</h3>
                    <button
                      onClick={() => markAsMastered(card.id)}
                      className={`p-2 rounded-lg transition-all ${
                        card.mastered
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      }`}
                    >
                      <Star className="w-5 h-5" fill={card.mastered ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  <p className="text-gray-300 mb-3">{card.definition}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Reviewed {card.reviewCount} times</span>
                    <span>{card.mastered ? '✓ Mastered' : 'Learning'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Flashcards Tab */}
      {activeTab === 'flashcards' && (
        <div className="space-y-6">
          {savedWords.length === 0 ? (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-12 text-center border border-gray-700/50">
              <Zap className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No flashcards available</h3>
              <p className="text-gray-500">Save words to your vocabulary to practice with flashcards</p>
            </div>
          ) : (
            <>
              <div className="text-center text-gray-400 mb-4">
                Card {currentFlashcard + 1} of {savedWords.length}
              </div>
              <div
                onClick={() => setShowAnswer(!showAnswer)}
                className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-sm rounded-2xl p-12 border-2 border-purple-500/50 cursor-pointer hover:border-purple-400 transition-all min-h-[300px] flex items-center justify-center"
              >
                <div className="text-center">
                  {!showAnswer ? (
                    <>
                      <h2 className="text-4xl font-bold text-white mb-4">
                        {savedWords[currentFlashcard].word}
                      </h2>
                      <p className="text-gray-400">Click to reveal definition</p>
                    </>
                  ) : (
                    <>
                      <h2 className="text-2xl font-bold text-white mb-4">
                        {savedWords[currentFlashcard].word}
                      </h2>
                      <p className="text-xl text-gray-300">
                        {savedWords[currentFlashcard].definition}
                      </p>
                    </>
                  )}
                </div>
              </div>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => markAsMastered(savedWords[currentFlashcard].id)}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all"
                >
                  I Know This
                </button>
                <button
                  onClick={nextFlashcard}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg text-white rounded-lg font-medium transition-all"
                >
                  Next Card
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
