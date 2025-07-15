
import { ResearchPlan } from '../../types.ts';

export const initialResearchPlanData: Omit<ResearchPlan, 'id' | 'createdAt' | 'updatedAt'> = {
    projectId: '',
    notes: '',
    researchTypes: [],
    epistemologies: [],
    pedagogies: [],
    methodologies: [],
    mixedMethods: [],
    titleAndOverview: '',
    communityEngagement: '',
    researchQuestions: '',
    designAndMethodology: '',
    ethicalConsiderations: '',
    knowledgeMobilization: '',
    projectManagement: '',
    projectEvaluation: '',
    fullReportHtml: '',
};
