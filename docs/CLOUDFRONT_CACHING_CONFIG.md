# CloudFront Caching Configuration

## Overview

This document describes the CloudFront caching configuration for the CTC Tutor application. The configuration optimizes content delivery, reduces S3 requests, and improves frontend load times.

## Configuration Details

### Cache Policy

The CloudFront distribution uses AWS Managed Cache Policy **CachingOptimized** (ID: `658327ea-f89d-4fab-a63d-7e88639e58f6`).

**Benefits:**
- Optimized for static content delivery
- Automatically caches based on query strings, headers, and cookies
- Includes built-in compression for text assets (HTML, CSS, JS)
- 24-hour default TTL for static assets
- Up to 1 year maximum TTL for versioned assets

### Cache Behavior

```yaml
DefaultCacheBehavior:
  TargetOriginId: S3Origin
  ViewerProtocolPolicy: redirect-to-https
  AllowedMethods: [GET, HEAD, OPTIONS]
  CachedMethods: [GET, HEAD]
  CachePolicyId: 658327ea-f89d-4fab-a63d-7e88639e58f6  # Managed-CachingOptimized
  Compress: true
```

### Compression

**Enabled for:**
- HTML files
- CSS files
- JavaScript files
- JSON files
- SVG files
- Text files

**Compression Method:** Gzip and Brotli (automatic based on client support)

### Cache TTL Settings

| Asset Type | Cache-Control Header | TTL |
|-----------|---------------------|-----|
| Static assets (JS, CSS, images) | `public, max-age=31536000, immutable` | 1 year |
| index.html | `no-cache, no-store, must-revalidate` | No cache |
| service-worker.js | `no-cache, no-store, must-revalidate` | No cache |

### Cache Invalidation

Cache invalidation is automatically handled during deployment:

```bash
# Deployment script automatically invalidates cache
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"
```

**When cache is invalidated:**
- After every deployment
- When frontend files are updated
- Ensures users always get the latest version

## Performance Benefits

### 1. Reduced S3 Requests
- Static assets cached at CloudFront edge locations
- Reduces origin (S3) requests by ~95%
- Lower S3 costs

### 2. Improved Load Times
- Content served from edge locations closest to users
- Reduced latency for users across India
- Target: <2 seconds page load time for 90% of requests

### 3. Bandwidth Optimization
- Automatic compression reduces transfer size by 60-80%
- Lower CloudFront data transfer costs
- Faster downloads on slower connections

## Monitoring

### CloudWatch Metrics

Monitor cache performance in CloudWatch:

```
Metrics to track:
- CacheHitRate: Should be >90% after warm-up
- BytesDownloaded: Total data transferred
- Requests: Total number of requests
- 4xxErrorRate: Client errors
- 5xxErrorRate: Server errors
```

### Cache Hit Rate

**Expected performance:**
- First deployment: 0% (cold cache)
- After 1 hour: 70-80%
- After 24 hours: 90-95%
- Steady state: >95%

## Troubleshooting

### Issue: Changes not visible after deployment

**Solution:**
```bash
# Manually invalidate cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

### Issue: Low cache hit rate

**Possible causes:**
1. Frequent deployments (cache invalidations)
2. Query string variations
3. Cookie variations

**Solution:**
- Review cache policy settings
- Check if query strings are necessary
- Verify cache-control headers on S3 objects

### Issue: Stale content served

**Solution:**
- Verify cache invalidation ran successfully
- Check CloudFront distribution status
- Wait 5-10 minutes for invalidation to propagate

## Cost Optimization

### Free Tier Benefits

AWS CloudFront Free Tier includes:
- 1 TB data transfer out per month
- 10,000,000 HTTP/HTTPS requests per month

### Cost Savings

With 95% cache hit rate:
- **S3 requests reduced:** 95% fewer GET requests
- **Data transfer:** Reduced by compression (60-80%)
- **Estimated monthly cost:** <$1 for hackathon demo period

## Best Practices

1. **Versioned Assets:** Use content hashing for JS/CSS files (e.g., `main.abc123.js`)
2. **Long TTL:** Set 1-year cache for versioned assets
3. **No Cache for HTML:** Always fetch fresh `index.html` to get latest asset references
4. **Compression:** Enable for all text-based assets
5. **Invalidation:** Only invalidate when necessary (costs $0.005 per path)

## References

- [AWS CloudFront Cache Policies](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/controlling-the-cache-key.html)
- [AWS Managed Cache Policies](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-cache-policies.html)
- [CloudFront Compression](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/ServingCompressedFiles.html)

---

**Last Updated:** 2024
**Configuration File:** `backend/template.yaml`
**Deployment Script:** `deploy-aws.sh`
