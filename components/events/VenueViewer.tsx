
import React from 'react';
import { Venue } from '../../types';
import { PROVINCES } from '../../constants';
import { useAppContext } from '../../context/AppContext';


interface VenueViewerProps {
  venue: Venue;
  onBack: () => void;
}

const ViewField: React.FC<{ label: string; value: React.ReactNode; className?: string }> = ({ label, value, className }) => (
    <div className={className}>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{label}</h3>
        <div className="mt-1 text-slate-900 prose prose-slate max-w-none">{value}</div>
    </div>
);

const VenueViewer: React.FC<VenueViewerProps> = ({ venue, onBack }) => {
    const { state } = useAppContext();

    const getCostDisplay = (v: Venue) => {
        switch(v.defaultCostType) {
            case 'free': return <span className="text-green-600 font-semibold">Free</span>;
            case 'in_kind': return <span className="text-purple-600 font-semibold">In-Kind</span>;
            case 'rented':
                const periodText = v.defaultCostPeriod.replace('_', ' ');
                return `${v.defaultCost.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' })} / ${periodText}`;
            default: return 'N/A';
        }
    }

    const provinceLabel = PROVINCES.find(p => p.value === venue.address.province)?.label || venue.address.province;
    const status = state.settings.events.venueTypes.find(s => s.label === venue.status);

    return (
        <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
            <div className="flex justify-between items-start mb-6 border-b pb-4">
                <h1 className="text-3xl font-bold text-slate-900">{venue.name}</h1>
                <button onClick={onBack} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100">
                    <i className="fa-solid fa-arrow-left mr-2"></i>Back to List
                </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                        <h3 className="font-semibold text-lg text-slate-700 mb-4">Venue Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <ViewField label="Status" value={<span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${status?.color}`}>{venue.status}</span>} />
                            <ViewField label="Type" value={venue.isVirtual ? 'Virtual' : 'Physical'} />
                            <ViewField label="Capacity" value={venue.capacity.toString()} />
                            <ViewField label="Default Cost" value={getCostDisplay(venue)} />
                        </div>
                    </div>
                    
                    {!venue.isVirtual && (
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                            <h3 className="font-semibold text-lg text-slate-700 mb-4">Address</h3>
                            <ViewField label="Street" value={venue.address.street} />
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <ViewField label="City" value={venue.address.city} />
                                <ViewField label="Province" value={provinceLabel} />
                                <ViewField label="Postal Code" value={venue.address.postalCode} />
                                <ViewField label="Country" value={venue.address.country} />
                            </div>
                        </div>
                    )}
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                        <h3 className="font-semibold text-lg text-slate-700 mb-4">Contact</h3>
                        <ViewField label="Contact Name" value={venue.contactName || 'N/A'} />
                        <ViewField label="Title" value={venue.contactTitle || 'N/A'} className="mt-4" />
                        <ViewField label="Email" value={<a href={`mailto:${venue.contactEmail}`} className="text-teal-600 hover:underline">{venue.contactEmail}</a>} className="mt-4" />
                        <ViewField label="Phone" value={venue.contactPhone || 'N/A'} className="mt-4" />
                        {venue.url && <ViewField label="Website" value={<a href={venue.url} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">{venue.url}</a>} className="mt-4" />}
                    </div>
                    {venue.notes && <ViewField label="Notes" value={<p className="whitespace-pre-wrap">{venue.notes}</p>} />}
                </div>
            </div>
        </div>
    );
};

export default VenueViewer;
