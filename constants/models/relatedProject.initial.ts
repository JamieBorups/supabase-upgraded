
import { RelatedProject } from '../../types';

export const initialRelatedProjectData: Omit<RelatedProject, 'id' | 'createdAt' | 'updatedAt'> = {
    title: '',
    organizations: '',
    reportUrl: '',
    description: '',
    notes: '',
    associatedProjectIds: [],
};