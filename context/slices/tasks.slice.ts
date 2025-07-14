
import { produce } from 'immer';
import { AppState, Action } from '../../types';

export const tasksInitialState = {
    tasks: [],
    activities: [],
    directExpenses: [],
};

export const tasksReducer = (state: AppState, action: Action): Partial<AppState> => {
    switch (action.type) {
        case 'SET_TASKS':
            return { tasks: action.payload };

        case 'ADD_TASK':
            return { tasks: [...state.tasks, action.payload] };

        case 'ADD_TASKS':
            return { tasks: [...state.tasks, ...action.payload] };

        case 'UPDATE_TASK':
            return {
                tasks: state.tasks.map(t =>
                    t.id === action.payload.id ? action.payload : t
                ),
            };

        case 'UPDATE_TASK_PARTIAL':
            return {
                tasks: state.tasks.map(t =>
                    t.id === action.payload.taskId ? { ...t, ...action.payload.data } : t
                ),
            };

        case 'DELETE_TASK': {
            const taskIdToDelete = action.payload;
            return {
                tasks: state.tasks.filter(t => t.id !== taskIdToDelete),
                activities: state.activities.filter(a => a.taskId !== taskIdToDelete),
            };
        }

        case 'DELETE_PROJECT': { // Also handle cascading deletes here
            const tasksToDelete = new Set(state.tasks.filter(t => t.projectId === action.payload).map(t => t.id));
            return {
                tasks: state.tasks.filter(t => t.projectId !== action.payload),
                activities: state.activities.filter(a => !tasksToDelete.has(a.taskId)),
                directExpenses: state.directExpenses.filter(d => d.projectId !== action.payload),
            };
        }

        case 'SET_ACTIVITIES':
            return { activities: action.payload };

        case 'ADD_ACTIVITIES':
            return { activities: [...state.activities, ...action.payload] };

        case 'UPDATE_ACTIVITY':
            return {
                activities: state.activities.map(a =>
                    a.id === action.payload.id ? action.payload : a
                ),
            };

        case 'APPROVE_ACTIVITY':
            return {
                activities: state.activities.map(a =>
                    a.id === action.payload ? { ...a, status: 'Approved' } : a
                ),
            };

        case 'DELETE_ACTIVITY':
            return { activities: state.activities.filter(a => a.id !== action.payload) };

        case 'SET_DIRECT_EXPENSES':
            return { directExpenses: action.payload };

        case 'ADD_DIRECT_EXPENSE':
            return { directExpenses: [...state.directExpenses, action.payload] };

        default:
            return {};
    }
};
