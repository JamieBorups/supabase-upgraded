import { RecreationFrameworkReport } from '../../types.ts';

export const initialRecreationReportData: Omit<RecreationFrameworkReport, 'id' | 'projectId' | 'createdAt'> = {
    notes: '',
    executiveSummary: '',
    activeLiving: '',
    inclusionAndAccess: '',
    connectingPeopleWithNature: '',
    supportiveEnvironments: '',
    recreationCapacity: '',
    closingSection: '',
    fullReportText: '',
};
