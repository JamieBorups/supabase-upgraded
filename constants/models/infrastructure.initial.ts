
import { Infrastructure } from '../../types';

export const initialInfrastructureData: Omit<Infrastructure, 'id' | 'createdAt' | 'updatedAt'> = {
    name: '',
    facilityType: 'Community Hall',
    location: '',
    imageUrl: '',
    yearBuilt: null,
    description: '',
    currentStatus: '',
    lastInspectionDate: null,
    conditionReportUrl: '',
    infrastructuralIssues: '',
    deferredMaintenanceCosts: null,
    lifecycleStatus: 'Mid-life',
    maintenanceSchedule: '',
    assetValue: null,
    internalNotes: '',
};
