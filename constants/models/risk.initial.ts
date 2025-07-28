
import { Risk } from '../../types.ts';

export const initialRiskData: Omit<Risk, 'id' | 'createdAt' | 'projectId'> = {
    heading: '',
    riskDescription: '',
    mitigationPlan: '',
    riskLevel: 'Low',
    additionalNotes: '',
};
