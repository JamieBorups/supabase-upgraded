
import { AppState, Action, InterestCompatibilityReport } from '../../types';

export const interestCompatibilityInitialState: { interestCompatibilityReports: InterestCompatibilityReport[] } = {
    interestCompatibilityReports: [],
};

export const interestCompatibilityReducer = (state: AppState, action: Action): Partial<AppState> => {
    switch (action.type) {
        case 'SET_INTEREST_COMPATIBILITY_REPORTS':
            return { interestCompatibilityReports: action.payload };
        
        case 'ADD_INTEREST_COMPATIBILITY_REPORT':
            return { interestCompatibilityReports: [...state.interestCompatibilityReports, action.payload] };

        case 'DELETE_INTEREST_COMPATIBILITY_REPORT':
            return {
                interestCompatibilityReports: state.interestCompatibilityReports.filter(r => r.id !== action.payload),
            };
        
        case 'DELETE_PROJECT':
            return {
                interestCompatibilityReports: state.interestCompatibilityReports.filter(r => r.projectId !== action.payload)
            };
            
        case 'LOAD_DATA':
            if (action.payload.interestCompatibilityReports) {
                return { interestCompatibilityReports: action.payload.interestCompatibilityReports };
            }
            return {};
            
        default:
            return {};
    }
};