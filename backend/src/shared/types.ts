// Shared types for CTC Tutor application

export interface ConceptExplanation {
  topic: string;
  intuition: string;
  analogy: string;
  technical: string;
  stepByStep: string[];
  constraints: string[];
  timeComplexity?: string;
  spaceComplexity?: string;
}

export interface CodeExample {
  language: string;
  code: string;
  explanation: string;
  annotations: { line: number; comment: string }[];
  timeComplexity?: string;
  spaceComplexity?: string;
}

export interface CommonMistake {
  description: string;
  incorrectExample: string;
  correctExample: string;
  explanation: string;
}

export interface VisualDiagram {
  type: 'flowchart' | 'tree' | 'sequence' | 'state';
  mermaidCode: string;
  description: string;
}

export interface ConceptResponse {
  explanation: ConceptExplanation;
  codeExample: CodeExample;
  commonMistakes: CommonMistake[];
  visualDiagram?: VisualDiagram;
  revisionSummary: {
    keyTakeaways: string[];
    mentalModel: string;
    examTraps: string[];
  };
}

export interface CodeAnalysisRequest {
  code: string;
  language: string;
}

export interface CodeAnalysisResponse {
  summary: string;
  lineByLineExplanation: { line: number; explanation: string }[];
  issues: { type: 'inefficiency' | 'logic' | 'style'; description: string; line?: number }[];
  simplifiedVersion?: string;
}

// New Pedagogical Analysis Types
export interface LogicExplanation {
  line: number;
  intent: string;
  logicCategory: 'initialization' | 'condition' | 'iteration' | 'computation' | 'output' | 'control_flow';
  complexity: string;
}

export interface DryRunStep {
  step: number;
  activeLine: number;
  variableChanges: { [key: string]: any };
  conditionState: boolean | null;
  output: string;
  explanation: string;
}

export interface EdgeCase {
  scenario: string;
  input: string;
  expectedBehavior: string;
  riskLevel: 'low' | 'medium' | 'high';
  mitigation: string;
}

export interface KnowledgeCheckQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ComplexityAnalysis {
  timeComplexity: string;
  spaceComplexity: string;
  realWorldImpact: string;
  comparisonData: {
    input_size: number[];
    current_algorithm: number[];
    optimal_algorithm: number[];
  };
}

export interface PedagogicalAnalysis {
  logicExplanations: LogicExplanation[];
  dryRunTable: DryRunStep[];
  complexityAnalysis: ComplexityAnalysis;
  edgeCases: EdgeCase[];
  knowledgeCheck: KnowledgeCheckQuestion[];
  algorithmType: string;
  coreLogic: string;
}

export interface EnhancedCodeAnalysisResponse extends CodeAnalysisResponse {
  pedagogicalAnalysis?: PedagogicalAnalysis;
}

export interface UserInteraction {
  sessionId: string;
  topic: string;
  timestamp: Date;
  confusionLevel?: number;
}

export interface AdaptiveContext {
  repeatedQueries: string[];
  confusionPatterns: string[];
  preferredComplexity: 'beginner' | 'intermediate' | 'advanced';
}


// ============================================================================
// Market Disruptor Features - New Types
// ============================================================================

// Feature 1: Project Context DNA
export interface ProjectContext {
  id: string;
  name: string;
  type: 'web_app' | 'mobile_app' | 'iot' | 'data_science' | 'ml' | 'other';
  domain: 'healthcare' | 'environment' | 'finance' | 'education' | 'social' | 'other';
  techStack: {
    frontend?: string[];
    backend?: string[];
    database?: string[];
    other?: string[];
  };
  dataCharacteristics: {
    type: 'real_time' | 'batch' | 'streaming' | 'user_input' | 'api';
    volume: 'small' | 'medium' | 'large' | 'massive';
    velocity: 'slow' | 'moderate' | 'fast' | 'real_time';
  };
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContextAwareAnalysis {
  standardAnalysis: EnhancedCodeAnalysisResponse;
  contextualInsights: {
    projectRelevance: string;
    realWorldScenario: string;
    scaleConsiderations: string;
    integrationPoints: string[];
    domainSpecificExamples: string[];
  };
  contextualTestCases: {
    scenario: string;
    input: string;
    expectedBehavior: string;
    projectRelevance: string;
  }[];
}

// Feature 2: Edge-Case Stress Test Sandbox
export interface StressTest {
  id: string;
  name: string;
  category: 'null_values' | 'boundary' | 'type_mismatch' | 'performance' | 'concurrency' | 'security';
  input: any;
  description: string;
  expectedBehavior: string;
}

export interface StressTestResult {
  testId: string;
  testName: string;
  passed: boolean;
  executionTime: number;
  memoryUsage?: number;
  error?: {
    message: string;
    line: number;
    stack: string;
  };
  output?: any;
  recommendation: string;
}

export interface StressTestReport {
  code: string;
  language: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  survivalRate: number;
  robustnessGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  results: StressTestResult[];
  overallRecommendations: string[];
  codeHighlights: {
    line: number;
    type: 'error' | 'warning' | 'success';
    message: string;
  }[];
}

// Feature 3: Architect's Blueprint Generator
export interface ArchitectureComponent {
  id: string;
  name: string;
  type: 'frontend' | 'backend' | 'database' | 'api' | 'service' | 'queue' | 'cache';
  description: string;
  technologies?: string[];
}

export interface ArchitectureConnection {
  from: string;
  to: string;
  type: 'sync' | 'async' | 'data_flow' | 'api_call' | 'event';
  protocol?: string;
  description: string;
}

export interface SystemArchitecture {
  components: ArchitectureComponent[];
  connections: ArchitectureConnection[];
  layers: {
    presentation: string[];
    business: string[];
    data: string[];
  };
}

export interface StateMachine {
  states: {
    id: string;
    name: string;
    type: 'initial' | 'normal' | 'final' | 'error';
    description: string;
  }[];
  transitions: {
    from: string;
    to: string;
    trigger: string;
    condition?: string;
  }[];
}

export interface DesignPattern {
  name: string;
  category: 'creational' | 'structural' | 'behavioral';
  confidence: number;
  location: {
    startLine: number;
    endLine: number;
  };
  explanation: string;
  benefits: string[];
  tradeoffs: string[];
}

export interface ArchitectureBlueprint {
  systemArchitecture: SystemArchitecture;
  stateMachine?: StateMachine;
  sequenceDiagram?: string;
  designPatterns: DesignPattern[];
  scalabilityAnalysis: {
    bottlenecks: string[];
    recommendations: string[];
    estimatedCapacity: string;
  };
  diagrams: {
    architecture: string;
    stateMachine?: string;
    sequence?: string;
  };
}

// Feature 4: Source-Sync Learning
export type StudyStyle = 'geeksforgeeks' | 'w3schools' | 'leetcode' | 'official_docs' | 'academic';

export interface StylePreferences {
  activeStyle: StudyStyle;
  customizations?: {
    verbosity: 'concise' | 'detailed' | 'comprehensive';
    codeExamples: 'minimal' | 'multiple' | 'extensive';
    theoryDepth: 'practical' | 'balanced' | 'theoretical';
  };
}

export interface StyledExplanation {
  style: StudyStyle;
  content: {
    title: string;
    introduction: string;
    approach?: string;
    algorithm?: string[];
    syntax?: string;
    tryItYourself?: string;
    intuition?: string;
    solutions?: {
      name: string;
      code: string;
      complexity: string;
    }[];
    mainContent: string;
    examples: CodeExample[];
    notes?: string[];
  };
  formatting: {
    headingStyle: string;
    codeBlockStyle: string;
    emphasisStyle: string;
  };
}

// Feature 5: Viva-Voce Mock Interviewer
export interface VivaQuestion {
  id: string;
  type: 'conceptual' | 'complexity' | 'tradeoffs' | 'alternatives' | 'edge_cases' | 'optimization' | 'real_world' | 'debugging';
  question: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  expectedKeywords: string[];
  followUpQuestions?: string[];
  hints?: string[];
}

export interface VivaResponse {
  questionId: string;
  transcript: string;
  duration: number;
  evaluation: {
    score: number;
    clarity: number;
    accuracy: number;
    completeness: number;
    keywordsCovered: string[];
    keywordsMissed: string[];
  };
  feedback: string;
  suggestions: string[];
}

export interface VivaSession {
  id: string;
  code: string;
  language: string;
  sessionType: 'quick' | 'standard' | 'deep_dive' | 'mock_interview' | 'custom';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  interviewerPersona: 'friendly' | 'tough' | 'neutral';
  questions: VivaQuestion[];
  responses: VivaResponse[];
  startTime: Date;
  endTime?: Date;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  readinessLevel: 'not_ready' | 'needs_practice' | 'ready' | 'well_prepared';
}

export interface VivaReport {
  session: VivaSession;
  transcript: {
    questionId: string;
    question: string;
    answer: string;
    score: number;
  }[];
  performanceMetrics: {
    averageScore: number;
    averageResponseTime: number;
    conceptualUnderstanding: number;
    technicalAccuracy: number;
    communicationSkills: number;
  };
  recommendations: string[];
  practiceTopics: string[];
  comparisonWithPrevious?: {
    improvement: number;
    areasImproved: string[];
    areasToFocus: string[];
  };
}
