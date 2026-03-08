# Concept-to-Code Tutor (CTC Tutor)

An AI-powered learning assistant that converts abstract concepts into structured, layered understanding and bridges the gap between theory and implementation.

## 🎯 Problem Statement

Learning technical concepts is inefficient because:
- Explanations are either too abstract or too code-heavy
- Learners jump between multiple tools (videos, blogs, AI chats)
- Existing AI tools respond conversationally, not pedagogically

CTC Tutor improves **conceptual clarity, learning speed, and developer understanding** using AI in a meaningful way.

## ✨ Features

### Core Learning Engine
- **🧠 Concept Explanation Engine**: Multi-layered explanations (intuition → analogy → technical → step-by-step)
- **👁️ Visual Representation**: Interactive diagrams and step-by-step visualizations
- **⚡ Concept-to-Code Generator**: Convert explained logic into executable Python code
- **🔍 Code Understanding Mode**: Analyze and explain existing code snippets
- **⚠️ Common Mistake Analysis**: Identify and explain frequent beginner errors
- **🎯 Adaptive Learning**: Context-aware explanations that adapt to user patterns

### Smart Features
- **📚 Revision Summaries**: Key takeaways, mental models, and exam traps
- **🔄 Feedback Loop**: Learn from user confusion patterns
- **📊 Complexity Analysis**: Time and space complexity explanations
- **🎨 Syntax Highlighting**: Beautiful code presentation with annotations

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **AI Integration**: OpenAI GPT-4 API
- **Diagrams**: Mermaid.js for visual representations
- **Code Highlighting**: Prism.js with syntax highlighting
- **Icons**: Lucide React for consistent UI

## 🚀 Quick Start

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Add your OpenAI API key to .env
   ```

3. **Start development servers:**
   ```bash
   npm run dev
   ```

   This starts both backend (port 3001) and frontend (port 3000).

4. **Open your browser:**
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
ctc-tutor/
├── 📱 frontend/              # React TypeScript app
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── ConceptExplainer.tsx
│   │   │   ├── CodeAnalyzer.tsx
│   │   │   ├── ExplanationCard.tsx
│   │   │   └── ...
│   │   ├── App.tsx          # Main application
│   │   └── index.tsx        # Entry point
│   └── package.json
├── 🔧 backend/              # Express TypeScript API
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business logic
│   │   │   ├── aiService.ts      # OpenAI integration
│   │   │   └── adaptiveService.ts # Learning adaptation
│   │   └── server.ts        # Express server
│   └── package.json
├── 🔗 shared/               # Shared TypeScript types
│   └── types.ts
├── 📚 docs/                 # Documentation
│   ├── API.md              # API documentation
│   ├── SETUP.md            # Detailed setup guide
│   ├── ROLLBACK.md         # Rollback procedures
│   └── ROLLBACK_QUICK_REFERENCE.md  # Quick rollback guide
└── package.json            # Root package manager
```

## 🎯 MVP Scope (Hackathon Ready)

- ✅ **Subject Focus**: Data Structures & Algorithms
- ✅ **Language Support**: Python code generation + 4 other languages for analysis
- ✅ **AI Features**: GPT-4 powered explanations with adaptive learning
- ✅ **Visual Support**: Mermaid diagrams for concept visualization
- ✅ **No Auth Required**: Focus on core learning experience
- ✅ **Responsive Design**: Works on desktop and mobile
- ✅ **Real-time Feedback**: User confusion tracking and adaptation

## 🔧 Available Scripts

```bash
# Install all dependencies (frontend + backend)
npm run install:all

# Start both servers in development mode
npm run dev

# Build frontend for production
npm run build

# Start production server
npm start
```

## 🚀 Deployment Options

### AWS Lambda (Primary)
Deploy as serverless functions with Amazon Bedrock:
```bash
./deploy-aws.sh
```
See [AWS Deployment Guide](AWS_DEPLOYMENT_GUIDE.md) for details.

### Railway (Backup - Recommended)
Deploy Express backend to Railway as backup:
```bash
cd backend
./deploy-railway.sh       # Bash
./deploy-railway.ps1      # PowerShell
```

### Vercel (Alternative Backup)
Deploy to Vercel (note: has AWS SDK limitations):
```bash
cd backend
./deploy-vercel.sh
```

**Documentation:**
- Quick start: [`BACKUP_DEPLOYMENT_QUICK_START.md`](BACKUP_DEPLOYMENT_QUICK_START.md)
- Full guide: [`backend/BACKUP_DEPLOYMENT_GUIDE.md`](backend/BACKUP_DEPLOYMENT_GUIDE.md)
- URL tracking: [`backend/BACKUP_DEPLOYMENT_URLS.md`](backend/BACKUP_DEPLOYMENT_URLS.md)

## 🔄 Rollback Procedures

If you need to revert from AWS Bedrock Lambda deployment to Express + OpenAI:

### Quick Rollback (30 seconds)
```bash
# Linux/Mac
./rollback.sh

# Windows
.\rollback.ps1
```

### Manual Rollback
1. Edit `backend/.env`: Set `USE_BEDROCK=false`
2. Start Express: `cd backend && npm run dev`
3. Edit `frontend/.env`: Set `REACT_APP_API_URL=http://localhost:3001/api`
4. Start frontend: `cd frontend && npm start`

**Documentation:**
- Full guide: [`docs/ROLLBACK.md`](docs/ROLLBACK.md)
- Quick reference: [`docs/ROLLBACK_QUICK_REFERENCE.md`](docs/ROLLBACK_QUICK_REFERENCE.md)

## 📖 Usage Examples

### Concept Learning
1. Enter a topic like "Binary Search" or "Dynamic Programming"
2. Get structured explanations from intuitive to technical
3. See visual diagrams and step-by-step breakdowns
4. Review code implementations with annotations
5. Learn from common mistakes and get revision summaries

### Code Analysis
1. Paste your code in any supported language
2. Get line-by-line explanations
3. Identify inefficiencies and logic issues
4. See improved versions when applicable

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit with clear messages: `git commit -m "Add feature"`
5. Push and create a Pull Request

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- Mermaid.js for diagram generation
- React and Node.js communities
- All contributors and testers

---

**Built with ❤️ for better learning experiences**