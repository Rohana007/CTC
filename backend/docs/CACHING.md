# Lambda Response Caching

## Overview

The Lambda functions implement in-memory caching to reduce Amazon Bedrock API invocations and improve response times for frequently requested content. This caching layer persists across warm Lambda invocations, providing significant cost savings and performance improvements.

## Architecture

### Cache Implementation

The caching system uses a centralized `LambdaCache` utility class located in `backend/src/lambda/utils/cache.ts`. This class provides:

- **Type-safe caching**: Generic type support for cached values
- **Automatic expiration**: TTL-based cache invalidation
- **Simple API**: Get, set, has, clear, and prune operations
- **Memory efficient**: Automatic cleanup of expired entries

### Cache Persistence

The cache is stored in the Lambda function's global scope, which means:

- **Warm invocations**: Cache persists across multiple invocations of the same Lambda container
- **Cold starts**: Cache is empty when a new Lambda container is initialized
- **No cross-container sharing**: Each Lambda container has its own independent cache

## Cached Endpoints

### 1. Dictionary Service

**Handler**: `backend/src/lambda/handlers/dictionaryService.ts`

**Cache Configuration**:
- **TTL**: 24 hours (1 day)
- **Cache Key**: `{word}:{language}`
- **Rationale**: Dictionary definitions are static and rarely change

**Example**:
```typescript
// Request: { word: "recursion", language: "en" }
// Cache Key: "recursion:en"
// TTL: 24 hours
```

### 2. Concept Explainer

**Handler**: `backend/src/lambda/handlers/conceptExplainer.ts`

**Cache Configuration**:
- **TTL**: 1 hour
- **Cache Key**: `{topic}:{language}:{complexity}`
- **Conditional Caching**: Only caches simple requests without `repeatedQueries` or `confusionPatterns`
- **Rationale**: Concept explanations are relatively stable but may need updates more frequently than dictionary entries

**Example**:
```typescript
// Request: { topic: "binary search", language: "en", complexity: "beginner" }
// Cache Key: "binary search:en:beginner"
// TTL: 1 hour

// Personalized requests are NOT cached:
// Request: { topic: "binary search", repeatedQueries: ["what is recursion"] }
// Not cached - personalized response
```

## Cache TTL Constants

The `CacheTTL` object provides predefined TTL values:

```typescript
export const CacheTTL = {
  ONE_HOUR: 60 * 60 * 1000,        // 3,600,000 ms
  SIX_HOURS: 6 * 60 * 60 * 1000,   // 21,600,000 ms
  TWELVE_HOURS: 12 * 60 * 60 * 1000, // 43,200,000 ms
  ONE_DAY: 24 * 60 * 60 * 1000,    // 86,400,000 ms
  ONE_WEEK: 7 * 24 * 60 * 60 * 1000 // 604,800,000 ms
};
```

## Usage Example

### Creating a Cache

```typescript
import { LambdaCache, CacheTTL } from '../utils/cache';

// Create a cache with 1-hour TTL
const cache = new LambdaCache<MyDataType>(CacheTTL.ONE_HOUR);
```

### Checking and Retrieving from Cache

```typescript
const cacheKey = `${param1}:${param2}`;
const cached = cache.get(cacheKey);

if (cached) {
  // Cache hit - return cached data
  return successResponse(cached, 200, { 
    requestId: context.awsRequestId, 
    duration: Date.now() - startTime,
    cached: true 
  });
}
```

### Storing in Cache

```typescript
const result = await aiService.someOperation(params);

// Store result in cache
cache.set(cacheKey, result);

return successResponse(result, 200, { 
  requestId: context.awsRequestId, 
  duration: Date.now() - startTime 
});
```

## Cache Monitoring

### Response Metadata

Cached responses include a `cached: true` flag in the metadata:

```json
{
  "success": true,
  "data": { ... },
  "metadata": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "requestId": "abc-123-def",
    "duration": 5,
    "cached": true
  }
}
```

### CloudWatch Logs

Cache hits are logged with the following format:

```
INFO Cache hit { word: "recursion", language: "en" }
INFO Cache hit { topic: "binary search", language: "en", complexity: "beginner" }
```

## Performance Impact

### Expected Improvements

| Metric | Without Cache | With Cache (Hit) | Improvement |
|--------|---------------|------------------|-------------|
| Response Time | 1000-3000ms | 5-50ms | 95-98% faster |
| Bedrock API Calls | 1 per request | 0 (cache hit) | 100% reduction |
| Lambda Duration | 1000-3000ms | 5-50ms | 95-98% reduction |
| Cost per Request | ~$0.0001 | ~$0.000001 | 99% reduction |

### Cache Hit Rate Estimation

Based on typical usage patterns:

- **Dictionary Service**: 70-80% hit rate (common terms requested frequently)
- **Concept Explainer**: 40-60% hit rate (popular topics requested by multiple users)

## Cost Savings

### Bedrock API Cost Reduction

Assuming:
- 10,000 requests/day
- 50% cache hit rate
- $0.0001 per Bedrock invocation

**Without caching**: 10,000 × $0.0001 = $1.00/day = $30/month

**With caching**: 5,000 × $0.0001 = $0.50/day = $15/month

**Savings**: $15/month (50% reduction)

### Lambda Cost Reduction

Cached responses execute faster, reducing Lambda compute costs:

- **Reduced duration**: 95% faster execution
- **Reduced memory usage**: Less time in memory
- **Estimated savings**: 40-50% on Lambda costs

## Cache Management

### Manual Cache Operations

The `LambdaCache` class provides management methods:

```typescript
// Check if key exists (and is not expired)
if (cache.has(cacheKey)) {
  // Key exists
}

// Get cache size
const size = cache.size();

// Clear all entries
cache.clear();

// Remove expired entries
cache.prune();
```

### Automatic Expiration

Expired entries are automatically removed when:
1. `get()` is called on an expired key
2. `has()` is called on an expired key
3. `prune()` is called manually

## Best Practices

### When to Cache

✅ **DO cache**:
- Static content (dictionary definitions, common concepts)
- Frequently requested content
- Expensive operations (Bedrock API calls)
- Content that doesn't change often

❌ **DON'T cache**:
- Personalized responses (with user context)
- Time-sensitive data
- User-specific data
- Responses with dynamic elements

### Cache Key Design

Good cache keys should be:
- **Unique**: Different inputs produce different keys
- **Consistent**: Same inputs always produce the same key
- **Readable**: Easy to understand in logs
- **Compact**: Not excessively long

Example:
```typescript
// Good: Clear, unique, consistent
const cacheKey = `${word}:${language}`;

// Bad: Not unique enough
const cacheKey = word;

// Bad: Too complex
const cacheKey = JSON.stringify({ word, language, timestamp: Date.now() });
```

### TTL Selection

Choose TTL based on content characteristics:

- **Static content**: 1 day to 1 week
- **Semi-static content**: 1-6 hours
- **Dynamic content**: Don't cache or use very short TTL (5-15 minutes)

## Limitations

### Memory Constraints

Lambda functions have memory limits (512MB-1024MB in this application). The cache should not exceed:

- **Recommended**: < 10% of Lambda memory (50-100MB)
- **Maximum**: < 25% of Lambda memory (125-250MB)

### No Cross-Container Sharing

Each Lambda container has its own cache. This means:

- Cache is not shared across multiple concurrent Lambda instances
- Cache hit rate may be lower during high-traffic periods with many containers
- Consider using ElastiCache or DynamoDB for shared caching if needed

### Cold Start Impact

Cache is empty on cold starts:

- First request to a new container will always be a cache miss
- Subsequent requests benefit from caching
- Provisioned concurrency can help maintain warm containers with populated caches

## Future Enhancements

Potential improvements for the caching system:

1. **Distributed Cache**: Use ElastiCache (Redis) for shared caching across Lambda instances
2. **Cache Warming**: Pre-populate cache with common requests
3. **Cache Analytics**: Track hit rates, popular keys, and cache effectiveness
4. **Adaptive TTL**: Adjust TTL based on request patterns
5. **Cache Invalidation API**: Endpoint to manually invalidate specific cache entries
6. **LRU Eviction**: Implement Least Recently Used eviction when cache size limit is reached

## Testing

### Unit Tests

The cache utility includes comprehensive unit tests in `backend/src/lambda/utils/cache.test.ts`:

- Basic operations (get, set, has, clear)
- TTL expiration
- Complex data types (objects, arrays)
- Cache pruning

### Integration Testing

To test caching in Lambda handlers:

1. Make the same request twice
2. Check response metadata for `cached: true` on second request
3. Verify response time is significantly faster on second request
4. Check CloudWatch logs for "Cache hit" messages

## Monitoring and Debugging

### CloudWatch Metrics

Monitor cache effectiveness using CloudWatch Logs Insights:

```sql
-- Cache hit rate
fields @timestamp, @message
| filter @message like /Cache hit/
| stats count() as cache_hits by bin(5m)

-- Response times (cached vs uncached)
fields @timestamp, metadata.duration, metadata.cached
| stats avg(metadata.duration) by metadata.cached
```

### Debugging Cache Issues

If cache is not working as expected:

1. **Check CloudWatch logs** for cache hit/miss messages
2. **Verify cache key** is consistent across requests
3. **Check TTL** hasn't expired
4. **Verify Lambda container** is warm (not cold start)
5. **Check memory usage** to ensure cache isn't being cleared due to memory pressure

## Conclusion

The Lambda response caching layer provides significant performance and cost benefits by reducing Bedrock API invocations for frequently requested content. The implementation is simple, type-safe, and easy to maintain, with clear monitoring and debugging capabilities.

For questions or issues, refer to the implementation in:
- `backend/src/lambda/utils/cache.ts` - Cache utility
- `backend/src/lambda/handlers/dictionaryService.ts` - Dictionary caching example
- `backend/src/lambda/handlers/conceptExplainer.ts` - Concept explainer caching example
