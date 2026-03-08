/**
 * API Client Tests
 * 
 * Basic tests to verify API client functionality
 */

import { ApiClient } from '../api';

describe('ApiClient', () => {
  let apiClient: ApiClient;

  beforeEach(() => {
    apiClient = new ApiClient('https://api.example.com');
  });

  describe('URL building', () => {
    it('should build correct URLs with base URL', () => {
      expect(apiClient.getBaseUrl()).toBe('https://api.example.com');
    });

    it('should handle base URL with trailing slash', () => {
      const client = new ApiClient('https://api.example.com/');
      expect(client.getBaseUrl()).toBe('https://api.example.com/');
    });

    it('should allow updating base URL', () => {
      apiClient.setBaseUrl('https://new-api.example.com');
      expect(apiClient.getBaseUrl()).toBe('https://new-api.example.com');
    });
  });

  describe('Request methods', () => {
    beforeEach(() => {
      global.fetch = jest.fn();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should make GET requests', async () => {
      const mockResponse = { data: 'test' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiClient.get('/test');
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({
          method: 'GET',
          mode: 'cors',
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should make POST requests with data', async () => {
      const mockResponse = { success: true };
      const postData = { name: 'test' };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiClient.post('/test', postData);
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(postData),
          mode: 'cors',
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(apiClient.get('/test')).rejects.toThrow('GET /test failed: 404 Not Found');
    });
  });

  describe('Retry logic', () => {
    beforeEach(() => {
      global.fetch = jest.fn();
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.resetAllMocks();
      jest.useRealTimers();
    });

    it('should retry on network errors', async () => {
      const mockResponse = { data: 'success' };
      
      // Fail twice, then succeed
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new TypeError('Failed to fetch'))
        .mockRejectedValueOnce(new TypeError('Failed to fetch'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

      const promise = apiClient.get('/test');
      
      // Fast-forward through retry delays
      await jest.runAllTimersAsync();
      
      const result = await promise;
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should retry on 503 status', async () => {
      const mockResponse = { data: 'success' };
      
      // Fail with 503, then succeed
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
          statusText: 'Service Unavailable',
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

      const promise = apiClient.get('/test');
      
      // Fast-forward through retry delays
      await jest.runAllTimersAsync();
      
      const result = await promise;
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('CORS handling', () => {
    beforeEach(() => {
      global.fetch = jest.fn();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should set CORS mode and headers', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await apiClient.get('/test');
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          mode: 'cors',
          credentials: 'omit',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });
  });
});
