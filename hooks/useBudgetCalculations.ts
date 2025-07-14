
import { useMemo } from 'react';
import { DetailedBudget, BudgetItem, Event, EventTicket, Venue } from '../types.ts';
import { initialBudget } from '../constants.ts';

const PERFORMANCE_CATEGORIES = new Set([
    'performance',
    'concert',
    'theatre',
    'music',
    'dance',
    'public presentation'
]);

export const useTicketRevenueCalculations = (projectId: string, allEvents: Event[], allVenues: Venue[], allEventTickets: EventTicket[]) => {
    // NOTE: useMemo was removed to prevent stale data caching. This function now runs on every render of its parent component,
    // ensuring calculations are always fresh. The parent component's re-render is triggered by the key in ProjectManager.
    
    const defaultResult = {
        numberOfPresentations: 0,
        averageVenueCapacity: 0,
        projectedAudience: 0,
        averagePctSold: 0,
        projectedRevenue: 0,
        averageTicketPrice: 0,
    };

    if (!projectId || !allEvents || !allVenues || !allEventTickets) {
        return defaultResult;
    }

    // Step 1: Filter for this project's PLANNED, revenue-generating events.
    const plannedProjectEvents = allEvents.filter(event =>
        event.projectId === projectId &&
        !event.isTemplate &&
        event.status !== 'Cancelled' &&
        PERFORMANCE_CATEGORIES.has((event.category || '').toLowerCase())
    );

    if (plannedProjectEvents.length === 0) {
        return defaultResult;
    }

    // Step 2: Gather all tickets available for sale across all planned events.
    const plannedEventIds = new Set(plannedProjectEvents.map(event => event.id));
    const ticketsForSale = allEventTickets.filter(ticket => plannedEventIds.has(ticket.eventId));

    // Step 3: Calculate the two primary metrics directly from the tickets.
    // This ensures they are the single source of truth for projections.
    const totalProjectedRevenue = ticketsForSale.reduce((sum, ticket) => sum + (ticket.price || 0) * (ticket.capacity || 0), 0);
    const totalProjectedAudience = ticketsForSale.reduce((sum, ticket) => sum + (ticket.capacity || 0), 0);

    // Step 4: Derive the average ticket price. This guarantees mathematical integrity.
    // The relationship: Audience * Average Price = Revenue will always be true.
    const weightedAverageTicketPrice = totalProjectedAudience > 0 ? totalProjectedRevenue / totalProjectedAudience : 0;

    // Step 5: Calculate supplementary metrics for display purposes.
    const numberOfPresentations = plannedProjectEvents.length;

    let totalVenueCapacityAcrossAllShows = 0;
    let sumOfVenueCapacitiesForAveraging = 0;
    
    plannedProjectEvents.forEach(event => {
        const venue = allVenues.find(v => v.id === event.venueId);
        if (venue) {
            // This is the total number of available "seats" across all shows.
            totalVenueCapacityAcrossAllShows += venue.capacity || 0;
            // This is used for the simple average display.
            sumOfVenueCapacitiesForAveraging += venue.capacity || 0;
        }
    });

    const averageVenueCapacity = numberOfPresentations > 0 ? sumOfVenueCapacitiesForAveraging / numberOfPresentations : 0;
    
    // This calculates the percentage of total *venue* capacity that has tickets assigned.
    const averagePctOfVenueSold = totalVenueCapacityAcrossAllShows > 0 ? (totalProjectedAudience / totalVenueCapacityAcrossAllShows) * 100 : 0;

    return {
        numberOfPresentations,
        averageVenueCapacity: Math.round(averageVenueCapacity),
        projectedAudience: totalProjectedAudience,
        averagePctSold: averagePctOfVenueSold,
        projectedRevenue: totalProjectedRevenue,
        averageTicketPrice: weightedAverageTicketPrice,
    };
};


export const useBudgetCalculations = (budget: DetailedBudget | undefined | null) => {
    const safeBudget = budget || initialBudget;

    const sumAmounts = (items: BudgetItem[] = []) => items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const sumAmountsByStatus = (items: BudgetItem[] = [], status: 'Approved' | 'Pending') => 
        items.filter(item => item.status === status).reduce((sum, item) => sum + (item.amount || 0), 0);
    
    const sumActuals = (items: BudgetItem[] = []) => items.reduce((sum, item) => sum + (item.actualAmount || 0), 0);

    const filterAndSum = (items: BudgetItem[] = []) => 
        items.filter(item => item.status !== 'Denied').reduce((sum, item) => sum + (item.amount || 0), 0);

    const totalGrants = useMemo(() => filterAndSum(safeBudget.revenues.grants), [safeBudget.revenues.grants]);
    
    const totalSales = useMemo(() => filterAndSum(safeBudget.revenues.sales), [safeBudget.revenues.sales]);
    const totalFundraising = useMemo(() => filterAndSum(safeBudget.revenues.fundraising), [safeBudget.revenues.fundraising]);
    const totalContributions = useMemo(() => filterAndSum(safeBudget.revenues.contributions), [safeBudget.revenues.contributions]);

    const totalRevenue = useMemo(() => totalGrants + totalSales + totalFundraising + totalContributions, [totalGrants, totalSales, totalFundraising, totalContributions]);

    // Actual revenue calculations
    const totalGrantsActual = useMemo(() => sumActuals(safeBudget.revenues.grants), [safeBudget.revenues.grants]);
    const totalSalesActual = useMemo(() => sumActuals(safeBudget.revenues.sales), [safeBudget.revenues.sales]);
    const totalFundraisingActual = useMemo(() => sumActuals(safeBudget.revenues.fundraising), [safeBudget.revenues.fundraising]);
    const totalContributionsActual = useMemo(() => sumActuals(safeBudget.revenues.contributions), [safeBudget.revenues.contributions]);
    const totalTicketsActual = useMemo(() => safeBudget.revenues.tickets?.actualRevenue || 0, [safeBudget.revenues.tickets]);
    
    // This now represents actual revenue from ALL sources, including tickets and manually entered sales
    const totalActualRevenue = useMemo(() => {
        return totalGrantsActual + totalTicketsActual + totalSalesActual + totalFundraisingActual + totalContributionsActual;
    }, [totalGrantsActual, totalTicketsActual, totalSalesActual, totalFundraisingActual, totalContributionsActual]);
    
    const totalSecuredRevenue = useMemo(() => {
        return ['grants', 'sales', 'fundraising', 'contributions'].reduce((total, category) => {
            return total + sumAmountsByStatus(safeBudget.revenues[category as keyof typeof safeBudget.revenues] as BudgetItem[], 'Approved');
        }, 0);
    }, [safeBudget.revenues]);

    const totalPendingRevenue = useMemo(() => {
        return ['grants', 'sales', 'fundraising', 'contributions'].reduce((total, category) => {
            return total + sumAmountsByStatus(safeBudget.revenues[category as keyof typeof safeBudget.revenues] as BudgetItem[], 'Pending');
        }, 0);
    }, [safeBudget.revenues]);


    const totalProfessionalFees = useMemo(() => sumAmounts(safeBudget.expenses.professionalFees), [safeBudget.expenses.professionalFees]);
    const totalTravel = useMemo(() => sumAmounts(safeBudget.expenses.travel), [safeBudget.expenses.travel]);
    const totalProduction = useMemo(() => sumAmounts(safeBudget.expenses.production), [safeBudget.expenses.production]);
    const totalAdministration = useMemo(() => sumAmounts(safeBudget.expenses.administration), [safeBudget.expenses.administration]);
    const totalResearch = useMemo(() => sumAmounts(safeBudget.expenses.research), [safeBudget.expenses.research]);
    const totalProfessionalDevelopment = useMemo(() => sumAmounts(safeBudget.expenses.professionalDevelopment), [safeBudget.expenses.professionalDevelopment]);

    const totalExpenses = useMemo(() => totalProfessionalFees + totalTravel + totalProduction + totalAdministration + totalResearch + totalProfessionalDevelopment, 
      [totalProfessionalFees, totalTravel, totalProduction, totalAdministration, totalResearch, totalProfessionalDevelopment]
    );

    const balance = useMemo(() => totalRevenue - totalExpenses, [totalRevenue, totalExpenses]);

    return {
        totalGrants,
        totalSales,
        totalFundraising,
        totalContributions,
        totalRevenue,
        totalActualRevenue,
        totalGrantsActual, // Exporting for detailed views
        totalSalesActual,
        totalFundraisingActual,
        totalContributionsActual,
        totalSecuredRevenue,
        totalPendingRevenue,
        totalProfessionalFees,
        totalTravel,
        totalProduction,
        totalAdministration,
        totalResearch,
        totalProfessionalDevelopment,
        totalExpenses,
        balance
    };
};
