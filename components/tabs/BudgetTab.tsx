
import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { produce } from 'immer';
import { FormData, BudgetItem, BudgetItemStatus, SaleSession } from '../../types';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { EXPENSE_FIELDS, REVENUE_FIELDS, initialBudget, BUDGET_ITEM_STATUS_OPTIONS } from '../../constants';
import { useBudgetCalculations, useTicketRevenueCalculations } from '../../hooks/useBudgetCalculations';
import { useAppContext } from '../../context/AppContext';
import FormField from '../ui/FormField';

interface Props {
  formData: FormData;
  onChange: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
}

const formatCurrency = (value: number | undefined | null) => {
    const num = value || 0;
    return num.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });
};

const ReadOnlyField: React.FC<{value: string | number}> = ({ value }) => (
    <div className="mt-1 p-2 bg-slate-100 border border-slate-300 rounded-md text-sm text-slate-700 min-h-[38px] flex items-center">
        {value}
    </div>
);


interface BudgetCategoryManagerProps {
    items: BudgetItem[];
    options: { value: string; label: string }[];
    onChange: (items: BudgetItem[]) => void;
    isRevenue?: boolean;
}

const BudgetCategoryManager: React.FC<BudgetCategoryManagerProps> = ({ items, options, onChange, isRevenue = false }) => {
    const { state } = useAppContext();
    const [newItemSource, setNewItemSource] = useState('');

    const handleAddItem = () => {
        if (!newItemSource) return;

        const option = options.find(o => o.value === newItemSource);
        if (!option) return;

        const newItem: BudgetItem = {
            id: `item_${Date.now()}_${Math.random()}`,
            source: option.value,
            description: '',
            amount: 0,
            ...(isRevenue && { status: 'Pending' })
        };
        onChange([...items, newItem]);
        setNewItemSource('');
    };

    const handleUpdateItem = (id: string, field: keyof BudgetItem, value: string | number | BudgetItemStatus) => {
        const newItems = items.map(item => {
            if (item.id === id) {
                return { ...item, [field]: value };
            }
            return item;
        });
        onChange(newItems);
    };

    const handleRemoveItem = (id: string) => {
        onChange(items.filter(item => item.id !== id));
    };

    const getLabelForSource = (source: string) => {
        const labels = isRevenue ? state.settings.budget.revenueLabels : state.settings.budget.expenseLabels;
        if (labels && labels[source]) {
            return labels[source];
        }
        // Fallback to formatting key
        return source.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    };
    
    const availableOptions = options;
    
    const gridCols = isRevenue ? 'grid-cols-12' : 'grid-cols-12';

    return (
        <div className="space-y-3">
            {items.length > 0 && (
                <div className="space-y-2 border-b border-slate-200 pb-3 mb-3">
                    <div className={`hidden md:grid ${gridCols} gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider`}>
                        <div className="md:col-span-4">Item</div>
                        {isRevenue && <div className="md:col-span-2">Status</div>}
                        <div className="md:col-span-4">Description</div>
                        <div className="md:col-span-2 text-right">Amount</div>
                        <div className="md:col-span-1"></div>
                    </div>
                    {items.map(item => (
                        <div key={item.id} className={`grid grid-cols-1 md:${gridCols} gap-2 items-center`}>
                            <div className="md:col-span-4 text-sm text-slate-800 font-medium">{getLabelForSource(item.source)}</div>
                            {isRevenue && (
                                <div className="md:col-span-2">
                                    <Select
                                        aria-label={`Status for ${getLabelForSource(item.source)}`}
                                        value={item.status || 'Pending'}
                                        onChange={e => handleUpdateItem(item.id, 'status', e.target.value as BudgetItemStatus)}
                                        options={BUDGET_ITEM_STATUS_OPTIONS}
                                        className="text-xs py-1"
                                    />
                                </div>
                            )}
                            <div className="md:col-span-4">
                                <Input
                                    aria-label={`Description for ${getLabelForSource(item.source)}`}
                                    type="text"
                                    placeholder="Description (e.g., 'Per diem for Elder 1')"
                                    value={item.description}
                                    onChange={e => handleUpdateItem(item.id, 'description', e.target.value)}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Input
                                    aria-label={`Amount for ${getLabelForSource(item.source)}`}
                                    type="number"
                                    placeholder="0.00"
                                    className="text-right"
                                    value={item.amount === 0 ? '' : item.amount}
                                    onChange={e => handleUpdateItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                                    step="0.01"
                                />
                            </div>
                            <div className="md:col-span-1 text-right">
                                <button type="button" onClick={() => handleRemoveItem(item.id)} className="text-slate-400 hover:text-red-600 p-2 rounded-full hover:bg-red-100 transition-colors" aria-label={`Remove ${getLabelForSource(item.source)}`}>
                                    <i className="fa-solid fa-trash-alt fa-fw"></i>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pt-2">
                <Select
                    value={newItemSource}
                    onChange={e => setNewItemSource(e.target.value)}
                    options={[{ value: '', label: 'Select an item to add...' }, ...availableOptions]}
                />
                <button
                    type="button"
                    onClick={handleAddItem}
                    disabled={!newItemSource}
                    className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md shadow-sm hover:bg-teal-700 disabled:bg-slate-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                    <i className="fa-solid fa-plus mr-2"></i>
                    Add to Budget
                </button>
            </div>
        </div>
    );
};

const BudgetSection: React.FC<{ title: string; children: React.ReactNode; instructions?: React.ReactNode; total?: number }> = ({ title, children, instructions, total }) => (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm mt-6">
        <h3 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-3 mb-4">{title}</h3>
        {instructions && <div className="text-sm text-slate-600 mb-4 prose max-w-none prose-ul:list-disc prose-ul:list-inside prose-li:mb-1">{instructions}</div>}
        <div className="space-y-2">{children}</div>
        {total !== undefined && (
            <div className="text-right font-bold mt-4 pt-4 border-t-2 border-slate-200 text-slate-800 text-lg">
                Total: {formatCurrency(total)}
            </div>
        )}
    </div>
);


const BudgetTab: React.FC<Props> = ({ formData, onChange }) => {
    const { state } = useAppContext();
    const { settings, events, eventTickets, venues, saleSessions, salesTransactions } = state;
    const { revenueLabels, expenseLabels } = settings.budget;

    const budget = formData.budget || initialBudget;
    
    // Calculate ticket revenue
    const ticketCalcs = useTicketRevenueCalculations(formData.id, events, venues, eventTickets);

    // Calculate sales revenue
    const salesData = useMemo(() => {
        // Get all event IDs for the current project.
        const projectEventIds = new Set(events.filter(e => e.projectId === formData.id).map(e => e.id));

        // Filter sale sessions relevant to this project.
        const relevantSaleSessions = saleSessions.filter(s =>
            (s.associationType === 'project' && s.projectId === formData.id) ||
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
    }, [saleSessions, salesTransactions, formData.id, events]);
    
    // Sync calculated sales data back to the main project form data
    useEffect(() => {
        if (formData.estimatedSales !== salesData.totalEstimatedRevenue) {
            onChange('estimatedSales', salesData.totalEstimatedRevenue);
        }
        if (formData.actualSales !== salesData.totalActualRevenue) {
            onChange('actualSales', salesData.totalActualRevenue);
        }
    }, [
        salesData.totalEstimatedRevenue,
        salesData.totalActualRevenue,
        formData.estimatedSales,
        formData.actualSales,
        onChange
    ]);


    const getRevenueLabel = useCallback((key: string, defaultLabel: string) => {
        const customLabel = revenueLabels[key];
        return (customLabel !== undefined && customLabel !== '') ? customLabel : defaultLabel;
    }, [revenueLabels]);

    const getExpenseLabel = useCallback((key: string, defaultLabel: string) => {
        const customLabel = expenseLabels[key];
        return (customLabel !== undefined && customLabel !== '') ? customLabel : defaultLabel;
    }, [expenseLabels]);
    
    const handleBudgetCategoryChange = (categoryPath: string[], items: BudgetItem[]) => {
        const newFormData = produce(formData, draft => {
            if (!draft.budget) {
                draft.budget = { ...initialBudget };
            }
            let current: any = draft.budget;
            for(let i=0; i<categoryPath.length-1; i++) {
                current = current[categoryPath[i] as keyof typeof current];
            }
            current[categoryPath[categoryPath.length-1] as keyof typeof current] = items;
        });
        onChange('budget', newFormData.budget);
    };
    
    const {
        totalGrants,
        totalSales, // Note: This is from manual budget entries, not the sales module
        totalFundraising,
        totalContributions,
        totalProfessionalFees,
        totalTravel,
        totalProduction,
        totalAdministration,
        totalResearch,
        totalProfessionalDevelopment,
        totalExpenses,
    } = useBudgetCalculations(budget);
    
     const projectedVenueCashExpense = useMemo(() => {
        const projectEvents = events.filter(e => e.projectId === formData.id && !e.isTemplate);
        return projectEvents.reduce((total, event) => {
            const venue = venues.find(v => v.id === event.venueId);
            if (!venue || event.status === 'Pending' || event.status === 'Cancelled') return total;

            const costDetails = event.venueCostOverride || {
                costType: venue.defaultCostType,
                cost: venue.defaultCost,
                period: venue.defaultCostPeriod,
                notes: ''
            };

            if (costDetails.costType !== 'rented') return total;

            if (costDetails.period === 'flat_rate') {
                return total + costDetails.cost;
            }

            const start = new Date(event.startDate);
            const end = new Date(event.endDate);
            const days = (end.getTime() - start.getTime()) / (1000 * 3600 * 24) + 1;

            if (costDetails.period === 'per_day') {
                return total + (costDetails.cost * days);
            }
            
            if (costDetails.period === 'per_hour') {
                 if (event.isAllDay) {
                    return total + (costDetails.cost * 8 * days); // Assume 8 hours for all-day
                }
                if (event.startTime && event.endTime) {
                    const startTime = new Date(`1970-01-01T${event.startTime}`);
                    const endTime = new Date(`1970-01-01T${event.endTime}`);
                    const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 3600);
                    return total + (costDetails.cost * hours * days);
                }
            }

            return total;
        }, 0);
    }, [events, venues, formData.id]);


    const nonTicketTotalRevenue = totalGrants + salesData.totalActualRevenue + totalFundraising + totalContributions;
    const totalRevenue = nonTicketTotalRevenue + ticketCalcs.projectedRevenue;
    const totalExpensesWithVenues = totalExpenses + projectedVenueCashExpense;
    const balance = totalRevenue - totalExpensesWithVenues;

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-slate-900">Project Budget</h2>
            <p className="text-base text-slate-600">Enter your project budget below. Add revenue and expense items to each category. The form will automatically calculate totals for you.</p>

            <BudgetSection title="Revenue: Sales">
                <p className="text-sm text-slate-600 mb-4">This data is automatically calculated from the <span className="font-semibold">Sales & Inventory</span> module.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                    <div className="bg-slate-100 p-3 rounded-md">
                        <div className="text-xs text-slate-500 font-semibold">BUDGETED</div>
                        <div className="text-lg font-bold text-slate-800">{formatCurrency(salesData.totalEstimatedRevenue)}</div>
                    </div>
                     <div className="bg-green-100 p-3 rounded-md">
                        <div className="text-xs text-green-700 font-semibold">ACTUAL</div>
                        <div className="text-lg font-bold text-green-800">{formatCurrency(salesData.totalActualRevenue)}</div>
                    </div>
                </div>
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
            </BudgetSection>

            <BudgetSection title="Revenue: Grants" total={totalGrants}>
                <BudgetCategoryManager
                    items={budget.revenues.grants}
                    options={REVENUE_FIELDS.grants.map(f => ({ value: f.key, label: getRevenueLabel(f.key, f.label) }))}
                    onChange={items => handleBudgetCategoryChange(['revenues', 'grants'], items)}
                    isRevenue={true}
                />
            </BudgetSection>

            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm mt-6">
                <h3 className="text-xl font-bold text-slate-800">Revenue: Tickets and box office</h3>
                <div className="mt-4 bg-slate-100/70 p-4 rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-600 mb-4">The information below is automatically calculated based on the events you have planned for this project.</p>
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
            </div>
            
            <BudgetSection title="Revenue: Fundraising" total={totalFundraising}>
                <BudgetCategoryManager
                    items={budget.revenues.fundraising}
                    options={REVENUE_FIELDS.fundraising.map(f => ({ value: f.key, label: getRevenueLabel(f.key, f.label) }))}
                    onChange={items => handleBudgetCategoryChange(['revenues', 'fundraising'], items)}
                    isRevenue={true}
                />
            </BudgetSection>

            <BudgetSection title="Revenue: Contributions" total={totalContributions}>
                <BudgetCategoryManager
                    items={budget.revenues.contributions}
                    options={REVENUE_FIELDS.contributions.map(f => ({ value: f.key, label: getRevenueLabel(f.key, f.label) }))}
                    onChange={items => handleBudgetCategoryChange(['revenues', 'contributions'], items)}
                    isRevenue={true}
                />
            </BudgetSection>

            <div className="mt-8 pt-6 border-t-4 border-double border-slate-300">
                <h2 className="text-3xl font-bold text-slate-900">Expenses</h2>
                <p className="text-base text-slate-600">Enter your project expenses. These will be used to calculate your project's balance.</p>
            </div>

            <BudgetSection title="Expenses: Professional Fees" total={totalProfessionalFees}>
                <BudgetCategoryManager
                    items={budget.expenses.professionalFees}
                    options={EXPENSE_FIELDS.professionalFees.map(f => ({ value: f.key, label: getExpenseLabel(f.key, f.label) }))}
                    onChange={items => handleBudgetCategoryChange(['expenses', 'professionalFees'], items)}
                />
            </BudgetSection>
            <BudgetSection title="Expenses: Travel" total={totalTravel}>
                <BudgetCategoryManager
                    items={budget.expenses.travel}
                    options={EXPENSE_FIELDS.travel.map(f => ({ value: f.key, label: getExpenseLabel(f.key, f.label) }))}
                    onChange={items => handleBudgetCategoryChange(['expenses', 'travel'], items)}
                />
            </BudgetSection>
            <BudgetSection title="Expenses: Production" total={totalProduction}>
                <BudgetCategoryManager
                    items={budget.expenses.production}
                    options={EXPENSE_FIELDS.production.map(f => ({ value: f.key, label: getExpenseLabel(f.key, f.label) }))}
                    onChange={items => handleBudgetCategoryChange(['expenses', 'production'], items)}
                />
            </BudgetSection>
            <BudgetSection title="Expenses: Administration" total={totalAdministration}>
                <BudgetCategoryManager
                    items={budget.expenses.administration}
                    options={EXPENSE_FIELDS.administration.map(f => ({ value: f.key, label: getExpenseLabel(f.key, f.label) }))}
                    onChange={items => handleBudgetCategoryChange(['expenses', 'administration'], items)}
                />
            </BudgetSection>
            <BudgetSection title="Expenses: Research" total={totalResearch}>
                <BudgetCategoryManager
                    items={budget.expenses.research}
                    options={EXPENSE_FIELDS.research.map(f => ({ value: f.key, label: getExpenseLabel(f.key, f.label) }))}
                    onChange={items => handleBudgetCategoryChange(['expenses', 'research'], items)}
                />
            </BudgetSection>
            <BudgetSection title="Expenses: Professional Development" total={totalProfessionalDevelopment}>
                <BudgetCategoryManager
                    items={budget.expenses.professionalDevelopment}
                    options={EXPENSE_FIELDS.professionalDevelopment.map(f => ({ value: f.key, label: getExpenseLabel(f.key, f.label) }))}
                    onChange={items => handleBudgetCategoryChange(['expenses', 'professionalDevelopment'], items)}
                />
            </BudgetSection>

            <div className="mt-12 bg-slate-100 p-6 rounded-lg border border-slate-200 shadow-inner">
                <h3 className="text-2xl font-bold text-slate-800">Budget Summary</h3>
                 <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="bg-green-100 p-4 rounded-lg border border-green-200">
                        <div className="text-sm font-semibold text-green-800">Total Projected Revenue</div>
                        <div className="text-2xl font-bold text-green-900">{formatCurrency(totalRevenue)}</div>
                    </div>
                     <div className="bg-red-100 p-4 rounded-lg border border-red-200">
                        <div className="text-sm font-semibold text-red-800">Total Projected Expenses</div>
                        <div className="text-2xl font-bold text-red-900">{formatCurrency(totalExpensesWithVenues)}</div>
                        <p className="text-xs text-red-600">(includes {formatCurrency(projectedVenueCashExpense)} from venue rentals)</p>
                    </div>
                    <div className="bg-blue-100 p-4 rounded-lg border border-blue-200">
                        <div className="text-sm font-semibold text-blue-800">Projected Balance</div>
                        <div className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-900' : 'text-orange-600'}`}>{formatCurrency(balance)}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BudgetTab;
