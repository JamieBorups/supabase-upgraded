import React from 'react';
import { produce } from 'immer';
import { AiPersonaSettings, EcoStarFieldSettings, EcoStarField } from '../../../types';
import FormField from '../../ui/FormField';
import { TextareaWithCounter } from '../../ui/TextareaWithCounter';
import PersonaEditor from './PersonaEditor';

interface EcoStarSettingsEditorProps {
    persona: AiPersonaSettings;
    onPersonaChange: (field: keyof AiPersonaSettings, value: any) => void;
    fieldSettings: EcoStarFieldSettings;
    onFieldSettingsChange: (settings: EcoStarFieldSettings) => void;
    onTestPersona: () => void;
}

const ECOSTAR_FIELDS: EcoStarField[] = [
    { key: 'Environment', label: 'E – Environment', description: '' },
    { key: 'Customer', label: 'C – Customer', description: '' },
    { key: 'Opportunity', label: 'O – Opportunity', description: '' },
    { key: 'Solution', label: 'S – Solution', description: '' },
    { key: 'Team', label: 'T – Team', description: '' },
    { key: 'Advantage', label: 'A – Advantage', description: '' },
    { key: 'Results', label: 'R – Results', description: '' },
];


const EcoStarSettingsEditor: React.FC<EcoStarSettingsEditorProps> = ({ 
    persona, onPersonaChange, fieldSettings, onFieldSettingsChange, onTestPersona 
}) => {

    const handlePromptChange = (fieldKey: string, prompt: string) => {
        const newSettings = produce(fieldSettings, draft => {
            if (draft[fieldKey]) {
                draft[fieldKey].prompt = prompt;
            }
        });
        onFieldSettingsChange(newSettings);
    };

    return (
        <div className="space-y-8">
            <div>
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800">ECO-STAR General Persona</h3>
                     <button
                        type="button"
                        onClick={onTestPersona}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <i className="fa-solid fa-flask-vial mr-2"></i>
                        Test Persona
                    </button>
                </div>
                <p className="text-sm text-slate-600 mb-4">This persona defines the AI's behavior when facilitating the brainstorming chat for all ECO-STAR sections.</p>
                <PersonaEditor persona={persona} onChange={onPersonaChange} />
            </div>

            <hr className="my-6 border-slate-200" />

            <div>
                 <h3 className="text-lg font-bold text-slate-800">Section-Specific Generation Prompts</h3>
                 <p className="text-sm text-slate-600 mb-4">Customize the specific instructions the AI uses when generating the final written content for each section of the report.</p>
                 <div className="space-y-6">
                    {ECOSTAR_FIELDS.map(field => (
                        <FormField key={field.key} label={`${field.label} Prompt`} htmlFor={`ecostar-prompt-${field.key}`}>
                            <TextareaWithCounter
                                id={`ecostar-prompt-${field.key}`}
                                value={fieldSettings[field.key]?.prompt || ''}
                                onChange={(e) => handlePromptChange(field.key, e.target.value)}
                                rows={5}
                                wordLimit={500}
                            />
                        </FormField>
                    ))}
                 </div>
            </div>
        </div>
    );
};

export default EcoStarSettingsEditor;
