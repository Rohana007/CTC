/**
 * API Client Service
 * 
 * Centralized API client with:
 * - Environment-based base URL configuration
 * - CORS header handling
 * - Retry logic for transient failures
 * - Standardized error handling
 */

import { API_BASE_URL } from '../config';

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const RETRY_DELAY_MULTIPLIER = 2; // Exponential backoff

// HTTP status codes that should trigger a retry
const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];

// Network errors that should trigger a retry
const RETRYABLE_ERRORS = ['Failed to fetch', 'NetworkError', 'Network request failed'];

interface RequestOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
}

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Check if an error is retryable
 */
const isRetryableError = (error: any, response?: Response): boolean => {
  // Check for network errors
  if (error instanceof TypeError && 
      RETRYABLE_ERRORS.some(msg => error.message.includes(msg))) {
    return true;
  }
  
  // Check for retryable HTTP status codes
  if (response && RETRYABLE_STATUS_CODES.includes(response.status)) {
    return true;
  }
  
  return false;
};

/**
 * Enhanced fetch with retry logic and CORS handling
 */
const fetchWithRetry = async (
  url: string,
  options: RequestOptions = {}
): Promise<Response> => {
  const {
    retries = MAX_RETRIES,
    retryDelay = INITIAL_RETRY_DELAY,
    ...fetchOptions
  } = options;

  // Ensure CORS headers are set
  const headers = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  const requestOptions: RequestInit = {
    ...fetchOptions,
    headers,
    mode: 'cors', // Explicitly set CORS mode
    credentials: 'omit', // Don't send credentials unless needed
  };

  let lastError: Error | null = null;
  let lastResponse: Response | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, requestOptions);
      
      // If response is ok, return it
      if (response.ok) {
        return response;
      }
      
      // Store the response for potential retry decision
      lastResponse = response;
      
      // Check if we should retry
      if (attempt < retries && isRetryableError(null, response)) {
        const delay = retryDelay * Math.pow(RETRY_DELAY_MULTIPLIER, attempt);
        console.warn(
          `Request failed with status ${response.status}. ` +
          `Retrying in ${delay}ms... (Attempt ${attempt + 1}/${retries})`
        );
        await sleep(delay);
        continue;
      }
      
      // If not retryable or out of retries, return the response
      // (caller will handle the error based on status)
      return response;
      
    } catch (error) {
      lastError = error as Error;
      
      // Check if we should retry
      if (attempt < retries && isRetryableError(error)) {
        const delay = retryDelay * Math.pow(RETRY_DELAY_MULTIPLIER, attempt);
        console.warn(
          `Request failed with error: ${lastError.message}. ` +
          `Retrying in ${delay}ms... (Attempt ${attempt + 1}/${retries})`
        );
        await sleep(delay);
        continue;
      }
      
      // If not retryable or out of retries, throw the error
      throw lastError;
    }
  }
  
  // This should never be reached, but TypeScript needs it
  if (lastResponse) {
    return lastResponse;
  }
  throw lastError || new Error('Request failed after retries');
};

/**
 * API Client class
 */
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Build full URL from endpoint
   */
  private buildUrl(endpoint: string): string {
    // Remove leading slash from endpoint if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    
    // Ensure baseUrl doesn't end with slash
    const cleanBaseUrl = this.baseUrl.endsWith('/') 
      ? this.baseUrl.slice(0, -1) 
      : this.baseUrl;
    
    return `${cleanBaseUrl}/${cleanEndpoint}`;
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = this.buildUrl(endpoint);
    const response = await fetchWithRetry(url, {
      method: 'GET',
      ...options,
    });

    if (!response.ok) {
      throw new Error(`GET ${endpoint} failed: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    
    // Unwrap Lambda response format { success: true, data: {...} }
    if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
      return json.data;
    }
    
    return json;
  }

  /**
   * POST request
   */
  async post<T = any>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = this.buildUrl(endpoint);
    const response = await fetchWithRetry(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });

    if (!response.ok) {
      throw new Error(`POST ${endpoint} failed: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    
    // Unwrap Lambda response format { success: true, data: {...} }
    if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
      return json.data;
    }
    
    return json;
  }

  /**
   * PUT request
   */
  async put<T = any>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = this.buildUrl(endpoint);
    const response = await fetchWithRetry(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });

    if (!response.ok) {
      throw new Error(`PUT ${endpoint} failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = this.buildUrl(endpoint);
    const response = await fetchWithRetry(url, {
      method: 'DELETE',
      ...options,
    });

    if (!response.ok) {
      throw new Error(`DELETE ${endpoint} failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Update base URL (useful for testing or dynamic configuration)
   */
  setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl;
  }

  /**
   * Get current base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for testing
export { ApiClient };

// Export types
export type { RequestOptions };
