# Cold Start Optimization Verification Checklist

Use this checklist to verify the cold start optimizations are working correctly.

## Pre-Deployment Verification

### 1. Install Dependencies
```bash
cd backend
npm install
```

Expected: esbuild should be installed in devDependencies

### 2. Build Lambda Functions
```bash
bash scripts/build-lambda.sh
```

Expected output:
- ✅ All 5 handlers built successfully
- 📦 Bundle sizes displayed (should be 50-200 KB each)
- No build errors

### 3. Verify Bundle Structure
```bash
ls -lh dist/lambda/handlers/
```

Expected:
- 5 .js files (one per handler)
- 5 .js.map files (sourcemaps)
- Total size < 1 MB for all bundles combined

### 4. Build Lambda Layer
```bash
bash scripts/build-layer.sh
```

Expected:
- ✅ Layer built successfully
- lambda-layer.zip created (~2-3 MB)

### 5. Verify Layer Contents
```bash
unzip -l lambda-layer.zip | grep bedrock
```

Expected:
- AWS SDK Bedrock Runtime client present in nodejs/node_modules

## Deployment Verification

### 1. SAM Build
```bash
sam build
```

Expected:
- All 5 functions build successfully
- SharedDependenciesLayer builds successfully
- No errors

### 2. SAM Deploy
```bash
sam deploy --guided
```

Expected:
- Stack deploys successfully
- All functions created
- Layer created and attached to functions
- API Gateway endpoints created

### 3. Verify Layer Attachment
```bash
aws lambda get-function --function-name <function-name> --query 'Configuration.Layers'
```

Expected:
- Layer ARN present in output
- Layer version matches deployed version

## Runtime Verification

### 1. Test Cold Start
```bash
# Invoke function after it hasn't been used for 15+ minutes
aws lambda invoke \
  --function-name ConceptExplainerFunction \
  --payload '{"body": "{\"topic\": \"variables\"}"}' \
  response.json
```

Expected:
- Function executes successfully
- Check CloudWatch Logs for InitDuration

### 2. Check CloudWatch Logs
```bash
aws logs tail /aws/lambda/ConceptExplainerFunction --follow
```

Look for:
- `REPORT` lines with `Init Duration`
- Init Duration should be 300-500 ms
- Total duration (cold start) should be < 3 seconds

### 3. CloudWatch Logs Insights Query
```
fields @timestamp, @initDuration, @duration, @memorySize
| filter @type = "REPORT"
| filter ispresent(@initDuration)
| sort @timestamp desc
| limit 20
```

Expected:
- Init durations: 300-500 ms
- Memory used: < 200 MB for most functions
- Cold start frequency: < 5% of invocations

### 4. Test Warm Start
```bash
# Invoke immediately after cold start
aws lambda invoke \
  --function-name ConceptExplainerFunction \
  --payload '{"body": "{\"topic\": \"variables\"}"}' \
  response.json
```

Expected:
- No Init Duration in logs
- Duration: 100-500 ms (much faster than cold start)

## Performance Benchmarks

### Target Metrics
- ✅ Cold start time: < 3 seconds (Requirement 2.10)
- ✅ Init duration: 300-500 ms
- ✅ Warm start: 100-500 ms
- ✅ Bundle size: < 200 KB per function
- ✅ Layer size: 2-3 MB

### Comparison Table

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Deployment package | 8-12 MB | 50-200 KB | 95% reduction |
| Cold start time | 2-4 sec | 1-2 sec | 50% faster |
| Init duration | 1-2 sec | 300-500 ms | 75% faster |
| Memory usage | ~300 MB | ~150 MB | 50% reduction |

## Troubleshooting

### Issue: Large Bundle Sizes

**Symptoms:** Bundles > 500 KB

**Solution:**
1. Check for unnecessary imports
2. Verify AWS SDK is externalized
3. Run bundle analyzer:
   ```bash
   node esbuild.config.js --metafile=meta.json
   ```

### Issue: Layer Not Attached

**Symptoms:** Functions still have large packages

**Solution:**
1. Verify layer exists:
   ```bash
   aws lambda list-layers
   ```
2. Check SAM template has layer reference
3. Redeploy with `sam deploy --force-upload`

### Issue: Slow Cold Starts

**Symptoms:** Init duration > 1 second

**Solution:**
1. Check CloudWatch Logs for errors during init
2. Verify memory allocation (increase if needed)
3. Check for synchronous initialization code
4. Review imports for heavy dependencies

### Issue: Build Failures

**Symptoms:** esbuild errors

**Solution:**
1. Verify all TypeScript compiles: `npx tsc --noEmit`
2. Check for missing dependencies
3. Review esbuild.config.js for correct paths
4. Ensure Node.js version is 18+

## Success Criteria

All of the following must be true:

- ✅ All 5 Lambda functions build without errors
- ✅ Bundle sizes are < 200 KB per function
- ✅ Lambda layer builds and deploys successfully
- ✅ Layer is attached to all functions
- ✅ Cold start init duration < 500 ms
- ✅ Total cold start time < 3 seconds
- ✅ Warm starts are < 500 ms
- ✅ No runtime errors in CloudWatch Logs
- ✅ All API endpoints respond correctly
- ✅ Cost stays within free tier limits

## Monitoring Dashboard

Create a CloudWatch dashboard to monitor cold starts:

1. Go to CloudWatch Console
2. Select "Dashboards" → "Create dashboard"
3. Add widgets for:
   - Lambda Invocations (all functions)
   - Lambda Duration (average)
   - Lambda Init Duration (when present)
   - Lambda Errors
   - API Gateway 4XX/5XX errors

## Next Steps After Verification

1. ✅ Document actual performance metrics
2. ✅ Update architecture diagrams with layer
3. ✅ Add cold start metrics to demo script
4. ✅ Consider provisioned concurrency for critical functions (if needed)
5. ✅ Set up alarms for cold start duration > 3 seconds

## References

- [AWS Lambda Cold Starts](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtime-environment.html)
- [Lambda Layers Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/configuration-layers.html)
- [CloudWatch Logs Insights](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/AnalyzingLogData.html)
