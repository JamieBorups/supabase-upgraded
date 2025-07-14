


import { AppState, Action } from '../../types';
import { initialSettings } from '../../constants.ts';

export const settingsInitialState = {
    settings: initialSettings,
};

export const settingsReducer = (state: AppState, action: Action): Partial<AppState> => {
    switch (action.type) {
        case 'UPDATE_SETTINGS':
            return { settings: action.payload };
            
        case 'LOAD_DATA':
            if (action.payload.settings) {
                return { settings: action.payload.settings };
            }
            return {};

        case 'CLEAR_ALL_DATA':
            return { settings: state.settings }; // Preserve settings on clear

        default:
            return {};
    }
};