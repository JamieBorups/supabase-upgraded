

export interface Kpi {
    id: string; // uuid
    kpiId: string; // e.g. KPI001
    title: string;
    description: string;
    createdAt?: string;
}

export interface ProjectKpi {
    id: string; // uuid
    projectId: string;
    kpiLibraryId: string;
    relevanceNotes?: string;
    targetValue?: string;
    currentValue?: string;
    createdAt?: string;
}

export interface KpiReport {
    id: string; // uuid
    projectId: string;
    notes?: string;
    fullReportText: string;
    kpiData?: {
        kpiDetails?: Kpi;
        relevanceNotes?: string;
        targetValue?: string;
        currentValue?: string;
    }[];
    createdAt?: string;
}