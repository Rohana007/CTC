import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { useLanguage } from '../contexts/LanguageContext';

interface GlobalVoiceControlProps {
  onNavigate: (tab: string) => void;
  onAction: (action: string) => void;
}

export const GlobalVoiceControl: React.FC<GlobalVoiceControlProps> = ({ 
  onNavigate, 
  onAction 
}) => {
  const { t, language } = useLanguage();
  
  const languageMap: Record<string, string> = {
    'en': 'en-US',
    'hi': 'hi-IN',
    'mr': 'mr-IN',
    'ta': 'ta-IN',
    'te': 'te-IN',
    'bn': 'bn-IN',
    'gu': 'gu-IN',
    'kn': 'kn-IN',
    'ml': 'ml-IN',
    'pa': 'pa-IN'
  };

  const { 
    isListening, 
    transcript, 
    error, 
    isSupported,
    startListening, 
    stopListening 
  } = useVoiceInput({
    language: languageMap[language] || 'en-US',
    continuous: false,
    onCommand: (command) => {
      const [type, value] = command.split(':');
      if (type === 'navigate') {
        onNavigate(value);
      } else if (type === 'action') {
        onAction(value);
      }
    }
  });

  if (!isSupported) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={isListening ? stopListening : startListening}
        className={`p-4 rounded-full shadow-lg transition-all ${
          isListening
            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
            : 'bg-primary-500 hover:bg-primary-600'
        } text-white`}
        title={isListening ? t('voice.stop') : t('voice.speak')}
      >
        {isListening ? (
          <MicOff className="w-6 h-6" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
      </button>
      
      {isListening && (
        <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg p-3 min-w-[200px]">
          <p className="text-sm font-medium text-gray-900">{t('voice.listening')}</p>
          {transcript && (
            <p className="text-xs text-gray-600 mt-1">{transcript}</p>
          )}
        </div>
      )}
      
      {error && (
        <div className="absolute bottom-full right-0 mb-2 bg-red-50 rounded-lg shadow-lg p-3 min-w-[200px]">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};
