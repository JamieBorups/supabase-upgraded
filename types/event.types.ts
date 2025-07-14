import { RecurrenceRule } from './shared.types';

export interface Venue {
  id: string;
  name: string;
  isVirtual: boolean;
  status: 'Potential' | 'Confirmed' | 'Not Available';
  address: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  capacity: number;
  url: string;
  contactName: string;
  contactTitle: string;
  contactEmail: string;
  contactPhone: string;
  notes: string;
  defaultCostType: 'free' | 'rented' | 'in_kind';
  defaultCost: number;
  defaultCostPeriod: 'per_day' | 'per_hour' | 'flat_rate';
  createdAt: string;
  updatedAt: string;
}

export interface EventMemberAssignment {
  memberId: string;
  role: string;
}

export interface Event {
  id: string;
  projectId: string;
  venueId: string;
  title: string;
  description: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Postponed' | 'Cancelled';
  category: string;
  tags: string[];
  isAllDay: boolean;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  notes?: string;
  actualAttendance?: number;
  assignedMembers: EventMemberAssignment[];
  venueCostOverride: {
    costType: 'free' | 'rented' | 'in_kind';
    cost: number;
    period: 'per_day' | 'per_hour' | 'flat_rate';
    notes: string;
  } | null;
  isTemplate: boolean;
  parentEventId: string | null;
  isOverride: boolean;
  recurrenceRule: RecurrenceRule | null;
  createdAt: string;
  updatedAt: string;
}

export interface TicketType {
  id: string;
  name: string;
  description: string;
  defaultPrice: number;
  isFree: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EventTicket {
  id: string;
  eventId: string;
  ticketTypeId: string;
  price: number;
  capacity: number;
  soldCount: number;
}
