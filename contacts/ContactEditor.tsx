
import React, { useState, useCallback, useMemo } from 'react';
import { produce } from 'immer';
import { Contact, Interaction } from '../../types';
import FormField from '../ui/FormField';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { TextareaWithCounter } from '../ui/TextareaWithCounter';
import { PROVINCES } from '../../constants';
import { useAppContext } from '../../context/AppContext';
import { CheckboxGroup } from '../ui/CheckboxGroup';
import * as api from '../../services/api';

interface ContactEditorProps {
    contact: Contact;
    onSave: (contact: Contact) => void;
    onCancel: () => void;
}

// --- Helper Components ---
const TagInput: React.FC<{ tags: string[], onChange: (tags: string[]) => void }> = ({ tags, onChange }) => {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newTag = inputValue.trim();
            if (newTag && !tags.includes(newTag)) {
                onChange([...tags, newTag]);
            }
            setInputValue('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        onChange(tags.filter(tag => tag !== tagToRemove));
    };

    return (
        <div>
            <div className="flex flex-wrap gap-2 p-2 border border-slate-400 rounded-md bg-white">
                {tags.map(tag => (
                    <span key={tag} className="flex items-center gap-2 bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded-full">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="text-blue-500 hover:text-blue-700">&times;</button>
                    </span>
                ))}
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-grow bg-transparent outline-none p-1 text-sm"
                    placeholder={tags.length === 0 ? "Add tags (e.g., Media, Funder)..." : ''}
                />
            </div>
             <p className="text-xs text-slate-500 mt-1">Separate tags with a comma or press Enter.</p>
        </div>
    );
};

const initialInteraction: Omit<Interaction, 'id' | 'contactId'> = { date: new Date().toISOString().split('T')[0], type: 'Call', notes: '' };

const InteractionLog: React.FC<{ contactId: string; contactName: string }> = ({ contactId, contactName }) => {
    const { state, dispatch, notify } = useAppContext();
    const interactions = useMemo(() => state.interactions.filter(i => i.contactId === contactId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [state.interactions, contactId]);
    const [newInteraction, setNewInteraction] = useState(initialInteraction);
    const [isAdding, setIsAdding] = useState(false);

    const handleAddInteraction = async () => {
        if (!newInteraction.notes) return;
        const payload: Omit<Interaction, 'id'> = { ...newInteraction, contactId };
        try {
            const addedInteraction = await api.addInteraction(payload as Interaction);
            dispatch({ type: 'ADD_INTERACTION', payload: addedInteraction });
            setNewInteraction(initialInteraction);
            setIsAdding(false);
            notify('Interaction logged.', 'success');
        } catch (error: any) {
            notify(`Error logging interaction: ${error.message}`, 'error');
        }
    };

    const handleDeleteInteraction = async (id: string) => {
        if(window.confirm('Are you sure you want to delete this interaction log?')) {
            try {
                await api.deleteInteraction(id);
                dispatch({ type: 'DELETE_INTERACTION', payload: id });
                notify('Interaction deleted.', 'success');
            } catch (error: any) {
                notify(`Error deleting interaction: ${error.message}`, 'error');
            }
        }
    };
    
    return (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <h3 className="font-semibold text-lg text-slate-700 mb-4">Interaction History for <span className="text-teal-600">{contactName}</span></h3>
             {!isAdding && (
                <button type="button" onClick={() => setIsAdding(true)} className="mb-4 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700">
                    <i className="fa-solid fa-plus mr-2"></i>Log New Interaction
                </button>
            )}

            {isAdding && (
                <div className="p-3 mb-4 bg-white border border-blue-300 rounded-lg space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Interaction Date" htmlFor="int_date" className="mb-0"><Input type="date" value={newInteraction.date} onChange={e => setNewInteraction(p => ({...p, date: e.target.value}))} /></FormField>
                        <FormField label="Interaction Type" htmlFor="int_type" className="mb-0"><Select value={newInteraction.type} onChange={e => setNewInteraction(p => ({...p, type: e.target.value as Interaction['type']}))} options={[{value: 'Call', label: 'Call'}, {value: 'Email', label: 'Email'}, {value: 'Meeting', label: 'Meeting'}, {value: 'Note', label: 'Note'}]} /></FormField>
                    </div>
                    <FormField label="Notes" htmlFor="int_notes" className="mb-0"><TextareaWithCounter value={newInteraction.notes} onChange={e => setNewInteraction(p => ({...p, notes: e.target.value}))} rows={3} wordLimit={200} /></FormField>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setIsAdding(false)} className="px-3 py-1 text-xs font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-md hover:bg-slate-200">Cancel</button>
                        <button type="button" onClick={handleAddInteraction} className="px-3 py-1 text-xs font-medium text-white bg-teal-600 rounded-md shadow-sm hover:bg-teal-700">Save Log</button>
                    </div>
                </div>
            )}
            
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {interactions.map(interaction => (
                    <div key={interaction.id} className="bg-white p-3 border border-slate-200 rounded-md">
                        <div className="flex justify-between items-start">
                            <p className="font-semibold text-slate-800 text-sm">
                                {interaction.type} on {new Date(interaction.date + 'T12:00:00').toLocaleDateString()}
                            </p>
                             <button type="button" onClick={() => handleDeleteInteraction(interaction.id)} className="text-slate-400 hover:text-red-500 text-xs"><i className="fa-solid fa-trash"></i></button>
                        </div>
                        <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{interaction.notes}</p>
                    </div>
                ))}
                {interactions.length === 0 && !isAdding && (
                    <p className="text-center text-slate-500 italic py-4">No interactions logged yet.</p>
                )}
            </div>
        </div>
    );
};


// --- Main Editor Component ---
const ContactEditor: React.FC<ContactEditorProps> = ({ contact, onSave, onCancel }) => {
    const { state } = useAppContext();
    const [formData, setFormData] = useState<Contact>(contact);
    const [activeTab, setActiveTab] = useState<'info' | 'interactions'>('info');

    const handleFormChange = <K extends keyof Contact>(field: K, value: Contact[K]) => {
        setFormData(produce(draft => { (draft as any)[field] = value; }));
    };

    const handleAddressChange = <K extends keyof Contact['address']>(field: K, value: Contact['address'][K]) => {
        setFormData(produce(draft => { draft.address[field] = value; }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.firstName || !formData.lastName || !formData.email) {
            alert('First Name, Last Name, and Email are required.');
            return;
        }
        onSave(formData);
    };

    const provinceOptions = useMemo(() => PROVINCES, []);
    const contactTypeOptions = useMemo(() => [
        { value: '', label: 'Select a type...' },
        ...state.settings.media.contactTypes.map(t => ({ value: t.label, label: t.label }))
    ], [state.settings.media.contactTypes]);

    const projectOptions = useMemo(() => state.projects.map(p => ({
        value: p.id, label: p.projectTitle
    })), [state.projects]);

    const editorTitle = contact.id && !contact.id.startsWith('new_') && (contact.firstName || contact.lastName)
        ? `Edit Contact: ${contact.firstName} ${contact.lastName}`
        : 'Add New Contact';

    const renderMainInfoTab = () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                 <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <h3 className="font-semibold text-lg text-slate-700 mb-4">Primary Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField label="First Name" htmlFor="firstName" required><Input id="firstName" value={formData.firstName} onChange={e => handleFormChange('firstName', e.target.value)} /></FormField>
                        <FormField label="Last Name" htmlFor="lastName" required><Input id="lastName" value={formData.lastName} onChange={e => handleFormChange('lastName', e.target.value)} /></FormField>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <FormField label="Title / Role" htmlFor="title"><Input id="title" value={formData.title} onChange={e => handleFormChange('title', e.target.value)} placeholder="e.g., Journalist" /></FormField>
                        <FormField label="Organization" htmlFor="organization"><Input id="organization" value={formData.organization} onChange={e => handleFormChange('organization', e.target.value)} placeholder="e.g., Winnipeg Free Press" /></FormField>
                    </div>
                </div>
                 <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <h3 className="font-semibold text-lg text-slate-700 mb-4">Contact Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField label="Email" htmlFor="email" required><Input type="email" id="email" value={formData.email} onChange={e => handleFormChange('email', e.target.value)} /></FormField>
                        <FormField label="Phone" htmlFor="phone"><Input type="tel" id="phone" value={formData.phone} onChange={e => handleFormChange('phone', e.target.value)} /></FormField>
                    </div>
                </div>
            </div>
             <div className="lg:col-span-1 space-y-6">
                 <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <h3 className="font-semibold text-lg text-slate-700 mb-4">Mailing Address</h3>
                    <div className="space-y-4">
                        <FormField label="Street" htmlFor="street" className="mb-2"><Input id="street" value={formData.address.street} onChange={e => handleAddressChange('street', e.target.value)} /></FormField>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField label="City" htmlFor="city" className="mb-0"><Input id="city" value={formData.address.city} onChange={e => handleAddressChange('city', e.target.value)} /></FormField>
                            <FormField label="Province" htmlFor="province" className="mb-0"><Select id="province" options={provinceOptions} value={formData.address.province} onChange={e => handleAddressChange('province', e.target.value)} /></FormField>
                        </div>
                        <FormField label="Postal Code" htmlFor="postalCode" className="mb-0"><Input id="postalCode" value={formData.address.postalCode} onChange={e => handleAddressChange('postalCode', e.target.value)} /></FormField>
                    </div>
                </div>
            </div>
             <div className="lg:col-span-3 mt-6 space-y-6">
                 <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <h3 className="font-semibold text-lg text-slate-700 mb-4">Categorization & Associations</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FormField label="Contact Type" htmlFor="contactType"><Select id="contactType" options={contactTypeOptions} value={formData.contactType} onChange={e => handleFormChange('contactType', e.target.value)}/></FormField>
                        <FormField label="Tags" htmlFor="tags"><TagInput tags={formData.tags} onChange={tags => handleFormChange('tags', tags)} /></FormField>
                         <FormField label="Associated Projects" htmlFor="associatedProjects">
                            <div className="max-h-48 overflow-y-auto p-2 border border-slate-300 rounded-md bg-white">
                                <CheckboxGroup name="associatedProjects" options={projectOptions} selectedValues={formData.associatedProjectIds} onChange={value => handleFormChange('associatedProjectIds', value)} columns={1} />
                            </div>
                        </FormField>
                    </div>
                     <div className="mt-6">
                        <FormField label="Notes" htmlFor="notes"><TextareaWithCounter id="notes" rows={5} value={formData.notes} onChange={e => handleFormChange('notes', e.target.value)} wordLimit={300} /></FormField>
                     </div>
                 </div>
             </div>
        </div>
    );

    return (
        <form onSubmit={handleSave}>
            <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
                <div className="flex justify-between items-start mb-6 pb-4 border-b border-slate-200">
                    <h1 className="text-3xl font-bold text-slate-900">{editorTitle}</h1>
                </div>
                
                 <div className="border-b border-slate-200 mb-6">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button type="button" onClick={() => setActiveTab('info')} className={`whitespace-nowrap py-3 px-3 border-b-2 font-semibold text-sm transition-all ${activeTab === 'info' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Main Info</button>
                        <button type="button" onClick={() => setActiveTab('interactions')} className={`whitespace-nowrap py-3 px-3 border-b-2 font-semibold text-sm transition-all ${activeTab === 'interactions' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Interactions</button>
                    </nav>
                </div>

                {activeTab === 'info' ? renderMainInfoTab() : <InteractionLog contactId={formData.id} contactName={`${formData.firstName} ${formData.lastName}`} />}

                <div className="flex items-center justify-end pt-6 border-t border-slate-200 mt-6 space-x-4">
                    <button type="button" onClick={onCancel} className="px-6 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100">Cancel</button>
                    <button type="submit" className="px-6 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700">Save Contact</button>
                </div>
            </div>
        </form>
    );
};

export default ContactEditor;
