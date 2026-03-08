# API Client Service

Centralized API client for making HTTP requests to the backend API with built-in retry logic, CORS handling, and error management.

## Features

- **Environment-based Configuration**: Automatically uses the correct API base URL based on environment variables
- **Retry Logic**: Automatically retries failed requests with exponential backoff
- **CORS Support**: Properly configured CORS headers for cross-origin requests
- **Type Safety**: Full TypeScript support with generic types
- **Error Handling**: Standardized error handling across all requests

## Usage

### Basic Usage

```typescript
import { apiClient } from '../services/api';

// GET request
const data = await apiClient.get('/api/concepts/explain');

// POST request
const result = await apiClient.post('/api/code-analysis/analyze', {
  code: 'console.log("Hello")',
  language: 'javascript'
});

// PUT request
const updated = await apiClient.put('/api/project-context/123', {
  name: 'Updated Project'
});

// DELETE request
await apiClient.delete('/api/project-context/123');
```

### With Type Safety

```typescript
interface ConceptResponse {
  explanation: string;
  examples: string[];
}

const data = await apiClient.get<ConceptResponse>('/api/concepts/explain');
// data is typed as ConceptResponse
```

### Custom Retry Configuration

```typescript
// Override default retry settings for a specific request
const data = await apiClient.get('/api/data', {
  retries: 5,           // Max 5 retries (default: 3)
  retryDelay: 2000,     // Start with 2 second delay (default: 1000ms)
});
```

### Error Handling

```typescript
try {
  const data = await apiClient.post('/api/endpoint', { data: 'value' });
} catch (error) {
  console.error('Request failed:', error.message);
  // Handle error appropriately
}
```

## Configuration

The API client uses the `API_BASE_URL` from `config.ts`, which is determined by:

1. `REACT_APP_API_URL` environment variable (if set)
2. Production URL if `NODE_ENV === 'production'`
3. `http://localhost:3001` for development

### Environment Variables

Set in `.env.production`:
```
REACT_APP_API_URL=https://your-api-gateway-url.amazonaws.com
```

## Retry Behavior

The client automatically retries requests in the following scenarios:

### Retryable HTTP Status Codes
- `408` - Request Timeout
- `429` - Too Many Requests
- `500` - Internal Server Error
- `502` - Bad Gateway
- `503` - Service Unavailable
- `504` - Gateway Timeout

### Retryable Network Errors
- "Failed to fetch"
- "NetworkError"
- "Network request failed"

### Retry Strategy
- **Max Retries**: 3 (configurable)
- **Initial Delay**: 1 second
- **Backoff**: Exponential (2x multiplier)
- **Delays**: 1s, 2s, 4s

## CORS Configuration

The client is configured with:
- `mode: 'cors'` - Explicit CORS mode
- `credentials: 'omit'` - No credentials sent (can be overridden)
- `Content-Type: application/json` - Default content type

## Advanced Usage

### Custom Headers

```typescript
const data = await apiClient.get('/api/endpoint', {
  headers: {
    'Authorization': 'Bearer token',
    'X-Custom-Header': 'value'
  }
});
```

### Changing Base URL

```typescript
// Useful for testing or multi-environment setups
apiClient.setBaseUrl('https://staging-api.example.com');
```

### Getting Current Base URL

```typescript
const currentUrl = apiClient.getBaseUrl();
console.log('Using API:', currentUrl);
```

## Migration from Direct Fetch

### Before (Direct fetch)
```typescript
const response = await fetch('http://localhost:3001/api/endpoint', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});

if (!response.ok) {
  throw new Error(`HTTP error! status: ${response.status}`);
}

const result = await response.json();
```

### After (API Client)
```typescript
const result = await apiClient.post('/api/endpoint', data);
```

## Testing

The API client can be easily mocked in tests:

```typescript
import { ApiClient } from '../services/api';

// Create a test instance
const testClient = new ApiClient('https://test-api.example.com');

// Mock fetch
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ data: 'test' })
});

// Use in tests
const result = await testClient.get('/test');
```

## Best Practices

1. **Always use the singleton instance** (`apiClient`) unless you need a custom configuration
2. **Let the retry logic handle transient failures** - don't implement your own retry logic
3. **Use TypeScript generics** for type-safe responses
4. **Handle errors appropriately** - the client throws errors for failed requests
5. **Don't hardcode URLs** - use relative paths and let the client handle the base URL

## Troubleshooting

### CORS Errors
If you see CORS errors, ensure:
- API Gateway has CORS enabled
- CloudFront distribution allows the correct origins
- The API returns proper CORS headers

### Retry Exhaustion
If requests fail after all retries:
- Check network connectivity
- Verify the API endpoint is correct
- Check API Gateway/Lambda logs for errors
- Consider increasing retry count for specific endpoints

### Environment Configuration
If the wrong API URL is being used:
- Check `.env.production` file
- Verify `REACT_APP_API_URL` is set correctly
- Rebuild the frontend after changing environment variables
