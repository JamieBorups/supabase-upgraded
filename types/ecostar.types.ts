
export interface ReportSectionContent {
    summary: string;
    keyConsiderations: string[];
    followUpQuestions: { question: string; sampleAnswer: string; }[];
}

export interface EcoStarField {
    key: string;
    label: string;
    description: string;
}

export interface EcoStarFieldConfig {
    prompt: string;
    schema: any; // Ideally, this would be a more specific JSON schema type
}

export type EcoStarFieldSettings = Record<string, EcoStarFieldConfig>;

export interface EcoStarReport {
    id: string;
    projectId: string;
    createdAt: string;
    notes: string;
    environmentReport: ReportSectionContent | null;
    customerReport: ReportSectionContent | null;
    opportunityReport: ReportSectionContent | null;
    solutionReport: ReportSectionContent | null;
    teamReport: ReportSectionContent | null;
    advantageReport: ReportSectionContent | null;
    resultsReport: ReportSectionContent | null;
    fullReportText: string;
}