# CTC Tutor Setup Guide

## Prerequisites

- Node.js 16+ and npm
- OpenAI API key
- Git

## Quick Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd ctc-tutor
   npm run install:all
   ```

2. **Environment setup:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=3001
   NODE_ENV=development
   ```

3. **Start development servers:**
   ```bash
   npm run dev
   ```

   This starts both backend (port 3001) and frontend (port 3000).

## Manual Setup

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start backend server:**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start frontend server:**
   ```bash
   npm start
   ```

## Production Build

1. **Build frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Build backend:**
   ```bash
   cd backend
   npm run build
   ```

3. **Start production server:**
   ```bash
   cd backend
   npm start
   ```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `OPENAI_API_KEY` | OpenAI API key for AI features | Yes | - |
| `PORT` | Backend server port | No | 3001 |
| `NODE_ENV` | Environment mode | No | development |

## Troubleshooting

### Common Issues

1. **"Module not found" errors:**
   - Run `npm run install:all` from root directory
   - Check that all dependencies are installed

2. **OpenAI API errors:**
   - Verify your API key is correct
   - Check your OpenAI account has sufficient credits
   - Ensure API key has proper permissions

3. **Port conflicts:**
   - Change PORT in `.env` file
   - Kill processes using ports 3000/3001

4. **CORS errors:**
   - Ensure frontend is running on port 3000
   - Check backend CORS configuration

### Development Tips

- Use `npm run dev` for hot reloading
- Check browser console for frontend errors
- Check terminal output for backend errors
- Use browser dev tools for debugging

## Project Structure

```
ctc-tutor/
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   └── ...
│   └── package.json
├── backend/           # Express backend
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   └── ...
│   └── package.json
├── shared/            # Shared TypeScript types
├── docs/              # Documentation
└── package.json       # Root package.json
```