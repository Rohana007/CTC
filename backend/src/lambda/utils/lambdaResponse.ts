/**
 * Lambda Response Utilities
 * 
 * Standardized API response formatting for Lambda functions
 */

export interface LambdaResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    requestId?: string;
    duration?: number;
    cached?: boolean;
  };
}

/**
 * Create a successful Lambda response
 */
export function successResponse<T>(
  data: T,
  statusCode: number = 200,
  metadata?: { requestId?: string; duration?: number; cached?: boolean }
): LambdaResponse {
  const response: ApiResponse<T> = {
    success: true,
    data,
    metadata: {
      timestamp: new Date().toISOString(),
      ...metadata
    }
  };

  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    },
    body: JSON.stringify(response)
  };
}

/**
 * Create an error Lambda response
 */
export function errorResponse(
  message: string,
  statusCode: number = 500,
  code?: string,
  details?: any
): LambdaResponse {
  const response: ApiResponse = {
    success: false,
    error: {
      message,
      code,
      details
    },
    metadata: {
      timestamp: new Date().toISOString()
    }
  };

  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    },
    body: JSON.stringify(response)
  };
}

/**
 * Create a validation error response
 */
export function validationErrorResponse(errors: string[]): LambdaResponse {
  return errorResponse(
    'Validation failed',
    400,
    'VALIDATION_ERROR',
    { errors }
  );
}

/**
 * Create a rate limit error response
 */
export function rateLimitResponse(): LambdaResponse {
  return errorResponse(
    'Rate limit exceeded. Please try again later.',
    429,
    'RATE_LIMIT_EXCEEDED'
  );
}

/**
 * Create an unauthorized error response
 */
export function unauthorizedResponse(): LambdaResponse {
  return errorResponse(
    'Unauthorized access',
    401,
    'UNAUTHORIZED'
  );
}
