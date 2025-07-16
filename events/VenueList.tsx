
import React, { useState, useMemo } from 'react';
import { Venue } from '../../types';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { PROVINCES } from '../../constants';

interface VenueListProps {
  venues: Venue[];
  onAddVenue: () => void;
  onEditVenue: (id: string) => void;
  onDeleteVenue: (id: string) => void;
  onViewVenue: (id: string) => void;
}

const formatCurrency = (value: number) => value.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });

const VenueList: React.FC<VenueListProps> = ({ venues, onAddVenue, onEditVenue, onDeleteVenue, onViewVenue }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [provinceFilter, setProvinceFilter] = useState('');

    const filteredVenues = useMemo(() => {
        return venues.filter(venue => {
            const searchLower = searchTerm.toLowerCase();
            const nameMatch = venue.name.toLowerCase().includes(searchLower);
            const cityMatch = venue.address.city.toLowerCase().includes(searchLower);
            const contactMatch = (venue.contactName || '').toLowerCase().includes(searchLower);
            const provinceMatch = !provinceFilter || venue.address.province === provinceFilter;

            return provinceMatch && (nameMatch || cityMatch || contactMatch);
        }).sort((a,b) => a.name.localeCompare(b.name));
    }, [venues, searchTerm, provinceFilter]);

    const getCostDisplay = (venue: Venue) => {
        switch(venue.defaultCostType) {
            case 'free': return <span className="text-green-600 font-semibold">Free</span>;
            case 'in_kind': return <span className="text-purple-600 font-semibold">In-Kind</span>;
            case 'rented':
                const periodText = venue.defaultCostPeriod.replace('_', ' ');
                return `${formatCurrency(venue.defaultCost)} / ${periodText}`;
            default: return 'N/A';
        }
    }

  return (
    <div>
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 flex-grow">
                <Input
                    placeholder="Search by name, city, or contact..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select
                    value={provinceFilter}
                    onChange={(e) => setProvinceFilter(e.target.value)}
                    options={PROVINCES}
                />
            </div>
            <button onClick={onAddVenue} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                <i className="fa-solid fa-plus mr-2"></i>Add New Venue
            </button>
        </div>

        {filteredVenues.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
                <i className="fa-solid fa-landmark text-6xl text-slate-300"></i>
                <h3 className="mt-4 text-lg font-medium">No venues found.</h3>
                <p className="mt-1">Click "Add New Venue" to create one.</p>
            </div>
        ) : (
            <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg">
                {filteredVenues.map(venue => (
                    <div key={venue.id} className="p-4 hover:bg-slate-50 flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                            <p className="font-semibold text-lg text-slate-800">{venue.name}</p>
                            <p className="text-sm text-slate-600">
                                {venue.isVirtual ? "Virtual Venue" : `${venue.address.city}, ${venue.address.province}`}
                            </p>
                            <div className="text-sm text-slate-500 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                                <span><i className="fa-solid fa-user-tie fa-fw mr-2 text-slate-400"></i>{venue.contactName || 'No contact'}</span>
                                {venue.url && (
                                    <a href={venue.url} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">
                                        <i className="fa-solid fa-globe fa-fw mr-1"></i>Website
                                    </a>
                                )}
                                <span><i className="fa-solid fa-hand-holding-dollar fa-fw mr-2 text-slate-400"></i>{getCostDisplay(venue)}</span>
                            </div>
                        </div>
                        <div className="flex-shrink-0 flex items-center gap-2">
                             <button onClick={() => onViewVenue(venue.id)} className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-100">View</button>
                             <button onClick={() => onEditVenue(venue.id)} className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700">Edit</button>
                             <button onClick={() => onDeleteVenue(venue.id)} className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 rounded-md shadow-sm hover:bg-red-200">Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};
export default VenueList;
