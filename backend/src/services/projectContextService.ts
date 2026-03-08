import { ProjectContext, ContextAwareAnalysis, EnhancedCodeAnalysisResponse } from '../shared/types';

export class ProjectContextService {
  /**
   * Generate contextual insights based on project context
   */
  generateContextualInsights(
    code: string,
    language: string,
    context: ProjectContext,
    standardAnalysis: EnhancedCodeAnalysisResponse
  ): ContextAwareAnalysis['contextualInsights'] {
    const algorithmType = standardAnalysis.pedagogicalAnalysis?.algorithmType || 'General Algorithm';
    
    // Generate project-specific relevance
    const projectRelevance = this.generateProjectRelevance(algorithmType, context);
    
    // Generate real-world scenario
    const realWorldScenario = this.generateRealWorldScenario(code, context, algorithmType);
    
    // Generate scale considerations
    const scaleConsiderations = this.generateScaleConsiderations(context, algorithmType);
    
    // Identify integration points
    const integrationPoints = this.identifyIntegrationPoints(code, context);
    
    // Generate domain-specific examples
    const domainSpecificExamples = this.generateDomainExamples(context, algorithmType);
    
    return {
      projectRelevance,
      realWorldScenario,
      scaleConsiderations,
      integrationPoints,
      domainSpecificExamples
    };
  }

  /**
   * Generate contextual test cases based on project characteristics
   */
  generateContextualTestCases(
    code: string,
    context: ProjectContext
  ): ContextAwareAnalysis['contextualTestCases'] {
    const testCases: ContextAwareAnalysis['contextualTestCases'] = [];
    
    // Generate test cases based on data characteristics
    if (context.dataCharacteristics.type === 'real_time') {
      testCases.push({
        scenario: 'Real-time Data Spike',
        input: 'Sudden influx of 10,000 data points per second',
        expectedBehavior: 'System should handle gracefully without dropping data',
        projectRelevance: `In ${context.name}, real-time data spikes are common during peak hours`
      });
    }
    
    if (context.dataCharacteristics.volume === 'massive') {
      testCases.push({
        scenario: 'Large Dataset Processing',
        input: 'Dataset with 1 million+ records',
        expectedBehavior: 'Algorithm should complete within acceptable time limits',
        projectRelevance: `${context.name} handles massive datasets requiring efficient algorithms`
      });
    }
    
    // Domain-specific test cases
    if (context.domain === 'environment') {
      testCases.push({
        scenario: 'Missing Sensor Data',
        input: 'Sensor readings with null values or gaps',
        expectedBehavior: 'Handle missing data with interpolation or default values',
        projectRelevance: 'Environmental sensors often have connectivity issues'
      });
    }
    
    if (context.domain === 'finance') {
      testCases.push({
        scenario: 'Concurrent Transactions',
        input: 'Multiple simultaneous transactions on same account',
        expectedBehavior: 'Maintain data consistency and prevent race conditions',
        projectRelevance: 'Financial systems must handle concurrent access safely'
      });
    }
    
    if (context.domain === 'healthcare') {
      testCases.push({
        scenario: 'Critical Data Validation',
        input: 'Patient data with potential errors',
        expectedBehavior: 'Strict validation to prevent medical errors',
        projectRelevance: 'Healthcare data requires highest accuracy standards'
      });
    }
    
    return testCases;
  }

  private generateProjectRelevance(algorithmType: string, context: ProjectContext): string {
    const domainContext = this.getDomainContext(context.domain);
    
    if (algorithmType === 'Binary Search') {
      if (context.domain === 'environment') {
        return `In ${context.name}, binary search is perfect for quickly locating specific sensor readings among thousands of devices. For example, finding sensor #4523 among 5000+ pollution monitors deployed across Delhi.`;
      } else if (context.domain === 'finance') {
        return `In ${context.name}, binary search enables fast transaction lookups in sorted ledgers, crucial for real-time balance checks and fraud detection.`;
      } else if (context.domain === 'healthcare') {
        return `In ${context.name}, binary search helps quickly locate patient records in large databases, essential for emergency situations.`;
      }
    }
    
    if (algorithmType === 'Sorting') {
      if (context.type === 'data_science') {
        return `In ${context.name}, efficient sorting is crucial for data preprocessing and analysis pipelines, especially with ${context.dataCharacteristics.volume} datasets.`;
      }
    }
    
    return `In ${context.name}, this ${algorithmType.toLowerCase()} algorithm helps process ${domainContext} data efficiently, which is critical for your ${context.type.replace('_', ' ')} application.`;
  }

  private generateRealWorldScenario(code: string, context: ProjectContext, algorithmType: string): string {
    if (context.domain === 'environment' && context.name.toLowerCase().includes('delhi')) {
      return `Imagine ${context.name} during Diwali when pollution levels spike dramatically. Your algorithm needs to process data from 5000+ sensors updating every minute. With ${context.dataCharacteristics.velocity} data velocity, this algorithm must handle ${context.dataCharacteristics.volume} volumes without lag, ensuring citizens get real-time air quality updates.`;
    }
    
    if (context.domain === 'finance') {
      return `In ${context.name}, during market opening hours, you might process thousands of transactions per second. This algorithm must maintain accuracy while handling concurrent requests, ensuring no financial discrepancies occur.`;
    }
    
    if (context.domain === 'social') {
      return `When ${context.name} experiences viral content, user activity can spike 100x. Your algorithm must scale to handle millions of concurrent users without degrading performance or user experience.`;
    }
    
    if (context.type === 'iot') {
      return `In your IoT system, devices send ${context.dataCharacteristics.type} data continuously. Network interruptions, battery failures, and sensor malfunctions are common. This algorithm must handle these real-world challenges gracefully.`;
    }
    
    return `In production, ${context.name} will face real-world challenges like network latency, data inconsistencies, and unexpected load spikes. This algorithm must be robust enough to handle these scenarios while maintaining performance.`;
  }

  private generateScaleConsiderations(context: ProjectContext, algorithmType: string): string {
    const volume = context.dataCharacteristics.volume;
    const velocity = context.dataCharacteristics.velocity;
    
    let considerations = `For ${context.name} with ${volume} data volume and ${velocity} velocity:\n\n`;
    
    if (volume === 'massive') {
      considerations += `• **Memory Management**: With massive datasets, consider streaming or batch processing instead of loading everything into memory.\n`;
      considerations += `• **Database Indexing**: Ensure proper indexing for fast lookups in large datasets.\n`;
    }
    
    if (velocity === 'real_time' || velocity === 'fast') {
      considerations += `• **Caching Strategy**: Implement caching to reduce database load and improve response times.\n`;
      considerations += `• **Asynchronous Processing**: Use message queues for non-critical operations to maintain responsiveness.\n`;
    }
    
    if (context.type === 'web_app' || context.type === 'mobile_app') {
      considerations += `• **API Rate Limiting**: Protect your backend from abuse and ensure fair resource allocation.\n`;
      considerations += `• **CDN Usage**: Serve static content from CDN to reduce server load.\n`;
    }
    
    considerations += `• **Horizontal Scaling**: Design for horizontal scaling to handle growth in ${context.name}.`;
    
    return considerations;
  }

  private identifyIntegrationPoints(code: string, context: ProjectContext): string[] {
    const integrationPoints: string[] = [];
    
    // Check for database operations
    if (code.match(/SELECT|INSERT|UPDATE|DELETE|mongoose|sequelize/i)) {
      if (context.techStack.database && context.techStack.database.length > 0) {
        integrationPoints.push(`Database Layer: Integrate with ${context.techStack.database.join(', ')} for data persistence`);
      } else {
        integrationPoints.push('Database Layer: Consider adding database integration for data persistence');
      }
    }
    
    // Check for API calls
    if (code.match(/fetch|axios|http\.get|requests\.get/i)) {
      integrationPoints.push('External APIs: Ensure proper error handling and retry logic for API calls');
    }
    
    // Check for async operations
    if (code.match(/async|await|Promise|then\(/i)) {
      integrationPoints.push('Asynchronous Processing: Consider message queues (RabbitMQ, Kafka) for reliable async operations');
    }
    
    // Frontend integration
    if (context.techStack.frontend && context.techStack.frontend.length > 0) {
      integrationPoints.push(`Frontend Integration: Expose this functionality via REST API for ${context.techStack.frontend.join(', ')}`);
    }
    
    // Backend integration
    if (context.techStack.backend && context.techStack.backend.length > 0) {
      integrationPoints.push(`Backend Services: Integrate with ${context.techStack.backend.join(', ')} microservices`);
    }
    
    return integrationPoints;
  }

  private generateDomainExamples(context: ProjectContext, algorithmType: string): string[] {
    const examples: string[] = [];
    
    if (context.domain === 'environment') {
      examples.push(`Finding the sensor with highest pollution reading among 5000 devices`);
      examples.push(`Sorting air quality data by timestamp for trend analysis`);
      examples.push(`Detecting anomalies in sensor readings (sudden spikes or drops)`);
    } else if (context.domain === 'finance') {
      examples.push(`Searching for specific transaction in sorted ledger`);
      examples.push(`Calculating account balance from transaction history`);
      examples.push(`Detecting fraudulent patterns in transaction data`);
    } else if (context.domain === 'healthcare') {
      examples.push(`Locating patient record in hospital database`);
      examples.push(`Sorting medical appointments by priority`);
      examples.push(`Analyzing patient vitals for anomaly detection`);
    } else if (context.domain === 'education') {
      examples.push(`Finding student record in large database`);
      examples.push(`Ranking students by performance metrics`);
      examples.push(`Analyzing learning patterns across cohorts`);
    } else if (context.domain === 'social') {
      examples.push(`Searching for user in millions of profiles`);
      examples.push(`Sorting posts by engagement metrics`);
      examples.push(`Recommending content based on user preferences`);
    }
    
    return examples;
  }

  private getDomainContext(domain: string): string {
    const domainContexts: { [key: string]: string } = {
      environment: 'environmental sensor',
      finance: 'financial transaction',
      healthcare: 'patient health',
      education: 'student learning',
      social: 'user interaction'
    };
    
    return domainContexts[domain] || 'application';
  }
}
