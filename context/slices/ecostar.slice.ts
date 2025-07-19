
import { AppState, Action, EcoStarReport } from '../../types';

export const ecostarInitialState: { ecostarReports: EcoStarReport[] } = {
    ecostarReports: [],
};

export const ecostarReducer = (state: AppState, action: Action): Partial<AppState> => {
    switch (action.type) {
        case 'SET_ECOSTAR_REPORTS':
            return { ecostarReports: action.payload };
        
        case 'ADD_ECOSTAR_REPORT':
            return { ecostarReports: [...state.ecostarReports, action.payload] };

        case 'DELETE_ECOSTAR_REPORT':
            return {
                ecostarReports: state.ecostarReports.filter(r => r.id !== action.payload),
            };
        
        case 'DELETE_PROJECT':
            return {
                ecostarReports: state.ecostarReports.filter(r => r.projectId !== action.payload)
            };
            
        case 'LOAD_DATA':
            if (action.payload.ecostarReports) {
                return { ecostarReports: action.payload.ecostarReports };
            }
            return {};
            
        default:
            return {};
    }
};