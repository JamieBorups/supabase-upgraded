

import React, { useMemo, useState, useEffect } from 'react';
import { produce } from 'immer';
import { DetailedBudget, BudgetItem, Task, Activity, DirectExpense, ExpenseCategoryType, FormData, BudgetItemStatus, Venue, ProposalSnapshot, Event, EventTicket } from '../../types';
import { useBudgetCalculations, useTicketRevenueCalculations } from '../../hooks/useBudgetCalculations';
import { REVENUE_FIELDS, EXPENSE_FIELDS, initialBudget, BUDGET_ITEM_STATUS_OPTIONS } from '../../constants';
import { Input } from '../ui/Input';
import { useAppContext } from '../../context/AppContext';

interface BudgetViewProps {
    project: FormData;
    tasks: Task[];
    activities: Activity[];
    directExpenses: DirectExpense[];
    onSave: (project: FormData) => void;
    snapshotData?: ProposalSnapshot['calculatedMetrics'];
    isProposalView?: boolean;
    events: Event[];
    venues: Venue[];
    eventTickets: EventTicket[];
}

const formatCurrency = (value: number) => value.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });

const ViewField: React.FC<{ label: string; value?: React.ReactNode; children?: React.ReactNode }> = ({ label, value, children }) => (
    <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{label}</h3>
        {value && <div className="mt-1 text-slate-900">{value}</div>}
        {children && <div className="mt-1 text-slate-900">{children}</div>}
    </div>
);

const StatusBadge: React.FC<{ status: BudgetItemStatus }> = ({ status }) => {
    const statusClasses: Record<BudgetItemStatus, string> = {
        Pending: 'bg-yellow-100 text-yellow-800',
        Approved: 'bg-green-100 text-green-800',
        Denied: 'bg-red-100 text-red-800',
    };
    return (
        <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[status]}`}>
            {status}
        </span>
    );
};

const ReadOnlyField: React.FC<{value: string | number | React.ReactNode}> = ({ value }) => (
    <div className="mt-1 p-2 bg-slate-100 border border-slate-300 rounded-md text-sm text-slate-700 min-h-[38px] flex items-center">
        {value}
    </div>
);


const RevenueSection: React.FC<{ 
    title: string; 
    children: React.ReactNode; 
    budgetTotal: number;
    actualTotal?: number;
    isProposalView?: boolean;
}> = ({title, children, budgetTotal, actualTotal, isProposalView = false}) => (
     <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm mt-6">
        <h3 className="text-xl font-bold text-slate-700 border-b border-slate-200 pb-2 mb-3">{title}</h3>
        {children}
        <div className={`grid ${isProposalView ? 'grid-cols-1' : 'grid-cols-2'} gap-4 text-right font-bold mt-3 pt-3 border-t-2 border-slate-200 text-base`}>
            <div>
                <span className="text-xs text-slate-500 font-semibold uppercase block">Budgeted</span>
                {formatCurrency(budgetTotal)}
            </div>
            {!isProposalView && (
             <div>
                <span className="text-xs text-teal-600 font-semibold uppercase block">Actual</span>
                {formatCurrency(actualTotal || 0)}
            </div>
            )}
        </div>
    </div>
);

const RevenueCategoryItemsView: React.FC<{ 
    items: BudgetItem[], 
    categoryPath: (string|number)[], 
    onUpdateRevenue: (path: (string | number)[], value: number) => void, 
    onSetEditingRevenueId: (id: string | null) => void, 
    editingRevenueId: string | null,
    fieldMap: Map<string, string>,
    isProposalView: boolean,
}> = ({ items, categoryPath, onUpdateRevenue, onSetEditingRevenueId, editingRevenueId, fieldMap, isProposalView }) => {
    if (!items || items.length === 0) {
        return <p className="text-sm text-slate-400 italic py-2">No items in this category.</p>;
    }
    
    return (
        <div className="space-y-1">
             <div className={`grid ${isProposalView ? 'grid-cols-7' : 'grid-cols-12'} gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 py-1`}>
                <div className="col-span-7">Item</div>
                <div className="col-span-2 text-right">Budgeted</div>
                {!isProposalView && <div className="col-span-3 text-right">Actual</div>}
            </div>
            {items.map((item, index) => {
                const label = fieldMap.get(item.source) || item.source;
                const isEditing = editingRevenueId === item.id;
                const isDenied = item.status === 'Denied';
                return (
                    <div key={item.id} className={`grid ${isProposalView ? 'grid-cols-7' : 'grid-cols-12'} gap-2 items-center hover:bg-slate-100 rounded p-2 group ${isDenied ? 'opacity-50' : ''}`}>
                         <div className="col-span-7 text-sm">
                            <div className="flex items-center gap-2">
                              <StatusBadge status={item.status || 'Pending'} />
                              <p className={`text-slate-800 font-medium ${isDenied ? 'line-through' : ''}`}>{label}</p>
                            </div>
                            <p className="text-xs text-slate-500 pl-8">{item.description}</p>
                        </div>
                        <div className={`col-span-2 text-right text-sm text-slate-600 ${isDenied ? 'line-through' : ''}`}>{formatCurrency(item.amount)}</div>
                        {!isProposalView && (
                            <div className="col-span-3 text-right text-sm font-semibold text-teal-700 cursor-pointer" onClick={() => !isDenied && onSetEditingRevenueId(item.id)}>
                                {isEditing ? (
                                    <Input 
                                        type="number" 
                                        defaultValue={item.actualAmount || ''}
                                        onBlur={(e) => {
                                            onUpdateRevenue([...categoryPath, index, 'actualAmount'], parseFloat(e.target.value) || 0);
                                            onSetEditingRevenueId(null);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.currentTarget.blur();
                                            }
                                        }}
                                        autoFocus
                                        className="text-right py-1"
                                    />
                                ) : (
                                <>
                                        {formatCurrency(item.actualAmount || 0)} 
                                        {!isDenied && <i className="fa-solid fa-pencil text-xs text-slate-300 ml-1 group-hover:text-teal-600 transition-colors"></i>}
                                </>
                                )}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    );
};

const ExpenseCategoryItemsView: React.FC<{
    items: BudgetItem[],
    actualsByBudgetItem: Map<string, { cost: number; contributedValue: number; hours: number; }>,
    fieldMap: Map<string, string>,
    isProposalView: boolean,
}> = ({ items, actualsByBudgetItem, fieldMap, isProposalView }) => {
     if (!items || items.length === 0) {
        return <p className="text-sm text-slate-400 italic py-2">No items budgeted for this category.</p>;
    }
    return (
        <div className="space-y-1">
            <div className={`grid ${isProposalView ? 'grid-cols-7' : 'grid-cols-10'} gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 py-1`}>
                <div className="col-span-5">Item</div>
                <div className="col-span-2 text-right">Budgeted</div>
                {!isProposalView && <div className="col-span-3 text-right">Actual Paid</div>}
            </div>
            {items.map(item => {
                 const actuals = actualsByBudgetItem.get(item.id) || { cost: 0, contributedValue: 0 };
                 return (
                    <div key={item.id} className={`grid ${isProposalView ? 'grid-cols-7' : 'grid-cols-10'} gap-2 items-center hover:bg-slate-100 rounded p-2 group`}>
                        <div className="col-span-5 text-sm">
                            <p className="text-slate-800 font-medium">{fieldMap.get(item.source) || item.source}</p>
                            <p className="text-xs text-slate-500">{item.description}</p>
                        </div>
                        <div className="col-span-2 text-right text-sm text-slate-600">{formatCurrency(item.amount)}</div>
                        {!isProposalView && <div className="col-span-3 text-right text-sm font-semibold text-blue-700">{formatCurrency(actuals.cost)}</div>}
                    </div>
                 )
            })}
        </div>
    );
}

const BudgetView: React.FC<BudgetViewProps> = ({ project, onSave, tasks, activities, directExpenses, snapshotData, isProposalView = false, events, venues, eventTickets }) => {
    const { state } = useAppContext();
    const { settings, saleSessions, salesTransactions } = state;
    const { revenueLabels, expenseLabels } = settings.budget;

    const [isEditingActualRevenue, setIsEditingActualRevenue] = useState(false);
    const [actualRevenueInput, setActualRevenueInput] = useState<string>((project.budget?.revenues?.tickets?.actualRevenue || '').toString());
    
    useEffect(() => {
        setActualRevenueInput((project.budget?.revenues?.tickets?.actualRevenue || '0').toString());
    }, [project.budget?.revenues?.tickets?.actualRevenue]);

    const budget = project.budget || initialBudget;

    const buildFieldMap = (
        budgetCategory: BudgetItem[],
        labelDictionary: Record<string, string>
    ): Map<string, string> => {
        const map = new Map<string, string>();
        budgetCategory.forEach(item => {
            if (!map.has(item.source)) {
                const label = labelDictionary[item.source] || item.source.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                map.set(item.source, label);
            }
        });
        return map;
    };
    
    const revenueFieldMap = useMemo(() => {
        const { tickets, ...restRevenues } = budget.revenues;
        const allRevenueItems = Object.values(restRevenues).flat();
        return buildFieldMap(allRevenueItems, revenueLabels);
    }, [budget.revenues, revenueLabels]);
    
    const expenseFieldMap = useMemo(() => {
        const allExpenseItems = Object.values(budget.expenses).flat();
        return buildFieldMap(allExpenseItems, expenseLabels);
    }, [budget.expenses, expenseLabels]);


    const [editingRevenueId, setEditingRevenueId] = useState<string | null>(null);

    const liveTicketCalcs = useTicketRevenueCalculations(project.id, events, venues, eventTickets);
    const ticketCalcs = snapshotData || liveTicketCalcs;

    const budgetCalculations = useBudgetCalculations(budget);
    
    const salesData = useMemo(() => {
        // Get all event IDs for the current project.
        const projectEventIds = new Set(events.filter(e => e.projectId === project.id).map(e => e.id));

        // Filter sale sessions relevant to this project.
        const relevantSaleSessions = saleSessions.filter(s =>
            (s.associationType === 'project' && s.projectId === project.id) ||
            (s.associationType === 'event' && s.eventId && projectEventIds.has(s.eventId))
        );

        // Pre-calculate actual revenue for each session to avoid repeated filtering.
        const actualsBySessionId = new Map<string, number>();
        salesTransactions.forEach(tx => {
            if (tx.saleSessionId && relevantSaleSessions.some(s => s.id === tx.saleSessionId)) {
                const currentTotal = actualsBySessionId.get(tx.saleSessionId) || 0;
                actualsBySessionId.set(tx.saleSessionId, currentTotal + tx.total);
            }
        });

        // Create the breakdown, one entry per SaleSession.
        const breakdown = relevantSaleSessions.map(session => {
            const actualRevenue = actualsBySessionId.get(session.id) || 0;
            const estimatedRevenue = session.expectedRevenue || 0;
            
            let contextName = '';
            if (session.associationType === 'event') {
                const event = events.find(e => e.id === session.eventId);
                contextName = event ? ` (${event.title})` : ' (Unknown Event)';
            }

            return {
                id: session.id,
                name: `${session.name}${contextName}`,
                estimatedRevenue,
                actualRevenue,
            };
        });

        const totalEstimatedRevenue = breakdown.reduce((sum, item) => sum + item.estimatedRevenue, 0);
        const totalActualRevenue = breakdown.reduce((sum, item) => sum + item.actualRevenue, 0);

        return {
            totalEstimatedRevenue,
            totalActualRevenue,
            breakdown: breakdown,
        };
    }, [saleSessions, salesTransactions, project.id, events]);
    
    const { actualsByBudgetItem, totalContributedValue, totalActualPaidExpenses } = useMemo(() => {
        const actuals = new Map<string, { cost: number, contributedValue: number, hours: number }>();
        const taskMap = new Map(tasks.map(t => [t.id, t]));

        activities.forEach(activity => {
            const task = taskMap.get(activity.taskId);
            if (!task || !task.budgetItemId) return;
            const current = actuals.get(task.budgetItemId) || { cost: 0, contributedValue: 0, hours: 0 };
            const value = (activity.hours || 0) * (task.hourlyRate || 0);
            if (task.workType === 'Paid') current.cost += value;
            else current.contributedValue += value;
            current.hours += (activity.hours || 0);
            actuals.set(task.budgetItemId, current);
        });

        directExpenses.forEach(expense => {
            if(!expense.budgetItemId) return;
            const current = actuals.get(expense.budgetItemId) || { cost: 0, contributedValue: 0, hours: 0 };
            current.cost += expense.amount;
            actuals.set(expense.budgetItemId, current);
        });

        const totalContributed = Array.from(actuals.values()).reduce((sum, item) => sum + item.contributedValue, 0);
        const totalActualPaid = Array.from(actuals.values()).reduce((sum, item) => sum + item.cost, 0);

        return { actualsByBudgetItem: actuals, totalContributedValue: totalContributed, totalActualPaidExpenses: totalActualPaid };
    }, [tasks, activities, directExpenses]);

    const projectedVenueCosts = useMemo(() => {
        const projectEvents = events.filter(e => e.projectId === project.id && !e.isTemplate);
        let cash = 0;
        let inKind = 0;

        projectEvents.forEach(event => {
            if (event.status === 'Cancelled' || event.status === 'Pending') return;
            const venue = venues.find(v => v.id === event.venueId);
            if (!venue) return;

            const costDetails = event.venueCostOverride || { costType: venue.defaultCostType, cost: venue.defaultCost, period: venue.defaultCostPeriod, notes: '' };
            if (costDetails.costType === 'free') return;
            
            let eventCost = 0;
            if (costDetails.period === 'flat_rate') {
                eventCost = costDetails.cost;
            } else {
                const start = new Date(event.startDate);
                const end = new Date(event.endDate);
                const days = (end.getTime() - start.getTime()) / (1000 * 3600 * 24) + 1;
                 if (costDetails.period === 'per_day') {
                    eventCost = costDetails.cost * days;
                } else if (costDetails.period === 'per_hour') {
                     if (event.isAllDay) {
                        eventCost = costDetails.cost * 8 * days;
                    } else if (event.startTime && event.endTime) {
                        const startTime = new Date(`1970-01-01T${event.startTime}`);
                        const endTime = new Date(`1970-01-01T${event.endTime}`);
                        const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 3600);
                        eventCost = costDetails.cost * hours * days;
                    }
                }
            }

            if(costDetails.costType === 'rented') cash += eventCost;
            if(costDetails.costType === 'in_kind') inKind += eventCost;
        });

        return { cash, inKind };
    }, [events, venues, project.id]);

    const totalProjectedRevenue = budgetCalculations.totalGrants + ticketCalcs.projectedRevenue + salesData.totalEstimatedRevenue + budgetCalculations.totalFundraising + budgetCalculations.totalContributions;
    const totalActualRevenue = budgetCalculations.totalGrantsActual + (budget.revenues.tickets?.actualRevenue || 0) + salesData.totalActualRevenue + budgetCalculations.totalFundraisingActual + budgetCalculations.totalContributionsActual;
    
    const totalProjectedExpenses = budgetCalculations.totalExpenses + projectedVenueCosts.cash;
    const totalActualExpenses = totalActualPaidExpenses;
    
    const projectedBalance = totalProjectedRevenue - totalProjectedExpenses;
    const actualBalance = totalActualRevenue - totalActualExpenses;

    const handleUpdateActualTicketRevenue = () => {
        const newActual = parseFloat(actualRevenueInput) || 0;
        const updatedProject = produce(project, draft => {
            if (!draft.budget) { draft.budget = initialBudget; }
            if (!draft.budget.revenues.tickets) { draft.budget.revenues.tickets = initialBudget.revenues.tickets; }
            draft.budget.revenues.tickets.actualRevenue = newActual;
        });
        onSave(updatedProject);
        setIsEditingActualRevenue(false);
    };
    
    const handleUpdateRevenueItem = (path: (string | number)[], value: number) => {
        const updatedProject = produce(project, draft => {
            if (!draft.budget) return;
            let current: any = draft.budget;
            for(let i=0; i<path.length-1; i++) {
                current = current[path[i] as keyof typeof current];
            }
            current[path[path.length-1] as keyof typeof current] = value;
        });
        onSave(updatedProject);
    };

    return (
        <section>
            <h2 className="text-2xl font-bold text-slate-800 border-b-2 border-teal-500 pb-2 mb-6">Budget vs. Actuals</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* REVENUE */}
                <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-3 mt-6">Revenue</h3>
                    
                    <RevenueSection title="Revenue: Grants" budgetTotal={budgetCalculations.totalGrants} actualTotal={budget.revenues.grants.reduce((sum, item) => sum + (item.actualAmount || 0), 0)} isProposalView={isProposalView}>
                       <RevenueCategoryItemsView items={budget.revenues.grants} categoryPath={['revenues', 'grants']} onUpdateRevenue={handleUpdateRevenueItem} onSetEditingRevenueId={setEditingRevenueId} editingRevenueId={editingRevenueId} fieldMap={revenueFieldMap} isProposalView={isProposalView} />
                    </RevenueSection>

                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm mt-6">
                        <h3 className="text-xl font-bold text-slate-700 border-b border-slate-200 pb-2 mb-3">Revenue: Tickets & Box Office</h3>
                        <div className="mt-4 bg-slate-100/70 p-4 rounded-lg border border-slate-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2 mb-4 p-2 bg-slate-200/50 rounded-md">
                                <div className="font-semibold text-sm text-slate-600">Number of presentations</div>
                                <div className="font-semibold text-sm text-slate-600">Average % of venue sold out</div>
                                <div className="font-semibold text-sm text-slate-600">Average venue capacity</div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <ReadOnlyField value={ticketCalcs.numberOfPresentations.toLocaleString()} />
                                <ReadOnlyField value={`${ticketCalcs.averagePctSold.toFixed(1)}%`} />
                                <ReadOnlyField value={ticketCalcs.averageVenueCapacity.toLocaleString()} />
                            </div>
                        </div>

                        <div className="mt-4 bg-slate-100/70 p-4 rounded-lg border border-slate-200">
                             <div className="flex items-end justify-between">
                                 <div className="font-semibold text-slate-700">Projected total audience</div>
                                 <div className="p-2 bg-white border border-slate-300 rounded-md text-slate-800 font-bold min-w-[120px] text-right">{ticketCalcs.projectedAudience.toLocaleString()}</div>
                            </div>
                        </div>
                        
                        <div className="mt-4 bg-slate-100/70 p-4 rounded-lg border border-slate-200">
                             <div className="flex items-end justify-between">
                                 <div className="font-semibold text-slate-700">Average ticket price</div>
                                 <div className="p-2 bg-white border border-slate-300 rounded-md text-slate-800 font-bold min-w-[120px] text-right">{formatCurrency(ticketCalcs.averageTicketPrice)}</div>
                            </div>
                        </div>
                        
                        <div className="mt-4 bg-slate-100/70 p-4 rounded-lg border border-slate-200">
                             <div className="flex items-end justify-between">
                                 <div className="font-semibold text-slate-700">Total tickets or box office</div>
                                 <div className="p-2 bg-white border border-slate-300 rounded-md text-slate-800 font-bold min-w-[120px] text-right">{formatCurrency(ticketCalcs.projectedRevenue)}</div>
                            </div>
                        </div>
                        
                        {!isProposalView && (
                            <div className="py-2.5 grid grid-cols-2 gap-4 mt-2">
                                <div className="text-sm font-bold text-slate-600">Actual Ticket Revenue</div>
                                <div className="text-sm text-slate-800 font-medium text-right cursor-pointer" onClick={() => setIsEditingActualRevenue(true)}>
                                    {isEditingActualRevenue ? (
                                        <Input
                                            type="number"
                                            defaultValue={actualRevenueInput}
                                            onBlur={handleUpdateActualTicketRevenue}
                                            onKeyDown={e => e.key === 'Enter' && e.currentTarget.blur()}
                                            autoFocus
                                            className="text-right py-1"
                                        />
                                    ) : (
                                        <>
                                            {formatCurrency(budget.revenues.tickets?.actualRevenue || 0)} <i className="fa-solid fa-pencil text-xs text-slate-300 ml-1"></i>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                         <div className={`grid ${isProposalView ? 'grid-cols-1' : 'grid-cols-2'} gap-4 text-right font-bold mt-3 pt-3 border-t-2 border-slate-200 text-base`}>
                            <div>
                                <span className="text-xs text-slate-500 font-semibold uppercase block">Budgeted</span>
                                {formatCurrency(ticketCalcs.projectedRevenue)}
                            </div>
                            {!isProposalView && (
                             <div>
                                <span className="text-xs text-teal-600 font-semibold uppercase block">Actual</span>
                                {formatCurrency(budget.revenues.tickets?.actualRevenue || 0)}
                            </div>
                            )}
                         </div>
                    </div>

                    <RevenueSection title="Revenue: Sales" budgetTotal={salesData.totalEstimatedRevenue} actualTotal={salesData.totalActualRevenue} isProposalView={isProposalView} >
                        <p className="text-sm text-slate-600">This data is automatically calculated from the <span className="font-semibold">Sales & Inventory</span> module.</p>
                        {salesData.breakdown.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-slate-200">
                                <h4 className="text-md font-semibold text-slate-700 mb-2">Breakdown by Sales Event:</h4>
                                <div className="space-y-2">
                                    {salesData.breakdown.map(item => (
                                        <div key={item.id} className="grid grid-cols-3 gap-4 text-sm p-2 bg-slate-100 rounded-md">
                                            <div className="col-span-1 font-medium">{item.name}</div>
                                            <div className="col-span-1 text-right">Expected: <span className="font-semibold">{formatCurrency(item.estimatedRevenue)}</span></div>
                                            <div className="col-span-1 text-right">Actual: <span className="font-semibold text-teal-600">{formatCurrency(item.actualRevenue)}</span></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </RevenueSection>
                    <RevenueSection title="Revenue: Fundraising" budgetTotal={budgetCalculations.totalFundraising} actualTotal={budget.revenues.fundraising.reduce((sum, item) => sum + (item.actualAmount || 0), 0)} isProposalView={isProposalView}>
                         <RevenueCategoryItemsView items={budget.revenues.fundraising} categoryPath={['revenues', 'fundraising']} onUpdateRevenue={handleUpdateRevenueItem} onSetEditingRevenueId={setEditingRevenueId} editingRevenueId={editingRevenueId} fieldMap={revenueFieldMap} isProposalView={isProposalView} />
                    </RevenueSection>
                    <RevenueSection title="Revenue: Contributions" budgetTotal={budgetCalculations.totalContributions} actualTotal={budget.revenues.contributions.reduce((sum, item) => sum + (item.actualAmount || 0), 0)} isProposalView={isProposalView}>
                        <RevenueCategoryItemsView items={budget.revenues.contributions} categoryPath={['revenues', 'contributions']} onUpdateRevenue={handleUpdateRevenueItem} onSetEditingRevenueId={setEditingRevenueId} editingRevenueId={editingRevenueId} fieldMap={revenueFieldMap} isProposalView={isProposalView} />
                    </RevenueSection>
                </div>
                {/* EXPENSES */}
                <div>
                     <h3 className="text-xl font-bold text-slate-800 mb-3 mt-6">Expenses</h3>
                     <div className="space-y-4">
                        {(Object.keys(EXPENSE_FIELDS) as ExpenseCategoryType[]).map(categoryKey => {
                            const title = `Expenses: ${categoryKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}`;
                            const budgetedTotal = budgetCalculations[`total${categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1)}` as keyof typeof budgetCalculations] as number;
                            const actualTotal = Array.from(actualsByBudgetItem.entries()).reduce((sum, [key, val]) => {
                                const item = budget.expenses[categoryKey].find(i => i.id === key);
                                return sum + (item ? val.cost : 0);
                            }, 0);

                            return (
                                <RevenueSection key={categoryKey} title={title} budgetTotal={budgetedTotal} actualTotal={actualTotal} isProposalView={isProposalView}>
                                    <ExpenseCategoryItemsView items={budget.expenses[categoryKey]} actualsByBudgetItem={actualsByBudgetItem} fieldMap={expenseFieldMap} isProposalView={isProposalView} />
                                </RevenueSection>
                            )
                        })}
                         <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm mt-6">
                            <h3 className="text-xl font-bold text-slate-700">Expenses: Venue Rentals (Cash Only)</h3>
                            <div className="grid grid-cols-2 gap-4 text-right font-bold mt-3 pt-3 text-base">
                                <div><span className="text-xs text-slate-500 font-semibold uppercase block">Projected</span>{formatCurrency(projectedVenueCosts.cash)}</div>
                                <div><span className="text-xs text-teal-600 font-semibold uppercase block">Actual</span>N/A</div>
                            </div>
                        </div>
                     </div>
                </div>
            </div>
            
            <div className="mt-12 bg-slate-100 p-6 rounded-lg border border-slate-200 shadow-inner">
                <h3 className="text-2xl font-bold text-slate-800">Budget Summary</h3>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Projected */}
                    <div className="bg-white p-4 rounded-lg border">
                        <h4 className="font-bold text-lg text-slate-700 text-center mb-3">Projected</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center text-green-700"><span className="font-semibold">Total Revenue</span><strong>{formatCurrency(totalProjectedRevenue)}</strong></div>
                            <div className="flex justify-between items-center text-red-700"><span className="font-semibold">Total Expenses</span><strong>{formatCurrency(totalProjectedExpenses)}</strong></div>
                            <div className={`flex justify-between items-center pt-2 border-t mt-2 font-bold text-lg ${projectedBalance >= 0 ? 'text-blue-800' : 'text-orange-600'}`}><span>Balance</span><span>{formatCurrency(projectedBalance)}</span></div>
                        </div>
                    </div>
                     {/* Actual */}
                    {!isProposalView && (
                        <div className="bg-white p-4 rounded-lg border">
                            <h4 className="font-bold text-lg text-slate-700 text-center mb-3">Actual</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between items-center text-green-700"><span className="font-semibold">Total Revenue</span><strong>{formatCurrency(totalActualRevenue)}</strong></div>
                                <div className="flex justify-between items-center text-red-700"><span className="font-semibold">Total Expenses</span><strong>{formatCurrency(totalActualExpenses)}</strong></div>
                                <div className={`flex justify-between items-center pt-2 border-t mt-2 font-bold text-lg ${actualBalance >= 0 ? 'text-blue-800' : 'text-orange-600'}`}><span>Balance</span><span>{formatCurrency(actualBalance)}</span></div>
                            </div>
                             <p className="text-xs text-center text-slate-500 mt-2">In-Kind / Volunteer Contribution Value: {formatCurrency(totalContributedValue + projectedVenueCosts.inKind)}</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default BudgetView;