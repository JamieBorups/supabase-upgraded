
export interface DetailedSdgAlignment {
    goalNumber: number;
    goalTitle: string;
    alignmentNarrative: string;
    strategicValue: string;
    challengesAndMitigation: string;
}

export interface SdgAlignmentReport {
    id: string;
    projectId: string;
    createdAt: string;
    notes: string;
    executiveSummary: string;
    detailedAnalysis: DetailedSdgAlignment[];
    strategicRecommendations: string[];
    fullReportText: string;
}
