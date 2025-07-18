
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
    summary: string;
    responsibilities: string[];
    hardSkills: string[];
    softSkills: string[];
    qualifications: string[];
    resumePoints: string[];
    linkedinSummary: string;
}
