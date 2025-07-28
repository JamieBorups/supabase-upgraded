
import { AppState, Action, Infrastructure } from '../../types';

export const infrastructureInitialState: { infrastructure: Infrastructure[] } = {
    infrastructure: [],
};

export const infrastructureReducer = (state: AppState, action: Action): Partial<AppState> => {
    switch (action.type) {
        case 'SET_INFRASTRUCTURE':
            return { infrastructure: action.payload };
        case 'ADD_INFRASTRUCTURE':
            return { infrastructure: [...state.infrastructure, action.payload] };
        case 'UPDATE_INFRASTRUCTURE':
            return {
                infrastructure: state.infrastructure.map(item =>
                    item.id === action.payload.id ? action.payload : item
                ),
            };
        case 'DELETE_INFRASTRUCTURE':
            return {
                infrastructure: state.infrastructure.filter(item => item.id !== action.payload),
            };
        case 'LOAD_DATA':
            if (action.payload.infrastructure) {
                return { infrastructure: action.payload.infrastructure };
            }
            return {};
        default:
            return {};
    }
};
