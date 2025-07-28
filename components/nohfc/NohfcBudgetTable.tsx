import React, { useMemo } from 'react';
import { NohfcBudgetItem } from '../../types';
import { Input } from '../ui/Input';
import { NOHFC_BUDGET_CATEGORIES } from '../../constants';
import { Select } from '../ui/Select';
import FormField from '../ui/FormField';
import { TextareaWithCounter } from '../ui/TextareaWithCounter';

interface NohfcBudgetTableProps {
    items: NohfcBudgetItem[];
    onChange: (items: NohfcBudgetItem[]) => void;
}

const formatCurrency = (value: number) => value.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });

const NohfcBudgetTable: React.FC<NohfcBudgetTableProps> = ({ items, onChange }) => {
    
    const handleUpdate = (index: number, field: keyof NohfcBudgetItem, value: any) => {
        const newItems = [...items];
        if (field === 'requestedAmount') {
            (newItems[index] as any)[field] = parseFloat(value) || 0;
        } else {
            (newItems[index] as any)[field] = value;
        }
        onChange(newItems);
    };

    const handleAdd = () => {
        const newItem: NohfcBudgetItem = { id: `budget_${Date.now()}`, application_id: '', category: '', itemDescription: '', costBreakdown: '', requestedAmount: 0, justification: '' };
        onChange([...items, newItem]);
    };

    const handleRemove = (index: number) => {
        onChange(items.filter((_, i) => i !== index));
    };

    const { subtotal, adminFee, total } = useMemo(() => {
        const sub = items.reduce((sum, item) => sum + (item.requestedAmount || 0), 0);
        const fee = sub * 0.15;
        const grandTotal = sub + fee;
        return { subtotal: sub, adminFee: fee, total: grandTotal };
    }, [items]);

    return (
        <div className="space-y-3">
             <div className="hidden md:grid grid-cols-12 gap-3 text-xs font-bold text-slate-600">
                <div className="col-span-3">Budget Category</div>
                <div className="col-span-3">Budget Item</div>
                <div className="col-span-4">Cost Breakdown</div>
                <div className="col-span-2 text-right">Requested Amount</div>
            </div>
            {items.map((item, index) => (
                 <div key={item.id} className="border-t pt-4 mt-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                        <div className="col-span-12 md:col-span-3">
                            <Select 
                                value={item.category} 
                                onChange={e => handleUpdate(index, 'category', e.target.value)}
                                options={NOHFC_BUDGET_CATEGORIES}
                            />
                        </div>
                        <div className="col-span-12 md:col-span-3"><Input value={item.itemDescription} onChange={e => handleUpdate(index, 'itemDescription', e.target.value)} /></div>
                        <div className="col-span-12 md:col-span-4"><Input value={item.costBreakdown} onChange={e => handleUpdate(index, 'costBreakdown', e.target.value)} /></div>
                        <div className="col-span-12 md:col-span-2 flex items-center gap-2">
                            <Input type="number" step="0.01" value={item.requestedAmount || ''} onChange={e => handleUpdate(index, 'requestedAmount', e.target.value)} className="text-right" />
                            <button type="button" onClick={() => handleRemove(index)} className="text-red-500 p-2"><i className="fa fa-trash"></i></button>
                        </div>
                    </div>
                     <div className="px-1">
                        <FormField label="Justification" htmlFor={`justification-${index}`} className="mb-0">
                            <TextareaWithCounter
                                id={`justification-${index}`}
                                value={item.justification || ''}
                                onChange={e => handleUpdate(index, 'justification', e.target.value)}
                                rows={2}
                                wordLimit={100}
                            />
                        </FormField>
                    </div>
                </div>
            ))}
             <button type="button" onClick={handleAdd} className="mt-2 btn btn-secondary">
                <i className="fa-solid fa-plus mr-2"></i>Add Budget Item
            </button>
            <div className="mt-6 pt-4 border-t-2 border-slate-300 space-y-2 text-right">
                <div className="flex justify-end items-center gap-4">
                    <span className="font-semibold">Subtotal:</span>
                    <span className="w-40 text-lg font-semibold">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-end items-center gap-4">
                    <span className="font-semibold">Administrative Fee (15%):</span>
                    <span className="w-40 text-lg font-semibold">{formatCurrency(adminFee)}</span>
                </div>
                <div className="flex justify-end items-center gap-4 pt-2 border-t mt-2">
                    <span className="font-bold text-xl">Total NOHFC Request:</span>
                    <span className="w-40 text-xl font-bold text-teal-700">{formatCurrency(total)}</span>
                </div>
            </div>
        </div>
    );
};

export default NohfcBudgetTable;