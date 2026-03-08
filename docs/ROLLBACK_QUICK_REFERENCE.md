# Rollback Quick Reference

## Emergency Rollback (30 seconds)

```bash
# Linux/Mac
./rollback.sh

# Windows
.\rollback.ps1
```

## Manual Rollback (2 minutes)

### 1. Switch to OpenAI

Edit `backend/.env`:
```bash
USE_BEDROCK=false
OPENAI_API_KEY=your_key_here
```

### 2. Start Express Server

```bash
cd backend
npm run dev
```

### 3. Update Frontend

Edit `frontend/.env`:
```bash
REACT_APP_API_URL=http://localhost:3001/api
```

### 4. Start Frontend

```bash
cd frontend
npm start
```

## Verification Commands

```bash
# Check backend health
curl http://localhost:3001/api/health

# Expected: {"status": "ok", "service": "openai"}

# Test concept explanation
curl -X POST http://localhost:3001/api/explain \
  -H "Content-Type: application/json" \
  -d '{"topic": "Binary Search", "language": "en"}'
```

## Tear Down AWS (Optional)

```bash
# Delete CloudFormation stack
aws cloudformation delete-stack \
  --stack-name ctc-tutor-stack \
  --region us-east-1

# Empty and delete S3 bucket
aws s3 rm s3://ctc-tutor-frontend-dev-<account-id> --recursive
aws s3 rb s3://ctc-tutor-frontend-dev-<account-id>
```

## Common Issues

### Port 3001 in use
```bash
# Linux/Mac
lsof -i :3001
kill -9 <PID>

# Windows
Get-NetTCPConnection -LocalPort 3001
Stop-Process -Id <PID> -Force
```

### CORS errors
```bash
# Clear browser cache: Ctrl+Shift+R
# Verify frontend/.env has: REACT_APP_API_URL=http://localhost:3001/api
```

### OpenAI API key missing
```bash
# Add to backend/.env
OPENAI_API_KEY=sk-your-key-here
```

## Feature Flag Reference

| Flag | Value | Effect |
|------|-------|--------|
| `USE_BEDROCK` | `false` | Use OpenAI |
| `USE_BEDROCK` | `true` | Use Bedrock |
| `PREFER_CLAUDE` | `false` | Use Nova (when Bedrock) |
| `PREFER_CLAUDE` | `true` | Use Claude (when Bedrock) |

## Rollback Checklist

- [ ] Backend `.env` has `USE_BEDROCK=false`
- [ ] OpenAI API key is set
- [ ] Express server running on port 3001
- [ ] Frontend `.env` has local API URL
- [ ] Frontend connects to localhost:3001
- [ ] All features tested and working
- [ ] No CORS errors in console
- [ ] AWS resources deleted (if desired)

## Support

- Full documentation: `docs/ROLLBACK.md`
- Setup guide: `docs/SETUP.md`
- API docs: `docs/API.md`

## Rollback Time Estimates

| Method | Time | Complexity |
|--------|------|------------|
| Automated script | 30 seconds | Easy |
| Manual rollback | 2 minutes | Easy |
| With AWS cleanup | 5-10 minutes | Medium |
| Full verification | 15 minutes | Medium |
