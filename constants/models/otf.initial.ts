
import { OtfApplication } from '../../types.ts';

export const initialOtfApplicationData: Omit<OtfApplication, 'id'> = {
    createdAt: '',
    updatedAt: '',
    projectId: null,
    title: '',
    
    // Mission and Activities
    basicIdea: '',
    missionStatement: "The Local Services Board of Melgund's Recreation Department is dedicated to enhancing the quality of life for residents of Dyment and Borups Corners by providing accessible, inclusive, and diverse recreation programming. In accordance with the Northern Services Boards Act, we acquire, establish, construct, operate, and maintain recreation facilities, and provide or contract for programs, charging fees as necessary. We strive to foster community well-being, encourage active lifestyles, and create opportunities for social engagement and personal growth within our unorganized territories. Our efforts will focus on promoting active living through a wide range of physical activities, encouraging a deeper connection between people and the rich natural environment of Northwestern Ontario, and ensuring recreation is truly inclusive for all ages and abilities. We are committed to innovative service provision and efficient delivery, aiming to build community capacity by fostering local leadership and partnerships, creating supportive environments for recreation, and recognizing recreation's vital role in individual and community development. This commitment reinforces our dedication to the holistic well-being of Dyment and Borups Corners.",
    activitiesDescription: '',
    sector: 'Sports/Recreation',
    peopleServedAnnually: 250,
    offersBilingualServices: false,
    bilingualMandateType: '',
    servesFrancophonePopulation: false,
    frenchServicesPeoplePercentage: 0,
    frenchProgramsPercentage: 0,
    paidStaffCount: 0,
    volunteerCount: 20,
    languagePopulationServed: ['General Population'],
    genderPopulationServed: ['General Population'],
    livedExperiencePopulationServed: ['General population'],
    identityPopulationServed: ['General Population'],
    leadershipReflectsCommunity: 'Yes',

    // Financial Health
    financialStatementUrl: '',
    hasSurplusOrDeficit: false,
    surplusDeficitInfoUrl: '',
    
    // Governance
    hasMinThreeBoardMembers: false,
    boardMembers: [],
    hasSeniorStaff: false,
    seniorStaff: [],
    byLawsUrl: '',
    
    // Acknowledgements
    confirmFinancialManagement: false,
    confirmInfoCorrect: false,
    confirmFinancialsUpdated: false,

    // Project Information
    otfSupportsUsed: [],
    projAgeGroup: 'General population (all age groups)',
    projLanguage: 'General Population',
    projGender: 'General Population',
    projLivedExperience: 'General population',
    projIdentity: 'General Population',
    projCommunitySize: '',
    projDescription: '',
    projOtfCatchment: '',
    projCensusDivision: '',
    projStartDate: '2025-11-10',
    projRequestedTerm: 12,
    projFundingPriority: '',
    projObjective: '',
    projImpactExplanation: '',
    isCollaborativeApplication: false,
    collaborators: [],
    collaborativeAgreementUrl: '',
    planToPurchaseEquipment: false,
    equipmentPhotos: [],
    projWhyAndWhoBenefits: '',
    projBarriersExplanation: '',
    
    // Anticipated Results
    projAnticipatedBeneficiaries: 250,
    projProgramsImpacted: 10,
    projStaffVolunteersTrained: 20,
    projPlansReportsCreated: 5,
    projPilotParticipants: 25,

    // Project Plan
    projectPlan: [
        { id: 'initial_plan_1', order: 1, deliverable: '', keyTask: '', timing: '', justification: '' },
        { id: 'initial_plan_2', order: 2, deliverable: '', keyTask: '', timing: '', justification: '' },
        { id: 'initial_plan_3', order: 3, deliverable: '', keyTask: '', timing: '', justification: '' },
    ],
    justificationIntro: '',
    justificationOutro: '',
    
    // Budget
    budgetItems: [],
    quotes: [],
    requiresQuotes: false,

    // Larger Project
    isLargerProject: false,
    largerProjectTotalCost: 0,
    largerProjectSecuredFunding: 0,
    largerProjectFundingSources: [],
    largerProjectUnsecuredFundingPlan: '',

    // Final Description
    projFinalDescription: '',
};
