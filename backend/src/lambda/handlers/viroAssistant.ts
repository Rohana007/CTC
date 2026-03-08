/**
 * Viro Assistant Lambda Handler
 * 
 * Handles Socratic tutoring conversations using Amazon Bedrock
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { ViroService } from '../../services/viroService';
import { successResponse, errorResponse } from '../utils/lambdaResponse';
import { logger } from '../utils/logger';
import { validateRequired, validateStringLength, combineValidations } from '../utils/validator';
import { withErrorHandling } from '../utils/errorHandler';

interface ViroAssistantRequest {
  question: string;
  language?: string;
  studentLevel?: string;
  previousInteractions?: string[];
}

export const handler = withErrorHandling(async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const startTime = Date.now();
  
  logger.setRequestContext(context.functionName, context.awsRequestId);
  logger.info('Viro assistant invoked');

  if (!event.body) {
    return errorResponse('Request body is required', 400);
  }

  let requestData: ViroAssistantRequest;
  try {
    requestData = JSON.parse(event.body);
  } catch (error) {
    return errorResponse('Invalid JSON in request body', 400);
  }

  const validation = combineValidations(
    validateRequired(requestData, ['question']),
    validateStringLength(requestData.question, 'question', 1, 500)
  );

  if (!validation.isValid) {
    return errorResponse('Validation failed', 400, 'VALIDATION_ERROR', { errors: validation.errors });
  }

  const viroService = new ViroService();

  try {
    const result = await viroService.generateSocraticResponse({
      studentQuestion: requestData.question,
      previousInteractions: requestData.previousInteractions || [],
      detectedLanguage: requestData.language as any || 'en',
      studentLevel: requestData.studentLevel as any || 'intermediate'
    });

    const duration = Date.now() - startTime;
    logger.logPerformance({ operation: 'viroAssistant', durationMs: duration });

    return successResponse(result, 200, { requestId: context.awsRequestId, duration });
  } catch (error) {
    logger.error('Failed to generate Viro response', { error });
    throw error;
  }
});
