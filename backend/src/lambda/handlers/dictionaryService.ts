/**
 * Dictionary Service Lambda Handler
 * 
 * Handles term lookup requests using Amazon Bedrock
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { AIService } from '../../services/aiService';
import { successResponse, errorResponse } from '../utils/lambdaResponse';
import { logger } from '../utils/logger';
import { validateRequired, validateStringLength, validateLanguageCode, combineValidations } from '../utils/validator';
import { withErrorHandling } from '../utils/errorHandler';
import { LambdaCache, CacheTTL } from '../utils/cache';

interface DictionaryRequest {
  word: string;
  language?: string;
}

// In-memory cache for dictionary lookups (persists across warm Lambda invocations)
const cache = new LambdaCache<any>(CacheTTL.ONE_DAY);

export const handler = withErrorHandling(async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const startTime = Date.now();
  
  logger.setRequestContext(context.functionName, context.awsRequestId);
  logger.info('Dictionary service invoked');

  if (!event.body) {
    return errorResponse('Request body is required', 400);
  }

  let requestData: DictionaryRequest;
  try {
    requestData = JSON.parse(event.body);
  } catch (error) {
    return errorResponse('Invalid JSON in request body', 400);
  }

  const validation = combineValidations(
    validateRequired(requestData, ['word']),
    validateStringLength(requestData.word, 'word', 1, 100)
  );

  if (requestData.language) {
    const langValidation = validateLanguageCode(requestData.language);
    if (!langValidation.isValid) {
      validation.errors.push(...langValidation.errors);
      validation.isValid = false;
    }
  }

  if (!validation.isValid) {
    return errorResponse('Validation failed', 400, 'VALIDATION_ERROR', { errors: validation.errors });
  }

  const language = requestData.language || 'en';
  const cacheKey = `${requestData.word}:${language}`;

  // Check cache
  const cached = cache.get(cacheKey);
  if (cached) {
    logger.info('Cache hit', { word: requestData.word, language });
    return successResponse(cached, 200, { 
      requestId: context.awsRequestId, 
      duration: Date.now() - startTime,
      cached: true
    });
  }

  const aiService = new AIService();

  try {
    const result = await aiService.lookupTerm(requestData.word, language);

    // Cache the result
    cache.set(cacheKey, result);

    const duration = Date.now() - startTime;
    logger.logPerformance({ operation: 'dictionaryLookup', durationMs: duration });

    return successResponse(result, 200, { requestId: context.awsRequestId, duration });
  } catch (error) {
    logger.error('Failed to lookup term', { error, word: requestData.word });
    throw error;
  }
});
