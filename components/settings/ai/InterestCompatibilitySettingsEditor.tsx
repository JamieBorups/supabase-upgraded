
import React from 'react';
import { produce } from 'immer';
import { AiPersonaSettings, InterestCompatibilitySectionSettings } from '../../../types';
import FormField from '../../ui/FormField';
import { TextareaWithCounter } from '../../ui/TextareaWithCounter';
import PersonaEditor from './PersonaEditor';
import { REPORT_SECTIONS } from '../../../constants';

interface InterestCompatibilitySettingsEditorProps {
    persona: AiPersonaSettings;
    onPersonaChange: (field: keyof AiPersonaSettings, value: any) => void;
    sectionSettings: Record<string, InterestCompatibilitySectionSettings>;
    onSectionSettingsChange: (settings: Record<string, InterestCompatibilitySectionSettings>) => void;
    onTestPersona: () => void;
}

const InterestCompatibilitySettingsEditor: React.FC<InterestCompatibilitySettingsEditorProps> = ({ 
    persona, onPersonaChange, sectionSettings, onSectionSettingsChange, onTestPersona 
}) => {

    const handlePromptChange = (fieldKey: string, prompt: string) => {
        const newSettings = produce(sectionSettings, draft => {
            if (draft[fieldKey]) {
                draft[fieldKey].prompt = prompt;
            }
        });
        onSectionSettingsChange(newSettings);
    };

    return (
        <div className="space-y-8">
            <div>
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800">Interest Compatibility General Persona</h3>
                     <button
                        type="button"
                        onClick={onTestPersona}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <i className="fa-solid fa-flask-vial mr-2"></i>
                        Test Persona
                    </button>
                </div>
                <p className="text-sm text-slate-600 mb-4">This persona defines the AI's behavior when facilitating any chat for this tool.</p>
                <PersonaEditor persona={persona} onChange={onPersonaChange} />
            </div>

            <hr className="my-6 border-slate-200" />

            <div>
                 <h3 className="text-lg font-bold text-slate-800">Section-Specific Generation Prompts</h3>
                 <p className="text-sm text-slate-600 mb-4">Customize the specific instructions the AI uses when generating the final written content for each section of the report.</p>
                 <div className="space-y-6">
                    {REPORT_SECTIONS.map(section => (
                        <FormField key={section.key} label={`${section.label} Prompt`} htmlFor={`ic-prompt-${section.key}`}>
                            <TextareaWithCounter
                                id={`ic-prompt-${section.key}`}
                                value={sectionSettings[section.key]?.prompt || ''}
                                onChange={(e) => handlePromptChange(section.key, e.target.value)}
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

export default InterestCompatibilitySettingsEditor;
