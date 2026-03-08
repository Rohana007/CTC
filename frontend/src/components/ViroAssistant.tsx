import React, { useState } from 'react';
import { ViroAvatar } from './ViroAvatar';
import { ViroDialogue } from './ViroDialogue';
import { Brain, MessageSquare, X, Minimize2, Maximize2 } from 'lucide-react';
import { apiClient } from '../services/api';

type ViroEmotion = 'neutral' | 'encouraging' | 'thoughtful' | 'excited' | 'patient' | 'celebratory';

interface ViroResponse {
  acknowledge: string;
  question: string;
  analogy?: string;
  hint?: string;
  action: string;
  emotion: ViroEmotion;
  xpReward?: number;
  totalXP?: number;
  sessionId?: string;
}

export const ViroAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showAvatar, setShowAvatar] = useState(true);
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<ViroResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [totalXP, setTotalXP] = useState(0);

  const handleAskViro = async () => {
    if (!question.trim()) return;

    setIsLoading(true);
    setResponse(null);

    try {
      const data = await apiClient.post('/api/viro/ask', {
        question: question.trim(),
        sessionId
      });
      setResponse(data);
      setSessionId(data.sessionId);
      setTotalXP(data.totalXP || 0);
      setQuestion(''); // Clear input after successful response
    } catch (err) {
      console.error('Error asking Viro:', err);
      // Show fallback response
      setResponse({
        acknowledge: "I'm here to help!",
        question: "Let's think about this together. Can you tell me more about what you're trying to understand?",
        action: "[ACTION: Nods encouragingly]",
        emotion: "encouraging"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskViro();
    }
  };

  if (!isOpen) {
    // Floating button to open Viro
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center neon-glow-blue shadow-2xl hover:scale-110 transition-transform"
        title="Ask Viro"
      >
        <Brain className="w-8 h-8 text-white" />
        {totalXP > 0 && (
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-gray-900">
            {totalXP}
          </div>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-4 max-w-2xl">
      {/* Avatar */}
      {showAvatar && !isMinimized && (
        <ViroAvatar
          isVisible={true}
          onClose={() => setShowAvatar(false)}
          emotion={response?.emotion || 'neutral'}
          xpGained={response?.xpReward || 0}
        />
      )}

      {/* Main Chat Interface */}
      <div className={`glass-card-violet rounded-2xl border border-purple-500/30 shadow-2xl transition-all ${isMinimized ? 'w-80' : 'w-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-purple-500/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center neon-glow-blue">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold">Viro Assistant</h3>
              <p className="text-xs text-gray-400">Your Socratic Coding Tutor</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {totalXP > 0 && (
              <div className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full flex items-center space-x-1">
                <span className="text-yellow-400 text-xs font-bold">{totalXP} XP</span>
              </div>
            )}
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-gray-400 hover:text-white transition-colors"
              title={isMinimized ? "Expand" : "Minimize"}
            >
              {isMinimized ? <Maximize2 className="w-5 h-5" /> : <Minimize2 className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Response Area */}
            <div className="p-4 max-h-96 overflow-y-auto">
              {response ? (
                <ViroDialogue response={response} isLoading={false} />
              ) : (
                <div className="text-center py-8">
                  <Brain className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
                  <p className="text-gray-400 text-sm">Ask me anything about coding!</p>
                  <p className="text-gray-500 text-xs mt-2">I'll guide you to the answer using the Socratic method</p>
                </div>
              )}
              {isLoading && (
                <ViroDialogue response={null} isLoading={true} />
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-purple-500/20">
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask Viro a question... (Press Enter to send)"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-purple-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60 resize-none"
                    rows={2}
                    disabled={isLoading}
                  />
                </div>
                <button
                  onClick={handleAskViro}
                  disabled={isLoading || !question.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Ask</span>
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <span>💡 Tip: I'll guide you to discover the answer yourself!</span>
                {!showAvatar && (
                  <button
                    onClick={() => setShowAvatar(true)}
                    className="text-purple-400 hover:text-purple-300"
                  >
                    Show Avatar
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
