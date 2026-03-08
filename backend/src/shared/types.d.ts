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
    annotations: {
        line: number;
        comment: string;
    }[];
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
    lineByLineExplanation: {
        line: number;
        explanation: string;
    }[];
    issues: {
        type: 'inefficiency' | 'logic' | 'style';
        description: string;
        line?: number;
    }[];
    simplifiedVersion?: string;
}
export interface LogicExplanation {
    line: number;
    intent: string;
    logicCategory: 'initialization' | 'condition' | 'iteration' | 'computation' | 'output' | 'control_flow';
    complexity: string;
}
export interface DryRunStep {
    step: number;
    activeLine: number;
    variableChanges: {
        [key: string]: any;
    };
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
//# sourceMappingURL=types.d.ts.map