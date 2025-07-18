

import React from 'react';
import { FormData } from './project.types';
import { Member, User } from './member.types';
import { Task, Activity, DirectExpense } from './task.types';
import { Report, Highlight } from './report.types';
import { NewsRelease, Contact, Interaction } from './crm.types';
import { Venue, Event, TicketType, EventTicket } from './event.types';
import { ProposalSnapshot } from './tool.types';
import { AppSettings } from './settings.types';
import { InventoryItem, InventoryCategory, SaleSession, SaleListing, SalesTransaction, ItemList } from './sales.types';
import { NotificationType, ProjectStatus } from './shared.types';
import { EcoStarReport } from './ecostar.types';
import { InterestCompatibilityReport } from './interestCompatibility.types';
import { SdgAlignmentReport } from './sdg.types';
import { RecreationFrameworkReport } from './recreation.types';
import { ResearchPlan } from './research.types.ts';
import { OtfApplication, ProgramGuideline } from './otf.types.ts';
import { JobDescription } from './experience.types.ts';

export interface ProjectExportData {
  project: FormData;
  tasks: Task[];
  activities: Activity[];
  directExpenses: DirectExpense[];
  members: Member[];
  newsReleases: NewsRelease[];
  reports: Report[];
  highlights: Highlight[];
  proposals: ProposalSnapshot[];
  contacts: Contact[];
  interactions: Interaction[];
  venues: Venue[];
  events: Event[];
  ticketTypes: TicketType[];
  eventTickets: EventTicket[];
  ecostarReports: EcoStarReport[];
  interestCompatibilityReports: InterestCompatibilityReport[];
  sdgAlignmentReports: SdgAlignmentReport[];
  recreationFrameworkReports: RecreationFrameworkReport[];
  researchPlans: ResearchPlan[];
}

export interface AppState {
    loading: boolean;
    setupNeeded: boolean;
    projects: FormData[];
    members: Member[];
    users: User[];
    tasks: Task[];
    activities: Activity[];
    directExpenses: DirectExpense[];
    reports: Report[];
    highlights: Highlight[];
    newsReleases: NewsRelease[];
    contacts: Contact[];
    interactions: Interaction[];
    venues: Venue[];
    events: Event[];
    ticketTypes: TicketType[];
    eventTickets: EventTicket[];
    proposals: ProposalSnapshot[];
    settings: AppSettings;
    inventoryItems: InventoryItem[];
    inventoryCategories: InventoryCategory[];
    saleSessions: SaleSession[];
    saleListings: SaleListing[];
    salesTransactions: SalesTransaction[];
    itemLists: ItemList[];
    ecostarReports: EcoStarReport[];
    interestCompatibilityReports: InterestCompatibilityReport[];
    sdgAlignmentReports: SdgAlignmentReport[];
    recreationFrameworkReports: RecreationFrameworkReport[];
    researchPlans: ResearchPlan[];
    otfApplications: OtfApplication[];
    programGuidelines: ProgramGuideline[];
    jobDescriptions: JobDescription[];
    currentUser: User | null;
    reportProjectIdToOpen: string | null;
    researchPlanToEdit: ResearchPlan | null;
    otfApplicationToEdit: OtfApplication | null;
    activeWorkshopItem: {
      type: 'task';
      itemId: string;
    } | {
      type: 'project';
      itemId: string;
      fieldKey: string;
      fieldLabel: string;
    } | null;
}

export type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SETUP_STATUS'; payload: boolean }
  | { type: 'SET_PROJECTS'; payload: FormData[] }
  | { type: 'ADD_PROJECT'; payload: FormData }
  | { type: 'UPDATE_PROJECT'; payload: FormData }
  | { type: 'UPDATE_PROJECT_PARTIAL'; payload: { projectId: string; data: Partial<FormData> } }
  | { type: 'UPDATE_PROJECT_STATUS'; payload: { projectId: string; status: ProjectStatus | string } }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'SET_MEMBERS'; payload: Member[] }
  | { type: 'ADD_MEMBER'; payload: Member }
  | { type: 'UPDATE_MEMBER'; payload: Member }
  | { type: 'DELETE_MEMBER'; payload: string }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'ADD_TASKS'; payload: Task[] }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'UPDATE_TASK_PARTIAL'; payload: { taskId: string; data: Partial<Pick<Task, 'title' | 'description'>> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_ACTIVITIES'; payload: Activity[] }
  | { type: 'ADD_ACTIVITIES'; payload: Activity[] }
  | { type: 'UPDATE_ACTIVITY'; payload: Activity }
  | { type: 'APPROVE_ACTIVITY'; payload: string }
  | { type: 'DELETE_ACTIVITY'; payload: string }
  | { type: 'SET_DIRECT_EXPENSES'; payload: DirectExpense[] }
  | { type: 'ADD_DIRECT_EXPENSE'; payload: DirectExpense }
  | { type: 'SET_REPORTS'; payload: Report[] }
  | { type: 'ADD_REPORT'; payload: Report }
  | { type: 'UPDATE_REPORT'; payload: Report }
  | { type: 'SET_HIGHLIGHTS'; payload: Highlight[] }
  | { type: 'ADD_HIGHLIGHT'; payload: Highlight }
  | { type: 'UPDATE_HIGHLIGHT'; payload: Highlight }
  | { type: 'DELETE_HIGHLIGHT'; payload: string }
  | { type: 'ADD_NEWS_RELEASE'; payload: NewsRelease }
  | { type: 'UPDATE_NEWS_RELEASE'; payload: NewsRelease }
  | { type: 'DELETE_NEWS_RELEASE'; payload: string }
  | { type: 'ADD_CONTACT'; payload: Contact }
  | { type: 'UPDATE_CONTACT'; payload: Contact }
  | { type: 'DELETE_CONTACT'; payload: string }
  | { type: 'SET_CONTACTS'; payload: Contact[] }
  | { type: 'ADD_INTERACTION'; payload: Interaction }
  | { type: 'UPDATE_INTERACTION'; payload: Interaction }
  | { type: 'DELETE_INTERACTION'; payload: string }
  | { type: 'SET_INTERACTIONS'; payload: Interaction[] }
  | { type: 'SET_VENUES'; payload: Venue[] }
  | { type: 'ADD_VENUE'; payload: Venue }
  | { type: 'UPDATE_VENUE'; payload: Venue }
  | { type: 'DELETE_VENUE'; payload: string }
  | { type: 'SET_EVENTS'; payload: Event[] }
  | { type: 'ADD_EVENT'; payload: Event }
  | { type: 'ADD_EVENTS'; payload: Event[] }
  | { type: 'UPDATE_EVENT'; payload: Event }
  | { type: 'DELETE_EVENT'; payload: string }
  | { type: 'DELETE_EVENTS'; payload: string[] }
  | { type: 'SET_TICKET_TYPES'; payload: TicketType[] }
  | { type: 'ADD_TICKET_TYPE'; payload: TicketType }
  | { type: 'UPDATE_TICKET_TYPE'; payload: TicketType }
  | { type: 'DELETE_TICKET_TYPE'; payload: string }
  | { type: 'SET_EVENT_TICKETS'; payload: EventTicket[] }
  | { type: 'CREATE_PROPOSAL_SNAPSHOT'; payload: ProposalSnapshot }
  | { type: 'UPDATE_PROPOSAL_SNAPSHOT'; payload: ProposalSnapshot }
  | { type: 'DELETE_PROPOSAL_SNAPSHOT'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: AppSettings }
  | { type: 'SET_CURRENT_USER'; payload: User | null }
  | { type: 'LOGOUT' }
  | { type: 'SET_REPORT_PROJECT_ID_TO_OPEN'; payload: string | null }
  | { type: 'SET_RESEARCH_PLAN_TO_EDIT'; payload: ResearchPlan | null }
  | { type: 'SET_OTF_APPLICATION_TO_EDIT'; payload: OtfApplication | null }
  | { type: 'SET_ACTIVE_WORKSHOP_ITEM'; payload: AppState['activeWorkshopItem'] }
  | { type: 'ADD_PROJECT_DATA', payload: ProjectExportData }
  | { type: 'LOAD_DATA'; payload: Omit<Partial<AppState>, 'reportProjectIdToOpen' | 'activeWorkshopItem' | 'currentUser' | 'loading'> }
  | { type: 'CLEAR_ALL_DATA' }
  | { type: 'LOAD_EVENT_DATA'; payload: { venues: Venue[], events: Event[], ticketTypes: TicketType[], eventTickets: EventTicket[] } }
  | { type: 'SET_INVENTORY_ITEMS'; payload: InventoryItem[] }
  | { type: 'ADD_INVENTORY_ITEM'; payload: InventoryItem }
  | { type: 'UPDATE_INVENTORY_ITEM'; payload: InventoryItem }
  | { type: 'ADJUST_INVENTORY_STOCK'; payload: { itemId: string; quantityDelta: number } }
  | { type: 'DELETE_INVENTORY_ITEM'; payload: string }
  | { type: 'SET_INVENTORY_CATEGORIES'; payload: InventoryCategory[] }
  | { type: 'ADD_INVENTORY_CATEGORY'; payload: InventoryCategory }
  | { type: 'UPDATE_INVENTORY_CATEGORY'; payload: InventoryCategory }
  | { type: 'DELETE_INVENTORY_CATEGORY'; payload: string }
  | { type: 'SET_SALE_SESSIONS'; payload: SaleSession[] }
  | { type: 'ADD_SALE_SESSION'; payload: SaleSession }
  | { type: 'UPDATE_SALE_SESSION'; payload: SaleSession }
  | { type: 'DELETE_SALE_SESSION'; payload: string }
  | { type: 'SET_SALES_TRANSACTIONS'; payload: SalesTransaction[] }
  | { type: 'ADD_SALES_TRANSACTION'; payload: SalesTransaction }
  | { type: 'SET_ITEM_LISTS'; payload: ItemList[] }
  | { type: 'ADD_ITEM_LIST'; payload: ItemList }
  | { type: 'UPDATE_ITEM_LIST'; payload: ItemList }
  | { type: 'DELETE_ITEM_LIST'; payload: string }
  | { type: 'SET_SALE_LISTINGS'; payload: SaleListing[] }
  | { type: 'ADD_SALE_LISTING'; payload: SaleListing }
  | { type: 'DELETE_SALE_LISTING'; payload: { saleSessionId: string; inventoryItemId: string; } }
  | { type: 'SET_ECOSTAR_REPORTS'; payload: EcoStarReport[] }
  | { type: 'ADD_ECOSTAR_REPORT'; payload: EcoStarReport }
  | { type: 'DELETE_ECOSTAR_REPORT'; payload: string }
  | { type: 'SET_INTEREST_COMPATIBILITY_REPORTS'; payload: InterestCompatibilityReport[] }
  | { type: 'ADD_INTEREST_COMPATIBILITY_REPORT'; payload: InterestCompatibilityReport }
  | { type: 'DELETE_INTEREST_COMPATIBILITY_REPORT'; payload: string }
  | { type: 'SET_SDG_REPORTS'; payload: SdgAlignmentReport[] }
  | { type: 'ADD_SDG_REPORT'; payload: SdgAlignmentReport }
  | { type: 'DELETE_SDG_REPORT'; payload: string }
  | { type: 'SET_RECREATION_REPORTS'; payload: RecreationFrameworkReport[] }
  | { type: 'ADD_RECREATION_REPORT'; payload: RecreationFrameworkReport }
  | { type: 'DELETE_RECREATION_REPORT'; payload: string }
  | { type: 'SET_RESEARCH_PLANS'; payload: ResearchPlan[] }
  | { type: 'ADD_RESEARCH_PLAN'; payload: ResearchPlan }
  | { type: 'UPDATE_RESEARCH_PLAN'; payload: ResearchPlan }
  | { type: 'DELETE_RESEARCH_PLAN'; payload: string }
  | { type: 'SET_OTF_APPLICATIONS'; payload: OtfApplication[] }
  | { type: 'ADD_OTF_APPLICATION'; payload: OtfApplication }
  | { type: 'UPDATE_OTF_APPLICATION'; payload: OtfApplication }
  | { type: 'DELETE_OTF_APPLICATION'; payload: string }
  | { type: 'SET_PROGRAM_GUIDELINES'; payload: ProgramGuideline[] }
  | { type: 'ADD_PROGRAM_GUIDELINE'; payload: ProgramGuideline }
  | { type: 'UPDATE_PROGRAM_GUIDELINE'; payload: ProgramGuideline }
  | { type: 'SET_JOB_DESCRIPTIONS'; payload: JobDescription[] }
  | { type: 'ADD_JOB_DESCRIPTION'; payload: JobDescription }
  | { type: 'UPDATE_JOB_DESCRIPTION'; payload: JobDescription }
  | { type: 'DELETE_JOB_DESCRIPTION'; payload: string };


export interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  notify: (message: string, type: NotificationType) => void;
}
