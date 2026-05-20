export interface AgentReputation {
  id: string;
  name: string;
  score: number;
  totalTasks: number;
  successfulTasks: number;
  reviews: PeerReview[];
  metadata: Record<string, any>;
  lastUpdated: string;
}

export interface PeerReview {
  reviewerId: string;
  rating: number; // 1-5
  comment: string;
  timestamp: string;
}

export interface TaskRecord {
  id: string;
  agentId: string;
  status: "success" | "failure";
  quality: number; // 0-1
  duration: number;
  timestamp: string;
}

export interface ReputationConfig {
  decayRate: number;
  reviewWeight: number;
  performanceWeight: number;
  minReviewsForConfidence: number;
}
