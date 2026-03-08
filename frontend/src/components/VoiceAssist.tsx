import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Pause, Play, SkipForward, SkipBack } from 'lucide-react';

interface VoiceAssistProps {
  text: string;
  autoPlay?: boolean;
}

export const VoiceAssist: React.FC<VoiceAssistProps> = ({ text, autoPlay = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<number>(0);
  const [rate, setRate] = useState<number>(1.0);
  const [pitch, setPitch] = useState<number>(1.0);

  useEffect(() => {
    const synth = window.speechSynthesis;
    
    const loadVoices = () => {
      const availableVoices = synth.getVoices();
      console.log('Available voices:', availableVoices.length, availableVoices);
      setVoices(availableVoices);
      
      // Try to find an English voice
      const englishVoice = availableVoices.findIndex(voice => 
        voice.lang.startsWith('en')
      );
      if (englishVoice !== -1) {
        setSelectedVoice(englishVoice);
        console.log('Selected English voice:', availableVoices[englishVoice].name);
      }
    };

    // Load voices immediately
    loadVoices();
    
    // Also listen for voices changed event (some browsers load voices async)
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices;
    }

    // Force load voices after a delay (Edge sometimes needs this)
    setTimeout(loadVoices, 100);

    return () => {
      synth.cancel();
    };
  }, []);

  useEffect(() => {
    if (autoPlay && text && !isPlaying) {
      handlePlay();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, text]);

  const handlePlay = () => {
    const synth = window.speechSynthesis;
    
    console.log('handlePlay called', { isPaused, isPlaying, voicesCount: voices.length });
    
    if (isPaused) {
      console.log('Resuming paused speech');
      synth.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    // Cancel any ongoing speech
    synth.cancel();

    // Wait for cancel to complete
    setTimeout(() => {
      const newUtterance = new SpeechSynthesisUtterance(text);
      
      // Set voice if available
      if (voices.length > 0 && voices[selectedVoice]) {
        newUtterance.voice = voices[selectedVoice];
        console.log('Using voice:', voices[selectedVoice].name);
      } else {
        console.warn('No voices available, using default');
      }
      
      newUtterance.rate = rate;
      newUtterance.pitch = pitch;
      newUtterance.volume = 1.0;
      newUtterance.lang = 'en-US';

      newUtterance.onstart = () => {
        console.log('✓ Speech started');
        setIsPlaying(true);
        setIsPaused(false);
      };

      newUtterance.onend = () => {
        console.log('✓ Speech ended');
        setIsPlaying(false);
        setIsPaused(false);
      };

      newUtterance.onerror = (event) => {
        console.error('✗ Speech synthesis error:', event);
        alert(`Voice output error: ${event.error}. Please check your system audio settings.`);
        setIsPlaying(false);
        setIsPaused(false);
      };

      console.log('Speaking text:', text.substring(0, 50) + '...');
      synth.speak(newUtterance);
      
      // Verify it's actually speaking
      setTimeout(() => {
        console.log('Speech synthesis status:', { 
          speaking: synth.speaking, 
          pending: synth.pending,
          paused: synth.paused 
        });
      }, 200);
    }, 100);
  };

  const handlePause = () => {
    const synth = window.speechSynthesis;
    synth.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleStop = () => {
    const synth = window.speechSynthesis;
    synth.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handleRateChange = (newRate: number) => {
    setRate(newRate);
    if (isPlaying || isPaused) {
      handleStop();
    }
  };

  return (
    <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
      <div className="flex items-center space-x-2">
        {!isPlaying && !isPaused && (
          <button
            onClick={handlePlay}
            className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
            title="Play"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        )}
        
        {isPlaying && (
          <button
            onClick={handlePause}
            className="p-2 bg-yellow-600 text-white rounded-full hover:bg-yellow-700 transition-colors"
            title="Pause"
          >
            <Pause className="w-5 h-5" />
          </button>
        )}
        
        {isPaused && (
          <button
            onClick={handlePlay}
            className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
            title="Resume"
          >
            <Play className="w-5 h-5" />
          </button>
        )}
        
        {(isPlaying || isPaused) && (
          <button
            onClick={handleStop}
            className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
            title="Stop"
          >
            <VolumeX className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex-1 flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Speed:</label>
          <select
            value={rate}
            onChange={(e) => handleRateChange(parseFloat(e.target.value))}
            className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="0.5">0.5x</option>
            <option value="0.75">0.75x</option>
            <option value="1.0">1.0x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="2.0">2.0x</option>
          </select>
        </div>

        {voices.length > 0 && (
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Voice:</label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(parseInt(e.target.value))}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-purple-500 focus:border-transparent max-w-xs"
            >
              {voices.map((voice, index) => (
                <option key={index} value={index}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-1 text-sm text-gray-600">
        {isPlaying && (
          <span className="flex items-center">
            <span className="animate-pulse mr-1">🔊</span>
            Playing...
          </span>
        )}
        {isPaused && (
          <span className="flex items-center">
            <span className="mr-1">⏸️</span>
            Paused
          </span>
        )}
      </div>
    </div>
  );
};
