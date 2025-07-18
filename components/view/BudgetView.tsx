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

const StatusBadge: React.FC<{ status: BudgetItemStatus }> = ({ status }) => {
    const { state: { settings: { theme } } } = useAppContext();
    const statusStyles: Record<BudgetItemStatus, { bg: string; text: string }> = {
        Pending: { bg: theme.statusWarningBg, text: theme.statusWarningText },
        Approved: { bg: theme.statusSuccessBg, text: theme.statusSuccessText },
        Denied: { bg: theme.statusErrorBg, text: theme.statusErrorText },
    };
    const style = statusStyles[status];
    return (
        <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full`} style={{ backgroundColor: style.bg, color: style.text }}>
            {status}
        </span>
    );
};

const ReadOnlyField: React.FC<{value: string | number | React.ReactNode}> = ({ value }) => (
    <div className="mt-1 p-2 rounded-md text-sm min-h-[38px] flex items-center" style={{ backgroundColor: 'var(--color-surface-muted)', borderColor: 'var(--color-border-default)', color: 'var(--color-text-default)' }}>
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
     <div className="p-4 rounded-lg border shadow-sm mt-6" style={{ backgroundColor: 'var(--color-surface-card)', borderColor: 'var(--color-border-subtle)'}}>
        <h3 className="text-xl font-bold border-b pb-2 mb-3" style={{ color: 'var(--color-text-heading)', borderColor: 'var(--color-border-subtle)'}}>{title}</h3>
        {children}
        <div className={`grid ${isProposalView ? 'grid-cols-1' : 'grid-cols-2'} gap-4 text-right font-bold mt-3 pt-3 border-t-2 text-base`} style={{ borderColor: 'var(--color-border-default)'}}>
            <div>
                <span className="text-xs font-semibold uppercase block" style={{ color: 'var(--color-text-muted)'}}>Budgeted</span>
                <span style={{ color: 'var(--color-text-heading)' }}>{formatCurrency(budgetTotal)}</span>
            </div>
            {!isProposalView && (
             <div>
                <span className="text-xs font-semibold uppercase block" style={{ color: 'var(--color-primary)'}}>Actual</span>
                <span style={{ color: 'var(--color-primary)' }}>{formatCurrency(actualTotal || 0)}</span>
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
        return <p className="text-sm italic py-2" style={{ color: 'var(--color-text-muted)' }}>No items in this category.</p>;
    }
    
    return (
        <div className="space-y-1">
             <div className={`grid ${isProposalView ? 'grid-cols-7' : 'grid-cols-12'} gap-2 text-xs font-semibold uppercase tracking-wider px-2 py-1`} style={{ color: 'var(--color-text-muted)' }}>
                <div className="col-span-7">Item</div>
                <div className="col-span-2 text-right">Budgeted</div>
                {!isProposalView && <div className="col-span-3 text-right">Actual</div>}
            </div>
            {items.map((item, index) => {
                const label = fieldMap.get(item.source) || item.source;
                const isEditing = editingRevenueId === item.id;
                const isDenied = item.status === 'Denied';
                return (
                    <div key={item.id} className={`grid ${isProposalView ? 'grid-cols-7' : 'grid-cols-12'} gap-2 items-center rounded p-2 group ${isDenied ? 'opacity-50' : 'hover:bg-slate-50'}`}>
                         <div className="col-span-7 text-sm">
                            <div className="flex items-center gap-2">
                              <StatusBadge status={item.status || 'Pending'} />
                              <p className={`font-medium ${isDenied ? 'line-through' : ''}`} style={{ color: 'var(--color-text-heading)'}}>{label}</p>
                            </div>
                            <p className="text-xs pl-8" style={{ color: 'var(--color-text-muted)'}}>{item.description}</p>
                        </div>
                        <div className={`col-span-2 text-right text-sm ${isDenied ? 'line-through' : ''}`} style={{ color: 'var(--color-text-default)'}}>{formatCurrency(item.amount)}</div>
                        {!isProposalView && (
                            <div className="col-span-3 text-right text-sm font-semibold cursor-pointer" style={{ color: 'var(--color-primary)'}} onClick={() => !isDenied && onSetEditingRevenueId(item.id)}>
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
        return <p className="text-sm italic py-2" style={{ color: 'var(--color-text-muted)' }}>No items budgeted for this category.</p>;
    }
    return (
        <div className="space-y-1">
            <div className={`grid ${isProposalView ? 'grid-cols-7' : 'grid-cols-10'} gap-2 text-xs font-semibold uppercase tracking-wider px-2 py-1`} style={{ color: 'var(--color-text-muted)' }}>
                <div className="col-span-5">Item</div>
                <div className="col-span-2 text-right">Budgeted</div>
                {!isProposalView && <div className="col-span-3 text-right">Actual Paid</div>}
            </div>
            {items.map(item => {
                 const actuals = actualsByBudgetItem.get(item.id) || { cost: 0, contributedValue: 0 };
                 return (
                    <div key={item.id} className={`grid ${isProposalView ? 'grid-cols-7' : 'grid-cols-10'} gap-2 items-center hover:bg-slate-50 rounded p-2 group`}>
                        <div className="col-span-5 text-sm">
                            <p className="font-medium" style={{ color: 'var(--color-text-heading)'}}>{fieldMap.get(item.source) || item.source}</p>
                            <p className="text-xs" style={{ color: 'var(--color-text-muted)'}}>{item.description}</p>
                        </div>
                        <div className="col-span-2 text-right text-sm" style={{ color: 'var(--color-text-default)'}}>{formatCurrency(item.amount)}</div>
                        {!isProposalView && <div className="col-span-3 text-right text-sm font-semibold" style={{ color: 'var(--color-status-info-text)'}}>{formatCurrency(actuals.cost)}</div>}
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
            <h2 className="text-2xl font-bold border-b-2 pb-2 mb-6" style={{ color: 'var(--color-text-heading)', borderColor: 'var(--color-primary)'}}>Budget vs. Actuals</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* REVENUE */}
                <div>
                    <h3 className="text-xl font-bold mb-3 mt-6" style={{ color: 'var(--color-text-heading)'}}>Revenue</h3>
                    
                    <RevenueSection title="Revenue: Grants" budgetTotal={budgetCalculations.totalGrants} actualTotal={budget.revenues.grants.reduce((sum, item) => sum + (item.actualAmount || 0), 0)} isProposalView={isProposalView}>
                       <RevenueCategoryItemsView items={budget.revenues.grants} categoryPath={['revenues', 'grants']} onUpdateRevenue={handleUpdateRevenueItem} onSetEditingRevenueId={setEditingRevenueId} editingRevenueId={editingRevenueId} fieldMap={revenueFieldMap} isProposalView={isProposalView} />
                    </RevenueSection>

                    <div className="p-4 rounded-lg border shadow-sm mt-6" style={{ backgroundColor: 'var(--color-surface-card)', borderColor: 'var(--color-border-subtle)'}}>
                        <h3 className="text-xl font-bold border-b pb-2 mb-3" style={{ color: 'var(--color-text-heading)', borderColor: 'var(--color-border-subtle)'}}>Revenue: Tickets & Box Office</h3>
                        <div className="mt-4 p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-surface-muted)', borderColor: 'var(--color-border-subtle)'}}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2 mb-4 p-2 rounded-md" style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
                                <div className="font-semibold text-sm" style={{ color: 'var(--color-text-muted)'}}>Number of presentations</div>
                                <div className="font-semibold text-sm" style={{ color: 'var(--color-text-muted)'}}>Average % of venue sold out</div>
                                <div className="font-semibold text-sm" style={{ color: 'var(--color-text-muted)'}}>Average venue capacity</div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <ReadOnlyField value={ticketCalcs.numberOfPresentations.toLocaleString()} />
                                <ReadOnlyField value={`${ticketCalcs.averagePctSold.toFixed(1)}%`} />
                                <ReadOnlyField value={ticketCalcs.averageVenueCapacity.toLocaleString()} />
                            </div>
                        </div>

                        <div className="mt-4 p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-surface-muted)', borderColor: 'var(--color-border-subtle)'}}>
                             <div className="flex items-end justify-between">
                                 <div className="font-semibold" style={{ color: 'var(--color-text-heading)'}}>Projected total audience</div>
                                 <div className="p-2 border rounded-md font-bold min-w-[120px] text-right" style={{ backgroundColor: 'var(--color-surface-card)', borderColor: 'var(--color-border-default)', color: 'var(--color-text-heading)'}}>{ticketCalcs.projectedAudience.toLocaleString()}</div>
                            </div>
                        </div>
                        
                        <div className="mt-4 p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-surface-muted)', borderColor: 'var(--color-border-subtle)'}}>
                             <div className="flex items-end justify-between">
                                 <div className="font-semibold" style={{ color: 'var(--color-text-heading)'}}>Average ticket price</div>
                                 <div className="p-2 border rounded-md font-bold min-w-[120px] text-right" style={{ backgroundColor: 'var(--color-surface-card)', borderColor: 'var(--color-border-default)', color: 'var(--color-text-heading)'}}>{formatCurrency(ticketCalcs.averageTicketPrice)}</div>
                            </div>
                        </div>
                        
                        <div className="mt-4 p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-surface-muted)', borderColor: 'var(--color-border-subtle)'}}>
                             <div className="flex items-end justify-between">
                                 <div className="font-semibold" style={{ color: 'var(--color-text-heading)'}}>Total tickets or box office</div>
                                 <div className="p-2 border rounded-md font-bold min-w-[120px] text-right" style={{ backgroundColor: 'var(--color-surface-card)', borderColor: 'var(--color-border-default)', color: 'var(--color-text-heading)'}}>{formatCurrency(ticketCalcs.projectedRevenue)}</div>
                            </div>
                        </div>
                        
                        {!isProposalView && (
                            <div className="py-2.5 grid grid-cols-2 gap-4 mt-2">
                                <div className="text-sm font-bold" style={{ color: 'var(--color-text-heading)'}}>Actual Ticket Revenue</div>
                                <div className="text-sm font-medium text-right cursor-pointer" style={{ color: 'var(--color-text-default)'}} onClick={() => setIsEditingActualRevenue(true)}>
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

                         <div className={`grid ${isProposalView ? 'grid-cols-1' : 'grid-cols-2'} gap-4 text-right font-bold mt-3 pt-3 border-t-2 text-base`} style={{ borderColor: 'var(--color-border-default)' }}>
                            <div>
                                <span className="text-xs font-semibold uppercase block" style={{ color: 'var(--color-text-muted)' }}>Budgeted</span>
                                <span style={{ color: 'var(--color-text-heading)' }}>{formatCurrency(ticketCalcs.projectedRevenue)}</span>
                            </div>
                            {!isProposalView && (
                             <div>
                                <span className="text-xs font-semibold uppercase block" style={{ color: 'var(--color-primary)' }}>Actual</span>
                                <span style={{ color: 'var(--color-primary)' }}>{formatCurrency(budget.revenues.tickets?.actualRevenue || 0)}</span>
                            </div>
                            )}
                         </div>
                    </div>

                    <RevenueSection title="Revenue: Sales" budgetTotal={salesData.totalEstimatedRevenue} actualTotal={salesData.totalActualRevenue} isProposalView={isProposalView} >
                        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>This data is automatically calculated from the <span className="font-semibold">Sales & Inventory</span> module.</p>
                        {salesData.breakdown.length > 0 && (
                            <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
                                <h4 className="text-md font-semibold mb-2" style={{ color: 'var(--color-text-heading)' }}>Breakdown by Sales Event:</h4>
                                <div className="space-y-2">
                                    {salesData.breakdown.map(item => (
                                        <div key={item.id} className="grid grid-cols-3 gap-4 text-sm p-2 rounded-md" style={{ backgroundColor: 'var(--color-surface-muted)' }}>
                                            <div className="col-span-1 font-medium">{item.name}</div>
                                            <div className="col-span-1 text-right">Expected: <span className="font-semibold">{formatCurrency(item.estimatedRevenue)}</span></div>
                                            <div className="col-span-1 text-right">Actual: <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>{formatCurrency(item.actualRevenue)}</span></div>
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
                     <h3 className="text-xl font-bold mb-3 mt-6" style={{ color: 'var(--color-text-heading)' }}>Expenses</h3>
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
                         <div className="p-4 rounded-lg border shadow-sm mt-6" style={{ backgroundColor: 'var(--color-surface-card)', borderColor: 'var(--color-border-subtle)'}}>
                            <h3 className="text-xl font-bold" style={{ color: 'var(--color-text-heading)' }}>Expenses: Venue Rentals (Cash Only)</h3>
                            <div className="grid grid-cols-2 gap-4 text-right font-bold mt-3 pt-3 text-base">
                                <div><span className="text-xs font-semibold uppercase block" style={{ color: 'var(--color-text-muted)' }}>Projected</span>{formatCurrency(projectedVenueCosts.cash)}</div>
                                <div><span className="text-xs font-semibold uppercase block" style={{ color: 'var(--color-primary)' }}>Actual</span>N/A</div>
                            </div>
                        </div>
                     </div>
                </div>
            </div>
            
            <div className="mt-12 p-6 rounded-lg border shadow-inner" style={{ backgroundColor: 'var(--color-surface-muted)', borderColor: 'var(--color-border-subtle)'}}>
                <h3 className="text-2xl font-bold" style={{ color: 'var(--color-text-heading)'}}>Budget Summary</h3>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Projected */}
                    <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-surface-card)', borderColor: 'var(--color-border-default)' }}>
                        <h4 className="font-bold text-lg text-center mb-3" style={{ color: 'var(--color-text-heading)' }}>Projected</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center" style={{ color: 'var(--color-status-success-text)'}}><span className="font-semibold">Total Revenue</span><strong>{formatCurrency(totalProjectedRevenue)}</strong></div>
                            <div className="flex justify-between items-center" style={{ color: 'var(--color-status-error-text)' }}><span className="font-semibold">Total Expenses</span><strong>{formatCurrency(totalProjectedExpenses)}</strong></div>
                            <div className={`flex justify-between items-center pt-2 border-t mt-2 font-bold text-lg ${projectedBalance >= 0 ? '' : 'text-orange-600'}`} style={{ borderColor: 'var(--color-border-default)', color: projectedBalance >= 0 ? 'var(--color-status-info-text)' : '' }}><span>Balance</span><span>{formatCurrency(projectedBalance)}</span></div>
                        </div>
                    </div>
                     {/* Actual */}
                    {!isProposalView && (
                        <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-surface-card)', borderColor: 'var(--color-border-default)' }}>
                            <h4 className="font-bold text-lg text-center mb-3" style={{ color: 'var(--color-text-heading)' }}>Actual</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between items-center" style={{ color: 'var(--color-status-success-text)'}}><span className="font-semibold">Total Revenue</span><strong>{formatCurrency(totalActualRevenue)}</strong></div>
                                <div className="flex justify-between items-center" style={{ color: 'var(--color-status-error-text)' }}><span className="font-semibold">Total Expenses</span><strong>{formatCurrency(totalActualExpenses)}</strong></div>
                                <div className={`flex justify-between items-center pt-2 border-t mt-2 font-bold text-lg ${actualBalance >= 0 ? '' : 'text-orange-600'}`} style={{ borderColor: 'var(--color-border-default)', color: actualBalance >= 0 ? 'var(--color-status-info-text)' : '' }}><span>Balance</span><span>{formatCurrency(actualBalance)}</span></div>
                            </div>
                             <p className="text-xs text-center mt-2" style={{ color: 'var(--color-text-muted)'}}>In-Kind / Volunteer Contribution Value: {formatCurrency(totalContributedValue + projectedVenueCosts.inKind)}</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default BudgetView;