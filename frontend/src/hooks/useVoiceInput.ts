import { useState, useEffect, useCallback, useRef } from 'react';

interface UseVoiceInputOptions {
  language?: string;
  continuous?: boolean;
  onResult?: (transcript: string) => void;
  onCommand?: (command: string) => void;
}

interface VoiceInputState {
  isListening: boolean;
  transcript: string;
  error: string | null;
  isSupported: boolean;
}

export const useVoiceInput = (options: UseVoiceInputOptions = {}) => {
  const {
    language = 'en-US',
    continuous = false,
    onResult,
    onCommand
  } = options;

  // Check for speech recognition support
  const checkSupport = () => {
    if (typeof window === 'undefined') return false;
    const hasWebkit = 'webkitSpeechRecognition' in window;
    const hasStandard = 'SpeechRecognition' in window;
    console.log('Speech recognition support check:', { hasWebkit, hasStandard });
    return hasWebkit || hasStandard;
  };

  const [state, setState] = useState<VoiceInputState>({
    isListening: false,
    transcript: '',
    error: null,
    isSupported: checkSupport()
  });

  const recognitionRef = useRef<any>(null);
  const isInitializedRef = useRef(false);

  const processCommand = useCallback((transcript: string) => {
    const lowerTranscript = transcript.toLowerCase();
    
    // Navigation commands
    if (lowerTranscript.includes('open concept') || 
        lowerTranscript.includes('concept explainer')) {
      onCommand?.('navigate:concepts');
    } else if (lowerTranscript.includes('open code') || 
               lowerTranscript.includes('code analyzer')) {
      onCommand?.('navigate:code-analysis');
    } else if (lowerTranscript.includes('open study') || 
               lowerTranscript.includes('study mode')) {
      onCommand?.('navigate:study-mode');
    }
    // Action commands
    else if (lowerTranscript.includes('analyze') || 
             lowerTranscript.includes('analyse')) {
      onCommand?.('action:analyze');
    } else if (lowerTranscript.includes('explain')) {
      onCommand?.('action:explain');
    }
  }, [onCommand]);

  // Initialize recognition instance once
  useEffect(() => {
    console.log('useVoiceInput useEffect running', { 
      isSupported: state.isSupported, 
      isInitialized: isInitializedRef.current 
    });

    if (!state.isSupported) {
      console.warn('Speech recognition not supported in this browser');
      return;
    }

    if (isInitializedRef.current) {
      console.log('Already initialized, skipping');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('SpeechRecognition constructor not available');
      setState(prev => ({ ...prev, isSupported: false }));
      return;
    }

    try {
      console.log('Creating SpeechRecognition instance...');
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = continuous;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language;
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onstart = () => {
        console.log('✓ Speech recognition started successfully');
        setState(prev => ({ ...prev, isListening: true, error: null }));
      };

      recognitionRef.current.onresult = (event: any) => {
        console.log('✓ Speech recognition result received', event);
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        const fullTranscript = (finalTranscript || interimTranscript).trim();
        console.log('Transcript:', { final: finalTranscript, interim: interimTranscript, full: fullTranscript });
        setState(prev => ({ ...prev, transcript: fullTranscript }));

        if (finalTranscript) {
          const trimmedTranscript = finalTranscript.trim();
          console.log('Calling onResult with:', trimmedTranscript);
          onResult?.(trimmedTranscript);
          processCommand(trimmedTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('✗ Speech recognition error:', event.error, event);
        let errorMessage = '';
        
        // Provide user-friendly error messages
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          errorMessage = 'Microphone access denied. Please allow microphone permissions in your browser settings.';
          alert(errorMessage);
        } else if (event.error === 'no-speech') {
          errorMessage = 'No speech detected. Please try speaking again.';
        } else if (event.error === 'network') {
          errorMessage = 'Network error. Speech recognition requires internet connection.';
          alert(errorMessage);
        } else if (event.error === 'aborted') {
          console.log('Recognition aborted (normal when stopping)');
        } else if (event.error === 'audio-capture') {
          errorMessage = 'No microphone detected. Please connect a microphone and try again.';
          alert(errorMessage);
        } else if (event.error === 'service-not-allowed') {
          errorMessage = 'Speech recognition service not allowed. Please check browser settings.';
          alert(errorMessage);
        } else {
          errorMessage = `Voice input error: ${event.error}`;
          alert(errorMessage);
        }
        
        setState(prev => ({ 
          ...prev, 
          error: errorMessage || null,
          isListening: false 
        }));
      };

      recognitionRef.current.onend = () => {
        console.log('Speech recognition ended');
        setState(prev => ({ ...prev, isListening: false }));
      };

      isInitializedRef.current = true;
      console.log('✓ Speech recognition initialized successfully');
    } catch (error) {
      console.error('✗ Failed to initialize speech recognition:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to initialize speech recognition',
        isSupported: false
      }));
    }

    return () => {
      console.log('Cleaning up speech recognition');
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log('Error stopping on cleanup (normal):', e);
        }
      }
    };
  }, [state.isSupported, language, continuous, onResult, processCommand]);

  const startListening = useCallback(() => {
    console.log('🎤 startListening called', { 
      isSupported: state.isSupported, 
      isListening: state.isListening,
      hasRecognition: !!recognitionRef.current,
      isInitialized: isInitializedRef.current
    });

    if (!state.isSupported) {
      const errorMsg = 'Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.';
      console.error('✗', errorMsg);
      setState(prev => ({ ...prev, error: errorMsg }));
      alert(errorMsg);
      return;
    }

    if (!recognitionRef.current) {
      const errorMsg = 'Speech recognition not initialized. Please refresh the page.';
      console.error('✗', errorMsg);
      setState(prev => ({ ...prev, error: errorMsg }));
      alert(errorMsg);
      return;
    }

    // Prevent starting if already listening
    if (state.isListening) {
      console.warn('⚠ Speech recognition is already active');
      return;
    }

    try {
      console.log('→ Attempting to start recognition...');
      recognitionRef.current.start();
      console.log('→ Start command sent, waiting for onstart event...');
      // State will be updated by onstart event
    } catch (error: any) {
      console.error('✗ Error starting speech recognition:', error);
      
      // Handle specific error cases
      if (error.message && error.message.includes('already started')) {
        console.warn('Recognition already started, updating state');
        setState(prev => ({ ...prev, isListening: true }));
        return;
      }
      
      const errorMessage = error?.message || 'Failed to start speech recognition';
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        isListening: false
      }));
      alert(`Voice input error: ${errorMessage}. Please check microphone permissions and try again.`);
    }
  }, [state.isSupported, state.isListening]);

  const stopListening = useCallback(() => {
    console.log('🛑 stopListening called');
    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        console.log('→ Stop command sent');
      }
    } catch (error) {
      console.error('✗ Error stopping speech recognition:', error);
    }
  }, []);

  const resetTranscript = useCallback(() => {
    console.log('Reset transcript');
    setState(prev => ({ ...prev, transcript: '', error: null }));
  }, []);

  console.log('useVoiceInput hook state:', state);

  return {
    ...state,
    startListening,
    stopListening,
    resetTranscript
  };
};
