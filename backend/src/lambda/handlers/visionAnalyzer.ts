/**
 * Vision Analyzer Lambda Handler
 * 
 * Handles image analysis requests using Amazon Bedrock
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { VisionService } from '../../services/visionService';
import { successResponse, errorResponse } from '../utils/lambdaResponse';
import { logger } from '../utils/logger';
import { validateRequired, validateBase64Image, combineValidations } from '../utils/validator';
import { withErrorHandling } from '../utils/errorHandler';

interface VisionAnalyzerRequest {
  imageBase64: string;
}

export const handler = withErrorHandling(async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const startTime = Date.now();
  
  logger.setRequestContext(context.functionName, context.awsRequestId);
  logger.info('Vision analyzer invoked');

  if (!event.body) {
    return errorResponse('Request body is required', 400);
  }

  let requestData: VisionAnalyzerRequest;
  try {
    requestData = JSON.parse(event.body);
  } catch (error) {
    return errorResponse('Invalid JSON in request body', 400);
  }

  const validation = combineValidations(
    validateRequired(requestData, ['imageBase64']),
    validateBase64Image(requestData.imageBase64, 5)
  );

  if (!validation.isValid) {
    return errorResponse('Validation failed', 400, 'VALIDATION_ERROR', { errors: validation.errors });
  }

  const visionService = new VisionService();

  try {
    const result = await visionService.analyzeImage(requestData.imageBase64);

    const duration = Date.now() - startTime;
    logger.logPerformance({ operation: 'visionAnalysis', durationMs: duration });

    return successResponse(result, 200, { requestId: context.awsRequestId, duration });
  } catch (error) {
    logger.error('Failed to analyze image', { error });
    throw error;
  }
});
