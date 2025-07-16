

import React from 'react';
import { produce } from 'immer';
import { CommunicationTemplate } from '../../../types';
import FormField from '../../ui/FormField';
import { Input } from '../../ui/Input';
import { TextareaWithCounter } from '../../ui/TextareaWithCounter';

interface PersonaTemplateManagerProps {
    templates: CommunicationTemplate[];
    onChange: (templates: CommunicationTemplate[]) => void;
    onLoadTemplate: (instructions: string) => void;
}

const newId = () => `tmpl_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

const PersonaTemplateManager: React.FC<PersonaTemplateManagerProps> = ({ templates, onChange, onLoadTemplate }) => {
    
    const handleUpdateTemplate = (id: string, field: 'name' | 'instructions', value: string) => {
        const newTemplates = produce(templates, draft => {
            const item = draft.find(t => t.id === id);
            if (item) {
                (item as any)[field] = value;
            }
        });
        onChange(newTemplates);
    };

    const handleAddTemplate = () => {
        const newTemplate: CommunicationTemplate = {
            id: newId(),
            name: 'New Template',
            instructions: 'You are a helpful assistant.'
        };
        onChange([...templates, newTemplate]);
    };

    const handleRemoveTemplate = (id: string) => {
        onChange(templates.filter(t => t.id !== id));
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                {templates.map(template => (
                    <div key={template.id} className="p-4 border border-slate-300 rounded-lg bg-slate-50 relative">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Template Name" htmlFor={`name-${template.id}`}>
                                <Input 
                                    id={`name-${template.id}`} 
                                    value={template.name} 
                                    onChange={(e) => handleUpdateTemplate(template.id, 'name', e.target.value)}
                                />
                            </FormField>
                            <div className="flex items-end justify-end gap-2">
                                 <button 
                                    type="button" 
                                    onClick={() => onLoadTemplate(template.instructions)}
                                    className="px-3 py-2 text-xs font-semibold text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700"
                                >
                                    <i className="fa-solid fa-arrow-down-to-line mr-2"></i>
                                    Load
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => handleRemoveTemplate(template.id)} 
                                    className="px-3 py-2 text-xs font-semibold text-red-700 bg-red-100 rounded-md shadow-sm hover:bg-red-200"
                                >
                                    <i className="fa-solid fa-trash-alt fa-fw"></i>
                                </button>
                            </div>
                        </div>

                        <div className="mt-2">
                            <FormField label="AI Instructions" htmlFor={`instructions-${template.id}`}>
                                <TextareaWithCounter
                                    id={`instructions-${template.id}`}
                                    value={template.instructions}
                                    onChange={(e) => handleUpdateTemplate(template.id, 'instructions', e.target.value)}
                                    rows={4}
                                    wordLimit={750}
                                />
                            </FormField>
                        </div>
                    </div>
                ))}
            </div>
             {templates.length === 0 && (
                <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-300 rounded-lg">
                    <p>No templates created for this persona yet.</p>
                </div>
            )}
            <div>
                <button
                    type="button"
                    onClick={handleAddTemplate}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <i className="fa-solid fa-plus mr-2"></i>
                    Add New Template
                </button>
            </div>
        </div>
    );
};

export default PersonaTemplateManager;