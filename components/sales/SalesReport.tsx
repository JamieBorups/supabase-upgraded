
import React, { useMemo, useState } from 'react';
import { useAppContext } from '../../context/AppContext.tsx';
import { SaleSession, SalesTransaction, InventoryItem } from '../../types.ts';
import { generateSalesPdf } from '../../utils/pdfGenerator.ts';

const formatCurrency = (value: number) => value.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });

const StatCard: React.FC<{ label: string; value: string; color: string; }> = ({ label, value, color }) => (
    <div className={`p-4 rounded-lg border-l-4 ${color}`}>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
);

const PdfChoiceModal: React.FC<{ onChoose: (type: 'summary' | 'full') => void, onClose: () => void }> = ({ onChoose, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Choose Report Type</h3>
            <div className="space-y-3">
                 <button onClick={() => onChoose('summary')} className="w-full text-left p-4 bg-white border border-slate-300 rounded-md hover:bg-slate-100 hover:border-teal-500">
                    <p className="font-semibold text-slate-800">Summary Only</p>
                    <p className="text-xs text-slate-500">A concise, high-level report with key financial metrics and item breakdowns.</p>
                </button>
                 <button onClick={() => onChoose('full')} className="w-full text-left p-4 bg-white border border-slate-300 rounded-md hover:bg-slate-100 hover:border-teal-500">
                    <p className="font-semibold text-slate-800">Full Report (with Transaction Log)</p>
                    <p className="text-xs text-slate-500">Includes the summary plus a detailed log of every transaction for this session.</p>
                </button>
            </div>
            <div className="mt-6 flex justify-end">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-md hover:bg-slate-200">Cancel</button>
            </div>
        </div>
    </div>
);

interface SalesReportProps {
    saleSession: SaleSession | null;
}

const SalesReport: React.FC<SalesReportProps> = ({ saleSession }) => {
    const { state, notify } = useAppContext();
    const { salesTransactions, inventoryItems, saleSessions } = state;
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const itemMap = useMemo(() => new Map(inventoryItems.map(i => [i.id, i])), [inventoryItems]);
    const sessionMap = useMemo(() => new Map(saleSessions.map(s => [s.id, s])), [saleSessions]);

    const reportData = useMemo(() => {
        if (!saleSession) return null;

        const estimatedRevenue = saleSession.expectedRevenue || 0;
        const transactionsForSession = salesTransactions.filter(tx => tx.saleSessionId === saleSession.id);
        const actualRevenue = transactionsForSession.reduce((sum, tx) => sum + tx.total, 0);

        const itemsSoldMap = new Map<string, {
            name: string;
            costPrice: number;
            salePrice: number;
            quantity: number;
            totalRevenue: number;
        }>();

        const vouchersRedeemedMap = new Map<string, {
            name: string;
            costPrice: number;
            quantity: number;
        }>();
        
        transactionsForSession.forEach(tx => {
            tx.items.forEach(item => {
                const inventoryItem = itemMap.get(item.inventoryItemId);
                if (!inventoryItem) return;

                if(item.isVoucherRedemption) {
                    const existingVoucher = vouchersRedeemedMap.get(item.inventoryItemId);
                    if (existingVoucher) {
                        existingVoucher.quantity += item.quantity;
                    } else {
                        vouchersRedeemedMap.set(item.inventoryItemId, {
                            name: inventoryItem.name,
                            costPrice: inventoryItem.costPrice,
                            quantity: item.quantity,
                        });
                    }
                } else {
                    const existingSale = itemsSoldMap.get(item.inventoryItemId);
                    if (existingSale) {
                        existingSale.quantity += item.quantity;
                        existingSale.totalRevenue += item.itemTotal;
                    } else {
                        itemsSoldMap.set(item.inventoryItemId, {
                            name: inventoryItem.name,
                            costPrice: inventoryItem.costPrice,
                            salePrice: item.pricePerItem,
                            quantity: item.quantity,
                            totalRevenue: item.itemTotal,
                        });
                    }
                }
            });
        });

        const itemsSold = Array.from(itemsSoldMap.values()).map(item => ({
            ...item,
            totalCost: item.costPrice * item.quantity,
            profit: item.totalRevenue - (item.costPrice * item.quantity)
        }));

        const vouchersBreakdown = Array.from(vouchersRedeemedMap.values()).map(item => ({
            ...item,
            totalCost: item.costPrice * item.quantity,
        }));
        
        const totalCostOfGoods = itemsSold.reduce((sum, item) => sum + item.totalCost, 0);
        const netProfit = actualRevenue - totalCostOfGoods;
        const totalPromotionalCost = vouchersBreakdown.reduce((sum, item) => sum + item.totalCost, 0);
        const totalVouchersRedeemed = vouchersBreakdown.reduce((sum, item) => sum + item.quantity, 0);
        
        return { 
            estimatedRevenue, 
            actualRevenue, 
            itemsSold, 
            totalCostOfGoods, 
            netProfit, 
            transactions: transactionsForSession,
            vouchersBreakdown,
            totalPromotionalCost,
            totalVouchersRedeemed
        };
    }, [saleSession, salesTransactions, itemMap]);
    
    const handleGeneratePdf = async (type: 'summary' | 'full') => {
        setIsPdfModalOpen(false);
        if (!reportData || !saleSession) {
            notify('No data available to generate a report.', 'warning');
            return;
        }
        setIsGeneratingPdf(true);
        notify('Generating PDF...', 'info');

        const summary = [
            { label: 'Actual Revenue', value: formatCurrency(reportData.actualRevenue) },
            { label: 'Cost of Goods Sold (COGS)', value: formatCurrency(reportData.totalCostOfGoods) },
            { label: 'Net Profit', value: formatCurrency(reportData.netProfit) },
            { label: 'Vouchers Redeemed', value: reportData.totalVouchersRedeemed.toString() },
            { label: 'Total Promotional Cost', value: formatCurrency(reportData.totalPromotionalCost) },
        ];
        
        try {
            await generateSalesPdf({
                title: `Sales Report: ${saleSession.name}`,
                summary: summary,
                itemBreakdown: reportData.itemsSold,
                vouchersBreakdown: reportData.vouchersBreakdown,
                transactions: type === 'full' ? reportData.transactions : undefined,
                itemMap
            });
        } catch (error: any) {
            console.error("PDF generation failed:", error);
            notify(`Failed to generate PDF: ${error.message}`, 'error');
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    if (!reportData) {
        return <div className="text-center py-20 text-slate-500 italic">No sales data for this session.</div>
    }

    return (
        <div>
            {isPdfModalOpen && <PdfChoiceModal onChoose={handleGeneratePdf} onClose={() => setIsPdfModalOpen(false)} />}
             <div className="flex justify-end mb-4">
                 <button
                    onClick={() => setIsPdfModalOpen(true)}
                    disabled={isGeneratingPdf}
                    className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-md shadow-sm hover:bg-rose-700 disabled:bg-slate-400"
                >
                    <i className={`fa-solid ${isGeneratingPdf ? 'fa-spinner fa-spin' : 'fa-file-pdf'} mr-2`}></i>
                    {isGeneratingPdf ? 'Generating...' : 'Generate PDF'}
                </button>
             </div>
            
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <StatCard label="Actual Revenue" value={formatCurrency(reportData.actualRevenue)} color="border-green-500" />
                    <StatCard label="Cost of Goods (COGS)" value={formatCurrency(reportData.totalCostOfGoods)} color="border-orange-500" />
                    <StatCard 
                        label="Net Profit" 
                        value={formatCurrency(reportData.netProfit)} 
                        color={reportData.netProfit >= 0 ? 'border-blue-500' : 'border-red-500'}
                    />
                     <StatCard label="Vouchers Redeemed" value={reportData.totalVouchersRedeemed.toString()} color="border-purple-500" />
                    <StatCard label="Promotional Cost" value={formatCurrency(reportData.totalPromotionalCost)} color="border-rose-500" />
                </div>
                
                <div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-4">Item Sales Breakdown</h3>
                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Item</th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Qty Sold</th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Cost/Unit</th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Price/Unit</th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Total Cost</th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Total Revenue</th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Profit</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {reportData.itemsSold.map(item => (
                                    <tr key={item.name}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">{item.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 text-right">{item.quantity}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 text-right">{formatCurrency(item.costPrice)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 text-right">{formatCurrency(item.salePrice)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-700 text-right">{formatCurrency(item.totalCost)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-700 text-right">{formatCurrency(item.totalRevenue)}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-right ${item.profit >= 0 ? 'text-blue-700' : 'text-red-700'}`}>{formatCurrency(item.profit)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesReport;
