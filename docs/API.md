# CTC Tutor API Documentation

## Base URL
```
http://localhost:3001/api
```

## Endpoints

### Concept Explanation

#### POST /concepts/explain
Generates a comprehensive explanation for a given concept.

**Request Body:**
```json
{
  "topic": "Binary Search",
  "sessionId": "optional-session-id",
  "confusionLevel": 1
}
```

**Response:**
```json
{
  "explanation": {
    "topic": "Binary Search",
    "intuition": "Simple explanation...",
    "analogy": "Real-world analogy...",
    "technical": "Technical details...",
    "stepByStep": ["Step 1", "Step 2", "..."],
    "constraints": ["Constraint 1", "..."],
    "timeComplexity": "O(log n)",
    "spaceComplexity": "O(1)"
  },
  "codeExample": {
    "language": "python",
    "code": "def binary_search()...",
    "explanation": "Code explanation...",
    "annotations": [
      {"line": 1, "comment": "Initialize variables"}
    ]
  },
  "commonMistakes": [
    {
      "description": "Off-by-one error",
      "incorrectExample": "while left < right:",
      "correctExample": "while left <= right:",
      "explanation": "Why this happens..."
    }
  ],
  "visualDiagram": {
    "type": "flowchart",
    "mermaidCode": "graph TD...",
    "description": "Visual explanation"
  },
  "revisionSummary": {
    "keyTakeaways": ["Key point 1", "..."],
    "mentalModel": "Think of it as...",
    "examTraps": ["Common trap 1", "..."]
  },
  "sessionId": "generated-session-id"
}
```

#### GET /concepts/popular
Returns a list of popular topics.

**Response:**
```json
{
  "topics": [
    "Binary Search",
    "Recursion",
    "Dynamic Programming"
  ]
}
```

#### POST /concepts/feedback
Records user feedback for adaptive learning.

**Request Body:**
```json
{
  "sessionId": "session-id",
  "topic": "Binary Search",
  "helpful": true,
  "confusionLevel": 1,
  "comments": "Optional feedback"
}
```

### Code Analysis

#### POST /code-analysis/analyze
Analyzes provided code and returns detailed feedback.

**Request Body:**
```json
{
  "code": "def binary_search(arr, target):\n    ...",
  "language": "python"
}
```

**Response:**
```json
{
  "summary": "This code implements binary search...",
  "lineByLineExplanation": [
    {"line": 1, "explanation": "Function definition..."},
    {"line": 2, "explanation": "Initialize pointers..."}
  ],
  "issues": [
    {
      "type": "inefficiency",
      "description": "Could use more efficient approach",
      "line": 5
    }
  ],
  "simplifiedVersion": "# Improved code here..."
}
```

#### GET /code-analysis/languages
Returns supported programming languages.

**Response:**
```json
{
  "languages": [
    {"id": "python", "name": "Python", "extension": ".py"},
    {"id": "javascript", "name": "JavaScript", "extension": ".js"}
  ]
}
```

## Error Responses

All endpoints return errors in this format:
```json
{
  "error": "Error message",
  "message": "Detailed error description"
}
```

Common HTTP status codes:
- `400` - Bad Request (missing required fields)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Rate Limiting

- 100 requests per 15 minutes per IP
- Applies to all endpoints

## Authentication

Currently no authentication required for MVP version.