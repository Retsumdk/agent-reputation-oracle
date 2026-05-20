import { AgentReputation, TaskRecord, ReputationConfig, PeerReview } from "./types";

export class ReputationEngine {
  private config: ReputationConfig;

  constructor(config: Partial<ReputationConfig> = {}) {
    this.config = {
      decayRate: 0.95,
      reviewWeight: 0.4,
      performanceWeight: 0.6,
      minReviewsForConfidence: 5,
      ...config,
    };
  }

  public calculateScore(agent: AgentReputation, tasks: TaskRecord[]): number {
    const performanceScore = this.calculatePerformanceScore(tasks);
    const reviewScore = this.calculateReviewScore(agent.reviews);

    // Apply weights
    let finalScore = 
      performanceScore * this.config.performanceWeight +
      reviewScore * this.config.reviewWeight;

    // Confidence penalty for low activity
    if (agent.reviews.length < this.config.minReviewsForConfidence) {
      const confidenceRatio = agent.reviews.length / this.config.minReviewsForConfidence;
      finalScore *= (0.8 + 0.2 * confidenceRatio);
    }

    return parseFloat(finalScore.toFixed(4));
  }

  private calculatePerformanceScore(tasks: TaskRecord[]): number {
    if (tasks.length === 0) return 0.5; // Baseline

    // Weight recent tasks more heavily (exponential decay)
    const sortedTasks = [...tasks].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    let totalWeight = 0;
    let weightedSum = 0;
    let currentWeight = 1.0;

    for (const task of sortedTasks) {
      const taskScore = task.status === "success" ? task.quality : 0;
      weightedSum += taskScore * currentWeight;
      totalWeight += currentWeight;
      currentWeight *= this.config.decayRate;
    }

    return weightedSum / totalWeight;
  }

  private calculateReviewScore(reviews: PeerReview[]): number {
    if (reviews.length === 0) return 0.5; // Baseline

    const sum = reviews.reduce((acc, r) => acc + (r.rating / 5), 0);
    return sum / reviews.length;
  }

  public createPeerReview(reviewerId: string, rating: number, comment: string): PeerReview {
    if (rating < 1 || rating > 5) throw new Error("Rating must be between 1 and 5");
    return {
      reviewerId,
      rating,
      comment,
      timestamp: new Date().toISOString(),
    };
  }

  public createTaskRecord(agentId: string, status: "success" | "failure", quality: number, duration: number): TaskRecord {
    return {
      id: Math.random().toString(36).substring(2, 15),
      agentId,
      status,
      quality,
      duration,
      timestamp: new Date().toISOString(),
    };
  }
}
