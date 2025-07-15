

import { ResearchPlan } from '../../types.ts';

export const initialResearchPlanData: Omit<ResearchPlan, 'id' | 'createdAt' | 'updatedAt'> = {
    projectId: '',
    notes: '',
    researchTypes: [],
    epistemologies: [],
    pedagogies: [],
    methodologies: [],
    mixedMethods: [],
    communities: [],
    titleAndOverview: '',
    researchQuestions: '',
    communityEngagement: '',
    designAndMethodology: '',
    ethicalConsiderations: '',
    knowledgeMobilization: '',
    projectManagement: '',
    sustainability: '',
    projectEvaluation: '',
    fullReportHtml: '',
};