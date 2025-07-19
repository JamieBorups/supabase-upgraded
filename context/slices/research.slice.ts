



import { AppState, Action, ResearchPlan } from '../../types';

export const researchInitialState: { researchPlans: ResearchPlan[] } = {
    researchPlans: [],
};

export const researchReducer = (state: AppState, action: Action): Partial<AppState> => {
    switch (action.type) {
        case 'SET_RESEARCH_PLANS':
            return { researchPlans: action.payload };
        
        case 'ADD_RESEARCH_PLAN':
            // Prevent duplicates if an add action is dispatched multiple times
            if (state.researchPlans.some(p => p.id === action.payload.id)) {
                return {};
            }
            return { researchPlans: [...state.researchPlans, action.payload] };

        case 'UPDATE_RESEARCH_PLAN':
            return {
                researchPlans: state.researchPlans.map(r => r.id === action.payload.id ? action.payload : r),
            };

        case 'DELETE_RESEARCH_PLAN':
            return {
                researchPlans: state.researchPlans.filter(r => r.id !== action.payload),
            };
        
        case 'DELETE_PROJECT':
            return {
                researchPlans: state.researchPlans.filter(r => r.projectId !== action.payload)
            };
            
        case 'LOAD_DATA':
            if (action.payload.researchPlans) {
                return { researchPlans: action.payload.researchPlans };
            }
            return {};
            
        default:
            return {};
    }
};