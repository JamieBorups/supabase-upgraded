
import { AppState, Action } from '../../types';

export const reportsInitialState = {
    reports: [],
    highlights: [],
};

export const reportsReducer = (state: AppState, action: Action): Partial<AppState> => {
    switch (action.type) {
        case 'SET_REPORTS':
            return { reports: action.payload };
        case 'ADD_REPORT':
            return { reports: [...state.reports, action.payload] };
        case 'UPDATE_REPORT':
            return {
                reports: state.reports.map(r =>
                    r.id === action.payload.id ? action.payload : r
                ),
            };

        case 'SET_HIGHLIGHTS':
            return { highlights: action.payload };
        case 'ADD_HIGHLIGHT':
            return { highlights: [...state.highlights, action.payload] };
        case 'UPDATE_HIGHLIGHT':
            return {
                highlights: state.highlights.map(h =>
                    h.id === action.payload.id ? action.payload : h
                ),
            };
        case 'DELETE_HIGHLIGHT':
            return { highlights: state.highlights.filter(h => h.id !== action.payload) };

        case 'DELETE_PROJECT': // Cascading delete
            const projectIdToDelete = action.payload;
            return {
                reports: state.reports.filter(r => r.projectId !== projectIdToDelete),
                highlights: state.highlights.filter(h => h.projectId !== projectIdToDelete),
            };

        default:
            return {};
    }
};
