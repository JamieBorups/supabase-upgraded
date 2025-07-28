import { AppState, Action, NohfcApplication } from '../../types';

export const nohfcInitialState: { nohfcApplications: NohfcApplication[] } = {
    nohfcApplications: [],
};

export const nohfcReducer = (state: AppState, action: Action): Partial<AppState> => {
    switch (action.type) {
        case 'SET_NOHFC_APPLICATIONS':
            return { nohfcApplications: action.payload };
        
        case 'ADD_NOHFC_APPLICATION':
            return { nohfcApplications: [...state.nohfcApplications, action.payload] };

        case 'UPDATE_NOHFC_APPLICATION':
            return {
                nohfcApplications: state.nohfcApplications.map(app => 
                    app.id === action.payload.id ? action.payload : app
                ),
            };

        case 'DELETE_NOHFC_APPLICATION':
            return {
                nohfcApplications: state.nohfcApplications.filter(app => app.id !== action.payload),
            };
            
        case 'DELETE_PROJECT':
            return {
                 nohfcApplications: state.nohfcApplications.filter(app => app.projectId !== action.payload)
            };

        case 'LOAD_DATA':
            if (action.payload.nohfcApplications) {
                return { nohfcApplications: action.payload.nohfcApplications };
            }
            return {};
            
        default:
            return {};
    }
};
