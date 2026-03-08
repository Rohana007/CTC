/**
 * Centralized Error Handler for Lambda Functions
 * 
 * Provides consistent error handling and logging across all Lambda handlers
 */

import { LambdaResponse, errorResponse } from './lambdaResponse';
import { logger } from './logger';

export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  BEDROCK_ERROR = 'BEDROCK_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED'
}

export class AppError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Handle errors and return appropriate Lambda response
 */
export function handleError(error: unknown, context?: string): LambdaResponse {
  // Log the error
  logger.error('Error occurred', { error, context });

  // Handle known error types
  if (error instanceof AppError) {
    return errorResponse(
      error.message,
      error.statusCode,
      error.code,
      error.details
    );
  }

  // Handle AWS SDK errors
  if (error && typeof error === 'object' && 'name' in error) {
    const awsError = error as any;
    
    if (awsError.name === 'ThrottlingException') {
      return errorResponse(
        'Service is temporarily busy. Please try again.',
        429,
        ErrorCode.RATE_LIMIT_ERROR
      );
    }

    if (awsError.name === 'ValidationException') {
      return errorResponse(
        'Invalid request parameters',
        400,
        ErrorCode.VALIDATION_ERROR,
        awsError.message
      );
    }

    if (awsError.name === 'TimeoutError') {
      return errorResponse(
        'Request timed out. Please try again.',
        504,
        ErrorCode.TIMEOUT_ERROR
      );
    }

    if (awsError.name === 'AccessDeniedException') {
      return errorResponse(
        'Access denied to AWS service',
        403,
        ErrorCode.UNAUTHORIZED
      );
    }
  }

  // Handle generic errors
  if (error instanceof Error) {
    return errorResponse(
      'An unexpected error occurred',
      500,
      ErrorCode.INTERNAL_ERROR,
      process.env.NODE_ENV === 'development' ? error.message : undefined
    );
  }

  // Unknown error type
  return errorResponse(
    'An unknown error occurred',
    500,
    ErrorCode.INTERNAL_ERROR
  );
}

/**
 * Wrap async handler with error handling
 */
export function withErrorHandling(
  handler: (event: any, context: any) => Promise<any>
) {
  return async (event: any, context: any): Promise<any> => {
    try {
      return await handler(event, context);
    } catch (error) {
      return handleError(error, context.functionName);
    }
  };
}
