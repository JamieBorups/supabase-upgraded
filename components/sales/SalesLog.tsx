

import React, { useMemo } from 'react';
import { useAppContext } from '../../context/AppContext.tsx';
import { generateSalesPdf } from '../../utils/pdfGenerator.ts';
import { SaleSession, SalesTransaction } from '../../types.ts';

const formatCurrency = (value: number) => value.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });

interface SalesLogProps {
    saleSession: SaleSession | null
}

const SalesLog: React.FC<SalesLogProps> = ({ saleSession }) => {
    const { state } = useAppContext();
    const { salesTransactions, inventoryItems, saleSessions } = state;

    const itemMap = useMemo(() => new Map(inventoryItems.map(i => [i.id, i])), [inventoryItems]);
    const sessionMap = useMemo(() => new Map(saleSessions.map(s => [s.id, s])), [saleSessions]);
    
    const filteredTransactions = useMemo(() => {
        if (!saleSession) return [];
        return salesTransactions.filter(tx => tx.saleSessionId === saleSession.id);
    }, [salesTransactions, saleSession]);

    // Create a single flat list of all items sold for rendering
    const flatSalesItems = useMemo(() => {
        return filteredTransactions
            .flatMap(tx => tx.items.map(item => ({
                ...item,
                transactionCreatedAt: tx.createdAt,
                saleSessionId: tx.saleSessionId,
            })))
            .sort((a, b) => new Date(b.transactionCreatedAt).getTime() - new Date(a.transactionCreatedAt).getTime());
    }, [filteredTransactions]);


    const handleGeneratePdf = () => {
        const title = `Sales Log for ${saleSession?.name || 'Session'}`;
        generateSalesPdf({
            title,
            transactions: filteredTransactions,
            itemMap,
            sessionMap
        });
    };

    return (
        <div>
            <div className="flex justify-end mb-4">
                <button 
                    onClick={handleGeneratePdf} 
                    className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-md shadow-sm hover:bg-rose-700 disabled:opacity-50"
                    disabled={filteredTransactions.length === 0}
                >
                    <i className="fa-solid fa-file-pdf mr-2"></i>Generate PDF Report
                </button>
            </div>
            
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-100">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Date</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Item</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Qty</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Price/Unit</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Line Total</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {flatSalesItems.length > 0 ? flatSalesItems.map(item => {
                            const inventoryItem = itemMap.get(item.inventoryItemId);
                            return (
                                <tr key={item.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-semibold text-slate-800">{new Date(item.transactionCreatedAt).toLocaleString()}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
                                        {inventoryItem?.name || 'Unknown Item'}
                                        {item.isVoucherRedemption && <span className="text-xs text-green-600 font-semibold ml-2">(Voucher)</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 text-right">{item.quantity}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 text-right">{formatCurrency(item.pricePerItem)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800 text-right">{formatCurrency(item.itemTotal)}</td>
                                </tr>
                            )
                        }) : (
                            <tr><td colSpan={5} className="text-center py-20 text-slate-500 italic">No sales transactions found for this session.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SalesLog;