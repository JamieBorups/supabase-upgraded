
import { produce } from 'immer';
import { AppState, Action, FormData, ProposalSnapshot } from '../../types';

export const projectsInitialState: { projects: FormData[], proposals: ProposalSnapshot[] } = {
    projects: [],
    proposals: [],
};

export const projectsReducer = (state: AppState, action: Action): Partial<AppState> => {
    switch (action.type) {
        case 'SET_PROJECTS':
            return { projects: action.payload };
        
        case 'ADD_PROJECT':
            return { projects: [...state.projects, action.payload] };

        case 'UPDATE_PROJECT':
            return {
                projects: state.projects.map(p =>
                    p.id === action.payload.id ? action.payload : p
                ),
            };
        
        case 'UPDATE_PROJECT_PARTIAL':
            return {
                projects: state.projects.map(p =>
                    p.id === action.payload.projectId ? { ...p, ...action.payload.data } : p
                ),
            };
        
        case 'UPDATE_PROJECT_STATUS':
             return {
                projects: state.projects.map(p =>
                    p.id === action.payload.projectId ? { ...p, status: action.payload.status } : p
                ),
             };
        
        case 'DELETE_PROJECT': {
            const projectIdToDelete = action.payload;
            return {
                projects: state.projects.filter(p => p.id !== projectIdToDelete),
                proposals: state.proposals.filter(p => p.projectId !== projectIdToDelete),
                ecostarReports: state.ecostarReports.filter(r => r.projectId !== projectIdToDelete),
                interestCompatibilityReports: state.interestCompatibilityReports.filter(r => r.projectId !== projectIdToDelete),
                sdgAlignmentReports: state.sdgAlignmentReports.filter(r => r.projectId !== projectIdToDelete),
            };
        }
            
        case 'CREATE_PROPOSAL_SNAPSHOT':
            return { proposals: [...state.proposals, action.payload] };
        
        case 'UPDATE_PROPOSAL_SNAPSHOT':
            return {
                proposals: state.proposals.map(p =>
                    p.id === action.payload.id ? action.payload : p
                ),
            };

        case 'DELETE_PROPOSAL_SNAPSHOT':
            return { proposals: state.proposals.filter(p => p.id !== action.payload) };

        default:
            return {};
    }
};