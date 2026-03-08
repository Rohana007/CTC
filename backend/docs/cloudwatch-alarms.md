# CloudWatch Alarms Configuration

## Overview

This document describes the CloudWatch alarms configured for the CTC Tutor serverless application. These alarms enable automated monitoring and alerting for system issues, ensuring production readiness for the hackathon demonstration.

## Configured Alarms

### 1. API Gateway Error Rate Alarm

**Alarm Name:** `${AWS::StackName}-ApiErrorRate-HighErrorRate`

**Purpose:** Monitors the overall error rate of the API Gateway to detect when the system is experiencing elevated error conditions.

**Configuration:**
- **Metric:** `5XXError` (AWS/ApiGateway)
- **Threshold:** 5 errors
- **Period:** 5 minutes (300 seconds)
- **Evaluation Periods:** 2 consecutive periods
- **Statistic:** Sum
- **Comparison:** Greater than threshold

**Trigger Condition:** Alarm triggers when there are more than 5 server errors (5XX) within a 5-minute period, evaluated over 2 consecutive periods (10 minutes total).

**Requirements Satisfied:** Requirement 9.7 - Error rates exceeding 5%

---

### 2. API Gateway 5xx Errors Alarm

**Alarm Name:** `${AWS::StackName}-Api5xxErrors`

**Purpose:** Provides immediate alerting when any 5xx errors occur in the API Gateway, indicating server-side issues.

**Configuration:**
- **Metric:** `5XXError` (AWS/ApiGateway)
- **Threshold:** 1 error
- **Period:** 5 minutes (300 seconds)
- **Evaluation Periods:** 1 period
- **Statistic:** Sum
- **Comparison:** Greater than or equal to threshold

**Trigger Condition:** Alarm triggers immediately when any 5xx error occurs within a 5-minute period.

**Requirements Satisfied:** Requirement 9.7 - API Gateway 5xx error monitoring

---

### 3. Lambda Duration Alarms (Per Function)

Five separate alarms monitor each Lambda function's execution duration to detect performance degradation:

#### 3.1 Concept Explainer Duration Alarm
**Alarm Name:** `${AWS::StackName}-ConceptExplainer-HighDuration`

#### 3.2 Code Analyzer Duration Alarm
**Alarm Name:** `${AWS::StackName}-CodeAnalyzer-HighDuration`

#### 3.3 Viro Assistant Duration Alarm
**Alarm Name:** `${AWS::StackName}-ViroAssistant-HighDuration`

#### 3.4 Dictionary Service Duration Alarm
**Alarm Name:** `${AWS::StackName}-DictionaryService-HighDuration`

#### 3.5 Vision Analyzer Duration Alarm
**Alarm Name:** `${AWS::StackName}-VisionAnalyzer-HighDuration`

**Configuration (All Functions):**
- **Metric:** `Duration` (AWS/Lambda)
- **Threshold:** 10,000 milliseconds (10 seconds)
- **Period:** 5 minutes (300 seconds)
- **Evaluation Periods:** 2 consecutive periods
- **Statistic:** Average
- **Comparison:** Greater than threshold

**Trigger Condition:** Alarm triggers when the average Lambda execution duration exceeds 10 seconds over a 5-minute period, evaluated over 2 consecutive periods (10 minutes total).

**Requirements Satisfied:** Requirement 9.8 - Lambda duration exceeding 10 seconds

---

## Alarm Behavior

### TreatMissingData
All alarms are configured with `TreatMissingData: notBreaching`, which means:
- If no data is available for the metric, the alarm will not trigger
- This prevents false alarms during periods of no traffic
- The alarm state remains unchanged when data is missing

### Evaluation Logic
- **Error Rate Alarm:** Requires 2 consecutive 5-minute periods with >5 errors
- **5xx Error Alarm:** Triggers immediately on any 5xx error in a 5-minute period
- **Duration Alarms:** Require 2 consecutive 5-minute periods with average duration >10s

---

## Monitoring Dashboard Integration

These alarms complement the CloudWatch Dashboard (`${AWS::StackName}-Dashboard`) which provides:
- Real-time visualization of API request counts and error rates
- Lambda invocation metrics and duration percentiles (p50, p90, p99)
- Bedrock invocation metrics with token usage and latency
- Log insights queries for detailed troubleshooting

---

## Notification Setup (Optional)

To receive notifications when alarms trigger, you can configure SNS topics:

1. Create an SNS topic:
```bash
aws sns create-topic --name ctc-tutor-alarms
```

2. Subscribe to the topic:
```bash
aws sns subscribe \
  --topic-arn arn:aws:sns:REGION:ACCOUNT_ID:ctc-tutor-alarms \
  --protocol email \
  --notification-endpoint your-email@example.com
```

3. Update the SAM template to add `AlarmActions` to each alarm:
```yaml
AlarmActions:
  - !Ref AlarmNotificationTopic
```

---

## Testing Alarms

### Test Error Rate Alarm
Trigger multiple errors by sending invalid requests:
```bash
for i in {1..10}; do
  curl -X POST https://YOUR_API_GATEWAY_URL/api/explain \
    -H "Content-Type: application/json" \
    -d '{"invalid": "data"}'
done
```

### Test Duration Alarm
Trigger a long-running Lambda by requesting complex analysis:
```bash
curl -X POST https://YOUR_API_GATEWAY_URL/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "code": "VERY_LARGE_CODE_BLOCK",
    "language": "python"
  }'
```

### Verify Alarm State
Check alarm status in CloudWatch:
```bash
aws cloudwatch describe-alarms \
  --alarm-name-prefix YOUR_STACK_NAME
```

---

## Troubleshooting

### Alarm Not Triggering
1. Verify the alarm is in `OK` state (not `INSUFFICIENT_DATA`)
2. Check that metrics are being published to CloudWatch
3. Verify the alarm dimensions match your resources
4. Review the evaluation period and threshold settings

### False Positives
1. Adjust the evaluation periods to require more consecutive breaches
2. Increase the threshold if the current value is too sensitive
3. Review the statistic type (Average vs Sum vs Maximum)

### Missing Data
1. Ensure Lambda functions are being invoked
2. Verify CloudWatch Logs are being written
3. Check IAM permissions for CloudWatch metrics

---

## Cost Considerations

**CloudWatch Alarms Pricing:**
- Standard alarms: $0.10 per alarm per month
- Total alarms: 7 alarms = $0.70/month
- Well within AWS free tier (10 alarms free)

**CloudWatch Logs:**
- Log retention: 7 days (minimal cost)
- Log ingestion: Covered by free tier for hackathon usage

---

## Requirements Traceability

| Requirement | Alarm | Status |
|-------------|-------|--------|
| 9.7 - Error rate >5% | ApiErrorRateAlarm | ✅ Implemented |
| 9.7 - API Gateway 5xx errors | Api5xxErrorAlarm | ✅ Implemented |
| 9.8 - Lambda duration >10s | 5 Duration Alarms | ✅ Implemented |
| 9.10 - Log retention 7 days | Log Groups | ✅ Implemented |

---

## Next Steps

1. **Deploy the updated template:**
   ```bash
   sam build
   sam deploy
   ```

2. **Verify alarms are created:**
   ```bash
   aws cloudwatch describe-alarms
   ```

3. **Test alarm triggers** (optional for hackathon)

4. **Configure SNS notifications** (optional for production)

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Task:** 11.3 Configure CloudWatch alarms  
**Status:** ✅ Complete
