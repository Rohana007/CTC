import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  InvokeModelCommandInput,
  ThrottlingException,
  ModelTimeoutException,
  ModelNotReadyException,
  ServiceUnavailableException,
} from '@aws-sdk/client-bedrock-runtime';

/**
 * Supported models on Amazon Bedrock
 * 
 * Using inference profile model IDs for cross-region routing and better availability
 * 
 * Pricing (approximate per 1M tokens):
 * - Nova Micro: $0.035 input / $0.14 output (cheapest, basic tasks)
 * - Nova Lite: $0.06 input / $0.24 output (cost-effective, no marketplace subscription)
 * - Claude 3 Haiku: ~$0.25 input / $1.25 output (4x more expensive, requires marketplace)
 * - Claude 3.5 Sonnet: $3 input / $15 output (50x more expensive, highest quality, requires marketplace)
 * 
 * Note: Claude models require AWS Marketplace subscription beyond payment method setup
 */
export enum ClaudeModel {
  NOVA_MICRO = 'us.amazon.nova-micro-v1:0',
  NOVA_LITE = 'us.amazon.nova-lite-v1:0',
  CLAUDE_3_HAIKU = 'us.anthropic.claude-3-haiku-20240307-v1:0',
  CLAUDE_3_5_SONNET = 'us.anthropic.claude-3-5-sonnet-20241022-v2:0',
}

/**
 * Configuration for Claude model invocation
 */
export interface ClaudeInvocationConfig {
  model: ClaudeModel;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stopSequences?: string[];
}

/**
 * Message format (works for both Claude and Nova)
 */
export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string | Array<{ text: string }>;
}

/**
 * Request body for Claude models
 */
interface ClaudeRequestBody {
  anthropic_version: string;
  max_tokens: number;
  messages: ClaudeMessage[];
  temperature?: number;
  top_p?: number;
  stop_sequences?: string[];
  system?: string;
}

/**
 * Request body for Amazon Nova models
 */
interface NovaRequestBody {
  messages: Array<{
    role: string;
    content: Array<{ text: string }>;
  }>;
  inferenceConfig: {
    max_new_tokens: number;
    temperature?: number;
    topP?: number;
    stopSequences?: string[];
  };
  system?: Array<{ text: string }>;
}

/**
 * Response body for Claude models
 */
interface ClaudeResponseBody {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  stop_reason: string;
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

/**
 * Response body for Amazon Nova models
 */
interface NovaResponseBody {
  output: {
    message: {
      role: string;
      content: Array<{ text: string }>;
    };
  };
  stopReason: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

/**
 * Retry configuration
 */
interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

/**
 * Default retry configuration with exponential backoff
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
};

/**
 * BedrockService provides a wrapper around AWS Bedrock Runtime Client
 * with support for Claude 3 models, error handling, and retry logic.
 */
export class BedrockService {
  private client: BedrockRuntimeClient;
  private retryConfig: RetryConfig;

  constructor(region: string = 'us-east-1', retryConfig?: Partial<RetryConfig>) {
    this.client = new BedrockRuntimeClient({
      region,
    });
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  }

  /**
   * Invokes a Claude model with the provided messages and configuration.
   * Implements retry logic with exponential backoff for transient failures.
   * 
   * @param messages - Array of messages in Claude format
   * @param config - Model configuration including model selection and parameters
   * @param systemPrompt - Optional system prompt to set context
   * @returns The text response from Claude
   * @throws Error for non-retryable errors or after max retries exceeded
   */
  async invokeClaude(
    messages: ClaudeMessage[],
    config: ClaudeInvocationConfig,
    systemPrompt?: string
  ): Promise<string> {
    const startTime = Date.now();
    const isNova = config.model.includes('nova');
    const isClaude = config.model.includes('anthropic.claude');
    
    let requestBody: any;
    
    if (isNova) {
      // Amazon Nova format
      requestBody = {
        messages: messages.map(msg => ({
          role: msg.role,
          content: [{ text: typeof msg.content === 'string' ? msg.content : msg.content[0].text }]
        })),
        inferenceConfig: {
          max_new_tokens: config.maxTokens || 2000,
          temperature: config.temperature ?? 0.7,
        }
      };
      
      if (systemPrompt) {
        requestBody.system = [{ text: systemPrompt }];
      }
    } else if (isClaude) {
      // Claude format (Anthropic models)
      requestBody = {
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: config.maxTokens || 2000,
        messages,
        temperature: config.temperature ?? 0.7,
        stop_sequences: config.stopSequences,
      };
      
      if (systemPrompt) {
        requestBody.system = systemPrompt;
      }
    } else {
      // Fallback to Claude format for unknown models
      requestBody = {
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: config.maxTokens || 2000,
        messages,
        temperature: config.temperature ?? 0.7,
        stop_sequences: config.stopSequences,
      };
      
      if (systemPrompt) {
        requestBody.system = systemPrompt;
      }
    }

    const input: InvokeModelCommandInput = {
      modelId: config.model,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(requestBody),
    };

    try {
      const result = await this.invokeWithRetry(input, isNova, isClaude, config.model, startTime);
      return result;
    } catch (error) {
      // Log failed invocation
      const latencyMs = Date.now() - startTime;
      this.logBedrockInvocation({
        model: config.model,
        latencyMs,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Invokes the Bedrock model with retry logic for transient failures.
   * Uses exponential backoff strategy.
   * 
   * @param input - The InvokeModelCommandInput
   * @param isNova - Whether the model is Amazon Nova
   * @param isClaude - Whether the model is Claude (Anthropic)
   * @param modelId - The model ID for logging
   * @param startTime - The start time for latency calculation
   * @returns The text response from the model
   * @throws Error after max retries or for non-retryable errors
   */
  private async invokeWithRetry(
    input: InvokeModelCommandInput, 
    isNova: boolean = false, 
    isClaude: boolean = false,
    modelId?: string,
    startTime?: number
  ): Promise<string> {
    let lastError: Error | undefined;
    let delay = this.retryConfig.initialDelayMs;

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        const command = new InvokeModelCommand(input);
        const response = await this.client.send(command);

        if (!response.body) {
          throw new Error('Empty response body from Bedrock');
        }

        const responseText = new TextDecoder().decode(response.body);
        
        if (isNova) {
          // Parse Nova response
          const responseBody = JSON.parse(responseText) as NovaResponseBody;
          
          if (!responseBody.output?.message?.content || responseBody.output.message.content.length === 0) {
            throw new Error('No content in Bedrock response');
          }

          // Log successful invocation with token counts
          if (modelId && startTime !== undefined) {
            this.logBedrockInvocation({
              model: modelId,
              inputTokens: responseBody.usage?.inputTokens,
              outputTokens: responseBody.usage?.outputTokens,
              latencyMs: Date.now() - startTime,
              success: true
            });
          }

          return responseBody.output.message.content[0].text;
        } else if (isClaude) {
          // Parse Claude response (Anthropic models)
          const responseBody = JSON.parse(responseText) as ClaudeResponseBody;

          if (!responseBody.content || responseBody.content.length === 0) {
            throw new Error('No content in Bedrock response');
          }

          const textContent = responseBody.content.find((c) => c.type === 'text');
          if (!textContent) {
            throw new Error('No text content in Bedrock response');
          }

          // Log successful invocation with token counts
          if (modelId && startTime !== undefined) {
            this.logBedrockInvocation({
              model: modelId,
              inputTokens: responseBody.usage?.input_tokens,
              outputTokens: responseBody.usage?.output_tokens,
              latencyMs: Date.now() - startTime,
              success: true
            });
          }

          return textContent.text;
        } else {
          // Fallback: try Claude format first, then Nova
          try {
            const responseBody = JSON.parse(responseText) as ClaudeResponseBody;
            if (responseBody.content && responseBody.content.length > 0) {
              const textContent = responseBody.content.find((c) => c.type === 'text');
              if (textContent) {
                // Log successful invocation
                if (modelId && startTime !== undefined) {
                  this.logBedrockInvocation({
                    model: modelId,
                    inputTokens: responseBody.usage?.input_tokens,
                    outputTokens: responseBody.usage?.output_tokens,
                    latencyMs: Date.now() - startTime,
                    success: true
                  });
                }
                return textContent.text;
              }
            }
          } catch {
            // Try Nova format
            const responseBody = JSON.parse(responseText) as NovaResponseBody;
            if (responseBody.output?.message?.content && responseBody.output.message.content.length > 0) {
              // Log successful invocation
              if (modelId && startTime !== undefined) {
                this.logBedrockInvocation({
                  model: modelId,
                  inputTokens: responseBody.usage?.inputTokens,
                  outputTokens: responseBody.usage?.outputTokens,
                  latencyMs: Date.now() - startTime,
                  success: true
                });
              }
              return responseBody.output.message.content[0].text;
            }
          }
          throw new Error('Unable to parse Bedrock response');
        }
      } catch (error) {
        lastError = error as Error;

        // Check if error is retryable
        if (!this.isRetryableError(error)) {
          throw this.enhanceError(error);
        }

        // Don't retry if we've exhausted attempts
        if (attempt >= this.retryConfig.maxRetries) {
          break;
        }

        // Log retry attempt with structured logging
        this.logRetryAttempt(attempt, this.retryConfig.maxRetries, lastError.message, delay);

        // Wait before retrying
        await this.sleep(delay);

        // Calculate next delay with exponential backoff
        delay = Math.min(
          delay * this.retryConfig.backoffMultiplier,
          this.retryConfig.maxDelayMs
        );
      }
    }

    // All retries exhausted
    throw new Error(
      `Bedrock invocation failed after ${this.retryConfig.maxRetries + 1} attempts: ${lastError?.message}`
    );
  }

  /**
   * Determines if an error is retryable (transient failure).
   * 
   * @param error - The error to check
   * @returns true if the error is retryable
   */
  private isRetryableError(error: unknown): boolean {
    if (!error) return false;

    // Check for specific AWS SDK error types
    if (
      error instanceof ThrottlingException ||
      error instanceof ModelTimeoutException ||
      error instanceof ServiceUnavailableException
    ) {
      return true;
    }

    // Check for ModelNotReadyException (model is loading)
    if (error instanceof ModelNotReadyException) {
      return true;
    }

    // Check for network errors
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      if (
        message.includes('network') ||
        message.includes('timeout') ||
        message.includes('econnreset') ||
        message.includes('econnrefused')
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Enhances error messages with user-friendly descriptions.
   * 
   * @param error - The original error
   * @returns Enhanced error with better message
   */
  private enhanceError(error: unknown): Error {
    if (error instanceof ThrottlingException) {
      return new Error(
        'Bedrock API rate limit exceeded. Please try again in a few moments.'
      );
    }

    if (error instanceof ModelNotReadyException) {
      return new Error(
        'The requested model is not ready. Please try again in a few moments.'
      );
    }

    if (error instanceof ModelTimeoutException) {
      return new Error(
        'The model request timed out. Please try again with a shorter prompt or lower max_tokens.'
      );
    }

    if (error instanceof ServiceUnavailableException) {
      return new Error(
        'Bedrock service is temporarily unavailable. Please try again later.'
      );
    }

    if (error instanceof Error) {
      // Check for access denied errors
      if (error.message.includes('AccessDeniedException')) {
        return new Error(
          'Access denied to Bedrock model. Please check IAM permissions.'
        );
      }

      // Check for validation errors
      if (error.message.includes('ValidationException')) {
        return new Error(
          `Invalid request to Bedrock: ${error.message}`
        );
      }

      return error;
    }

    return new Error('Unknown error occurred while invoking Bedrock');
  }

  /**
   * Sleep utility for retry delays.
   * 
   * @param ms - Milliseconds to sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Log Bedrock invocation metrics in structured JSON format
   */
  private logBedrockInvocation(params: {
    model: string;
    inputTokens?: number;
    outputTokens?: number;
    latencyMs: number;
    success: boolean;
    error?: string;
  }) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      service: 'bedrock',
      operation: 'invoke_model',
      model: params.model,
      inputTokens: params.inputTokens,
      outputTokens: params.outputTokens,
      totalTokens: (params.inputTokens || 0) + (params.outputTokens || 0),
      latencyMs: params.latencyMs,
      success: params.success,
      error: params.error
    };

    if (params.success) {
      console.log(JSON.stringify(logEntry));
    } else {
      console.error(JSON.stringify(logEntry));
    }
  }

  /**
   * Log retry attempts in structured JSON format
   */
  private logRetryAttempt(attempt: number, maxRetries: number, errorMessage: string, delayMs: number) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      service: 'bedrock',
      operation: 'retry',
      attempt: attempt + 1,
      maxAttempts: maxRetries + 1,
      errorMessage,
      nextRetryDelayMs: delayMs
    };

    console.warn(JSON.stringify(logEntry));
  }

  /**
   * Helper method to select the appropriate model based on task complexity and cost requirements.
   * 
   * @param isComplexTask - Whether the task requires a more capable model
   * @param preferClaude - Whether to prefer Claude models (requires marketplace subscription)
   * @returns The recommended model
   */
  static selectModel(isComplexTask: boolean, preferClaude: boolean = false): ClaudeModel {
    if (preferClaude) {
      // Use Claude models (requires AWS Marketplace subscription)
      // Claude 3.5 Sonnet: Best quality but 50x more expensive than Nova Lite
      // Claude 3 Haiku: Good balance but still 4x more expensive than Nova Lite
      return isComplexTask ? ClaudeModel.CLAUDE_3_5_SONNET : ClaudeModel.CLAUDE_3_HAIKU;
    } else {
      // Use Amazon Nova models (no marketplace subscription needed)
      // Nova Lite: Very cost-effective for most tasks ($0.06/$0.24 per 1M tokens)
      // Nova Micro: Cheapest option for simple tasks ($0.035/$0.14 per 1M tokens)
      return isComplexTask ? ClaudeModel.NOVA_LITE : ClaudeModel.NOVA_MICRO;
    }
  }
}
