/**
 * Code Analyzer Lambda Handler
 * 
 * Handles code analysis requests using Amazon Bedrock
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { AIService } from '../../services/aiService';
import { successResponse, errorResponse } from '../utils/lambdaResponse';
import { logger } from '../utils/logger';
import { 
  validateRequired, 
  validateStringLength, 
  validateProgrammingLanguage,
  combineValidations 
} from '../utils/validator';
import { withErrorHandling } from '../utils/errorHandler';

interface CodeAnalyzerRequest {
  code: string;
  language: string;
}

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
  logger.info('Code analyzer invoked', { 
    httpMethod: event.httpMethod,
    path: event.path 
  });

  // Parse request body
  if (!event.body) {
    return errorResponse('Request body is required', 400);
  }

  let requestData: CodeAnalyzerRequest;
  try {
    requestData = JSON.parse(event.body);
  } catch (error) {
    return errorResponse('Invalid JSON in request body', 400);
  }

  // Validate input
  const validation = combineValidations(
    validateRequired(requestData, ['code', 'language']),
    validateStringLength(requestData.code, 'code', 1, 10000),
    validateProgrammingLanguage(requestData.language)
  );

  if (!validation.isValid) {
    logger.warn('Validation failed', { errors: validation.errors });
    return errorResponse('Validation failed', 400, 'VALIDATION_ERROR', { errors: validation.errors });
  }

  // Initialize AI service
  const aiService = new AIService();

  try {
    // Analyze code
    const result = await aiService.analyzeCode(
      requestData.code,
      requestData.language
    );

    const duration = Date.now() - startTime;
    
    // Log performance
    logger.logPerformance({
      operation: 'analyzeCode',
      durationMs: duration
    });

    logger.info('Code analysis completed successfully', {
      language: requestData.language,
      codeLength: requestData.code.length,
      durationMs: duration
    });

    return successResponse(result, 200, {
      requestId: context.awsRequestId,
      duration
    });
  } catch (error) {
    logger.error('Failed to analyze code', { error, language: requestData.language });
    throw error;
  }
});
