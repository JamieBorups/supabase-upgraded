
import { AppState, Action } from '../../types';

export const kpiInitialState = {
    kpiLibrary: [],
    projectKpis: [],
    kpiReports: [],
};

export const kpiReducer = (state: AppState, action: Action): Partial<AppState> => {
    switch(action.type) {
        case 'SET_KPI_DATA':
            return {
                ...state,
                kpiLibrary: action.payload.kpiLibrary,
                projectKpis: action.payload.projectKpis,
                kpiReports: action.payload.kpiReports,
            };
        // Library actions
        case 'ADD_KPI_TO_LIBRARY':
            return { ...state, kpiLibrary: [...state.kpiLibrary, action.payload] };
        case 'ADD_KPIS_TO_LIBRARY':
            return { ...state, kpiLibrary: [...state.kpiLibrary, ...action.payload] };
        case 'UPDATE_KPI_IN_LIBRARY':
            return { ...state, kpiLibrary: state.kpiLibrary.map(k => k.id === action.payload.id ? action.payload : k) };
        case 'DELETE_KPI_FROM_LIBRARY': {
            const kpiIdToDelete = action.payload;
            return { 
                ...state, 
                kpiLibrary: state.kpiLibrary.filter(k => k.id !== kpiIdToDelete),
                projectKpis: state.projectKpis.filter(pk => pk.kpiLibraryId !== kpiIdToDelete)
            };
        }
        
        // Project KPI actions
        case 'ADD_PROJECT_KPIS':
            return { ...state, projectKpis: [...state.projectKpis, ...action.payload] };
        case 'SET_PROJECT_KPIS':
            return { ...state, projectKpis: action.payload };
        case 'UPDATE_PROJECT_KPI':
             return { ...state, projectKpis: state.projectKpis.map(pk => pk.id === action.payload.id ? action.payload : pk) };
        case 'DELETE_PROJECT_KPI':
            return { ...state, projectKpis: state.projectKpis.filter(pk => pk.id !== action.payload) };
            
        // Report actions
        case 'ADD_KPI_REPORT':
            return { ...state, kpiReports: [...state.kpiReports, action.payload] };
        case 'DELETE_KPI_REPORT':
            return { ...state, kpiReports: state.kpiReports.filter(r => r.id !== action.payload) };
            
        case 'DELETE_PROJECT':
            const projectId = action.payload;
            return {
                ...state,
                projectKpis: state.projectKpis.filter(pk => pk.projectId !== projectId),
                kpiReports: state.kpiReports.filter(r => r.projectId !== projectId),
            };

        default:
            return {};
    }
}
