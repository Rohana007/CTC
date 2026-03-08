# CTC Tutor - AWS Serverless Architecture

## Current Production Architecture (Updated: March 2026)

### Overview

CTC Tutor is deployed as a fully serverless application on AWS, leveraging Amazon Bedrock for AI capabilities, Lambda for compute, and CloudFront for global content delivery.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Students/Users                           │
│                    (10 Indian Languages)                         │
└────────────┬────────────────────────────┬───────────────────────┘
             │                            │
             │ HTTPS                      │ API Calls
             │                            │
             ▼                            ▼
    ┌────────────────┐          ┌─────────────────┐
    │   CloudFront   │          │  API Gateway    │
    │      CDN       │          │   (REST API)    │
    └────────┬───────┘          └────────┬────────┘
             │                           │
             │ Origin                    │
             ▼                           │
    ┌────────────────┐                  │
    │   S3 Bucket    │                  │
    │ React Frontend │                  │
    └────────────────┘                  │
                                        │
                    ┌───────────────────┼───────────────────┬───────────────┬──────────────┐
                    │                   │                   │               │              │
                    ▼                   ▼                   ▼               ▼              ▼
            ┌───────────────┐   ┌──────────────┐   ┌──────────────┐ ┌──────────┐ ┌──────────────┐
            │    Lambda     │   │   Lambda     │   │   Lambda     │ │  Lambda  │ │   Lambda     │
            │   Concept     │   │     Code     │   │     Viro     │ │Dictionary│ │   Vision     │
            │  Explainer    │   │   Analyzer   │   │  Assistant   │ │ Service  │ │  Analyzer    │
            └───────┬───────┘   └──────┬───────┘   └──────┬───────┘ └────┬─────┘ └──────┬───────┘
                    │                  │                   │              │              │
                    └──────────────────┼───────────────────┼──────────────┼──────────────┘
                                       │                   │              │
                                       ▼                   ▼              ▼
                              ┌─────────────────────────────────────────────┐
                              │         Amazon Bedrock                      │
                              │  • Claude 3 Sonnet (complex tasks)          │
                              │  • Claude 3 Haiku (simple tasks)            │
                              │  • Vision capabilities                      │
                              └─────────────────────────────────────────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │   CloudWatch    │
                              │ Logs & Metrics  │
                              └─────────────────┘
```

### Components

#### 1. Frontend Layer
- **CloudFront CDN**: Global content delivery network
  - Distribution ID: `E2NTJIUCWB8OZF`
  - 24-hour cache TTL
  - HTTPS only
  - Custom domain support

- **S3 Static Hosting**: React application
  - Bucket: `ctc-tutor-frontend-dev-096610237603`
  - Region: `us-east-1`
  - Public read access via CloudFront only

#### 2. API Layer
- **API Gateway**: REST API endpoint
  - URL: `https://x1gs5a0o8a.execute-api.us-east-1.amazonaws.com/dev`
  - CORS enabled
  - Request/response logging
  - Throttling: 10,000 requests/second

#### 3. Compute Layer (Lambda Functions)

All Lambda functions use:
- Runtime: Node.js 20.x
- Architecture: ARM64 (20% cost savings)
- Memory: 512 MB
- Timeout: 30 seconds
- Environment: Production

**Lambda Functions:**

1. **Concept Explainer** (`conceptExplainer`)
   - Endpoint: `/api/concepts/explain`
   - Purpose: Multi-layered concept explanations
   - Model: Claude 3 Sonnet

2. **Code Analyzer** (`codeAnalyzer`)
   - Endpoint: `/api/code/analyze`
   - Purpose: Code analysis with pedagogical insights
   - Model: Claude 3 Sonnet

3. **Viro Assistant** (`viroAssistant`)
   - Endpoint: `/api/viro/chat`
   - Purpose: Conversational AI tutor
   - Model: Claude 3 Haiku (fast responses)

4. **Dictionary Service** (`dictionaryService`)
   - Endpoint: `/api/dictionary/lookup`
   - Purpose: Technical term explanations
   - Model: Claude 3 Haiku

5. **Vision Analyzer** (`visionAnalyzer`)
   - Endpoint: `/api/vision/analyze`
   - Purpose: Handwritten code/diagram analysis
   - Model: Claude 3 Sonnet (Vision)

#### 4. AI Services
- **Amazon Bedrock**: Managed AI service
  - Models: Claude 3 Sonnet, Claude 3 Haiku
  - Region: `us-east-1`
  - On-demand pricing
  - Vision capabilities enabled

#### 5. Monitoring & Logging
- **CloudWatch Logs**: Centralized logging
  - Log groups per Lambda function
  - 7-day retention
  - Structured JSON logging

- **CloudWatch Metrics**: Performance monitoring
  - Lambda invocations
  - Duration
  - Errors
  - Throttles

### Data Flow

1. **Static Content Request**:
   ```
   User → CloudFront → S3 → CloudFront → User
   ```

2. **API Request**:
   ```
   User → API Gateway → Lambda → Bedrock → Lambda → API Gateway → User
                          ↓
                     CloudWatch
   ```

### Security

- **IAM Roles**: Least-privilege access
  - Lambda execution role with Bedrock invoke permissions
  - S3 read-only for CloudFront
  - CloudWatch Logs write access

- **API Gateway**: 
  - CORS configured for frontend domain
  - Request validation
  - Rate limiting

- **CloudFront**:
  - HTTPS only
  - Origin access control
  - Geo-restriction capable

### Performance Optimizations

1. **ARM64 Architecture**: 20% cost savings, better performance
2. **CloudFront Caching**: Reduces Lambda invocations
3. **Smart Model Selection**: Haiku for simple tasks, Sonnet for complex
4. **Concurrent Lambda Execution**: Auto-scaling based on demand
5. **Lambda Layer**: Shared dependencies (AWS SDK)

### Cost Structure

**Monthly Estimates (1000 users, 10 requests/day)**:

- Lambda: ~$5-10 (300,000 invocations)
- Bedrock: ~$50-100 (based on token usage)
- API Gateway: ~$3.50 (300,000 requests)
- CloudFront: ~$1-5 (data transfer)
- S3: <$1 (storage + requests)

**Total**: ~$60-120/month

### Deployment

- **Infrastructure**: AWS SAM (Serverless Application Model)
- **CI/CD**: Manual deployment via AWS CLI
- **Frontend**: S3 sync + CloudFront invalidation
- **Backend**: SAM build + deploy

### URLs

- **Production Frontend**: https://d3hrbeknvapj0l.cloudfront.net
- **API Endpoint**: https://x1gs5a0o8a.execute-api.us-east-1.amazonaws.com/dev

### Monitoring Dashboard

Access CloudWatch dashboards:
```bash
aws cloudwatch get-dashboard --dashboard-name CTC-Tutor-Production
```

### Supported Features

✅ 10 Indian languages (Hindi, Marathi, Tamil, Telugu, Bengali, Gujarati, Kannada, Malayalam, Punjabi, English)
✅ Concept explanations with Socratic method
✅ Code analysis with pedagogical insights
✅ Vision analysis (handwritten code/diagrams)
✅ One-tap dictionary
✅ Conversational AI tutor (Viro)
✅ Voice input/output
✅ Responsive design

### Future Enhancements

- DynamoDB for user progress tracking
- Cognito for authentication
- S3 for user-uploaded content
- ElastiCache for response caching
- Multi-region deployment

---

**Last Updated**: March 7, 2026
**Architecture Version**: 2.0 (Serverless)
