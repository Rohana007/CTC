import express, { Request, Response } from 'express';
import { viroService } from '../services/viroService';

const router = express.Router();

interface ViroRequestBody {
  question: string;
  previousInteractions?: string[];
  sessionId?: string;
}

interface ViroSession {
  sessionId: string;
  interactions: string[];
  totalXP: number;
  startTime: Date;
}

// In-memory session storage (replace with database in production)
const sessions = new Map<string, ViroSession>();

/**
 * POST /api/viro/ask
 * Get Socratic response from Viro
 */
router.post('/ask', async (req: Request, res: Response) => {
  try {
    const { question, previousInteractions = [], sessionId } = req.body as ViroRequestBody;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // Get or create session
    let session: ViroSession;
    if (sessionId && sessions.has(sessionId)) {
      session = sessions.get(sessionId)!;
    } else {
      const newSessionId = `viro_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      session = {
        sessionId: newSessionId,
        interactions: [],
        totalXP: 0,
        startTime: new Date()
      };
      sessions.set(newSessionId, session);
    }

    // Detect language and student level
    const detectedLanguage = viroService.detectLanguage(question);
    const studentLevel = viroService.estimateStudentLevel(question);

    // Generate Socratic response
    const response = await viroService.generateSocraticResponse({
      studentQuestion: question,
      previousInteractions: session.interactions.slice(-5), // Last 5 interactions for context
      detectedLanguage,
      studentLevel
    });

    // Update session
    session.interactions.push(`Q: ${question}`);
    session.interactions.push(`A: ${response.acknowledge} ${response.question}`);
    if (response.xpReward) {
      session.totalXP += response.xpReward;
    }

    res.json({
      ...response,
      sessionId: session.sessionId,
      totalXP: session.totalXP,
      detectedLanguage,
      studentLevel
    });
  } catch (error) {
    console.error('Error in /api/viro/ask:', error);
    res.status(500).json({ 
      error: 'Failed to generate response',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/viro/session/:sessionId
 * Get session details
 */
router.get('/session/:sessionId', (req: Request, res: Response) => {
  const { sessionId } = req.params;

  if (!sessions.has(sessionId)) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const session = sessions.get(sessionId)!;
  res.json({
    sessionId: session.sessionId,
    totalXP: session.totalXP,
    interactionCount: Math.floor(session.interactions.length / 2),
    startTime: session.startTime,
    duration: Date.now() - session.startTime.getTime()
  });
});

/**
 * POST /api/viro/feedback
 * Submit feedback on Viro's response
 */
router.post('/feedback', (req: Request, res: Response) => {
  const { sessionId, helpful, rating, comment } = req.body;

  if (!sessionId || typeof helpful !== 'boolean') {
    return res.status(400).json({ error: 'sessionId and helpful are required' });
  }

  // In production, store feedback in database
  console.log('Viro feedback received:', { sessionId, helpful, rating, comment });

  res.json({ success: true, message: 'Feedback recorded' });
});

/**
 * GET /api/viro/analogies/:concept
 * Get analogy for a specific concept
 */
router.get('/analogies/:concept', (req: Request, res: Response) => {
  const { concept } = req.params;
  const analogy = viroService.getAnalogy(concept);

  if (!analogy) {
    return res.status(404).json({ error: 'No analogy found for this concept' });
  }

  res.json({ concept, analogy });
});

/**
 * POST /api/viro/xp/calculate
 * Calculate XP reward for an interaction
 */
router.post('/xp/calculate', (req: Request, res: Response) => {
  const { questionComplexity, studentProgress } = req.body;

  if (!questionComplexity || !studentProgress) {
    return res.status(400).json({ error: 'questionComplexity and studentProgress are required' });
  }

  const xp = viroService.calculateXPReward(questionComplexity, studentProgress);
  res.json({ xp });
});

/**
 * DELETE /api/viro/session/:sessionId
 * Clear session (for testing or user request)
 */
router.delete('/session/:sessionId', (req: Request, res: Response) => {
  const { sessionId } = req.params;

  if (!sessions.has(sessionId)) {
    return res.status(404).json({ error: 'Session not found' });
  }

  sessions.delete(sessionId);
  res.json({ success: true, message: 'Session cleared' });
});

// Cleanup old sessions (run periodically)
setInterval(() => {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours

  for (const [sessionId, session] of sessions.entries()) {
    if (now - session.startTime.getTime() > maxAge) {
      sessions.delete(sessionId);
    }
  }
}, 60 * 60 * 1000); // Run every hour

export default router;
