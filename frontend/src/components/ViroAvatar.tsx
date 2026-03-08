import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, Award, X } from 'lucide-react';
import { ViroCharacter } from './ViroCharacter';

type ViroEmotion = 'neutral' | 'encouraging' | 'thoughtful' | 'excited' | 'patient' | 'celebratory';

interface ViroAvatarProps {
  isVisible: boolean;
  onClose: () => void;
  emotion?: ViroEmotion;
  xpGained?: number;
}

export const ViroAvatar: React.FC<ViroAvatarProps> = ({ 
  isVisible, 
  onClose, 
  emotion = 'neutral',
  xpGained = 0
}) => {
  const [showXP, setShowXP] = useState(false);

  useEffect(() => {
    if (xpGained > 0) {
      setShowXP(true);
      const timer = setTimeout(() => setShowXP(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [xpGained]);

  if (!isVisible) return null;

  const getEmotionStyle = () => {
    const styles = {
      neutral: 'from-purple-600/20 to-blue-600/20',
      encouraging: 'from-green-600/20 to-emerald-600/20',
      thoughtful: 'from-indigo-600/20 to-purple-600/20',
      excited: 'from-yellow-600/20 to-orange-600/20',
      patient: 'from-blue-600/20 to-cyan-600/20',
      celebratory: 'from-pink-600/20 to-purple-600/20'
    };
    return styles[emotion];
  };

  const getEmotionBorder = () => {
    const borders = {
      neutral: 'border-purple-500/40',
      encouraging: 'border-green-500/40',
      thoughtful: 'border-indigo-500/40',
      excited: 'border-yellow-500/40',
      patient: 'border-blue-500/40',
      celebratory: 'border-pink-500/40'
    };
    return borders[emotion];
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fadeIn">
      {/* XP Notification */}
      {showXP && xpGained > 0 && (
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="glass-card-violet px-4 py-2 rounded-full flex items-center space-x-2">
            <Award className="w-5 h-5 text-yellow-400" />
            <span className="text-white font-bold">+{xpGained} XP</span>
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </div>
        </div>
      )}

      {/* Avatar Container */}
      <div className={`glass-card-violet rounded-2xl p-4 w-80 border-2 ${getEmotionBorder()} shadow-2xl`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center neon-glow-blue">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">Viro</h3>
              <p className="text-gray-400 text-xs">Your AI Coding Tutor</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Avatar Image */}
        <div className={`relative w-full h-64 rounded-xl bg-gradient-to-br ${getEmotionStyle()} border border-purple-500/30 overflow-hidden mb-3`}>
          {/* Holographic Background Effect */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 left-4 w-16 h-16 border border-purple-400 rounded-lg animate-pulse"></div>
            <div className="absolute bottom-8 right-6 w-12 h-12 border border-blue-400 rounded-full animate-pulse delay-100"></div>
            <div className="absolute top-1/2 right-8 w-8 h-8 border border-cyan-400 rounded animate-pulse delay-200"></div>
            {/* Floating Code Snippets */}
            <div className="absolute top-12 right-12 text-purple-400 text-xs opacity-30 font-mono">
              {'{ code }'}
            </div>
            <div className="absolute bottom-16 left-8 text-blue-400 text-xs opacity-30 font-mono">
              01010101
            </div>
          </div>

          {/* Avatar Character */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Check if custom image exists, otherwise show placeholder */}
            <ViroCharacter emotion={emotion} />
          </div>

          {/* Rim Lighting Effect */}
          <div className="absolute inset-0 border-2 border-transparent rounded-xl"
               style={{
                 background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.3), rgba(0, 212, 255, 0.3))',
                 WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                 WebkitMaskComposite: 'xor',
                 maskComposite: 'exclude',
                 padding: '2px'
               }}>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-gray-400 text-xs">Online & Ready</span>
        </div>
      </div>

      {/* Floating Action Hint */}
      <div className="absolute -top-12 left-0 right-0 text-center">
        <p className="text-gray-400 text-xs">Ask me anything! 💬</p>
      </div>
    </div>
  );
};
