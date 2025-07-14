import { AppState, ProjectExportData } from './context.types';
import { Contact, Interaction } from './crm.types';
import { Venue, Event, TicketType, EventTicket } from './event.types';

export interface ProjectExportFile {
  type: "ARTS_INCUBATOR_PROJECT_EXPORT";
  appVersion: string;
  exportDate: string;
  data: ProjectExportData;
}

export interface WorkspaceExportFile {
  type: "ARTS_INCUBATOR_WORKSPACE_BACKUP";
  appVersion: string;
  exportDate: string;
  data: Omit<AppState, 'reportProjectIdToOpen' | 'activeWorkshopItem' | 'currentUser'>;
}

export interface AiSettingsExportFile {
  type: "ARTS_INCUBATOR_AI_SETTINGS_EXPORT";
  appVersion: string;
  exportDate: string;
  data: AppState['settings']['ai'];
}

export interface ContactsExportFile {
  type: "ARTS_INCUBATOR_CONTACTS_EXPORT";
  appVersion: string;
  exportDate: string;
  data: {
    contacts: Contact[];
    interactions: Interaction[];
  };
}

export interface EventsAndVenuesExportFile {
  type: "ARTS_INCUBATOR_EVENTS_AND_VENUES_EXPORT";
  appVersion: string;
  exportDate: string;
  data: {
    venues: Venue[];
    events: Event[];
    ticketTypes: TicketType[];
    eventTickets: EventTicket[];
  };
}