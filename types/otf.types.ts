
export interface ProgramGuideline {
    id: string;
    createdAt: string;
    name: string;
    description: string;
    guidelineData: Record<string, any>; // Flexible JSONB for structured guidelines
}

export interface OtfBoardMember {
    id: string;
    application_id?: string;
    firstName: string;
    lastName: string;
    termStartDate: string;
    termEndDate: string;
    position: string;
    isArmsLength: boolean;
}

export interface OtfSeniorStaff {
    id: string;
    application_id?: string;
    firstName: string;
    lastName: string;
    position: string;
    isArmsLength: boolean;
}

export interface OtfCollaborator {
    id: string;
    application_id?: string;
    organizationName: string;
}

export interface OtfProjectPlanItem {
    id: string;
    application_id?: string;
    order: number;
    deliverable: string;
    keyTask: string;
    timing: string;
    justification: string;
}

export interface OtfBudgetItem {
    id: string;
    application_id?: string;
    category: string;
    itemDescription: string;
    costBreakdown: string;
    requestedAmount: number;
}

export interface OtfQuote {
    id: string;
    application_id?: string;
    fileUrl: string;
    description: string;
}

export interface OtfLargerProjectFunding {
    id: string;
    application_id?: string;
    source: string;
    usageOfFunds: string;
}


export interface OtfApplication {
    id: string;
    createdAt: string;
    updatedAt: string;
    projectId: string | null;
    title: string;
    
    // Mission and Activities
    basicIdea: string;
    missionStatement: string;
    activitiesDescription: string;
    sector: string;
    peopleServedAnnually: number;
    offersBilingualServices: boolean;
    bilingualMandateType: string;
    servesFrancophonePopulation: boolean;
    frenchServicesPeoplePercentage: number;
    frenchProgramsPercentage: number;
    paidStaffCount: number;
    volunteerCount: number;
    languagePopulationServed: string[];
    genderPopulationServed: string[];
    livedExperiencePopulationServed: string[];
    identityPopulationServed: string[];
    leadershipReflectsCommunity: string;

    // Financial Health
    financialStatementUrl?: string;
    hasSurplusOrDeficit: boolean;
    surplusDeficitInfoUrl?: string;
    
    // Governance
    hasMinThreeBoardMembers: boolean;
    boardMembers: OtfBoardMember[];
    hasSeniorStaff: boolean;
    seniorStaff: OtfSeniorStaff[];
    byLawsUrl?: string;
    
    // Acknowledgements
    confirmFinancialManagement: boolean;
    confirmInfoCorrect: boolean;
    confirmFinancialsUpdated: boolean;

    // Project Information
    otfSupportsUsed: string[];
    projAgeGroup: string;
    projLanguage: string;
    projGender: string;
    projLivedExperience: string;
    projIdentity: string;
    projCommunitySize: string;
    projDescription: string;
    projOtfCatchment: string;
    projCensusDivision: string;
    projStartDate: string;
    projRequestedTerm: number;
    projFundingPriority: string;
    projObjective: string;
    projImpactExplanation: string;
    isCollaborativeApplication: boolean;
    collaborators: OtfCollaborator[];
    collaborativeAgreementUrl?: string;
    planToPurchaseEquipment: boolean;
    equipmentPhotos: { url: string; description: string }[];
    projWhyAndWhoBenefits: string;
    projBarriersExplanation: string;
    
    // Anticipated Results
    projAnticipatedBeneficiaries: number;
    projProgramsImpacted: number;
    projStaffVolunteersTrained: number;
    projPlansReportsCreated: number;
    projPilotParticipants: number;

    // Project Plan
    projectPlan: OtfProjectPlanItem[];
    justificationIntro: string;
    justificationOutro: string;
    
    // Budget
    budgetItems: OtfBudgetItem[];
    quotes: OtfQuote[];
    requiresQuotes: boolean;

    // Larger Project
    isLargerProject: boolean;
    largerProjectTotalCost?: number;
    largerProjectSecuredFunding?: number;
    largerProjectFundingSources?: OtfLargerProjectFunding[];
    largerProjectUnsecuredFundingPlan?: string;

    // Final Description
    projFinalDescription: string;
}
