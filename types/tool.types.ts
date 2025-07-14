
import { FormData } from './project.types';
import { Task } from './task.types';

export interface ProposalSnapshot {
    id: string;
    projectId: string;
    createdAt: string;
    updatedAt?: string;
    notes: string;
    projectData: FormData;
    tasks: Task[];
    calculatedMetrics: {
        projectedRevenue: number;
        projectedAudience: number;
        numberOfPresentations: number;
        averageTicketPrice: number;
        averagePctSold: number;
        averageVenueCapacity: number;
    };
}

export type AssessableFieldKey = keyof Pick<FormData, 'projectTitle' | 'background' | 'projectDescription' | 'audience' | 'paymentAndConditions' | 'schedule' | 'culturalIntegrity' | 'communityImpact' | 'organizationalRationale' | 'artisticDevelopment'> | 'artisticDisciplinesAndGenres';

export interface AssessableField {
    key: AssessableFieldKey;
    label: string;
    wordLimit: number;
}
