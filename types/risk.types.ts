
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Risk {
    id: string;
    createdAt: string;
    projectId: string;
    heading: string;
    riskDescription: string;
    mitigationPlan: string;
    riskLevel: RiskLevel;
    additionalNotes: string;
}
