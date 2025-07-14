
import React from 'react';
import { TicketType } from '../../types';

interface TicketTypeViewerProps {
    ticketType: TicketType;
    onBack: () => void;
}

const formatCurrency = (value: number) => value.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });

const ViewField: React.FC<{ label: string; value: React.ReactNode; className?: string }> = ({ label, value, className = '' }) => (
    <div className={className}>
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
        <div className="mt-1 text-slate-800">{value}</div>
    </div>
);

const TicketTypeViewer: React.FC<TicketTypeViewerProps> = ({ ticketType, onBack }) => {
    return (
        <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
            <div className="flex justify-between items-start mb-6 border-b pb-4">
                <h1 className="text-3xl font-bold text-slate-900">{ticketType.name}</h1>
                <button onClick={onBack} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100">
                    <i className="fa-solid fa-arrow-left mr-2"></i>Back to List
                </button>
            </div>
            
            <div className="max-w-xl space-y-6">
                <ViewField label="Description" value={<p className="whitespace-pre-wrap">{ticketType.description || 'No description provided.'}</p>} />
                <ViewField label="Default Price" value={ticketType.isFree ? 'Free' : formatCurrency(ticketType.defaultPrice)} />
            </div>
        </div>
    );
};

export default TicketTypeViewer;
