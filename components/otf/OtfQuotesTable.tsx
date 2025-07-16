
import React from 'react';
import { OtfQuote } from '../../types';
import { Input } from '../ui/Input';
// Note: True file uploads are complex. This component uses simple URL inputs as a substitute.

interface OtfQuotesTableProps {
    items: OtfQuote[];
    onChange: (items: OtfQuote[]) => void;
}

const OtfQuotesTable: React.FC<OtfQuotesTableProps> = ({ items, onChange }) => {

    const handleUpdate = (index: number, field: keyof OtfQuote, value: string) => {
        const newItems = [...items];
        (newItems[index] as any)[field] = value;
        onChange(newItems);
    };

    const handleAdd = () => {
        const newItem: OtfQuote = { id: `quote_${Date.now()}`, application_id: '', fileUrl: '', description: '' };
        onChange([...items, newItem]);
    };

    const handleRemove = (id: string) => {
        onChange(items.filter(item => item.id !== id));
    };

    return (
        <div className="space-y-3">
            <p className="text-xs text-slate-500">For individual goods and services valued above $5,000, a minimum of 1 quote is required. You can provide a public URL to the quote (e.g., from Google Drive, Dropbox).</p>
            <div className="hidden md:grid grid-cols-12 gap-3 text-xs font-bold text-slate-600">
                <div className="col-span-5">Quote / Estimate File URL</div>
                <div className="col-span-6">Short Description</div>
                <div className="col-span-1"></div>
            </div>
            {items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start border-t pt-3">
                    <div className="col-span-12 md:col-span-5"><Input type="url" value={item.fileUrl} onChange={e => handleUpdate(index, 'fileUrl', e.target.value)} placeholder="https://example.com/quote.pdf" /></div>
                    <div className="col-span-12 md:col-span-6"><Input value={item.description} onChange={e => handleUpdate(index, 'description', e.target.value)} placeholder="e.g., Quote for audio equipment" /></div>
                    <div className="col-span-12 md:col-span-1"><button type="button" onClick={() => handleRemove(item.id)} className="text-red-500 p-2"><i className="fa fa-trash"></i></button></div>
                </div>
            ))}
             <button type="button" onClick={handleAdd} className="mt-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                <i className="fa-solid fa-plus mr-2"></i>Add Quote
            </button>
        </div>
    );
};

export default OtfQuotesTable;
