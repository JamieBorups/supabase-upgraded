



import { AppState, Action, ProgramGuideline } from '../../types';

export const guidelinesInitialState: { programGuidelines: ProgramGuideline[] } = {
    programGuidelines: [],
};

export const guidelinesReducer = (state: AppState, action: Action): Partial<AppState> => {
    switch(action.type) {
        case 'SET_PROGRAM_GUIDELINES':
            return { programGuidelines: action.payload };
        
        case 'ADD_PROGRAM_GUIDELINE':
            return { programGuidelines: [...state.programGuidelines, action.payload] };

        case 'UPDATE_PROGRAM_GUIDELINE':
            return {
                programGuidelines: state.programGuidelines.map(g => g.id === action.payload.id ? action.payload : g)
            };
        
        case 'LOAD_DATA':
            if (action.payload.programGuidelines) {
                return { programGuidelines: action.payload.programGuidelines };
            }
            return {};

        default:
            return {};
    }
}