/**
 * CloudWatch Logger for Lambda Functions
 * 
 * Provides structured JSON logging for CloudWatch Logs
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: any;
  error?: any;
}

class Logger {
  private functionName: string;
  private requestId: string;

  constructor() {
    this.functionName = process.env.AWS_LAMBDA_FUNCTION_NAME || 'local';
    this.requestId = 'local';
  }

  setRequestContext(functionName: string, requestId: string) {
    this.functionName = functionName;
    this.requestId = requestId;
  }

  private log(level: LogLevel, message: string, context?: any) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: {
        functionName: this.functionName,
        requestId: this.requestId,
        ...context
      }
    };

    // Output as JSON for CloudWatch Logs Insights
    console.log(JSON.stringify(entry));
  }

  debug(message: string, context?: any) {
    if (process.env.LOG_LEVEL === 'DEBUG') {
      this.log(LogLevel.DEBUG, message, context);
    }
  }

  info(message: string, context?: any) {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: any) {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, context?: any) {
    const errorContext = { ...context };
    
    // Extract error details if present
    if (context?.error instanceof Error) {
      errorContext.error = {
        name: context.error.name,
        message: context.error.message,
        stack: context.error.stack
      };
    }

    this.log(LogLevel.ERROR, message, errorContext);
  }

  /**
   * Log Bedrock invocation metrics
   */
  logBedrockInvocation(params: {
    model: string;
    inputTokens?: number;
    outputTokens?: number;
    latencyMs: number;
    success: boolean;
  }) {
    this.info('Bedrock invocation', {
      service: 'bedrock',
      ...params
    });
  }

  /**
   * Log Lambda performance metrics
   */
  logPerformance(params: {
    operation: string;
    durationMs: number;
    memoryUsedMB?: number;
  }) {
    this.info('Performance metric', {
      type: 'performance',
      ...params
    });
  }
}

// Export singleton instance
export const logger = new Logger();
