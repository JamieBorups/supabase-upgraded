
import { produce } from 'immer';
import { AppState, Action, ProjectExportData, Member, ResearchPlan, OtfApplication, NohfcApplication } from '../../types';

export const uiInitialState: Pick<AppState, 'loading' | 'setupNeeded' | 'currentUser' | 'reportProjectIdToOpen' | 'researchPlanToEdit' | 'otfApplicationToEdit' | 'nohfcApplicationToEdit' | 'activeWorkshopItem'> = {
    loading: true,
    setupNeeded: false, // Default to false, AppContext will determine if setup is needed
    currentUser: null,
    reportProjectIdToOpen: null,
    researchPlanToEdit: null,
    otfApplicationToEdit: null,
    nohfcApplicationToEdit: null,
    activeWorkshopItem: null,
};

export const uiReducer = (state: AppState, action: Action): Partial<AppState> => {
    switch (action.type) {
        case 'SET_LOADING':
            return { loading: action.payload };

        case 'SET_SETUP_STATUS':
            return { setupNeeded: action.payload };

        case 'SET_CURRENT_USER':
            if (action.payload) {
                sessionStorage.setItem('currentUser', JSON.stringify(action.payload));
            } else {
                sessionStorage.removeItem('currentUser');
            }
            return { currentUser: action.payload };

        case 'LOGOUT':
            sessionStorage.removeItem('currentUser');
            return {
                // Slices from uiInitialState that are reset
                loading: false,
                setupNeeded: false, 
                currentUser: null,
                reportProjectIdToOpen: null,
                researchPlanToEdit: null,
                otfApplicationToEdit: null,
                nohfcApplicationToEdit: null,
                activeWorkshopItem: null,
                
                // Slices to PRESERVE from current state
                settings: state.settings,
                users: state.users,

                // Slices to explicitly RESET to their initial empty states
                projects: [],
                proposals: [],
                members: [],
                tasks: [],
                activities: [],
                directExpenses: [],
                reports: [],
                highlights: [],
                newsReleases: [],
                contacts: [],
                interactions: [],
                venues: [],
                events: [],
                ticketTypes: [],
                eventTickets: [],
                inventoryItems: [],
                inventoryCategories: [],
                saleSessions: [],
                saleListings: [],
                salesTransactions: [],
                itemLists: [],
                ecostarReports: [],
                interestCompatibilityReports: [],
                sdgAlignmentReports: [],
                recreationFrameworkReports: [],
                researchPlans: [],
                relatedProjects: [],
                otfApplications: [],
                nohfcApplications: [],
                programGuidelines: [],
            };

        case 'SET_REPORT_PROJECT_ID_TO_OPEN':
            return { reportProjectIdToOpen: action.payload };

        case 'SET_RESEARCH_PLAN_TO_EDIT':
            return { researchPlanToEdit: action.payload };

        case 'SET_OTF_APPLICATION_TO_EDIT':
            return { otfApplicationToEdit: action.payload };
        
        case 'SET_NOHFC_APPLICATION_TO_EDIT':
            return { nohfcApplicationToEdit: action.payload };

        case 'SET_ACTIVE_WORKSHOP_ITEM':
            return { activeWorkshopItem: action.payload };

        case 'LOAD_DATA': {
            const partialState: Partial<AppState> = {};
            for (const key in action.payload) {
                if (key in state) {
                    (partialState as any)[key] = (action.payload as any)[key];
                }
            }
            return partialState;
        }

        case 'ADD_PROJECT_DATA': {
            const newProjectData = action.payload;
            const existingMemberEmails = new Set(state.members.map((m: Member) => m.email));
            const newMembers = newProjectData.members.filter(m => !existingMemberEmails.has(m.email));
            
            return {
                projects: [...state.projects, newProjectData.project],
                tasks: [...state.tasks, ...newProjectData.tasks],
                activities: [...state.activities, ...newProjectData.activities],
                directExpenses: [...state.directExpenses, ...newProjectData.directExpenses],
                reports: [...state.reports, ...newProjectData.reports],
                highlights: [...state.highlights, ...newProjectData.highlights],
                newsReleases: [...state.newsReleases, ...newProjectData.newsReleases],
                proposals: [...state.proposals, ...newProjectData.proposals],
                contacts: [...state.contacts, ...newProjectData.contacts],
                interactions: [...state.interactions, ...newProjectData.interactions],
                venues: [...state.venues, ...newProjectData.venues],
                events: [...state.events, ...newProjectData.events],
                ticketTypes: [...state.ticketTypes, ...newProjectData.ticketTypes],
                eventTickets: [...state.eventTickets, ...newProjectData.eventTickets],
                ecostarReports: [...state.ecostarReports, ...(newProjectData.ecostarReports || [])],
                interestCompatibilityReports: [...state.interestCompatibilityReports, ...(newProjectData.interestCompatibilityReports || [])],
                sdgAlignmentReports: [...state.sdgAlignmentReports, ...(newProjectData.sdgAlignmentReports || [])],
                recreationFrameworkReports: [...state.recreationFrameworkReports, ...(newProjectData.recreationFrameworkReports || [])],
                researchPlans: [...state.researchPlans, ...(newProjectData.researchPlans || [])],
                members: [...state.members, ...newMembers],
            };
        }

        case 'CLEAR_ALL_DATA':
            return {
                ...uiInitialState,
                projects: [], members: [], users: [], tasks: [], activities: [], directExpenses: [],
                reports: [], highlights: [], newsReleases: [], contacts: [], interactions: [],
                venues: [], events: [], ticketTypes: [], eventTickets: [], proposals: [],
                inventoryItems: [], inventoryCategories: [], salesTransactions: [], itemLists: [],
                saleListings: [], ecostarReports: [], interestCompatibilityReports: [], recreationFrameworkReports: [], sdgAlignmentReports: [], researchPlans: [],
                settings: state.settings,
                currentUser: state.currentUser,
                loading: false,
            };

        default:
            return {};
    }
};
