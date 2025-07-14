
import { AppState, Action } from '../../types';
import { RecreationFrameworkReport } from '../../types';

export const recreationInitialState = {
    recreationFrameworkReports: [],
};

export const recreationReducer = (state: AppState, action: Action): Partial<AppState> => {
    switch (action.type) {
        case 'SET_RECREATION_REPORTS':
            return { recreationFrameworkReports: action.payload };
        
        case 'ADD_RECREATION_REPORT':
            // Check if a report with this ID already exists to prevent duplicates
            const existingIndex = state.recreationFrameworkReports.findIndex(r => r.id === action.payload.id);
            if (existingIndex > -1) {
                 // If it exists, update it. This case is for minor edits, though the main flow is adding.
                const updatedReports = [...state.recreationFrameworkReports];
                updatedReports[existingIndex] = action.payload;
                return { recreationFrameworkReports: updatedReports };
            }
            // If it doesn't exist, add it.
            return { recreationFrameworkReports: [...state.recreationFrameworkReports, action.payload] };

        case 'DELETE_RECREATION_REPORT':
            return {
                recreationFrameworkReports: state.recreationFrameworkReports.filter(r => r.id !== action.payload),
            };
        
        case 'DELETE_PROJECT':
            return {
                recreationFrameworkReports: state.recreationFrameworkReports.filter(r => r.projectId !== action.payload)
            };
            
        case 'LOAD_DATA':
            if (action.payload.recreationFrameworkReports) {
                return { recreationFrameworkReports: action.payload.recreationFrameworkReports };
            }
            return {};
            
        default:
            return {};
    }
};
