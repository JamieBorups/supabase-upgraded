
export interface Infrastructure {
    id: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    facilityType: string;
    location: string;
    imageUrl: string;
    yearBuilt: number | null;
    description: string;
    currentStatus: string;
    lastInspectionDate: string | null;
    conditionReportUrl: string;
    infrastructuralIssues: string;
    deferredMaintenanceCosts: number | null;
    lifecycleStatus: string;
    maintenanceSchedule: string;
    assetValue: number | null;
    internalNotes: string;
}
