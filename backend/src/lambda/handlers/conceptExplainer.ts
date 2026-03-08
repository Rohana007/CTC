/**
 * Concept Explainer Lambda Handler
 * 
 * Handles concept explanation requests using Amazon Bedrock
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { AIService } from '../../services/aiService';
import { successResponse, errorResponse } from '../utils/lambdaResponse';
import { logger } from '../utils/logger';
import { 
  validateRequired, 
  validateStringLength, 
  validateLanguageCode,
  validateComplexityLevel,
  combineValidations 
} from '../utils/validator';
import { withErrorHandling } from '../utils/errorHandler';
import { LambdaCache, CacheTTL } from '../utils/cache';

interface ConceptExplainerRequest {
  topic: string;
  language?: string;
  complexity?: string;
  repeatedQueries?: string[];
  confusionPatterns?: string[];
}

// In-memory cache for concept explanations (persists across warm Lambda invocations)
const cache = new LambdaCache<any>(CacheTTL.ONE_HOUR);

/**
 * Main Lambda handler
 */
export const handler = withErrorHandling(async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const startTime = Date.now();
  
  // Set request context for logging
  logger.setRequestContext(context.functionName, context.awsRequestId);
  logger.info('Concept explainer invoked', { 
    httpMethod: event.httpMethod,
    path: event.path 
  });

  // Parse request body
  if (!event.body) {
    return errorResponse('Request body is required', 400);
  }

  let requestData: ConceptExplainerRequest;
  try {
    requestData = JSON.parse(event.body);
  } catch (error) {
    return errorResponse('Invalid JSON in request body', 400);
  }

  // Validate input
  const validation = combineValidations(
    validateRequired(requestData, ['topic']),
    validateStringLength(requestData.topic, 'topic', 1, 200)
  );

  if (requestData.language) {
    const langValidation = validateLanguageCode(requestData.language);
    if (!langValidation.isValid) {
      validation.errors.push(...langValidation.errors);
      validation.isValid = false;
    }
  }

  if (requestData.complexity) {
    const complexityValidation = validateComplexityLevel(requestData.complexity);
    if (!complexityValidation.isValid) {
      validation.errors.push(...complexityValidation.errors);
      validation.isValid = false;
    }
  }

  if (!validation.isValid) {
    logger.warn('Validation failed', { errors: validation.errors });
    return errorResponse('Validation failed', 400, 'VALIDATION_ERROR', { errors: validation.errors });
  }

  // Create cache key from request parameters
  const language = requestData.language || 'en';
  const complexity = requestData.complexity || 'beginner';
  const cacheKey = `${requestData.topic}:${language}:${complexity}`;

  // Check cache (only for simple requests without repeated queries or confusion patterns)
  if (!requestData.repeatedQueries?.length && !requestData.confusionPatterns?.length) {
    const cached = cache.get(cacheKey);
    if (cached) {
      logger.info('Cache hit', { topic: requestData.topic, language, complexity });
      return successResponse(cached, 200, { 
        requestId: context.awsRequestId, 
        duration: Date.now() - startTime,
        cached: true
      });
    }
  }

  // Initialize AI service
  const aiService = new AIService();

  try {
    // Generate concept explanation
    const result = await aiService.explainConcept(requestData.topic, {
      preferredComplexity: requestData.complexity as any || 'beginner',
      repeatedQueries: requestData.repeatedQueries || [],
      confusionPatterns: requestData.confusionPatterns || []
    });

    // Generate or use existing sessionId
    const sessionId = context.awsRequestId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Cache the result (only for simple requests)
    if (!requestData.repeatedQueries?.length && !requestData.confusionPatterns?.length) {
      const language = requestData.language || 'en';
      const complexity = requestData.complexity || 'beginner';
      const cacheKey = `${requestData.topic}:${language}:${complexity}`;
      cache.set(cacheKey, result);
    }

    const duration = Date.now() - startTime;
    
    // Log performance
    logger.logPerformance({
      operation: 'explainConcept',
      durationMs: duration
    });

    logger.info('Concept explanation generated successfully', {
      topic: requestData.topic,
      language: requestData.language,
      durationMs: duration
    });

    // Include sessionId in response for frontend compatibility
    return successResponse({
      ...result,
      sessionId
    }, 200, {
      requestId: context.awsRequestId,
      duration
    });
  } catch (error) {
    logger.error('Failed to generate concept explanation', { error, topic: requestData.topic });
    throw error;
  }
});
