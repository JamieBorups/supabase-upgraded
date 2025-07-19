
import { AppState, Action, NewsRelease, Contact, Interaction } from '../../types';

export const mediaInitialState: { newsReleases: NewsRelease[], contacts: Contact[], interactions: Interaction[] } = {
    newsReleases: [],
    contacts: [],
    interactions: [],
};

export const mediaReducer = (state: AppState, action: Action): Partial<AppState> => {
    switch (action.type) {
        case 'ADD_NEWS_RELEASE':
            return { newsReleases: [...state.newsReleases, action.payload] };
        case 'UPDATE_NEWS_RELEASE':
            return { newsReleases: state.newsReleases.map(nr => nr.id === action.payload.id ? action.payload : nr) };
        case 'DELETE_NEWS_RELEASE':
            return { newsReleases: state.newsReleases.filter(nr => nr.id !== action.payload) };

        case 'ADD_CONTACT':
            return { contacts: [...state.contacts, action.payload] };
        case 'UPDATE_CONTACT':
            return { contacts: state.contacts.map(c => c.id === action.payload.id ? action.payload : c) };
        case 'DELETE_CONTACT': {
            const contactIdToDelete = action.payload;
            return {
                contacts: state.contacts.filter(c => c.id !== contactIdToDelete),
                interactions: state.interactions.filter(i => i.contactId !== contactIdToDelete),
            };
        }
        case 'SET_CONTACTS':
            return { contacts: action.payload };

        case 'ADD_INTERACTION':
            return { interactions: [...state.interactions, action.payload] };
        case 'UPDATE_INTERACTION':
            return { interactions: state.interactions.map(i => i.id === action.payload.id ? action.payload : i) };
        case 'DELETE_INTERACTION':
            return { interactions: state.interactions.filter(i => i.id !== action.payload) };
        case 'SET_INTERACTIONS':
            return { interactions: action.payload };
            
        case 'DELETE_PROJECT': { // Cascading delete
            const projectIdToDelete = action.payload;
            const updatedContacts = state.contacts.map(contact => {
                const newAssociatedIds = contact.associatedProjectIds.filter(id => id !== projectIdToDelete);
                return { ...contact, associatedProjectIds: newAssociatedIds };
            });
            return {
                newsReleases: state.newsReleases.filter(nr => nr.projectId !== projectIdToDelete),
                contacts: updatedContacts,
            };
        }

        default:
            return {};
    }
};