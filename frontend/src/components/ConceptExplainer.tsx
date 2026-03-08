import React, { useState } from 'react';
import { Search, Loader2, BookOpen, Lightbulb, Code2, AlertTriangle, RotateCcw, Mic } from 'lucide-react';
import { ConceptResponse } from '../../../shared/types';
import { ExplanationCard } from './ExplanationCard';
import { CodeExample } from './CodeExample';
import { VisualDiagram } from './VisualDiagram';
import { CommonMistakes } from './CommonMistakes';
import { RevisionSummary } from './RevisionSummary';
import { VoiceAssist } from './VoiceAssist';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { useLanguage } from '../contexts/LanguageContext';
import { apiClient } from '../services/api';

export const ConceptExplainer: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ConceptResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const { t, language } = useLanguage();
  
  const { isListening, transcript, error: voiceError, startListening, stopListening } = useVoiceInput({
    language: language === 'hi' ? 'hi-IN' : 'en-US',
    onResult: (result) => {
      setTopic(result);
    }
  });

  const handleExplain = async () => {
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const data = await apiClient.post('/api/concepts/explain', {
        topic: topic.trim(),
        sessionId,
      });
      setResponse(data);
      setSessionId(data.sessionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate explanation');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleExplain();
    }
  };

  const handleFeedback = async (helpful: boolean, confusionLevel?: number) => {
    if (!sessionId || !response) return;

    try {
      await apiClient.post('/api/concepts/feedback', {
        sessionId,
        topic: response.explanation.topic,
        helpful,
        confusionLevel,
      });
    } catch (err) {
      console.error('Failed to send feedback:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Demo Mode Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">🎭</span>
            </div>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Demo Mode Active</h3>
            <p className="text-sm text-blue-700">
              Using sample AI responses for demonstration. Try "Binary Search" or "Recursion" for detailed examples!
            </p>
          </div>
        </div>
      </div>

      {/* Search Section - Enhanced with Pulsing Glow */}
      <div className="glass-card p-6">
        <div className="flex items-center mb-6">
          <div className="p-2 bg-gradient-to-r from-blue-600/20 to-violet-600/20 rounded-lg mr-3">
            <BookOpen className="w-6 h-6 text-blue-400 neon-icon" />
          </div>
          <h2 className="text-xl font-bold text-high-contrast">{t('concepts.title')}</h2>
        </div>
        
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <div className={`relative ${topic.trim() ? 'pulse-search' : ''}`}>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-violet-600/20 rounded-xl blur-sm" />
              <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-xl border border-blue-500/30 flex items-center">
                <Search className="w-5 h-5 text-blue-400 ml-4" />
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t('concepts.placeholder')}
                  className="flex-1 bg-transparent px-4 py-4 text-white placeholder-gray-500 focus:outline-none"
                  disabled={loading}
                />
                {isListening && transcript && (
                  <div className="absolute right-20 top-1/2 transform -translate-y-1/2 bg-purple-600/20 text-purple-300 px-3 py-1 rounded-lg text-sm border border-purple-500/30">
                    {transcript}
                  </div>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={loading}
            className={`px-5 py-4 rounded-xl flex items-center space-x-2 transition-all font-medium ${
              isListening 
                ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse neon-glow-violet' 
                : 'bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:shadow-lg neon-icon'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Mic className="w-5 h-5" />
            <span>{isListening ? t('voice.listening') : t('voice.speak')}</span>
          </button>
          <button
            onClick={handleExplain}
            disabled={loading || !topic.trim()}
            className="btn-saas px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Lightbulb className="w-4 h-4" />
            )}
            <span>{loading ? t('concepts.explaining') : t('concepts.explain')}</span>
          </button>
        </div>

        {/* Quick Topics */}
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">Quick start:</p>
          <div className="flex flex-wrap gap-2">
            {['Binary Search', 'Recursion', 'Dynamic Programming', 'Linked Lists', 'Hash Tables'].map((quickTopic) => (
              <button
                key={quickTopic}
                onClick={() => setTopic(quickTopic)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                disabled={loading}
              >
                {quickTopic}
              </button>
            ))}
          </div>
        </div>

        {/* Voice Input Error Display */}
        {voiceError && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
              <p className="text-sm text-yellow-800">{voiceError}</p>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {response && (
        <div className="space-y-6">
          {/* Voice Assist */}
          <VoiceAssist 
            text={`Concept: ${response.explanation.topic}. Intuition: ${response.explanation.intuition}. Technical explanation: ${response.explanation.technical}`}
          />

          {/* Explanation Cards */}
          <div className="grid gap-6 lg:grid-cols-2">
            <ExplanationCard
              title="Intuitive Understanding"
              content={response.explanation.intuition}
              icon={<Lightbulb className="w-5 h-5" />}
              color="blue"
            />
            <ExplanationCard
              title="Analogy"
              content={response.explanation.analogy}
              icon={<BookOpen className="w-5 h-5" />}
              color="green"
            />
            <ExplanationCard
              title="Technical Explanation"
              content={response.explanation.technical}
              icon={<Code2 className="w-5 h-5" />}
              color="purple"
            />
            <ExplanationCard
              title="Step-by-Step Logic"
              content={response.explanation.stepByStep.join('\n')}
              icon={<RotateCcw className="w-5 h-5" />}
              color="orange"
            />
          </div>

          {/* Visual Diagram */}
          {response.visualDiagram && (
            <VisualDiagram diagram={response.visualDiagram} />
          )}

          {/* Code Example */}
          <CodeExample codeExample={response.codeExample} />

          {/* Common Mistakes */}
          <CommonMistakes mistakes={response.commonMistakes} />

          {/* Revision Summary */}
          <RevisionSummary summary={response.revisionSummary} />

          {/* Feedback Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Was this explanation helpful?</h3>
            <div className="flex space-x-4">
              <button
                onClick={() => handleFeedback(true, 1)}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              >
                👍 Very Clear
              </button>
              <button
                onClick={() => handleFeedback(true, 2)}
                className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
              >
                😐 Somewhat Clear
              </button>
              <button
                onClick={() => handleFeedback(false, 3)}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                😕 Still Confused
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};