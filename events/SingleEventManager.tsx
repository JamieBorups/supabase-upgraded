
import React, { useState } from 'react';
import { RRule } from 'rrule';
import { useAppContext } from '../../context/AppContext';
import { Event, EventTicket, RecurrenceRule } from '../../types';
import { initialEventData } from '../../constants';
import ConfirmationModal from '../ui/ConfirmationModal';
import EventList from './EventList';
import EventEditor from './EventEditor';
import EventViewer from './EventViewer';
import EditRecurrenceChoiceModal from './EditRecurrenceChoiceModal';
import * as api from '../../services/api';

type ViewMode = 'list' | 'edit' | 'view';

const SingleEventManager: React.FC = () => {
  const { state, dispatch, notify } = useAppContext();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [editChoice, setEditChoice] = useState<{ event: Event, onChoose: (choice: 'one' | 'all') => void } | null>(null);

  const handleAddEvent = () => {
    const now = new Date().toISOString();
    setCurrentEvent({ ...initialEventData, id: `new_event_${Date.now()}`, createdAt: now, updatedAt: now });
    setViewMode('edit');
  };
  
  const handleViewEvent = (id: string) => {
    const event = state.events.find(e => e.id === id);
    if (event) {
        setCurrentEvent(event);
        setViewMode('view');
    }
  };

  const handleEditEvent = (id: string) => {
    const event = state.events.find(e => e.id === id);
    if (event) {
        if (event.parentEventId) {
            setEditChoice({
                event,
                onChoose: (choice) => {
                    if (choice === 'one') {
                        setCurrentEvent(event);
                        setViewMode('edit');
                    } else { // 'all'
                        const parentEvent = state.events.find(e => e.id === event.parentEventId);
                        setCurrentEvent(parentEvent || event);
                        setViewMode('edit');
                    }
                    setEditChoice(null);
                }
            });
        } else {
            setCurrentEvent(event);
            setViewMode('edit');
        }
    }
  };

  const handleDeleteEvent = (event: Event) => {
    setEventToDelete(event);
    setIsDeleteModalOpen(true);
  };
  
  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;
    
    try {
        if (eventToDelete.isTemplate) {
            const childrenIds = state.events.filter(e => e.parentEventId === eventToDelete.id).map(e => e.id);
            await api.deleteEvents([eventToDelete.id, ...childrenIds]);
            dispatch({ type: 'DELETE_EVENTS', payload: [eventToDelete.id, ...childrenIds] });
            notify('Event series and all occurrences deleted.', 'success');
        } else {
            await api.deleteEvent(eventToDelete.id);
            dispatch({ type: 'DELETE_EVENT', payload: eventToDelete.id });
            notify('Event deleted.', 'success');
        }
    } catch (error: any) {
        notify(`Error deleting event(s): ${error.message}`, 'error');
    }

    setIsDeleteModalOpen(false);
    setEventToDelete(null);
  };

  const handleBackToList = () => {
    setViewMode('list');
    setCurrentEvent(null);
  };

  const generateAndStageChildren = (parent: Event, tickets: EventTicket[], rule: RecurrenceRule, preservedChildren: Event[] = []) => {
      const preservedDates = new Set(preservedChildren.map(e => e.startDate));

      const jsToRruleDayMap: { [key: number]: any } = { 0: RRule.SU, 1: RRule.MO, 2: RRule.TU, 3: RRule.WE, 4: RRule.TH, 5: RRule.FR, 6: RRule.SA };
      const rruleWeekdays = rule.daysOfWeek?.map(d => jsToRruleDayMap[d]);
      
      const rrule = new RRule({
          freq: RRule[rule.frequency.toUpperCase() as 'DAILY' | 'WEEKLY' | 'MONTHLY'],
          interval: rule.interval, byweekday: rruleWeekdays,
          dtstart: new Date(parent.startDate + 'T12:00:00Z'),
          until: rule.endCondition.type === 'date' ? new Date(rule.endCondition.value as string + 'T23:59:59Z') : null,
          count: rule.endCondition.type === 'count' ? (rule.endCondition.value as number) : null,
      });

      const allGeneratedDates = rrule.all();
      const newDatesToCreate = allGeneratedDates.filter(date => !preservedDates.has(date.toISOString().split('T')[0]));
      
      const { id, recurrenceRule: rr, isTemplate: it, assignedMembers, ...parentDataForChild } = parent;

      const newChildren = newDatesToCreate.map((date): Omit<Event, 'id' | 'createdAt' | 'updatedAt'> => {
          const startDate = date.toISOString().split('T')[0];
          return { ...parentDataForChild, assignedMembers: [], isTemplate: false, parentEventId: parent.id, isOverride: false, recurrenceRule: null, startDate, endDate: startDate };
      });

      const newChildTickets = newChildren.flatMap(child => 
        tickets.map(ticketTemplate => {
            const { id, eventId, soldCount, ...restOfTicket } = ticketTemplate;
            return { ...restOfTicket, soldCount: 0, eventId: `placeholder_for_${child.title}` };
        })
      );
      
      return { newChildren: newChildren as Event[], newChildTickets: newChildTickets as Omit<EventTicket, 'id'>[] };
  };
  
  // --- DEDICATED SAVE FUNCTIONS ---

  const saveNewStandaloneEvent = async (eventData: Event, tickets: EventTicket[]) => {
    const eventToSave: Event = { ...eventData, updatedAt: new Date().toISOString(), isTemplate: false, parentEventId: null, recurrenceRule: null };
    const savedEvent = await api.addEvent(eventToSave);
    if (tickets.length > 0) {
        await api.setEventTickets(savedEvent.id, tickets.map(t => ({...t, eventId: savedEvent.id})));
    }
    const finalEventTickets = await api.getEventTickets();
    dispatch({ type: 'ADD_EVENT', payload: savedEvent });
    dispatch({ type: 'SET_EVENT_TICKETS', payload: finalEventTickets });
    notify('Event created successfully.', 'success');
  };

  const saveNewRecurringSeries = async (eventData: Event, tickets: EventTicket[], rule: RecurrenceRule) => {
    const parentEventData: Event = { ...eventData, isTemplate: true, recurrenceRule: rule, updatedAt: new Date().toISOString() };
    const savedParent = await api.addEvent(parentEventData);
    if (tickets.length > 0) {
        await api.setEventTickets(savedParent.id, tickets.map(t => ({ ...t, eventId: savedParent.id })));
    }

    const { newChildren, newChildTickets } = generateAndStageChildren(savedParent, tickets, rule);
    
    if (newChildren.length > 0) {
        const savedChildren = await api.addEvents(newChildren);
        const ticketsForChildren = savedChildren.flatMap(child =>
            newChildTickets
            .filter(t => t.eventId.endsWith(child.title))
            .map(ticket => ({...ticket, eventId: child.id}))
        );
        if (ticketsForChildren.length > 0) {
            await api.addEventTickets(ticketsForChildren as Omit<EventTicket, 'id'>[]);
        }
        dispatch({ type: 'ADD_EVENTS', payload: savedChildren });
    }
    
    dispatch({ type: 'ADD_EVENT', payload: savedParent });
    const finalEventTickets = await api.getEventTickets();
    dispatch({ type: 'SET_EVENT_TICKETS', payload: finalEventTickets });
    notify(`Event series created with ${newChildren.length} occurrences.`, 'success');
  };

  const updateStandaloneEvent = async (eventData: Event, tickets: EventTicket[]) => {
    const eventToSave: Event = { ...eventData, updatedAt: new Date().toISOString() };
    const savedEvent = await api.updateEvent(eventToSave.id, eventToSave);
     if (tickets.length > 0) {
        await api.setEventTickets(savedEvent.id, tickets.map(t => ({...t, eventId: savedEvent.id})));
    }
    const finalEventTickets = await api.getEventTickets();
    dispatch({ type: 'UPDATE_EVENT', payload: savedEvent });
    dispatch({ type: 'SET_EVENT_TICKETS', payload: finalEventTickets });
    notify('Event updated successfully.', 'success');
  };

  const updateSingleOccurrence = async (eventData: Event, tickets: EventTicket[]) => {
    const finalEventData: Event = { ...eventData, updatedAt: new Date().toISOString(), isOverride: true, isTemplate: false, recurrenceRule: null };
    const savedEvent = await api.updateEvent(finalEventData.id, finalEventData);
    if (tickets.length > 0) {
        await api.setEventTickets(savedEvent.id, tickets.map(t => ({...t, eventId: savedEvent.id})));
    }
    const finalEventTickets = await api.getEventTickets();
    dispatch({ type: 'UPDATE_EVENT', payload: savedEvent });
    dispatch({ type: 'SET_EVENT_TICKETS', payload: finalEventTickets });
    notify('Event occurrence updated successfully.', 'success');
  };

  const updateRecurringSeries = async (templateData: Event, tickets: EventTicket[], rule: RecurrenceRule | null) => {
    const parentEventData: Event = { ...templateData, updatedAt: new Date().toISOString(), recurrenceRule: rule, isTemplate: true };
    const updatedParent = await api.updateEvent(parentEventData.id, parentEventData);
    if (tickets.length > 0) {
        await api.setEventTickets(updatedParent.id, tickets.map(t => ({...t, eventId: updatedParent.id})));
    }

    const allOldChildren = state.events.filter(e => e.parentEventId === updatedParent.id);
    const preservedChildren = allOldChildren.filter(e => e.status === 'Completed' || e.isOverride);
    const deletableChildrenIds = allOldChildren.filter(e => !preservedChildren.some(pc => pc.id === e.id)).map(e => e.id);
    
    if (deletableChildrenIds.length > 0) {
        await api.deleteEvents(deletableChildrenIds);
    }

    let newChildren: Event[] = [];
    let newChildTickets: Omit<EventTicket, 'id'>[] = [];
    if (rule) {
        const generated = generateAndStageChildren(updatedParent, tickets, rule, preservedChildren);
        newChildren = generated.newChildren;
        newChildTickets = generated.newChildTickets;
    }
    
    if (newChildren.length > 0) {
        const savedNewChildren = await api.addEvents(newChildren);
        const ticketsForChildren = savedNewChildren.flatMap(child => 
            newChildTickets
            .filter(t => t.eventId.endsWith(child.title))
            .map(ticket => ({...ticket, eventId: child.id}))
        );
        if (ticketsForChildren.length > 0) {
            await api.addEventTickets(ticketsForChildren as Omit<EventTicket, 'id'>[]);
        }
        dispatch({ type: 'ADD_EVENTS', payload: savedNewChildren });
    }
    
    dispatch({ type: 'DELETE_EVENTS', payload: deletableChildrenIds });
    dispatch({ type: 'UPDATE_EVENT', payload: updatedParent });
    
    const finalEventTickets = await api.getEventTickets();
    dispatch({ type: 'SET_EVENT_TICKETS', payload: finalEventTickets });

    notify(`Event series updated.`, 'success');
  };

  const convertStandaloneToRecurring = async (eventData: Event, tickets: EventTicket[], rule: RecurrenceRule) => {
    const parentEventData: Event = { ...eventData, isTemplate: true, recurrenceRule: rule, updatedAt: new Date().toISOString() };
    const updatedParent = await api.updateEvent(parentEventData.id, parentEventData);
    if (tickets.length > 0) {
        await api.setEventTickets(updatedParent.id, tickets.map(t => ({...t, eventId: updatedParent.id})));
    }
    
    const { newChildren, newChildTickets } = generateAndStageChildren(updatedParent, tickets, rule);

    if (newChildren.length > 0) {
        const savedChildren = await api.addEvents(newChildren);
        const ticketsForChildren = savedChildren.flatMap(child =>
             newChildTickets
            .filter(t => t.eventId.endsWith(child.title))
            .map(ticket => ({...ticket, eventId: child.id}))
        );
        if (ticketsForChildren.length > 0) {
            await api.addEventTickets(ticketsForChildren as Omit<EventTicket, 'id'>[]);
        }
        dispatch({ type: 'ADD_EVENTS', payload: savedChildren });
    }
    
    dispatch({ type: 'UPDATE_EVENT', payload: updatedParent });
    const finalEventTickets = await api.getEventTickets();
    dispatch({ type: 'SET_EVENT_TICKETS', payload: finalEventTickets });
    notify('Event converted to a recurring series.', 'success');
  };

  // --- SAVE ROUTER ---
  const handleSaveEvent = async (eventDataFromEditor: Event, ticketsForEvent: EventTicket[], recurrenceRuleFromEditor: RecurrenceRule | null) => {
    try {
        const isNew = eventDataFromEditor.id.startsWith('new_');
        const originalEvent = isNew ? null : state.events.find(e => e.id === eventDataFromEditor.id);

        if (isNew) {
            if (recurrenceRuleFromEditor) {
                await saveNewRecurringSeries(eventDataFromEditor, ticketsForEvent, recurrenceRuleFromEditor);
            } else {
                await saveNewStandaloneEvent(eventDataFromEditor, ticketsForEvent);
            }
        } else { // Is an update
            if (!originalEvent) throw new Error("Original event not found for update.");

            if (originalEvent.isTemplate) {
                await updateRecurringSeries(eventDataFromEditor, ticketsForEvent, recurrenceRuleFromEditor);
            } else if (originalEvent.parentEventId) {
                await updateSingleOccurrence(eventDataFromEditor, ticketsForEvent);
            } else { // Standalone event
                if (recurrenceRuleFromEditor) {
                    await convertStandaloneToRecurring(eventDataFromEditor, ticketsForEvent, recurrenceRuleFromEditor);
                } else {
                    await updateStandaloneEvent(eventDataFromEditor, ticketsForEvent);
                }
            }
        }
        
        setViewMode('list');
        setCurrentEvent(null);

    } catch (error: any) {
        console.error("Error during save:", error);
        notify(`An error occurred while saving: ${error.message}`, 'error');
    }
  };


  return (
    <>
      {viewMode === 'list' && (
        <EventList 
          events={state.events}
          onAddEvent={handleAddEvent}
          onEditEvent={handleEditEvent}
          onDeleteEvent={handleDeleteEvent}
          onViewEvent={handleViewEvent}
        />
      )}
      {viewMode === 'edit' && currentEvent && (
        <EventEditor
          key={currentEvent.id}
          event={currentEvent}
          onSave={handleSaveEvent}
          onCancel={handleBackToList}
        />
      )}
      {viewMode === 'view' && currentEvent && (
        <EventViewer
            event={currentEvent}
            onBack={handleBackToList}
        />
      )}
      {editChoice && (
        <EditRecurrenceChoiceModal 
            isOpen={true}
            onClose={() => setEditChoice(null)}
            onChoose={editChoice.onChoose}
        />
      )}
      {isDeleteModalOpen && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDeleteEvent}
          title="Delete Event"
          message={eventToDelete?.isTemplate ? "This is a recurring event template. Deleting it will also delete all of its future occurrences that have not been individually modified. This action cannot be undone." : "Are you sure you want to delete this event? This action cannot be undone."}
        />
      )}
    </>
  );
};

export default SingleEventManager;
