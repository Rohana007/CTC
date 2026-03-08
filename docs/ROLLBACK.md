# Rollback Documentation

## Overview

This document provides step-by-step instructions for rolling back from the AWS Bedrock Lambda deployment to the original Express backend with OpenAI integration. Use this guide if you encounter critical issues with the AWS deployment or need to quickly revert to the previous architecture.

## Quick Rollback

For immediate rollback, use the automated script:

```bash
# From project root
./rollback.sh
```

This script will:
1. Switch backend to use OpenAI instead of Bedrock
2. Stop AWS Lambda deployment (optional)
3. Start local Express server
4. Update frontend to use local API endpoint
5. Restart frontend development server

## Manual Rollback Procedures

### 1. Revert to Express Backend

#### Step 1.1: Update Environment Variables

Edit `backend/.env`:

```bash
# Switch from Bedrock to OpenAI
USE_BEDROCK=false

# Ensure OpenAI API key is set
OPENAI_API_KEY=your_openai_api_key_here

# Backend configuration
PORT=3001
NODE_ENV=development
```

#### Step 1.2: Start Express Server

```bash
cd backend
npm run dev
```

The Express server will start on `http://localhost:3001`.

#### Step 1.3: Verify Backend is Running

Test the backend:

```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{"status": "ok", "service": "openai"}
```

### 2. Switch Back to OpenAI

The feature flag system allows seamless switching between Bedrock and OpenAI without code changes.

#### Step 2.1: Verify OpenAI API Key

Ensure your OpenAI API key is valid:

```bash
# Check if key is set
echo $OPENAI_API_KEY

# Or check in .env file
cat backend/.env | grep OPENAI_API_KEY
```

#### Step 2.2: Test OpenAI Integration

Run a test request:

```bash
cd backend
npm run test:openai
```

Or manually test with curl:

```bash
curl -X POST http://localhost:3001/api/explain \
  -H "Content-Type: application/json" \
  -d '{"topic": "Binary Search", "language": "en"}'
```

#### Step 2.3: Monitor OpenAI Usage

Check OpenAI dashboard for API usage:
- Visit: https://platform.openai.com/usage
- Verify requests are being processed
- Check for any rate limit or quota issues

### 3. Update Frontend Configuration

#### Step 3.1: Update API Endpoint

Edit `frontend/.env`:

```bash
# Switch from API Gateway to local Express
REACT_APP_API_URL=http://localhost:3001/api
```

Or for production build:

Edit `frontend/.env.production`:

```bash
REACT_APP_API_URL=http://localhost:3001/api
```

#### Step 3.2: Rebuild Frontend (if needed)

If you're running a production build:

```bash
cd frontend
npm run build
```

#### Step 3.3: Restart Frontend Development Server

```bash
cd frontend
npm start
```

The frontend will now connect to the local Express backend.

### 4. Verify Rollback Success

#### Step 4.1: Test All Features

Test each feature to ensure it works with OpenAI:

1. **Concept Explanation**
   - Navigate to concept explainer
   - Enter a topic (e.g., "Recursion")
   - Verify explanation is generated

2. **Code Analysis**
   - Navigate to code analyzer
   - Paste sample code
   - Verify analysis is generated

3. **Viro Assistant**
   - Navigate to Viro chat
   - Send a message
   - Verify Socratic response

4. **Dictionary Service**
   - Navigate to dictionary
   - Look up a term (e.g., "Algorithm")
   - Verify definition is returned

5. **Vision Analysis** (if applicable)
   - Upload an image
   - Verify analysis is generated

#### Step 4.2: Check Browser Console

Open browser developer tools (F12) and check for:
- No CORS errors
- API requests going to `localhost:3001`
- Successful responses (200 status codes)

#### Step 4.3: Check Backend Logs

Monitor backend terminal for:
- "AIService initialized with OpenAI" message
- Successful API requests
- No Bedrock-related errors

### 5. Optional: Tear Down AWS Resources

If you want to completely remove AWS deployment to avoid costs:

#### Step 5.1: Delete CloudFormation Stack

```bash
aws cloudformation delete-stack \
  --stack-name ctc-tutor-stack \
  --region us-east-1
```

#### Step 5.2: Verify Stack Deletion

```bash
aws cloudformation describe-stacks \
  --stack-name ctc-tutor-stack \
  --region us-east-1
```

Wait until you get "Stack does not exist" error (this means deletion is complete).

#### Step 5.3: Clean Up S3 Buckets (if needed)

If the stack deletion fails due to non-empty S3 buckets:

```bash
# List buckets
aws s3 ls | grep ctc-tutor

# Empty the frontend bucket
aws s3 rm s3://ctc-tutor-frontend-dev-<account-id> --recursive

# Delete the bucket
aws s3 rb s3://ctc-tutor-frontend-dev-<account-id>
```

#### Step 5.4: Verify CloudWatch Logs Cleanup

CloudWatch log groups should be automatically deleted with the stack. Verify:

```bash
aws logs describe-log-groups \
  --log-group-name-prefix /aws/lambda/ctc-tutor \
  --region us-east-1
```

## Rollback Scenarios

### Scenario 1: Bedrock API Errors

**Symptoms:**
- 500 errors from Lambda functions
- "Bedrock API error" messages in CloudWatch logs
- Slow or failed AI responses

**Rollback Steps:**
1. Switch `USE_BEDROCK=false` in `backend/.env`
2. Restart Express server: `npm run dev`
3. Update frontend to use `localhost:3001`
4. Test with OpenAI

### Scenario 2: Lambda Cold Start Issues

**Symptoms:**
- First requests take >5 seconds
- Timeout errors (504 Gateway Timeout)
- Poor user experience

**Rollback Steps:**
1. Keep AWS deployment running (for comparison)
2. Start local Express server as backup
3. Update frontend to use local endpoint
4. Monitor both deployments
5. Decide whether to optimize Lambda or fully rollback

### Scenario 3: Cost Overruns

**Symptoms:**
- AWS bill exceeding budget
- Free tier limits exceeded
- Unexpected charges

**Rollback Steps:**
1. Immediately switch to local Express + OpenAI
2. Delete CloudFormation stack to stop charges
3. Review AWS Cost Explorer for charge sources
4. Optimize configuration before redeploying

### Scenario 4: API Gateway Rate Limiting

**Symptoms:**
- 429 Too Many Requests errors
- Users unable to access features
- Rate limit exceeded messages

**Rollback Steps:**
1. Switch to local Express server (no rate limits)
2. Update frontend configuration
3. Adjust API Gateway throttling settings if redeploying
4. Consider implementing request queuing

### Scenario 5: CloudFront Distribution Issues

**Symptoms:**
- Frontend not loading
- 403 Forbidden errors
- Stale cached content

**Rollback Steps:**
1. Serve frontend locally: `npm start` in frontend directory
2. Update API endpoint to local backend
3. Invalidate CloudFront cache if keeping AWS deployment
4. Check S3 bucket permissions

## Feature Flag System

The application uses environment variables as feature flags for easy switching:

### Backend Feature Flags

In `backend/.env`:

```bash
# Primary flag: Use Bedrock or OpenAI
USE_BEDROCK=false  # Set to 'true' for Bedrock, 'false' for OpenAI

# Model preference (when using Bedrock)
PREFER_CLAUDE=false  # Set to 'true' for Claude, 'false' for Nova

# AWS configuration (only needed for Bedrock)
AWS_REGION=us-east-1
```

### Frontend Feature Flags

In `frontend/.env`:

```bash
# API endpoint
REACT_APP_API_URL=http://localhost:3001/api  # Local Express
# REACT_APP_API_URL=https://xxx.execute-api.us-east-1.amazonaws.com/dev/api  # AWS API Gateway
```

### Switching Between Providers

**To switch from Bedrock to OpenAI:**
1. Set `USE_BEDROCK=false` in `backend/.env`
2. Ensure `OPENAI_API_KEY` is set
3. Restart backend server

**To switch from OpenAI to Bedrock:**
1. Set `USE_BEDROCK=true` in `backend/.env`
2. Ensure AWS credentials are configured
3. Restart backend server

**No code changes required** - the `AIService` class automatically uses the correct provider based on the flag.

## Troubleshooting

### Issue: "OPENAI_API_KEY is required" Error

**Solution:**
```bash
# Add to backend/.env
OPENAI_API_KEY=sk-your-key-here

# Or export temporarily
export OPENAI_API_KEY=sk-your-key-here
```

### Issue: CORS Errors After Rollback

**Solution:**
```bash
# Ensure frontend is using correct API URL
# Check frontend/.env
REACT_APP_API_URL=http://localhost:3001/api

# Restart frontend
cd frontend
npm start
```

### Issue: Port 3001 Already in Use

**Solution:**
```bash
# Find process using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>

# Or use a different port
# Edit backend/.env
PORT=3002
```

### Issue: OpenAI Rate Limit Exceeded

**Solution:**
1. Wait for rate limit to reset (typically 1 minute)
2. Check OpenAI dashboard for usage limits
3. Upgrade OpenAI plan if needed
4. Implement request caching to reduce API calls

### Issue: Frontend Still Calling AWS API Gateway

**Solution:**
```bash
# Clear browser cache
# Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

# Verify .env file
cat frontend/.env

# Rebuild if needed
cd frontend
npm run build
```

## Rollback Checklist

Use this checklist to ensure complete rollback:

- [ ] Backend `.env` updated with `USE_BEDROCK=false`
- [ ] OpenAI API key is set and valid
- [ ] Express server is running on port 3001
- [ ] Backend health check returns `{"service": "openai"}`
- [ ] Frontend `.env` updated with local API URL
- [ ] Frontend is running and connecting to local backend
- [ ] All features tested and working (concept, code, viro, dictionary, vision)
- [ ] No CORS errors in browser console
- [ ] No Bedrock-related errors in backend logs
- [ ] AWS resources deleted (if desired)
- [ ] CloudFormation stack deleted (if desired)
- [ ] S3 buckets emptied and deleted (if desired)
- [ ] Team notified of rollback
- [ ] Incident documented for future reference

## Prevention and Monitoring

### Before Deploying to AWS

1. **Test locally first**
   - Verify all features work with Bedrock locally
   - Run integration tests
   - Check response quality and latency

2. **Set up monitoring**
   - Configure CloudWatch alarms
   - Set up cost alerts
   - Enable detailed logging

3. **Have rollback plan ready**
   - Keep Express backend code in working state
   - Document rollback procedures
   - Test rollback process in staging

### During AWS Deployment

1. **Monitor closely**
   - Watch CloudWatch logs in real-time
   - Check error rates and latency
   - Monitor AWS costs

2. **Test incrementally**
   - Test one feature at a time
   - Verify each Lambda function works
   - Check API Gateway routing

3. **Keep local backup running**
   - Don't shut down Express server immediately
   - Keep it as fallback during testing
   - Switch back if issues arise

### After AWS Deployment

1. **Monitor for 24-48 hours**
   - Watch for errors and performance issues
   - Check user feedback
   - Monitor costs daily

2. **Keep rollback ready**
   - Don't delete Express backend code
   - Keep OpenAI API key active
   - Maintain rollback documentation

3. **Document issues**
   - Log any problems encountered
   - Document solutions
   - Update rollback procedures

## Support and Resources

### AWS Support
- AWS Support Center: https://console.aws.amazon.com/support/
- AWS Documentation: https://docs.aws.amazon.com/
- AWS Forums: https://forums.aws.amazon.com/

### OpenAI Support
- OpenAI Help Center: https://help.openai.com/
- OpenAI API Status: https://status.openai.com/
- OpenAI Community: https://community.openai.com/

### Project Resources
- GitHub Repository: [Your repo URL]
- Project Documentation: `docs/`
- API Documentation: `docs/API.md`
- Setup Guide: `docs/SETUP.md`

## Conclusion

This rollback documentation ensures you can quickly and safely revert to the Express + OpenAI architecture if needed. The feature flag system makes switching between providers seamless, and the automated rollback script handles most of the process.

**Remember:** Always test the rollback procedure before you need it. Run through these steps in a staging environment to ensure they work when you need them in production.

For questions or issues, refer to the troubleshooting section or contact the development team.
