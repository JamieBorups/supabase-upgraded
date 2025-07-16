

import React from 'react';
import { produce } from 'immer';
import { AiPersonaSettings } from '../../../types';
import FormField from '../../ui/FormField';
import { TextareaWithCounter } from '../../ui/TextareaWithCounter';
import PersonaEditor from './PersonaEditor';
import { OTF_FIELD_INSTRUCTIONS } from '../../../constants/ai/otf.constants';

interface OtfSettingsEditorProps {
    persona: AiPersonaSettings;
    onPersonaChange: (field: keyof AiPersonaSettings, value: any) => void;
    fieldSettings: Record<string, string>;
    onFieldSettingsChange: (settings: Record<string, string>) => void;
    onTestPersona: () => void;
}

const OtfSettingsEditor: React.FC<OtfSettingsEditorProps> = ({ 
    persona, onPersonaChange, fieldSettings, onFieldSettingsChange, onTestPersona 
}) => {

    const handlePromptChange = (fieldKey: string, prompt: string) => {
        const newSettings = produce(fieldSettings, draft => {
            draft[fieldKey] = prompt;
        });
        onFieldSettingsChange(newSettings);
    };
    
    const fieldKeys = Object.keys(OTF_FIELD_INSTRUCTIONS);

    return (
        <div className="space-y-8">
            <div>
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800">OTF Generator Persona</h3>
                     <button
                        type="button"
                        onClick={onTestPersona}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <i className="fa-solid fa-flask-vial mr-2"></i>
                        Test Persona
                    </button>
                </div>
                <p className="text-sm text-slate-600 mb-4">This persona defines the AI's behavior when generating content for the OTF application.</p>
                <PersonaEditor persona={persona} onChange={onPersonaChange} />
            </div>

            <hr className="my-6 border-slate-200" />

            <div>
                 <h3 className="text-lg font-bold text-slate-800">Field-Specific Generation Prompts</h3>
                 <p className="text-sm text-slate-600 mb-4">Customize the specific instructions the AI uses when generating suggestions for each field.</p>
                 <div className="space-y-6">
                    {fieldKeys.map(key => (
                        <FormField key={key} label={`${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} Prompt`} htmlFor={`otf-prompt-${key}`}>
                            <TextareaWithCounter
                                id={`otf-prompt-${key}`}
                                value={fieldSettings[key] || ''}
                                onChange={(e) => handlePromptChange(key, e.target.value)}
                                rows={4}
                                wordLimit={300}
                            />
                        </FormField>
                    ))}
                 </div>
            </div>
        </div>
    );
};

export default OtfSettingsEditor;
