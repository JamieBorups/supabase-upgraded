import { AppState, Action, Risk } from '../../types';

export const risksInitialState: { risks: Risk[] } = {
    risks: [],
};

export const risksReducer = (state: AppState, action: Action): Partial<AppState> => {
    switch (action.type) {
        case 'SET_RISKS':
            return { risks: action.payload };
        
        case 'ADD_RISK':
            return { risks: [...state.risks, action.payload] };

        case 'UPDATE_RISK':
            return {
                risks: state.risks.map(r => r.id === action.payload.id ? action.payload : r),
            };

        case 'DELETE_RISK':
            return {
                risks: state.risks.filter(r => r.id !== action.payload),
            };
        
        case 'DELETE_PROJECT':
            return {
                risks: state.risks.filter(r => r.projectId !== action.payload)
            };
            
        case 'LOAD_DATA':
            if (action.payload.risks) {
                return { risks: action.payload.risks };
            }
            return {};
            
        default:
            return {};
    }
};
