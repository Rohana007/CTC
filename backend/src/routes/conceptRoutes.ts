import { Router, Request, Response } from 'express';
import { AIService } from '../services/aiService';
import { MockAIService } from '../services/mockAiService';
import { AdaptiveService } from '../services/adaptiveService';
import { UserInteraction } from '../shared/types';

const router = Router();
let aiService: AIService | MockAIService;
let adaptiveService: AdaptiveService;

// Lazy initialization to ensure environment variables are loaded
const getServices = () => {
  if (!aiService) {
    // Use mock service for demo (OpenAI quota exceeded)
    console.log('🎭 Using mock AI service for demo');
    aiService = new MockAIService();
    adaptiveService = new AdaptiveService();
  }
  return { aiService, adaptiveService };
};

// Generate session ID helper
const generateSessionId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Explain concept endpoint
router.post('/explain', async (req: Request, res: Response) => {
  try {
    const { topic, sessionId, confusionLevel } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const { aiService, adaptiveService } = getServices();
    const currentSessionId = sessionId || generateSessionId();

    // Track user interaction
    const interaction: UserInteraction = {
      sessionId: currentSessionId,
      topic,
      timestamp: new Date(),
      confusionLevel
    };
    adaptiveService.trackInteraction(interaction);

    // Get adaptive context
    const context = adaptiveService.getAdaptiveContext(currentSessionId, topic);

    // Generate explanation
    const explanation = await aiService.explainConcept(topic, context);

    res.json({
      ...explanation,
      sessionId: currentSessionId,
      adaptiveContext: context
    });

  } catch (error) {
    console.error('Concept explanation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate explanation',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get popular topics endpoint
router.get('/popular', (req: Request, res: Response) => {
  const popularTopics = [
    'Binary Search',
    'Recursion',
    'Dynamic Programming',
    'Linked Lists',
    'Binary Trees',
    'Sorting Algorithms',
    'Hash Tables',
    'Graph Traversal',
    'Stack and Queue',
    'Big O Notation'
  ];

  res.json({ topics: popularTopics });
});

// Feedback endpoint
router.post('/feedback', (req: Request, res: Response) => {
  try {
    const { sessionId, topic, helpful, confusionLevel, comments } = req.body;

    if (!sessionId || !topic) {
      return res.status(400).json({ error: 'Session ID and topic are required' });
    }

    const { adaptiveService } = getServices();

    // Track feedback as interaction
    const interaction: UserInteraction = {
      sessionId,
      topic: `feedback_${topic}`,
      timestamp: new Date(),
      confusionLevel
    };
    adaptiveService.trackInteraction(interaction);

    console.log('Feedback received:', { sessionId, topic, helpful, confusionLevel, comments });

    res.json({ message: 'Feedback recorded successfully' });

  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({ error: 'Failed to record feedback' });
  }
});

export { router as conceptRoutes };