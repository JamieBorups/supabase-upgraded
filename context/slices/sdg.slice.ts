import { AppState, Action } from '../../types';

export const sdgInitialState = {
    sdgAlignmentReports: [],
};

export const sdgReducer = (state: AppState, action: Action): Partial<AppState> => {
    switch (action.type) {
        case 'SET_SDG_REPORTS':
            return { sdgAlignmentReports: action.payload };
        
        case 'ADD_SDG_REPORT':
            return { sdgAlignmentReports: [...state.sdgAlignmentReports, action.payload] };

        case 'DELETE_SDG_REPORT':
            return {
                sdgAlignmentReports: state.sdgAlignmentReports.filter(r => r.id !== action.payload),
            };
        
        case 'DELETE_PROJECT':
            return {
                sdgAlignmentReports: state.sdgAlignmentReports.filter(r => r.projectId !== action.payload)
            };
            
        case 'LOAD_DATA':
            if (action.payload.sdgAlignmentReports) {
                return { sdgAlignmentReports: action.payload.sdgAlignmentReports };
            }
            return {};
            
        default:
            return {};
    }
};