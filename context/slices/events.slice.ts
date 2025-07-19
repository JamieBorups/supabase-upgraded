
import { AppState, Action, Venue, Event, TicketType, EventTicket } from '../../types';

export const eventsInitialState: { venues: Venue[], events: Event[], ticketTypes: TicketType[], eventTickets: EventTicket[] } = {
    venues: [],
    events: [],
    ticketTypes: [],
    eventTickets: [],
};

export const eventsReducer = (state: AppState, action: Action): Partial<AppState> => {
    switch (action.type) {
        case 'SET_VENUES':
            return { venues: action.payload };
        case 'ADD_VENUE':
            return { venues: [...state.venues, action.payload] };
        case 'UPDATE_VENUE':
            return { venues: state.venues.map(v => v.id === action.payload.id ? action.payload : v) };
        case 'DELETE_VENUE':
            return { venues: state.venues.filter(v => v.id !== action.payload) };

        case 'SET_EVENTS':
            return { events: action.payload };
        case 'ADD_EVENT':
            return { events: [...state.events, action.payload] };
        case 'ADD_EVENTS':
            return { events: [...state.events, ...action.payload] };
        case 'UPDATE_EVENT':
            return { events: state.events.map(e => e.id === action.payload.id ? action.payload : e) };
        case 'DELETE_EVENT':
            return { events: state.events.filter(e => e.id !== action.payload) };
        case 'DELETE_EVENTS': {
            const eventIdsToDelete = new Set(action.payload);
            return { events: state.events.filter(e => !eventIdsToDelete.has(e.id)) };
        }
            
        case 'DELETE_PROJECT': // Cascading delete
            return { events: state.events.filter(e => e.projectId !== action.payload) };

        case 'SET_TICKET_TYPES':
            return { ticketTypes: action.payload };
        case 'ADD_TICKET_TYPE':
            return { ticketTypes: [...state.ticketTypes, action.payload] };
        case 'UPDATE_TICKET_TYPE':
            return { ticketTypes: state.ticketTypes.map(tt => tt.id === action.payload.id ? action.payload : tt) };
        case 'DELETE_TICKET_TYPE':
            return { ticketTypes: state.ticketTypes.filter(tt => tt.id !== action.payload) };

        case 'SET_EVENT_TICKETS':
            return { eventTickets: action.payload };
            
        case 'LOAD_EVENT_DATA':
            return {
                venues: action.payload.venues,
                events: action.payload.events,
                ticketTypes: action.payload.ticketTypes,
                eventTickets: action.payload.eventTickets
            };

        default:
            return {};
    }
};