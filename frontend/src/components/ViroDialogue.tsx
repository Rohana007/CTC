import React, { useState, useEffect } from 'react';
import { MessageCircle, Lightbulb, Target, Sparkles, Volume2, VolumeX } from 'lucide-react';

type ViroEmotion = 'neutral' | 'encouraging' | 'thoughtful' | 'excited' | 'patient' | 'celebratory';

interface ViroResponse {
  acknowledge: string;
  question: string;
  analogy?: string;
  hint?: string;
  action: string;
  emotion: ViroEmotion;
}

interface ViroDialogueProps {
  response: ViroResponse | null;
  isLoading?: boolean;
  onSpeak?: () => void;
  isSpeaking?: boolean;
}

export const ViroDialogue: React.FC<ViroDialogueProps> = ({ 
  response, 
  isLoading = false,
  onSpeak,
  isSpeaking = false
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (response) {
      setIsVisible(true);
    }
  }, [response]);

  if (!response && !isLoading) return null;

  const getEmotionColor = () => {
    const colors = {
      neutral: 'from-purple-600/20 to-blue-600/20',
      encouraging: 'from-green-600/20 to-emerald-600/20',
      thoughtful: 'from-indigo-600/20 to-purple-600/20',
      excited: 'from-yellow-600/20 to-orange-600/20',
      patient: 'from-blue-600/20 to-cyan-600/20',
      celebratory: 'from-pink-600/20 to-purple-600/20'
    };
    return response ? colors[response.emotion] : colors.neutral;
  };

  const getEmotionIcon = () => {
    if (!response) return '💬';
    const icons = {
      neutral: '💬',
      encouraging: '😊',
      thoughtful: '🤔',
      excited: '🎉',
      patient: '😌',
      celebratory: '🌟'
    };
    return icons[response.emotion];
  };

  return (
    <div className={`glass-card-violet rounded-2xl p-6 border border-purple-500/30 shadow-2xl ${isVisible ? 'animate-fadeIn' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5 text-purple-400" />
          <h3 className="text-white font-semibold">Viro's Guidance</h3>
          <span className="text-2xl">{getEmotionIcon()}</span>
        </div>
        {onSpeak && (
          <button
            onClick={onSpeak}
            className="p-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 transition-colors"
            title="Read aloud"
          >
            {isSpeaking ? (
              <Volume2 className="w-4 h-4 text-purple-400 animate-pulse" />
            ) : (
              <VolumeX className="w-4 h-4 text-gray-400" />
            )}
          </button>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-200"></div>
            <span className="text-gray-400 text-sm ml-2">Viro is thinking...</span>
          </div>
        </div>
      )}

      {/* Response Content */}
      {response && !isLoading && (
        <div className="space-y-4">
          {/* Acknowledgment */}
          <div className={`p-4 rounded-xl bg-gradient-to-br ${getEmotionColor()} border border-purple-500/20`}>
            <p className="text-white leading-relaxed">{response.acknowledge}</p>
          </div>

          {/* Socratic Question */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20">
            <div className="flex items-start space-x-3">
              <Target className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-xs text-blue-400 font-semibold mb-1 uppercase tracking-wide">Think About This</p>
                <p className="text-white leading-relaxed">{response.question}</p>
              </div>
            </div>
          </div>

          {/* Analogy (if provided) */}
          {response.analogy && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-600/10 to-pink-600/10 border border-purple-500/20">
              <div className="flex items-start space-x-3">
                <Lightbulb className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-xs text-yellow-400 font-semibold mb-1 uppercase tracking-wide">Real-World Analogy</p>
                  <p className="text-white leading-relaxed">{response.analogy}</p>
                </div>
              </div>
            </div>
          )}

          {/* Hint (if provided) */}
          {response.hint && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-600/10 to-blue-600/10 border border-cyan-500/20">
              <div className="flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-xs text-cyan-400 font-semibold mb-1 uppercase tracking-wide">Hint</p>
                  <p className="text-white leading-relaxed">{response.hint}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Indicator */}
          <div className="flex items-center justify-center space-x-2 pt-2">
            <div className="text-xs text-gray-500 italic">{response.action}</div>
          </div>
        </div>
      )}

      {/* Footer Tip */}
      <div className="mt-4 pt-4 border-t border-purple-500/20">
        <p className="text-xs text-gray-400 text-center">
          💡 Try to answer the question above before asking for more help
        </p>
      </div>
    </div>
  );
};
