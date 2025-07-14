
import { supabase } from '../../supabase.ts';
import { Venue, Event, TicketType, EventTicket } from '../../types.ts';
import { mapObjectToSnakeCase, mapObjectToCamelCase, handleResponse, mapVenueToDb, mapVenueFromDb } from './utils';

export const getVenues = async (): Promise<Venue[]> => (handleResponse(await supabase.from('venues').select('*'))).map(mapVenueFromDb);
export const addVenue = async (venue: Venue): Promise<Venue> => {
    const { id, ...rest } = venue;
    return mapVenueFromDb(handleResponse(await supabase.from('venues').insert(mapVenueToDb(rest)).select().single()));
};
export const updateVenue = async (id: string, venue: Venue): Promise<Venue> => mapVenueFromDb(handleResponse(await supabase.from('venues').update(mapVenueToDb(venue)).eq('id', id).select().single()));
export const deleteVenue = async (id: string): Promise<void> => handleResponse(await supabase.from('venues').delete().eq('id', id));

export const getEvents = async (): Promise<Event[]> => {
    const { data: eventsData, error } = await supabase.from('events').select('*, event_members(*)');
    handleResponse({ data: eventsData, error });
    return (eventsData || []).map(e => {
        const { event_members, ...rest } = e;
        const event = mapObjectToCamelCase(rest);
        event.assignedMembers = event_members.map((em: any) => ({ memberId: em.member_id, role: em.role }));
        return event;
    });
};
export const addEvent = async (event: Event): Promise<Event> => {
    const { id, assignedMembers, ...rest } = event;
    const { data, error } = await supabase.from('events').insert(mapObjectToSnakeCase(rest)).select().single();
    handleResponse({data, error});
    if (assignedMembers.length > 0) await supabase.from('event_members').insert(assignedMembers.map(am => ({ event_id: data.id, member_id: am.memberId, role: am.role })));
    return { ...mapObjectToCamelCase(data), assignedMembers };
};
export const addEvents = async (events: Event[]): Promise<Event[]> => {
    const eventsToInsert = events.map(e => {
        const { id, ...rest } = e;
        return mapObjectToSnakeCase(rest);
    });
    return mapObjectToCamelCase(handleResponse(await supabase.from('events').insert(eventsToInsert).select()));
};

export const updateEvent = async (id: string, event: Event): Promise<Event> => {
    const { assignedMembers, ...rest } = event;
    const { data, error } = await supabase.from('events').update(mapObjectToSnakeCase(rest)).eq('id', id).select().single();
    handleResponse({data, error});
    await supabase.from('event_members').delete().eq('event_id', id);
    if (assignedMembers.length > 0) await supabase.from('event_members').insert(assignedMembers.map(am => ({ event_id: id, member_id: am.memberId, role: am.role })));
    return { ...mapObjectToCamelCase(data), assignedMembers };
};
export const deleteEvent = async (id: string): Promise<void> => handleResponse(await supabase.from('events').delete().eq('id', id));
export const deleteEvents = async (ids: string[]): Promise<void> => handleResponse(await supabase.from('events').delete().in('id', ids));

export const getTicketTypes = async (): Promise<TicketType[]> => mapObjectToCamelCase(handleResponse(await supabase.from('ticket_types').select('*')));
export const addTicketType = async (tt: TicketType): Promise<TicketType> => {
    const { id, ...rest } = tt;
    return mapObjectToCamelCase(handleResponse(await supabase.from('ticket_types').insert(mapObjectToSnakeCase(rest)).select().single()));
};
export const updateTicketType = async (id: string, tt: TicketType): Promise<TicketType> => mapObjectToCamelCase(handleResponse(await supabase.from('ticket_types').update(mapObjectToSnakeCase(tt)).eq('id', id).select().single()));
export const deleteTicketType = async (id: string): Promise<void> => handleResponse(await supabase.from('ticket_types').delete().eq('id', id));

export const getEventTickets = async (): Promise<EventTicket[]> => mapObjectToCamelCase(handleResponse(await supabase.from('event_tickets').select('*')));
export const addEventTickets = async (ets: Omit<EventTicket, 'id'>[]): Promise<void> => handleResponse(await supabase.from('event_tickets').insert(ets.map(mapObjectToSnakeCase)));
export const setEventTickets = async (eventId: string, tickets: EventTicket[]): Promise<void> => {
    await supabase.from('event_tickets').delete().eq('event_id', eventId);
    if (tickets.length > 0) await supabase.from('event_tickets').insert(tickets.map(t => mapObjectToSnakeCase({...t, eventId})));
};
