# CloudWatch Dashboard Documentation

## Overview

The CTC Tutor application includes a comprehensive CloudWatch dashboard that provides real-time visibility into system health, performance, and AWS Bedrock usage. The dashboard is automatically created during deployment and includes 13 widgets organized into logical sections.

## Dashboard URL

After deployment, access the dashboard at:
```
https://console.aws.amazon.com/cloudwatch/home?region=<your-region>#dashboards:name=<stack-name>-Dashboard
```

Or find it in the AWS Console:
1. Navigate to CloudWatch → Dashboards
2. Select `<stack-name>-Dashboard`

## Dashboard Sections

### 1. API Gateway Metrics

#### Request Count
- **Widget**: API Request Count
- **Metrics**: Total API requests over time
- **Purpose**: Monitor overall traffic and usage patterns
- **Period**: 5 minutes
- **Use Case**: Identify peak usage times, validate deployment success

#### Error Rate
- **Widget**: API Error Rate
- **Metrics**: 
  - 4XX errors (client errors)
  - 5XX errors (server errors)
  - Calculated error rate percentage
- **Purpose**: Track API reliability and identify issues
- **Threshold**: Error rate should stay below 5%
- **Use Case**: Detect service degradation, validate error handling

#### Latency
- **Widget**: API Latency (ms)
- **Metrics**: 
  - Average latency
  - p50 (median)
  - p90 (90th percentile)
  - p99 (99th percentile)
- **Purpose**: Monitor API response times
- **Target**: 95% of requests should complete within 3 seconds (3000ms)
- **Use Case**: Identify performance bottlenecks, validate optimizations

### 2. Lambda Function Metrics

#### Invocations & Errors
- **Widget**: Lambda Invocations & Errors
- **Metrics**:
  - Total invocations
  - Errors
  - Throttles
- **Purpose**: Monitor Lambda execution health
- **Use Case**: Detect function failures, identify throttling issues

#### Duration
- **Widget**: Lambda Duration (ms)
- **Metrics**:
  - Average duration
  - p50, p90, p99 percentiles
  - Maximum duration
- **Purpose**: Track Lambda execution time
- **Threshold**: Duration should stay below 10 seconds (10000ms)
- **Use Case**: Identify slow functions, optimize cold starts

#### Concurrent Executions
- **Widget**: Lambda Concurrent Executions
- **Metrics**: Maximum concurrent executions
- **Purpose**: Monitor Lambda scaling behavior
- **Limit**: AWS account default is 1000 concurrent executions
- **Use Case**: Ensure sufficient concurrency for traffic spikes

### 3. Per-Function Metrics

#### Duration by Function
- **Widget**: Lambda Duration by Function
- **Functions**:
  - ConceptExplainerFunction
  - CodeAnalyzerFunction
  - ViroAssistantFunction
  - DictionaryServiceFunction
  - VisionAnalyzerFunction
- **Purpose**: Compare performance across different Lambda functions
- **Use Case**: Identify which functions need optimization

#### Invocations by Function
- **Widget**: Lambda Invocations by Function
- **Display**: Stacked area chart
- **Purpose**: Understand usage distribution across features
- **Use Case**: Identify most-used features, plan capacity

#### Errors by Function
- **Widget**: Lambda Errors by Function
- **Display**: Stacked area chart
- **Purpose**: Identify which functions are experiencing errors
- **Use Case**: Prioritize debugging efforts, validate fixes

### 4. Bedrock Invocation Metrics

#### Metrics by Model
- **Widget**: Bedrock Invocation Metrics by Model
- **Type**: CloudWatch Logs Insights query
- **Metrics**:
  - Average latency per model
  - Total input tokens
  - Total output tokens
- **Purpose**: Compare performance and usage across Bedrock models
- **Use Case**: Optimize model selection, track token costs

#### Invocations Over Time
- **Widget**: Bedrock Invocations Over Time
- **Type**: CloudWatch Logs Insights query
- **Metrics**:
  - Invocation count per 5-minute bin
  - Average latency
- **Purpose**: Monitor Bedrock usage patterns
- **Use Case**: Identify peak usage, correlate with API traffic

#### Token Usage by Model
- **Widget**: Bedrock Token Usage by Model
- **Type**: CloudWatch Logs Insights query
- **Metrics**: Total tokens consumed per model
- **Purpose**: Track Bedrock costs
- **Cost**: Tokens are the primary cost driver for Bedrock
- **Use Case**: Monitor costs, optimize prompt engineering

#### Failures by Model & Error
- **Widget**: Bedrock Failures by Model & Error
- **Type**: CloudWatch Logs Insights query
- **Metrics**: Failure count grouped by model and error type
- **Purpose**: Identify Bedrock reliability issues
- **Common Errors**:
  - ThrottlingException: Rate limit exceeded
  - ValidationException: Invalid request
  - ServiceUnavailableException: Temporary outage
- **Use Case**: Implement retry logic, adjust rate limits

## CloudWatch Logs Insights Queries

The dashboard includes four log-based widgets that query structured logs from all Lambda functions. These queries leverage the JSON logging format implemented in Task 11.1.

### Query 1: Bedrock Metrics by Model
```
fields @timestamp, model, inputTokens, outputTokens, latencyMs
| filter service = "bedrock" and operation = "invoke_model" and success = true
| stats avg(latencyMs) as avgLatency, sum(inputTokens) as totalInput, sum(outputTokens) as totalOutput by model
| sort avgLatency desc
```

### Query 2: Bedrock Invocations Over Time
```
fields @timestamp, model, latencyMs, success
| filter service = "bedrock" and operation = "invoke_model"
| stats count() as invocations, avg(latencyMs) as avgLatency by bin(5m)
```

### Query 3: Token Usage by Model
```
fields @timestamp, model, totalTokens
| filter service = "bedrock" and success = true
| stats sum(totalTokens) as tokens by model
```

### Query 4: Failures by Model & Error
```
fields @timestamp, model, error
| filter service = "bedrock" and success = false
| stats count() as failures by model, error
```

## Monitoring Best Practices

### Daily Checks
1. **Error Rate**: Verify error rate is below 5%
2. **Latency**: Check p99 latency is under 3 seconds
3. **Bedrock Failures**: Review any Bedrock errors
4. **Token Usage**: Monitor daily token consumption

### Weekly Reviews
1. **Performance Trends**: Compare week-over-week latency
2. **Cost Analysis**: Review token usage and estimate costs
3. **Usage Patterns**: Identify peak usage times
4. **Function Optimization**: Review slow functions for optimization

### Incident Response
1. **High Error Rate**: Check Lambda errors by function widget
2. **High Latency**: Review Lambda duration and Bedrock latency
3. **Throttling**: Check concurrent executions and Bedrock rate limits
4. **Bedrock Failures**: Review failures by model & error widget

## CloudWatch Alarms

The dashboard is complemented by CloudWatch alarms that send notifications when thresholds are exceeded:

### API Error Rate Alarm
- **Metric**: API Gateway 5XX errors
- **Threshold**: Error rate > 5%
- **Evaluation**: 2 consecutive periods of 5 minutes
- **Action**: Review Lambda errors and Bedrock failures

### Lambda Duration Alarm
- **Metric**: Lambda function duration
- **Threshold**: Average duration > 10 seconds
- **Evaluation**: 2 consecutive periods of 5 minutes
- **Action**: Review slow functions, optimize code or increase memory

## Cost Monitoring

### Token Cost Estimation
Bedrock pricing varies by model:
- **Claude 3 Haiku**: ~$0.25 per 1M input tokens, ~$1.25 per 1M output tokens
- **Claude 3 Sonnet**: ~$3 per 1M input tokens, ~$15 per 1M output tokens
- **Nova Lite**: ~$0.06 per 1M input tokens, ~$0.24 per 1M output tokens

Use the "Bedrock Token Usage by Model" widget to estimate daily costs:
```
Daily Cost = (Input Tokens × Input Price) + (Output Tokens × Output Price)
```

### Free Tier Limits
- **Lambda**: 1M requests/month, 400,000 GB-seconds compute
- **API Gateway**: 1M API calls/month (first 12 months)
- **CloudWatch**: 10 custom metrics, 10 alarms, 5GB logs
- **Bedrock**: No free tier (pay per token)

## Troubleshooting

### Dashboard Not Showing Data
1. Verify Lambda functions have been invoked
2. Check CloudWatch Logs are being generated
3. Wait 5-10 minutes for metrics to populate
4. Verify correct AWS region is selected

### Log Queries Returning No Results
1. Verify structured logging is enabled (LOG_LEVEL environment variable)
2. Check log group names match Lambda function names
3. Verify logs contain JSON with expected fields
4. Adjust time range to include recent invocations

### High Costs
1. Review token usage by model
2. Consider switching complex tasks to cheaper models
3. Implement response caching (see Task 10.1)
4. Optimize prompts to reduce token usage

## Related Documentation

- [Structured Logging Implementation](../STRUCTURED_LOGGING.md)
- [Cost Optimization Guide](./CACHING.md)
- [Cold Start Optimization](./COLD_START_OPTIMIZATION.md)
- [Deployment Guide](../../README.md)

## Dashboard Maintenance

### Updating the Dashboard
The dashboard is defined in `backend/template.yaml` as a CloudFormation resource. To update:

1. Edit the `MonitoringDashboard` resource in `template.yaml`
2. Run `sam deploy` to update the stack
3. Refresh the CloudWatch console to see changes

### Adding Custom Widgets
To add new widgets:

1. Create the widget JSON in the `DashboardBody` property
2. Use CloudWatch metric math for calculated metrics
3. Use CloudWatch Logs Insights for log-based queries
4. Test queries in CloudWatch Logs Insights before adding to dashboard

### Exporting Dashboard
To share the dashboard configuration:

1. Open the dashboard in CloudWatch console
2. Click "Actions" → "View/edit source"
3. Copy the JSON definition
4. Save to a file for version control

## Summary

The CloudWatch dashboard provides comprehensive visibility into:
- ✅ API request count, error rate, and latency
- ✅ Lambda duration and memory usage
- ✅ Bedrock invocation metrics (latency, tokens, failures)
- ✅ Per-function performance breakdown
- ✅ Cost tracking and optimization insights

This dashboard enables proactive monitoring, rapid incident response, and data-driven optimization of the CTC Tutor application.
