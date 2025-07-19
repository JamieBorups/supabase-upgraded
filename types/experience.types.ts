

export interface JobDescription {
    id: string;
    isSystemDefined: boolean;
    isEditable: boolean;
    createdAt: string;
    updatedAt: string;
    projectId: string | null;
    memberId: string | null;
    title: string;
    seniorityLevel: string;
    tailoringTags: string[];
    projectTagline: string;
    projectSummary: string;
    summary: string;
    responsibilities: string[];
    hardSkills: string;
    softSkills: string;
    qualifications: string[];
    resumePoints: string[];
    linkedinSummary: string;
    aboutOrg?: string;
    volunteerBenefits: string;
    timeCommitment?: string;
    applicationProcess?: string;
    callToAction?: string;
}