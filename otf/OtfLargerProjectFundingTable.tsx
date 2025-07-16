
import React from 'react';
import { OtfLargerProjectFunding } from '../../types';
import { Input } from '../ui/Input';

interface OtfLargerProjectFundingTableProps {
    items: OtfLargerProjectFunding[];
    onChange: (items: OtfLargerProjectFunding[]) => void;
}

const OtfLargerProjectFundingTable: React.FC<OtfLargerProjectFundingTableProps> = ({ items, onChange }) => {
    
    const handleUpdate = (index: number, field: keyof OtfLargerProjectFunding, value: any) => {
        const newItems = [...items];
        (newItems[index] as any)[field] = value;
        onChange(newItems);
    };

    const handleAdd = () => {
        const newItem: OtfLargerProjectFunding = { id: `fund_${Date.now()}`, application_id: '', source: '', usageOfFunds: '' };
        onChange([...items, newItem]);
    };

    const handleRemove = (id: string) => {
        onChange(items.filter(item => item.id !== id));
    };

    return (
        <div className="space-y-3">
            <div className="hidden md:grid grid-cols-12 gap-3 text-xs font-bold text-slate-600">
                <div className="col-span-5">Source of Secured Funding</div>
                <div className="col-span-6">How Funds Will Be Used</div>
                <div className="col-span-1"></div>
            </div>
            {items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start border-t pt-3">
                    <div className="col-span-12 md:col-span-5"><Input value={item.source} onChange={e => handleUpdate(index, 'source', e.target.value)} placeholder="e.g., Municipal Grant" /></div>
                    <div className="col-span-12 md:col-span-6"><Input value={item.usageOfFunds} onChange={e => handleUpdate(index, 'usageOfFunds', e.target.value)} placeholder="e.g., To cover venue rental costs" /></div>
                    <div className="col-span-12 md:col-span-1"><button type="button" onClick={() => handleRemove(item.id)} className="text-red-500 p-2"><i className="fa fa-trash"></i></button></div>
                </div>
            ))}
             <button type="button" onClick={handleAdd} className="mt-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                <i className="fa-solid fa-plus mr-2"></i>Add Funding Source
            </button>
        </div>
    );
};

export default OtfLargerProjectFundingTable;
