
import React, { useState, useMemo, useEffect } from 'react';
import { produce } from 'immer';
import { useAppContext } from '../../context/AppContext';
import { SaleSession, InventoryItem } from '../../types';
import { initialSaleSession } from '../../constants';
import FormField from '../ui/FormField';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { RadioGroup } from '../ui/RadioGroup';
import { CheckboxGroup } from '../ui/CheckboxGroup';

interface SaleSessionEditorModalProps {
    session: SaleSession | null;
    onSave: (session: SaleSession) => void;
    onCancel: () => void;
}

const ContactSearchInput: React.FC<{
    value: string;
    onValueChange: (name: string) => void;
    onContactSelect: (contactId: string, contactName: string) => void;
}> = ({ value, onValueChange, onContactSelect }) => {
    const { state } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [showResults, setShowResults] = useState(false);
    
    const searchResults = useMemo(() => {
        if (!searchTerm) return [];
        return state.contacts.filter(c => 
            `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.organization.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 5);
    }, [searchTerm, state.contacts]);

    const handleSelect = (contactId: string, contactName: string) => {
        onContactSelect(contactId, contactName);
        setShowResults(false);
        setSearchTerm('');
    };

    return (
        <div className="relative">
            <Input 
                value={value || searchTerm}
                onChange={e => {
                    onValueChange(e.target.value);
                    setSearchTerm(e.target.value);
                    if (e.target.value) setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
                placeholder="Type to search contacts or enter name..."
            />
            {showResults && searchResults.length > 0 && (
                <ul className="absolute z-[80] w-full bg-white border border-slate-300 rounded-md mt-1 max-h-48 overflow-y-auto shadow-lg">
                    {searchResults.map(contact => (
                        <li 
                            key={contact.id}
                            onClick={() => handleSelect(contact.id, `${contact.firstName} ${contact.lastName}`)}
                            className="p-2 hover:bg-teal-100 cursor-pointer"
                        >
                            {contact.firstName} {contact.lastName} ({contact.organization})
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};


const SaleSessionEditorModal: React.FC<SaleSessionEditorModalProps> = ({ session, onSave, onCancel }) => {
    const { state } = useAppContext();
    const { projects, events } = state;
    
    const [formData, setFormData] = useState<Omit<SaleSession, 'id' | 'createdAt' | 'updatedAt'>>(session || initialSaleSession);

    const isComplete = useMemo(() => {
        if (!formData.name) return false;
        if (formData.organizerType === 'internal') {
            if (formData.associationType === 'event') return !!formData.eventId;
            if (formData.associationType === 'project') return !!formData.projectId;
            if (formData.associationType === 'general') return true;
            return false;
        }
        if (formData.organizerType === 'partner') {
            return !!formData.partnerName;
        }
        return false;
    }, [formData]);
    
    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const now = new Date().toISOString();
        const dataToSave: SaleSession = {
            id: session?.id || `new_session_${Date.now()}`,
            createdAt: session?.createdAt || now,
            updatedAt: now,
            ...formData,
        };
        onSave(dataToSave);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-[60] flex justify-center items-center p-4">
            <form onSubmit={handleSave} className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h3 className="text-xl font-bold text-slate-800 mb-6">{session ? 'Edit' : 'Create New'} Sale Session</h3>
                
                <div className="space-y-4">
                    <FormField label="Session Name" htmlFor="session_name" required>
                        <Input id="session_name" value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} placeholder="e.g., Saturday Market - July 20" />
                    </FormField>
                    <FormField label="Expected Revenue" htmlFor="expected_revenue" instructions="Set a goal for this sales session.">
                        <Input type="number" step="0.01" id="expected_revenue" value={formData.expectedRevenue || ''} onChange={e => setFormData(p => ({...p, expectedRevenue: parseFloat(e.target.value) || 0}))} placeholder="0.00" />
                    </FormField>
                    <FormField label="Who is conducting this sale?" htmlFor="organizerType-internal">
                        <RadioGroup name="organizerType" selectedValue={formData.organizerType} onChange={(val) => setFormData(p => ({...p, organizerType: val as any}))} options={[{value: 'internal', label: "Our Collective"}, {value: 'partner', label: "A Partner"}]} />
                    </FormField>
                    {formData.organizerType === 'internal' && (
                        <FormField label="How is this sale associated?" htmlFor="associationType-event">
                            <RadioGroup name="associationType" selectedValue={formData.associationType || ''} onChange={(val) => setFormData(p => ({...p, associationType: val as any}))} options={[{value: 'event', label: 'Link to an Event'}, {value: 'project', label: 'Link to a Project'}, {value: 'general', label: 'General/Unlinked Sale'}]} />
                        </FormField>
                    )}
                    {formData.organizerType === 'internal' && formData.associationType === 'event' && (
                        <FormField label="Select an Event" htmlFor="event_select"><Select id="event_select" value={formData.eventId || ''} onChange={e => setFormData(p => ({...p, eventId: e.target.value}))} options={[{value: '', label: 'Select event...'}, ...events.filter(e => !e.isTemplate).map(e => ({value: e.id, label: e.title}))]} /></FormField>
                    )}
                    {formData.organizerType === 'internal' && formData.associationType === 'project' && (
                        <FormField label="Select a Project" htmlFor="project_select"><Select id="project_select" value={formData.projectId || ''} onChange={e => setFormData(p => ({...p, projectId: e.target.value}))} options={[{value: '', label: 'Select project...'}, ...projects.map(p => ({value: p.id, label: p.projectTitle}))]} /></FormField>
                    )}
                    {formData.organizerType === 'partner' && (
                        <FormField label="Partner Information" htmlFor="partner_name">
                            <ContactSearchInput 
                                value={formData.partnerName || ''}
                                onValueChange={(name) => setFormData(p => ({...p, partnerName: name, partnerContactId: null}))}
                                onContactSelect={(contactId, name) => setFormData(p => ({...p, partnerName: name, partnerContactId: contactId}))}
                            />
                        </FormField>
                    )}
                </div>
                
                <div className="mt-8 flex justify-end space-x-3 pt-5 border-t">
                    <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-md hover:bg-slate-200">Cancel</button>
                    <button type="submit" disabled={!isComplete} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md shadow-sm hover:bg-teal-700 disabled:bg-slate-400">Save Session</button>
                </div>
            </form>
        </div>
    );
};

export default SaleSessionEditorModal;
