
import React, { createContext, useReducer, useEffect, useContext, ReactNode, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { AppState, AppContextType, NotificationType } from '../types.ts';
import { generatePasswordHash } from '../utils/crypto.ts';
import * as api from '../services/api.ts';
import { initialState, appReducer } from './store';
import { settingsInitialState } from './slices/settings.slice.ts';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState, (init) => {
        try {
            const storedUser = sessionStorage.getItem('currentUser');
            if (storedUser) {
                return { ...init, currentUser: JSON.parse(storedUser) };
            }
        } catch (error) {
            console.error("Could not parse stored user", error);
        }
        return init;
    });

    const notify = useCallback((message: string, type: NotificationType = 'success') => {
        switch (type) {
            case 'success': toast.success(message); break;
            case 'error': toast.error(message); break;
            case 'info': toast(message, { icon: 'ℹ️' }); break;
            case 'warning': toast(message, { icon: '⚠️' }); break;
            default: toast(message); break;
        }
    }, []);

    useEffect(() => {
        const initializeApp = async () => {
            // Check if essential environment variables are configured.
            if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY || !process.env.API_KEY) {
                dispatch({ type: 'SET_SETUP_STATUS', payload: true });
                dispatch({ type: 'SET_LOADING', payload: false });
                return;
            }

            try {
                // If config is set, proceed with initialization
                const settingsFromApi = await api.getSettings();

                // If we get here, connection is good. Mark setup as complete.
                dispatch({ type: 'SET_SETUP_STATUS', payload: false });

                // Now, fetch the rest of the data.
                const [
                    projects, members, users, tasks, activities, highlights, 
                    newsReleases, reports, contacts, interactions, venues, 
                    events, ticketTypes, eventTickets, proposals, directExpenses,
                    inventoryItems, inventoryCategories, saleSessions, salesTransactions, itemLists,
                    saleListings, ecostarReports, interestCompatibilityReports, sdgAlignmentReports, recreationFrameworkReports
                ] = await Promise.all([
                    api.getProjects(), api.getMembers(), api.getUsers(), api.getTasks(), api.getActivities(), api.getHighlights(),
                    api.getNewsReleases(), api.getReports(), api.getContacts(), api.getInteractions(), api.getVenues(),
                    api.getEvents(), api.getTicketTypes(), api.getEventTickets(), api.getProposals(), api.getDirectExpenses(),
                    api.getInventoryItems(), api.getInventoryCategories(), api.getSaleSessions(), api.getSalesTransactions(), api.getItemLists(),
                    api.getSaleListings(), api.getEcoStarReports(), api.getInterestCompatibilityReports(), api.getSdgAlignmentReports(), api.getRecreationFrameworkReports()
                ]);

                // Check for admin user after fetching users table
                if (users.length === 0) {
                    const adminPasswordHash = await generatePasswordHash('admin');
                    const newUser = await api.addUser({ username: 'admin', passwordHash: adminPasswordHash, role: 'admin', memberId: null } as any);
                    users.push(newUser); // Add to the local array to avoid a re-fetch
                }
                
                const completeSettings = {
                    ...settingsInitialState.settings, ...settingsFromApi,
                    general: { ...settingsInitialState.settings.general, ...(settingsFromApi.general || {}) },
                    projects: { ...settingsInitialState.settings.projects, ...(settingsFromApi.projects || {}) },
                    members: { ...settingsInitialState.settings.members, ...(settingsFromApi.members || {}) },
                    tasks: { ...settingsInitialState.settings.tasks, ...(settingsFromApi.tasks || {}) },
                    budget: { ...settingsInitialState.settings.budget, ...(settingsFromApi.budget || {}), revenueLabels: { ...settingsInitialState.settings.budget.revenueLabels, ...(settingsFromApi.budget?.revenueLabels || {})}, expenseLabels: { ...settingsInitialState.settings.budget.expenseLabels, ...(settingsFromApi.budget?.expenseLabels || {})}},
                    media: { ...settingsInitialState.settings.media, ...(settingsFromApi.media || {}) },
                    events: { ...settingsInitialState.settings.events, ...(settingsFromApi.events || {}) },
                    ai: { ...settingsInitialState.settings.ai, ...(settingsFromApi.ai || {}), personas: {...settingsInitialState.settings.ai.personas, ...(settingsFromApi.ai?.personas || {})}, personaTemplates: {...settingsInitialState.settings.ai.personaTemplates, ...(settingsFromApi.ai?.personaTemplates || {})}},
                    sales: { ...settingsInitialState.settings.sales, ...(settingsFromApi.sales || {}) },
                    gallery: { ...settingsInitialState.settings.gallery, ...(settingsFromApi.gallery || {}) },
                };
                
                const loadedData: Partial<AppState> = {
                    settings: completeSettings, projects, members, users, tasks, activities, highlights,
                    newsReleases, reports, contacts, interactions, venues, events, ticketTypes,
                    eventTickets, proposals, directExpenses, inventoryItems, inventoryCategories,
                    saleSessions, salesTransactions, itemLists, saleListings, ecostarReports,
                    interestCompatibilityReports, sdgAlignmentReports, recreationFrameworkReports
                };
                
                dispatch({ type: 'LOAD_DATA', payload: loadedData });

            } catch (error: any) {
                console.error("Initialization failed:", error);
                // If any part of the connection/fetch fails (with non-placeholder keys), it indicates a user config error.
                dispatch({ type: 'SET_SETUP_STATUS', payload: true });
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        };
        
        initializeApp();
    }, [notify]);

    const contextValue = useMemo(() => ({ state, dispatch, notify }), [state, notify]);

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};