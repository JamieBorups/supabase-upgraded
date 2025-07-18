
import { AppState, Action } from '../../types';

export const experienceInitialState = {
    jobDescriptions: [],
};

export const experienceReducer = (state: AppState, action: Action): Partial<AppState> => {
    switch (action.type) {
        case 'SET_JOB_DESCRIPTIONS':
            return { jobDescriptions: action.payload };
        
        case 'ADD_JOB_DESCRIPTION':
            return { jobDescriptions: [...state.jobDescriptions, action.payload] };

        case 'UPDATE_JOB_DESCRIPTION':
            return {
                jobDescriptions: state.jobDescriptions.map(jd =>
                    jd.id === action.payload.id ? action.payload : jd
                ),
            };

        case 'DELETE_JOB_DESCRIPTION':
            return {
                jobDescriptions: state.jobDescriptions.filter(jd => jd.id !== action.payload),
            };

        case 'DELETE_PROJECT':
            return {
                jobDescriptions: state.jobDescriptions.filter(jd => jd.projectId !== action.payload)
            };
        
        case 'DELETE_MEMBER':
            return {
                jobDescriptions: state.jobDescriptions.map(jd => 
                    jd.memberId === action.payload ? { ...jd, memberId: null } : jd
                )
            };
            
        case 'LOAD_DATA':
            if (action.payload.jobDescriptions) {
                return { jobDescriptions: action.payload.jobDescriptions };
            }
            return {};
            
        default:
            return {};
    }
};
