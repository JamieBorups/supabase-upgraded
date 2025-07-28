
import { AppState, Action, ResearchPlan, RelatedProject } from '../../types';

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

export const relatedProjectsReducer = (state: AppState, action: Action): Partial<AppState> => {
    switch (action.type) {
        case 'SET_RELATED_PROJECTS':
            return { relatedProjects: action.payload };
        
        case 'ADD_RELATED_PROJECT':
            return { relatedProjects: [...state.relatedProjects, action.payload] };

        case 'UPDATE_RELATED_PROJECT':
            return {
                relatedProjects: state.relatedProjects.map(rp => 
                    rp.id === action.payload.id ? action.payload : rp
                ),
            };

        case 'DELETE_RELATED_PROJECT':
            return {
                relatedProjects: state.relatedProjects.filter(rp => rp.id !== action.payload),
                researchPlans: state.researchPlans.map(plan => ({
                    ...plan,
                    relatedProjectIds: (plan.relatedProjectIds || []).filter(id => id !== action.payload)
                }))
            };
            
        case 'DELETE_PROJECT':
             return {
                relatedProjects: state.relatedProjects.map(rp => ({
                    ...rp,
                    associatedProjectIds: rp.associatedProjectIds.filter(id => id !== action.payload)
                }))
            };

        case 'LOAD_DATA':
            if (action.payload.relatedProjects) {
                return { relatedProjects: action.payload.relatedProjects };
            }
            return {};
            
        default:
            return {};
    }
};