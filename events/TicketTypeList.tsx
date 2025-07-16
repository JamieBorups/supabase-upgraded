
import React, { useState, useMemo } from 'react';
import { TicketType } from '../../types';
import { Input } from '../ui/Input';

interface TicketTypeListProps {
  ticketTypes: TicketType[];
  onAdd: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

const formatCurrency = (value: number) => value.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });

const TicketTypeList: React.FC<TicketTypeListProps> = ({ ticketTypes, onAdd, onEdit, onDelete, onView }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredTicketTypes = useMemo(() => {
        return ticketTypes
            .filter(tt => tt.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a,b) => a.name.localeCompare(b.name));
    }, [ticketTypes, searchTerm]);

  return (
    <div>
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
            <div className="flex-grow">
                <Input
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button onClick={onAdd} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                <i className="fa-solid fa-plus mr-2"></i>Add New Ticket Type
            </button>
        </div>

        {filteredTicketTypes.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
                <i className="fa-solid fa-ticket text-6xl text-slate-300"></i>
                <h3 className="mt-4 text-lg font-medium">No ticket types found.</h3>
                <p className="mt-1">Click "Add New Ticket Type" to create reusable tickets for your events.</p>
            </div>
        ) : (
            <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg">
                {filteredTicketTypes.map(tt => (
                    <div key={tt.id} className="p-4 hover:bg-slate-50 flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                            <p className="font-semibold text-lg text-slate-800">{tt.name}</p>
                            <p className="text-sm text-slate-600">{tt.description || 'No description'}</p>
                        </div>
                        <div className="flex-shrink-0 flex items-center gap-4">
                            <span className="text-sm font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-md">{tt.isFree ? 'Free' : formatCurrency(tt.defaultPrice)}</span>
                            <div className="flex items-center gap-2">
                                <button onClick={() => onView(tt.id)} className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-100">View</button>
                                <button onClick={() => onEdit(tt.id)} className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700">Edit</button>
                                <button onClick={() => onDelete(tt.id)} className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 rounded-md shadow-sm hover:bg-red-200">Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};
export default TicketTypeList;
