
import React, { useState, useMemo } from 'react';
import { Venue } from '../../types';
import FormField from '../ui/FormField';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { TextareaWithCounter } from '../ui/TextareaWithCounter';
import { PROVINCES } from '../../constants';
import ToggleSwitch from '../ui/ToggleSwitch';
import { RadioGroup } from '../ui/RadioGroup';
import { useAppContext } from '../../context/AppContext';

interface VenueEditorProps {
    venue: Venue;
    onSave: (venue: Venue) => void;
    onCancel: () => void;
}

const COST_TYPE_OPTIONS = [
    { value: 'free', label: 'Free' },
    { value: 'rented', label: 'Rented (Cash Expense)' },
    { value: 'in_kind', label: 'In-Kind Contribution' },
];

const COST_PERIOD_OPTIONS = [
    { value: 'flat_rate', label: 'Flat Rate' },
    { value: 'per_day', label: 'Per Day' },
    { value: 'per_hour', label: 'Per Hour' },
];

const VenueEditor: React.FC<VenueEditorProps> = ({ venue, onSave, onCancel }) => {
    const { state } = useAppContext();
    const [formData, setFormData] = useState<Venue>(venue);

    const venueStatusOptions = useMemo(() => {
        if (state.settings.events.venueTypes && state.settings.events.venueTypes.length > 0) {
            return state.settings.events.venueTypes.map(s => ({ value: s.label, label: s.label }));
        }
        // Fallback in case settings are empty
        return [
            { value: 'Potential', label: 'Potential' },
            { value: 'Confirmed', label: 'Confirmed' },
            { value: 'Not Available', label: 'Not Available' },
        ];
    }, [state.settings.events.venueTypes]);

    const handleChange = <K extends keyof Venue>(field: K, value: Venue[K]) => {
        setFormData(prev => ({...prev, [field]: value}));
    };
    
    const handleAddressChange = <K extends keyof Venue['address']>(field: K, value: Venue['address'][K]) => {
        setFormData(prev => ({...prev, address: {...prev.address, [field]: value}}));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSave} className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
            <div className="flex justify-between items-start mb-6 border-b pb-4">
                <h1 className="text-3xl font-bold text-slate-900">{formData.id.startsWith('venue_') ? "Edit Venue" : "Add New Venue"}</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8">
                {/* Left Column */}
                <div className="space-y-6">
                    <FormField label="Venue Name" htmlFor="venueName" required>
                        <Input id="venueName" value={formData.name} onChange={e => handleChange('name', e.target.value)} />
                    </FormField>

                    <ToggleSwitch
                        id="isVirtual"
                        checked={formData.isVirtual}
                        onChange={checked => handleChange('isVirtual', checked)}
                        label="This is a virtual venue (e.g., online stream)"
                    />
                    
                     {!formData.isVirtual && (
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4">
                             <h3 className="font-semibold text-lg text-slate-700">Venue Address</h3>
                            <FormField label="Street Address" htmlFor="street"><Input id="street" value={formData.address.street} onChange={e => handleAddressChange('street', e.target.value)} /></FormField>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="City" htmlFor="city"><Input id="city" value={formData.address.city} onChange={e => handleAddressChange('city', e.target.value)} /></FormField>
                                <FormField label="Province/Territory" htmlFor="province"><Select id="province" value={formData.address.province} onChange={e => handleAddressChange('province', e.target.value)} options={PROVINCES} /></FormField>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="Postal Code" htmlFor="postalCode"><Input id="postalCode" value={formData.address.postalCode} onChange={e => handleAddressChange('postalCode', e.target.value)} /></FormField>
                                <FormField label="Country" htmlFor="country"><Input id="country" value={formData.address.country} onChange={e => handleAddressChange('country', e.target.value)} /></FormField>
                            </div>
                        </div>
                    )}
                    
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4">
                        <h3 className="font-semibold text-lg text-slate-700">Default Rental Information</h3>
                         <FormField label="Cost Type" htmlFor="costType" className="mb-0">
                            <RadioGroup name="costType" options={COST_TYPE_OPTIONS} selectedValue={formData.defaultCostType} onChange={val => handleChange('defaultCostType', val as any)} />
                        </FormField>
                        {formData.defaultCostType !== 'free' && (
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <FormField label="Default Cost" htmlFor="defaultCost"><Input type="number" id="defaultCost" value={formData.defaultCost || ''} onChange={e => handleChange('defaultCost', parseFloat(e.target.value) || 0)} /></FormField>
                                <FormField label="Period" htmlFor="defaultCostPeriod"><Select id="defaultCostPeriod" value={formData.defaultCostPeriod} onChange={e => handleChange('defaultCostPeriod', e.target.value as any)} options={COST_PERIOD_OPTIONS} /></FormField>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                         <FormField label="Status" htmlFor="status">
                            <Select id="status" value={formData.status} onChange={e => handleChange('status', e.target.value as Venue['status'])} options={venueStatusOptions} />
                        </FormField>
                         <FormField label="Capacity" htmlFor="capacity">
                            <Input type="number" id="capacity" value={formData.capacity || ''} onChange={e => handleChange('capacity', parseInt(e.target.value) || 0)} disabled={formData.isVirtual} />
                        </FormField>
                    </div>
                     <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4">
                        <h3 className="font-semibold text-lg text-slate-700">Contact Information</h3>
                        <FormField label="Key Contact Name" htmlFor="contactName"><Input id="contactName" value={formData.contactName} onChange={e => handleChange('contactName', e.target.value)} /></FormField>
                        <FormField label="Contact Title" htmlFor="contactTitle"><Input id="contactTitle" value={formData.contactTitle} onChange={e => handleChange('contactTitle', e.target.value)} /></FormField>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField label="Contact Email" htmlFor="contactEmail"><Input type="email" id="contactEmail" value={formData.contactEmail} onChange={e => handleChange('contactEmail', e.target.value)} /></FormField>
                            <FormField label="Contact Phone" htmlFor="contactPhone"><Input type="tel" id="contactPhone" value={formData.contactPhone} onChange={e => handleChange('contactPhone', e.target.value)} /></FormField>
                        </div>
                         <FormField label="Website URL" htmlFor="url"><Input type="url" id="url" value={formData.url} onChange={e => handleChange('url', e.target.value)} /></FormField>
                    </div>
                    
                    <FormField label="Notes" htmlFor="notes" instructions="Private notes about this venue.">
                        <TextareaWithCounter id="notes" rows={5} wordLimit={300} value={formData.notes} onChange={e => handleChange('notes', e.target.value)} />
                    </FormField>
                </div>
            </div>

            <div className="flex items-center justify-end pt-8 mt-8 border-t border-slate-200 space-x-4">
                <button type="button" onClick={onCancel} className="px-6 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100">Cancel</button>
                <button type="submit" className="px-6 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700">Save Venue</button>
            </div>
        </form>
    );
};

export default VenueEditor;
