import { UserInteraction, AdaptiveContext } from '../shared/types';

export class AdaptiveService {
  private userSessions: Map<string, UserInteraction[]> = new Map();
  private readonly CONFUSION_THRESHOLD = 2;
  private readonly REPEAT_THRESHOLD = 3;

  trackInteraction(interaction: UserInteraction): void {
    const sessionId = interaction.sessionId;
    
    if (!this.userSessions.has(sessionId)) {
      this.userSessions.set(sessionId, []);
    }
    
    this.userSessions.get(sessionId)!.push(interaction);
  }

  getAdaptiveContext(sessionId: string, currentTopic: string): AdaptiveContext {
    const interactions = this.userSessions.get(sessionId) || [];
    
    return {
      repeatedQueries: this.findRepeatedQueries(interactions, currentTopic),
      confusionPatterns: this.identifyConfusionPatterns(interactions),
      preferredComplexity: this.determineComplexityLevel(interactions)
    };
  }

  private findRepeatedQueries(interactions: UserInteraction[], currentTopic: string): string[] {
    const topicCounts = new Map<string, number>();
    
    interactions.forEach(interaction => {
      const count = topicCounts.get(interaction.topic) || 0;
      topicCounts.set(interaction.topic, count + 1);
    });

    return Array.from(topicCounts.entries())
      .filter(([topic, count]) => count >= this.REPEAT_THRESHOLD)
      .map(([topic]) => topic);
  }

  private identifyConfusionPatterns(interactions: UserInteraction[]): string[] {
    const confusionPatterns: string[] = [];
    
    // Group interactions by topic and analyze confusion levels
    const topicGroups = new Map<string, UserInteraction[]>();
    
    interactions.forEach(interaction => {
      if (!topicGroups.has(interaction.topic)) {
        topicGroups.set(interaction.topic, []);
      }
      topicGroups.get(interaction.topic)!.push(interaction);
    });

    // Identify topics with high confusion
    topicGroups.forEach((topicInteractions, topic) => {
      const avgConfusion = topicInteractions
        .filter(i => i.confusionLevel !== undefined)
        .reduce((sum, i) => sum + (i.confusionLevel || 0), 0) / topicInteractions.length;
      
      if (avgConfusion >= this.CONFUSION_THRESHOLD) {
        confusionPatterns.push(topic);
      }
    });

    return confusionPatterns;
  }

  private determineComplexityLevel(interactions: UserInteraction[]): 'beginner' | 'intermediate' | 'advanced' {
    if (interactions.length < 5) {
      return 'beginner';
    }

    // Analyze interaction patterns to determine user level
    const recentInteractions = interactions.slice(-10);
    const avgConfusion = recentInteractions
      .filter(i => i.confusionLevel !== undefined)
      .reduce((sum, i) => sum + (i.confusionLevel || 0), 0) / recentInteractions.length;

    if (avgConfusion < 1) {
      return 'advanced';
    } else if (avgConfusion < 2) {
      return 'intermediate';
    } else {
      return 'beginner';
    }
  }

  // Clean up old sessions (call periodically)
  cleanupOldSessions(): void {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    
    this.userSessions.forEach((interactions, sessionId) => {
      const recentInteractions = interactions.filter(
        interaction => interaction.timestamp > cutoffTime
      );
      
      if (recentInteractions.length === 0) {
        this.userSessions.delete(sessionId);
      } else {
        this.userSessions.set(sessionId, recentInteractions);
      }
    });
  }
}