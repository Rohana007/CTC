import { Router, Request, Response } from 'express';
import { AIService } from '../services/aiService';
import { MockAIService } from '../services/mockAiService';
import { CodeAnalysisRequest, EnhancedCodeAnalysisResponse } from '../shared/types';

const router = Router();
let aiService: AIService | MockAIService;

// Lazy initialization to ensure environment variables are loaded
const getAIService = () => {
  if (!aiService) {
    console.log('🎭 Using mock AI service for demo');
    aiService = new MockAIService();
  }
  return aiService;
};

// Analyze code endpoint
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { code, language }: CodeAnalysisRequest = req.body;

    if (!code || !language) {
      return res.status(400).json({ 
        error: 'Code and language are required' 
      });
    }

    // Validate code length
    if (code.length > 10000) {
      return res.status(400).json({ 
        error: 'Code is too long. Maximum 10,000 characters allowed.' 
      });
    }

    // Supported languages
    const supportedLanguages = ['python', 'javascript', 'java', 'cpp', 'c'];
    if (!supportedLanguages.includes(language.toLowerCase())) {
      return res.status(400).json({ 
        error: `Language '${language}' is not supported. Supported languages: ${supportedLanguages.join(', ')}` 
      });
    }

    const aiService = getAIService();
    const analysis = await aiService.analyzeCode(code, language);

    res.json(analysis);

  } catch (error) {
    console.error('Code analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze code',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get supported languages
router.get('/languages', (req: Request, res: Response) => {
  const languages = [
    { id: 'python', name: 'Python', extension: '.py' },
    { id: 'javascript', name: 'JavaScript', extension: '.js' },
    { id: 'java', name: 'Java', extension: '.java' },
    { id: 'cpp', name: 'C++', extension: '.cpp' },
    { id: 'c', name: 'C', extension: '.c' }
  ];

  res.json({ languages });
});

export { router as codeAnalysisRoutes };