import React, { useState, useEffect } from 'react';
import { Brain, Sparkles } from 'lucide-react';

type ViroEmotion = 'neutral' | 'encouraging' | 'thoughtful' | 'excited' | 'patient' | 'celebratory';

interface ViroCharacterProps {
  emotion: ViroEmotion;
}

// Image paths for real character (when available)
const CHARACTER_IMAGES: Record<ViroEmotion, string> = {
  neutral: '/images/viro/viro_neutral.png',
  encouraging: '/images/viro/viro_encouraging.png',
  thoughtful: '/images/viro/viro_thoughtful.png',
  excited: '/images/viro/viro_excited.png',
  patient: '/images/viro/viro_patient.png',
  celebratory: '/images/viro/viro_celebratory.png',
};

export const ViroCharacter: React.FC<ViroCharacterProps> = ({ emotion }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Try to preload the image
    const img = new Image();
    img.src = CHARACTER_IMAGES[emotion];
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageError(true);
  }, [emotion]);

  // If real image is available and loaded, show it
  if (imageLoaded && !imageError) {
    return (
      <div className="relative w-full h-full">
        <img
          src={CHARACTER_IMAGES[emotion]}
          alt={`Viro - ${emotion}`}
          className="w-full h-full object-cover object-center"
        />
      </div>
    );
  }

  // Otherwise, show beautiful placeholder
  return <ViroPlaceholder emotion={emotion} />;
};

// Beautiful placeholder avatar
const ViroPlaceholder: React.FC<{ emotion: ViroEmotion }> = ({ emotion }) => {
  const getEmotionEmoji = () => {
    const emojis = {
      neutral: '👋',
      encouraging: '😊',
      thoughtful: '🤔',
      excited: '🎉',
      patient: '😌',
      celebratory: '🌟'
    };
    return emojis[emotion];
  };

  const getEmotionLabel = () => {
    const labels = {
      neutral: 'Ready to help',
      encouraging: 'Encouraging',
      thoughtful: 'Thinking',
      excited: 'Excited',
      patient: 'Patient',
      celebratory: 'Celebrating'
    };
    return labels[emotion];
  };

  const getEmotionGradient = () => {
    const gradients = {
      neutral: 'from-purple-600 via-blue-600 to-cyan-600',
      encouraging: 'from-green-500 via-emerald-500 to-teal-500',
      thoughtful: 'from-indigo-600 via-purple-600 to-pink-600',
      excited: 'from-yellow-500 via-orange-500 to-red-500',
      patient: 'from-blue-500 via-cyan-500 to-teal-500',
      celebratory: 'from-pink-500 via-purple-500 to-indigo-500'
    };
    return gradients[emotion];
  };

  return (
    <div className="text-center relative z-10">
      {/* Animated Background Glow */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getEmotionGradient()} opacity-20 blur-3xl animate-pulse`}></div>
      
      {/* Main Avatar Circle */}
      <div className="relative">
        {/* Outer Ring Animation */}
        <div className={`absolute inset-0 w-40 h-40 mx-auto bg-gradient-to-br ${getEmotionGradient()} rounded-full opacity-30 animate-ping`}></div>
        
        {/* Avatar Circle */}
        <div className={`relative w-40 h-40 mx-auto bg-gradient-to-br ${getEmotionGradient()} rounded-full flex items-center justify-center neon-glow-blue shadow-2xl`}>
          {/* Inner Glow */}
          <div className="absolute inset-2 bg-gray-900/50 rounded-full backdrop-blur-sm"></div>
          
          {/* Icon */}
          <div className="relative z-10">
            <Brain className="w-20 h-20 text-white drop-shadow-2xl" />
          </div>
          
          {/* Sparkle Effect */}
          <Sparkles className="absolute top-2 right-2 w-6 h-6 text-yellow-300 animate-pulse" />
        </div>
      </div>

      {/* Character Info */}
      <div className="mt-6 space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getEmotionGradient()} animate-pulse`}></div>
          <p className="text-white text-lg font-bold tracking-wide">Viro</p>
          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getEmotionGradient()} animate-pulse`}></div>
        </div>
        
        <p className="text-gray-300 text-sm font-medium">AI Coding Tutor</p>
        
        <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r ${getEmotionGradient()} bg-opacity-20 border border-purple-500/30`}>
          <span className="text-2xl">{getEmotionEmoji()}</span>
          <span className="text-white text-sm font-medium">{getEmotionLabel()}</span>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-purple-400 rounded-full animate-ping"></div>
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-blue-400 rounded-full animate-ping delay-100"></div>
        <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-cyan-400 rounded-full animate-ping delay-200"></div>
      </div>
    </div>
  );
};
