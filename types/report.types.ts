export interface Highlight {
    id: string;
    projectId: string;
    title: string;
    url: string;
}

export interface Report {
    id:string;
    projectId: string;
    projectResults: string;
    grantSpendingDescription: string;
    workplanAdjustments: string;
    involvedPeople: string[];
    involvedActivities: string[];
    impactStatements: Record<string, string>;
    feedback: string;
    additionalFeedback: string;
}
