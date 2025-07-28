
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext.tsx';
import { RelatedProject } from '../../types';
import FormField from '../ui/FormField.tsx';
import { Input } from '../ui/Input.tsx';
import { Textarea } from '../ui/Textarea.tsx';
import { CheckboxGroup } from '../ui/CheckboxGroup.tsx';

interface RelatedProjectsEditorProps {
    project: RelatedProject;
    onSave: (project: RelatedProject) => void;
    onCancel: () => void;
}

const RelatedProjectsEditor: React.FC<RelatedProjectsEditorProps> = ({ project, onSave, onCancel }) => {
    const { state } = useAppContext();
    const [formData, setFormData] = useState<RelatedProject>(project);

    const projectOptions = useMemo(() => {
        return state.projects.map(p => ({ value: p.id, label: p.projectTitle }));
    }, [state.projects]);

    const handleChange = (field: keyof RelatedProject, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value, updatedAt: new Date().toISOString() }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSave} className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h1 className="text-3xl font-bold text-slate-900">{project.id.startsWith('new_') ? 'Add' : 'Edit'} Related Project</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <FormField label="Title" htmlFor="rp_title" required>
                        <Input id="rp_title" value={formData.title} onChange={e => handleChange('title', e.target.value)} />
                    </FormField>
                    <FormField label="Organization(s)" htmlFor="rp_orgs">
                        <Input id="rp_orgs" value={formData.organizations} onChange={e => handleChange('organizations', e.target.value)} placeholder="e.g., University of Manitoba, Arts Council" />
                    </FormField>
                    <FormField label="Report URL" htmlFor="rp_url">
                        <Input type="url" id="rp_url" value={formData.reportUrl} onChange={e => handleChange('reportUrl', e.target.value)} placeholder="https://example.com/report.pdf" />
                    </FormField>
                    <FormField label="Brief Description" htmlFor="rp_desc">
                        <Textarea id="rp_desc" value={formData.description} onChange={e => handleChange('description', e.target.value)} rows={5} />
                    </FormField>
                    <FormField label="Internal Notes (Optional)" htmlFor="rp_notes">
                        <Textarea id="rp_notes" value={formData.notes} onChange={e => handleChange('notes', e.target.value)} rows={3} />
                    </FormField>
                </div>
                <div>
                    <FormField label="Associate with Your Projects" htmlFor="rp_assoc" instructions="Link this record to one or more of your existing projects for context.">
                        <div className="p-3 border rounded-md bg-slate-50 max-h-96 overflow-y-auto">
                            <CheckboxGroup
                                name="associatedProjects"
                                options={projectOptions}
                                selectedValues={formData.associatedProjectIds}
                                onChange={value => handleChange('associatedProjectIds', value)}
                                columns={1}
                            />
                        </div>
                    </FormField>
                </div>
            </div>
            <div className="mt-8 pt-6 border-t flex justify-end gap-3">
                <button type="button" onClick={onCancel} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Project</button>
            </div>
        </form>
    );
};

export default RelatedProjectsEditor;
