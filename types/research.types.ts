

export interface ResearchPlanCommunity {
    id?: string;
    communityName: string;
    provinceState: string;
    country: string;
    organization?: string;
}

export interface ResearchPlan {
    id: string;
    projectId: string;
    createdAt: string;
    updatedAt: string;
    notes: string;
    researchTypes: string[]; // e.g., ['Arts-Based', 'Indigenous-Led']
    epistemologies?: string[];
    pedagogies?: string[];
    methodologies?: string[];
    mixedMethods?: string[];
    communities?: ResearchPlanCommunity[];
    titleAndOverview?: string;
    researchQuestions?: string;
    communityEngagement?: string;
    designAndMethodology?: string;
    ethicalConsiderations?: string;
    knowledgeMobilization?: string;
    projectManagement?: string;
    sustainability?: string;
    projectEvaluation?: string;
    fullReportHtml?: string;
}

export type ResearchPlanSection = keyof Omit<ResearchPlan, 'id' | 'projectId' | 'createdAt' | 'updatedAt' | 'notes' | 'researchTypes' | 'fullReportHtml' | 'epistemologies' | 'pedagogies' | 'methodologies' | 'mixedMethods' | 'communities'>;

export interface ResearchPlanSectionSettings {
    prompt: string;
    schema: any;
}