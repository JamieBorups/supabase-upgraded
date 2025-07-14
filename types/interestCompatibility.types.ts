
// This is a direct reflection of the JSON schema in the tool
export interface InterestCompatibilityReport {
  id: string;
  projectId: string;
  createdAt: string;
  notes: string;
  executiveSummary?: string;
  stakeholderAnalysis?: {
    name: string;
    role: string;
    interests: string[];
  }[];
  highCompatibilityAreas?: {
    area: string;
    stakeholders: string[];
    insight: string;
    followUpQuestions: string[];
    guidance: string;
  }[];
  potentialConflicts?: {
    area: string;
    stakeholders: string[];
    insight: string;
    mitigation: string;
    followUpQuestions: string[];
    guidance: string;
  }[];
  actionableRecommendations?: string[];
  fullReportText: string;
}
