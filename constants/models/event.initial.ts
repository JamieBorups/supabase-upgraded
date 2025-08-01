import { Event } from '../../types.ts';

export const initialEventData: Event = {
    id: '',
    projectId: '',
    venueId: '',
    title: '',
    description: '',
    status: 'Pending',
    category: '',
    tags: [],
    isAllDay: false,
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    assignedMembers: [],
    venueCostOverride: null,
    isTemplate: false,
    parentEventId: null,
    isOverride: false,
    recurrenceRule: null,
    createdAt: '',
    updatedAt: '',
};
