



import { AppState, Action, OtfApplication, ProgramGuideline } from '../../types';

export const otfInitialState: { otfApplications: OtfApplication[], programGuidelines: ProgramGuideline[] } = {
    otfApplications: [],
    programGuidelines: [],
};

export const otfReducer = (state: AppState, action: Action): Partial<AppState> => {
    switch (action.type) {
        case 'SET_OTF_APPLICATIONS':
            return { otfApplications: action.payload };
        
        case 'ADD_OTF_APPLICATION':
            return { otfApplications: [...state.otfApplications, action.payload] };

        case 'UPDATE_OTF_APPLICATION':
            return {
                otfApplications: state.otfApplications.map(app => 
                    app.id === action.payload.id ? action.payload : app
                ),
            };

        case 'DELETE_OTF_APPLICATION':
            return {
                otfApplications: state.otfApplications.filter(app => app.id !== action.payload),
            };
            
        case 'DELETE_PROJECT':
            // Although OTF applications are not directly linked to projects in the state,
            // this is a good place to put this logic if that changes in the future.
            // For now, no action is needed as they are separate entities in the UI.
            return {};

        case 'LOAD_DATA':
            if (action.payload.otfApplications) {
                return { otfApplications: action.payload.otfApplications };
            }
            return {};
            
        default:
            return {};
    }
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