
import { produce } from 'immer';
import { AppState, Action, Member, User } from '../../types';

export const membersInitialState: { members: Member[], users: User[] } = {
    members: [],
    users: [],
};

export const membersReducer = (state: AppState, action: Action): Partial<AppState> => {
    switch (action.type) {
        case 'SET_MEMBERS':
            return { members: action.payload };
            
        case 'ADD_MEMBER':
            return { members: [...state.members, action.payload] };

        case 'UPDATE_MEMBER':
            return {
                members: state.members.map(m =>
                    m.id === action.payload.id ? action.payload : m
                ),
            };

        case 'DELETE_MEMBER': {
            const memberIdToDelete = action.payload;
            const updatedProjects = state.projects.map(p => {
                const newCollaborators = p.collaboratorDetails.filter(c => c.memberId !== memberIdToDelete);
                return { ...p, collaboratorDetails: newCollaborators };
            });
            const updatedTasks = state.tasks.map(t => {
                if (t.assignedMemberId === memberIdToDelete) {
                    return { ...t, assignedMemberId: '' };
                }
                return t;
            });
            return {
                members: state.members.filter(m => m.id !== memberIdToDelete),
                projects: updatedProjects,
                tasks: updatedTasks,
            };
        }
        
        case 'SET_USERS':
            return { users: action.payload };

        case 'ADD_USER':
            return { users: [...state.users, action.payload] };

        case 'UPDATE_USER':
            return {
                users: state.users.map(u =>
                    u.id === action.payload.id ? action.payload : u
                ),
            };

        case 'DELETE_USER':
            return { users: state.users.filter(u => u.id !== action.payload) };

        default:
            return {};
    }
};