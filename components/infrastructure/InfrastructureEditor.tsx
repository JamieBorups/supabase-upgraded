
import React, { useState } from 'react';
import { Infrastructure } from '../../types.ts';
import FormField from '../ui/FormField.tsx';
import { Input } from '../ui/Input.tsx';
import { Textarea } from '../ui/Textarea.tsx';

interface InfrastructureEditorProps {
    item: Infrastructure;
    onSave: (item: Infrastructure) => void;
    onCancel: () => void;
}

const InfrastructureEditor: React.FC<InfrastructureEditorProps> = ({ item, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Infrastructure>(item);

    const handleChange = (field: keyof Infrastructure, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSave} className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h1 className="text-3xl font-bold text-slate-900">{item.id.startsWith('new_') ? 'Add' : 'Edit'} Facility</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <FormField label="Facility Name" htmlFor="name" required><Input id="name" value={formData.name} onChange={e => handleChange('name', e.target.value)} /></FormField>
                    <FormField label="Facility Type" htmlFor="facilityType"><Input id="facilityType" value={formData.facilityType} onChange={e => handleChange('facilityType', e.target.value)} placeholder="e.g., Community Hall, Art Gallery" /></FormField>
                    <FormField label="Location" htmlFor="location"><Input id="location" value={formData.location} onChange={e => handleChange('location', e.target.value)} /></FormField>
                    <FormField label="Year Built" htmlFor="yearBuilt"><Input type="number" id="yearBuilt" value={formData.yearBuilt || ''} onChange={e => handleChange('yearBuilt', parseInt(e.target.value) || null)} /></FormField>
                    <FormField label="Description" htmlFor="description"><Textarea id="description" value={formData.description} onChange={e => handleChange('description', e.target.value)} rows={4} /></FormField>
                    <FormField label="Current Status" htmlFor="currentStatus"><Textarea id="currentStatus" value={formData.currentStatus} onChange={e => handleChange('currentStatus', e.target.value)} rows={3} /></FormField>
                </div>
                <div className="space-y-4">
                    <FormField label="Infrastructural Issues" htmlFor="infrastructuralIssues"><Textarea id="infrastructuralIssues" value={formData.infrastructuralIssues} onChange={e => handleChange('infrastructuralIssues', e.target.value)} rows={5} /></FormField>
                    <FormField label="Lifecycle Status" htmlFor="lifecycleStatus"><Input id="lifecycleStatus" value={formData.lifecycleStatus} onChange={e => handleChange('lifecycleStatus', e.target.value)} placeholder="e.g., Mid-life, Requires major renovation" /></FormField>
                    <FormField label="Maintenance Schedule" htmlFor="maintenanceSchedule"><Textarea id="maintenanceSchedule" value={formData.maintenanceSchedule} onChange={e => handleChange('maintenanceSchedule', e.target.value)} rows={3} /></FormField>
                    <FormField label="Internal Notes" htmlFor="internalNotes"><Textarea id="internalNotes" value={formData.internalNotes} onChange={e => handleChange('internalNotes', e.target.value)} rows={3} /></FormField>
                </div>
            </div>
            <div className="mt-8 pt-6 border-t flex justify-end gap-3">
                <button type="button" onClick={onCancel} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Facility</button>
            </div>
        </form>
    );
};

export default InfrastructureEditor;
