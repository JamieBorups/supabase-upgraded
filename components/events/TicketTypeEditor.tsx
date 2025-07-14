
import React, { useState } from 'react';
import { TicketType } from '../../types';
import FormField from '../ui/FormField';
import { Input } from '../ui/Input';
import { TextareaWithCounter } from '../ui/TextareaWithCounter';
import ToggleSwitch from '../ui/ToggleSwitch';

interface TicketTypeEditorProps {
  ticketType: TicketType;
  onSave: (ticketType: TicketType) => void;
  onCancel: () => void;
}

const TicketTypeEditor: React.FC<TicketTypeEditorProps> = ({ ticketType, onSave, onCancel }) => {
    const [formData, setFormData] = useState<TicketType>(ticketType);

    const handleChange = <K extends keyof TicketType>(field: K, value: TicketType[K]) => {
        setFormData(prev => ({...prev, [field]: value}));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSave} className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
            <div className="flex justify-between items-start mb-6 border-b pb-4">
                <h1 className="text-3xl font-bold text-slate-900">{formData.id.startsWith('tt_') ? "Edit Ticket Type" : "Add New Ticket Type"}</h1>
            </div>

            <div className="space-y-6 max-w-xl">
                <FormField label="Ticket Name" htmlFor="ttName" required instructions="e.g., General Admission, Student, VIP">
                    <Input id="ttName" value={formData.name} onChange={e => handleChange('name', e.target.value)} />
                </FormField>
                
                <FormField label="Description" htmlFor="ttDescription" instructions="Optional short description of what this ticket includes.">
                    <TextareaWithCounter id="ttDescription" rows={3} wordLimit={100} value={formData.description} onChange={e => handleChange('description', e.target.value)} />
                </FormField>

                <ToggleSwitch
                    id="isFree"
                    checked={formData.isFree}
                    onChange={checked => handleChange('isFree', checked)}
                    label="This ticket is free"
                />

                {!formData.isFree && (
                    <FormField label="Default Price" htmlFor="ttPrice" required instructions="This price will be suggested when assigning the ticket to an event.">
                        <Input type="number" id="ttPrice" value={formData.defaultPrice} onChange={e => handleChange('defaultPrice', parseFloat(e.target.value) || 0)} />
                    </FormField>
                )}
            </div>
            
            <div className="flex items-center justify-end pt-8 mt-8 border-t border-slate-200 space-x-4">
                <button type="button" onClick={onCancel} className="px-6 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100">Cancel</button>
                <button type="submit" className="px-6 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700">Save Ticket Type</button>
            </div>
        </form>
    );
};

export default TicketTypeEditor;
