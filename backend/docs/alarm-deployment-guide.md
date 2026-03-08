# CloudWatch Alarms Deployment Guide

## Quick Reference

This guide provides step-by-step instructions for deploying and verifying the CloudWatch alarms configured in task 11.3.

---

## Deployment Steps

### 1. Validate the SAM Template

Before deploying, validate the template syntax:

```bash
cd backend
sam validate --template template.yaml
```

Expected output: `template.yaml is a valid SAM Template`

---

### 2. Build the SAM Application

Build the Lambda functions and prepare for deployment:

```bash
sam build
```

This will:
- Compile TypeScript to JavaScript
- Bundle dependencies
- Prepare deployment packages

---

### 3. Deploy to AWS

Deploy the stack with CloudWatch alarms:

```bash
sam deploy --guided
```

Or if you've already configured deployment:

```bash
sam deploy
```

---

### 4. Verify Alarms Were Created

Check that all 7 alarms were created successfully:

```bash
aws cloudwatch describe-alarms --query 'MetricAlarms[?starts_with(AlarmName, `ctc-tutor`)].AlarmName' --output table
```

Expected output should show:
- `ctc-tutor-*-ApiErrorRate-HighErrorRate`
- `ctc-tutor-*-Api5xxErrors`
- `ctc-tutor-*-ConceptExplainer-HighDuration`
- `ctc-tutor-*-CodeAnalyzer-HighDuration`
- `ctc-tutor-*-ViroAssistant-HighDuration`
- `ctc-tutor-*-DictionaryService-HighDuration`
- `ctc-tutor-*-VisionAnalyzer-HighDuration`

---

### 5. Check Alarm Status

View the current state of all alarms:

```bash
aws cloudwatch describe-alarms --query 'MetricAlarms[?starts_with(AlarmName, `ctc-tutor`)].{Name:AlarmName,State:StateValue}' --output table
```

Expected states:
- `OK` - Alarm is active and metrics are within threshold
- `INSUFFICIENT_DATA` - Not enough data yet (normal for new deployments)
- `ALARM` - Threshold has been breached (investigate)

---

## Alarm Details

### Configured Alarms Summary

| Alarm Name | Metric | Threshold | Purpose |
|------------|--------|-----------|---------|
| ApiErrorRate-HighErrorRate | 5XXError | >5 errors | Detect elevated error rates |
| Api5xxErrors | 5XXError | ≥1 error | Immediate 5xx error detection |
| ConceptExplainer-HighDuration | Duration | >10s | Monitor function performance |
| CodeAnalyzer-HighDuration | Duration | >10s | Monitor function performance |
| ViroAssistant-HighDuration | Duration | >10s | Monitor function performance |
| DictionaryService-HighDuration | Duration | >10s | Monitor function performance |
| VisionAnalyzer-HighDuration | Duration | >10s | Monitor function performance |

---

## Viewing Alarms in AWS Console

### CloudWatch Console

1. Navigate to: https://console.aws.amazon.com/cloudwatch/
2. Click **Alarms** in the left sidebar
3. Filter by your stack name (e.g., `ctc-tutor`)
4. View alarm status, history, and metrics

### CloudWatch Dashboard

The deployment also creates a comprehensive dashboard:

1. Navigate to: https://console.aws.amazon.com/cloudwatch/
2. Click **Dashboards** in the left sidebar
3. Select `ctc-tutor-*-Dashboard`
4. View real-time metrics for API Gateway, Lambda, and Bedrock

---

## Testing Alarms (Optional)

### Test API Error Rate Alarm

Generate multiple errors to trigger the alarm:

```bash
API_URL="YOUR_API_GATEWAY_URL"

for i in {1..10}; do
  curl -X POST "$API_URL/api/explain" \
    -H "Content-Type: application/json" \
    -d '{"invalid": "data"}' &
done
wait
```

Wait 10-15 minutes and check alarm state:

```bash
aws cloudwatch describe-alarms --alarm-names "ctc-tutor-*-ApiErrorRate-HighErrorRate"
```

---

### Test Lambda Duration Alarm

Trigger a long-running Lambda function:

```bash
API_URL="YOUR_API_GATEWAY_URL"

# Send a complex code analysis request
curl -X POST "$API_URL/api/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "'"$(cat large_code_file.py)"'",
    "language": "python"
  }'
```

Wait 10-15 minutes and check alarm state:

```bash
aws cloudwatch describe-alarms --alarm-names "ctc-tutor-*-CodeAnalyzer-HighDuration"
```

---

## Troubleshooting

### Alarm Shows INSUFFICIENT_DATA

**Cause:** No metrics have been published yet.

**Solution:**
1. Invoke the Lambda functions by making API requests
2. Wait 5-10 minutes for metrics to propagate
3. Check alarm state again

---

### Alarm Not Triggering When Expected

**Cause:** Evaluation period or threshold may need adjustment.

**Solution:**
1. Review the alarm configuration in the SAM template
2. Check the actual metric values in CloudWatch Metrics
3. Adjust `EvaluationPeriods` or `Threshold` if needed

---

### Cannot Find Alarms

**Cause:** Stack name may be different than expected.

**Solution:**
1. List all CloudFormation stacks:
   ```bash
   aws cloudformation list-stacks --query 'StackSummaries[?StackStatus==`CREATE_COMPLETE`].StackName'
   ```
2. Use the correct stack name to filter alarms

---

## Cleanup (Optional)

To remove all alarms and resources:

```bash
sam delete
```

This will delete:
- All Lambda functions
- API Gateway
- CloudWatch alarms
- CloudWatch log groups
- S3 buckets (if empty)
- CloudFront distribution

---

## Requirements Satisfied

✅ **Requirement 9.7:** CloudWatch alarms for error rates exceeding 5%  
✅ **Requirement 9.8:** CloudWatch alarms for Lambda duration exceeding 10 seconds  
✅ **Task 11.3:** Configure CloudWatch alarms for error rate, Lambda duration, and API Gateway 5xx errors

---

## Next Steps

1. ✅ Deploy the updated SAM template
2. ✅ Verify alarms are created
3. ⏭️ Proceed to task 11.4: Test monitoring and alerting (optional)
4. ⏭️ Configure SNS notifications for production use (optional)

---

**Document Version:** 1.0  
**Task:** 11.3 Configure CloudWatch alarms  
**Status:** ✅ Complete
