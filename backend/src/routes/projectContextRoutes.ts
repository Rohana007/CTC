import express from 'express';
import { ProjectContext, ContextAwareAnalysis } from '../shared/types';
import { ProjectContextService } from '../services/projectContextService';
import { MockAIService } from '../services/mockAiService';

const router = express.Router();
const projectContextService = new ProjectContextService();
const mockAIService = new MockAIService();

// In-memory storage for Phase 1 (will be replaced with database in Phase 2)
const projectContexts: Map<string, ProjectContext> = new Map();

/**
 * Create a new project context
 */
router.post('/create', async (req, res) => {
  try {
    const { name, type, domain, techStack, dataCharacteristics, description } = req.body;
    
    // Validation
    if (!name || !type || !domain) {
      return res.status(400).json({ error: 'Missing required fields: name, type, domain' });
    }
    
    const projectContext: ProjectContext = {
      id: `ctx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      type,
      domain,
      techStack: techStack || {},
      dataCharacteristics: dataCharacteristics || {
        type: 'user_input',
        volume: 'medium',
        velocity: 'moderate'
      },
      description: description || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    projectContexts.set(projectContext.id, projectContext);
    
    res.json({ projectContext });
  } catch (error: any) {
    console.error('Error creating project context:', error);
    res.status(500).json({ error: 'Failed to create project context', message: error.message });
  }
});

/**
 * Get all project contexts
 */
router.get('/list', async (req, res) => {
  try {
    const contexts = Array.from(projectContexts.values());
    res.json({ contexts });
  } catch (error: any) {
    console.error('Error listing project contexts:', error);
    res.status(500).json({ error: 'Failed to list project contexts', message: error.message });
  }
});

/**
 * Get a specific project context by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const context = projectContexts.get(id);
    
    if (!context) {
      return res.status(404).json({ error: 'Project context not found' });
    }
    
    res.json({ context });
  } catch (error: any) {
    console.error('Error getting project context:', error);
    res.status(500).json({ error: 'Failed to get project context', message: error.message });
  }
});

/**
 * Update a project context
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const context = projectContexts.get(id);
    
    if (!context) {
      return res.status(404).json({ error: 'Project context not found' });
    }
    
    const { name, type, domain, techStack, dataCharacteristics, description } = req.body;
    
    const updatedContext: ProjectContext = {
      ...context,
      name: name || context.name,
      type: type || context.type,
      domain: domain || context.domain,
      techStack: techStack || context.techStack,
      dataCharacteristics: dataCharacteristics || context.dataCharacteristics,
      description: description !== undefined ? description : context.description,
      updatedAt: new Date()
    };
    
    projectContexts.set(id, updatedContext);
    
    res.json({ projectContext: updatedContext });
  } catch (error: any) {
    console.error('Error updating project context:', error);
    res.status(500).json({ error: 'Failed to update project context', message: error.message });
  }
});

/**
 * Delete a project context
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!projectContexts.has(id)) {
      return res.status(404).json({ error: 'Project context not found' });
    }
    
    projectContexts.delete(id);
    
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting project context:', error);
    res.status(500).json({ error: 'Failed to delete project context', message: error.message });
  }
});

/**
 * Analyze code with project context
 */
router.post('/analyze', async (req, res) => {
  try {
    const { code, language, contextId } = req.body;
    
    // Validation
    if (!code || !language) {
      return res.status(400).json({ error: 'Missing required fields: code, language' });
    }
    
    // Get standard analysis
    const standardAnalysis = await mockAIService.analyzeCode(code, language);
    
    // If no context provided, return standard analysis
    if (!contextId) {
      return res.json({ analysis: { standardAnalysis } });
    }
    
    // Get project context
    const context = projectContexts.get(contextId);
    if (!context) {
      return res.status(404).json({ error: 'Project context not found' });
    }
    
    // Generate contextual insights
    const contextualInsights = projectContextService.generateContextualInsights(
      code,
      language,
      context,
      standardAnalysis
    );
    
    // Generate contextual test cases
    const contextualTestCases = projectContextService.generateContextualTestCases(code, context);
    
    const analysis: ContextAwareAnalysis = {
      standardAnalysis,
      contextualInsights,
      contextualTestCases
    };
    
    res.json({ analysis });
  } catch (error: any) {
    console.error('Error analyzing code with context:', error);
    res.status(500).json({ error: 'Failed to analyze code', message: error.message });
  }
});

export { router as projectContextRoutes };
