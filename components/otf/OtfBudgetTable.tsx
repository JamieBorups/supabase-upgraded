
import React, { useMemo } from 'react';
import { OtfBudgetItem } from '../../types';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { OTF_BUDGET_CATEGORIES } from '../../constants';

interface OtfBudgetTableProps {
    items: OtfBudgetItem[];
    onChange: (items: OtfBudgetItem[]) => void;
}

const formatCurrency = (value: number) => value.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });

const OtfBudgetTable: React.FC<OtfBudgetTableProps> = ({ items, onChange }) => {
    
    const handleUpdate = (index: number, field: keyof OtfBudgetItem, value: any) => {
        const newItems = [...items];
        if (field === 'requestedAmount') {
            (newItems[index] as any)[field] = parseFloat(value) || 0;
        } else {
            (newItems[index] as any)[field] = value;
        }
        onChange(newItems);
    };

    const handleAdd = () => {
        const newItem: OtfBudgetItem = { id: `budget_${Date.now()}`, application_id: '', category: '', itemDescription: '', costBreakdown: '', requestedAmount: 0 };
        onChange([...items, newItem]);
    };

    const handleRemove = (index: number) => {
        onChange(items.filter((_, i) => i !== index));
    };

    const { subtotal, adminFee, total } = useMemo(() => {
        const sub = items.filter(item => item.category !== 'Overhead and Administration Costs')
                         .reduce((sum, item) => sum + (item.requestedAmount || 0), 0);
        const fee = sub * 0.15;
        const grandTotal = sub + fee;
        return { subtotal: sub, adminFee: fee, total: grandTotal };
    }, [items]);

    return (
        <div className="space-y-3">
             <div className="hidden md:grid grid-cols-12 gap-3 text-xs font-bold text-slate-600">
                <div className="col-span-3">Budget Category</div>
                <div className="col-span-3">Budget Item (Max 10 words)</div>
                <div className="col-span-4">Cost Breakdown (Max 25 words)</div>
                <div className="col-span-2 text-right">Requested Amount</div>
            </div>
            {items.filter(item => item.category !== 'Overhead and Administration Costs').map((item, index) => {
                // Find original index to pass to handlers
                const originalIndex = items.findIndex(originalItem => originalItem.id === item.id);
                return (
                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start border-t pt-3">
                        <div className="col-span-12 md:col-span-3">
                            <Select 
                                value={item.category} 
                                onChange={e => handleUpdate(originalIndex, 'category', e.target.value)}
                                options={OTF_BUDGET_CATEGORIES.filter(c => c.value !== 'Overhead and Administration Costs')}
                            />
                        </div>
                        <div className="col-span-12 md:col-span-3"><Input value={item.itemDescription} onChange={e => handleUpdate(originalIndex, 'itemDescription', e.target.value)} /></div>
                        <div className="col-span-12 md:col-span-4"><Input value={item.costBreakdown} onChange={e => handleUpdate(originalIndex, 'costBreakdown', e.target.value)} /></div>
                        <div className="col-span-12 md:col-span-2 flex items-center gap-2">
                            <Input type="number" step="0.01" value={item.requestedAmount || ''} onChange={e => handleUpdate(originalIndex, 'requestedAmount', e.target.value)} className="text-right" />
                            <button type="button" onClick={() => handleRemove(originalIndex)} className="text-red-500 p-2"><i className="fa fa-trash"></i></button>
                        </div>
                    </div>
                );
            })}
             <button type="button" onClick={handleAdd} className="mt-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                <i className="fa-solid fa-plus mr-2"></i>Add Budget Item
            </button>
            <div className="mt-6 pt-4 border-t-2 border-slate-300 space-y-2 text-right">
                <div className="flex justify-end items-center gap-4">
                    <span className="font-semibold">Subtotal:</span>
                    <span className="w-40 text-lg font-semibold">{formatCurrency(subtotal)}</span>
                </div>
                 <div className="flex justify-end items-center gap-4">
                    <span className="font-semibold">Overhead & Administration (15%):</span>
                    <span className="w-40 text-lg font-semibold">{formatCurrency(adminFee)}</span>
                </div>
                 <div className="flex justify-end items-center gap-4 pt-2 border-t mt-2">
                    <span className="font-bold text-xl">Total Request:</span>
                    <span className="w-40 text-xl font-bold text-teal-700">{formatCurrency(total)}</span>
                </div>
            </div>
        </div>
    );
};

export default OtfBudgetTable;
