

import React, { useMemo } from 'react';
import { AppSettings, FormData, BudgetItem, Event, EventTicket, Venue } from '../../types';
import { useBudgetCalculations, useTicketRevenueCalculations } from '../../hooks/useBudgetCalculations';
import { REVENUE_FIELDS, EXPENSE_FIELDS } from '../../constants';

const formatCurrency = (value: number | undefined | null) => {
    const num = value || 0;
    return num.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });
};

interface ReportBudgetViewProps {
    project: FormData;
    actuals: Map<string, number>;
    settings: AppSettings;
    events: Event[];
    eventTickets: EventTicket[];
    venues: Venue[];
}

const ReportSection: React.FC<{title: string, className?: string}> = ({title, className=""}) => (
    <div className={`bg-slate-700 text-white font-semibold p-1.5 mt-4 text-sm ${className}`}></div>
);

const GenericTable: React.FC<{headers: string[], rows: (string|number|React.ReactNode)[][], isTotal?: boolean }> = ({headers, rows, isTotal=false}) => (
     <div className="overflow-x-auto">
        <table className="min-w-full text-sm border-collapse border border-slate-300">
            {!isTotal && (
                <thead>
                    <tr>
                        {headers.map((h, i) => (
                            <th key={i} className={`p-2 border border-slate-300 bg-slate-100 font-semibold text-slate-600 text-left ${h.toLowerCase().includes('projected') || h.toLowerCase().includes('actual') || h.toLowerCase().includes('requested') || h.toLowerCase().includes('awarded') || h.toLowerCase().includes('capacity') || h.toLowerCase().includes('price') || h.toLowerCase().includes('audience') ? 'text-right' : ''}`}>
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
            )}
            <tbody>
                {rows.map((row, i) => (
                    <tr key={i} className="border-t border-slate-300 bg-white hover:bg-slate-50">
                        {row.map((cell, j) => (
                            <td key={j} className={`p-2 border-b border-slate-300 ${isTotal ? 'font-bold' : ''} ${typeof cell === 'number' || (typeof cell === 'string' && cell.startsWith('$')) ? 'text-right' : ''}`}>
                                {cell}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const ReportBudgetView: React.FC<ReportBudgetViewProps> = ({ project, actuals, settings, events, eventTickets, venues }) => {
    const budget = project.budget;
    const { revenueLabels, expenseLabels } = settings.budget;

    const revenueFieldMap = useMemo(() => {
        const allFields = Object.values(REVENUE_FIELDS).flat();
        return new Map(allFields.map(f => [f.key, (revenueLabels[f.key] !== undefined && revenueLabels[f.key] !== '') ? revenueLabels[f.key] : f.label]));
    }, [revenueLabels]);
    
    const expenseFieldMap = useMemo(() => {
        const allFields = Object.values(EXPENSE_FIELDS).flat();
        return new Map(allFields.map(f => [f.key, (expenseLabels[f.key] !== undefined && expenseLabels[f.key] !== '') ? expenseLabels[f.key] : f.label]));
    }, [expenseLabels]);

    const budgetCalculations = useBudgetCalculations(budget);
    const { projectedAudience, projectedRevenue } = useTicketRevenueCalculations(project.id, events, venues, eventTickets);
    const totalActualExpenses = Array.from(actuals.values()).reduce((sum, val) => sum + val, 0);
    const getActual = (id: string) => actuals.get(id) || 0;

    const renderRows = (items: BudgetItem[], fieldMap: Map<string, string>, showDescription: boolean = true) => {
        return items.map(item => {
            const projectedAmount = item.amount || 0;
            const actualAmount = getActual(item.id);
            const rowData: (string|React.ReactNode)[] = [fieldMap.get(item.source) || item.source];
            
            if (showDescription) { // 4 column layout
                 rowData.push(formatCurrency(projectedAmount));
                 rowData.push(formatCurrency(actualAmount));
                 rowData.push(item.description);
            } else { // 3 column layout
                rowData.push(formatCurrency(projectedAmount));
                rowData.push(formatCurrency(actualAmount));
            }
            return rowData;
        });
    };

    const totalProjectedRevenue = budgetCalculations.totalRevenue + projectedRevenue;
    
    return (
      <section>
          <h2 className="text-2xl font-bold text-slate-800 border-b-2 border-teal-500 pb-2 mb-6">Budget Report</h2>
          <div className="bg-slate-50 border p-4 rounded-md mt-6">
                <ReportSection title="Total budget" />
                <GenericTable
                    headers={["", "Projected revenues", "Actual revenues", "Projected expenses", "Actual expenses"]}
                    rows={[["Total budget", formatCurrency(totalProjectedRevenue), formatCurrency(budgetCalculations.totalActualRevenue), formatCurrency(budgetCalculations.totalExpenses), formatCurrency(totalActualExpenses)]]}
                    isTotal
                />
                
                <ReportSection title="Revenue: Grants" />
                <GenericTable headers={["", "Requested", "Awarded", "Description"]} rows={renderRows(budget.revenues.grants, revenueFieldMap)} />
                
                <ReportSection title="Revenue: Tickets and box office" />
                <GenericTable
                    headers={["Metric", "Value"]}
                    rows={[
                        ["Projected Audience", projectedAudience.toLocaleString()],
                        ["Projected Revenue", formatCurrency(projectedRevenue)],
                        ["Actual Revenue", formatCurrency(budget.revenues.tickets?.actualRevenue || 0)],
                    ]}
                />

                <ReportSection title="Revenue: Sales" />
                <GenericTable headers={['Source', 'Projected', 'Actual', 'Description']} rows={renderRows(budget.revenues.sales, revenueFieldMap)} />
                
                <ReportSection title="Revenue: Fundraising" />
                <GenericTable headers={['Source', 'Projected', 'Actual', 'Description']} rows={renderRows(budget.revenues.fundraising, revenueFieldMap)} />

                <ReportSection title="Revenue: Contributions" />
                <GenericTable headers={['Source', 'Projected', 'Actual', 'Description']} rows={renderRows(budget.revenues.contributions, revenueFieldMap)} />
                
                <div className="mt-4">
                    <GenericTable headers={['', 'Projected', 'Actual']} rows={[['Total revenues', formatCurrency(totalProjectedRevenue), formatCurrency(budgetCalculations.totalActualRevenue)]]} isTotal />
                </div>

                <ReportSection title="Expenses: Professional fees and honorariums" />
                <GenericTable headers={['Expense Item', 'Projected', 'Actual', 'Description']} rows={renderRows(budget.expenses.professionalFees, expenseFieldMap)} />
                
                <ReportSection title="Expenses: Travel" />
                <GenericTable headers={['Expense Item', 'Projected', 'Actual', 'Description']} rows={renderRows(budget.expenses.travel, expenseFieldMap)} />
                
                <ReportSection title="Expenses: Production and publication costs" />
                <GenericTable headers={['Expense Item', 'Projected', 'Actual', 'Description']} rows={renderRows(budget.expenses.production, expenseFieldMap)} />

                <ReportSection title="Expenses: Administration" />
                <GenericTable headers={['Expense Item', 'Projected', 'Actual', 'Description']} rows={renderRows(budget.expenses.administration, expenseFieldMap)} />

                <ReportSection title="Expenses: Research" />
                <GenericTable headers={['Expense Item', 'Projected', 'Actual']} rows={renderRows(budget.expenses.research, expenseFieldMap, false)} />
                
                <ReportSection title="Expenses: Professional development" />
                <GenericTable headers={['Expense Item', 'Projected', 'Actual']} rows={renderRows(budget.expenses.professionalDevelopment, expenseFieldMap, false)} />

                <div className="mt-4">
                    <GenericTable headers={['', 'Projected', 'Actual']} rows={[['Total expenses', formatCurrency(budgetCalculations.totalExpenses), formatCurrency(totalActualExpenses)]]} isTotal/>
                </div>
          </div>
      </section>
    );
};

export default ReportBudgetView;
