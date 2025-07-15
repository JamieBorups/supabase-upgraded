
import React from 'react';
import { produce } from 'immer';
import { AiPersonaSettings, ResearchPlanSectionSettings } from '../../../types';
import FormField from '../../ui/FormField';
import { TextareaWithCounter } from '../../ui/TextareaWithCounter';
import PersonaEditor from './PersonaEditor';
import ResearchApproachDescriptions from './ResearchApproachDescriptions';

interface ResearchPlanSettingsEditorProps {
    persona: AiPersonaSettings;
    onPersonaChange: (field: keyof AiPersonaSettings, value: any) => void;
    sectionSettings: Record<string, ResearchPlanSectionSettings>;
    onSectionSettingsChange: (settings: Record<string, ResearchPlanSectionSettings>) => void;
    onTestPersona: () => void;
}

const RESEARCH_PLAN_SECTIONS = [
    { key: 'titleAndOverview', label: 'Project Title and Overview' },
    { key: 'communityEngagement', label: 'Community Engagement and Context' },
    { key: 'researchQuestions', label: 'Research Questions and Objectives' },
    { key: 'designAndMethodology', label: 'Research Design and Methodology' },
    { key: 'ethicalConsiderations', label: 'Ethical Considerations and Protocols' },
    { key: 'knowledgeMobilization', label: 'Knowledge Mobilization and Dissemination' },
    { key: 'projectManagement', label: 'Project Management and Timeline' },
    { key: 'projectEvaluation', label: 'Project Evaluation' },
];

const ResearchPlanSettingsEditor: React.FC<ResearchPlanSettingsEditorProps> = ({ 
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
                    <h3 className="text-lg font-bold text-slate-800">Research Plan General Persona</h3>
                     <button
                        type="button"
                        onClick={onTestPersona}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <i className="fa-solid fa-flask-vial mr-2"></i>
                        Test Persona
                    </button>
                </div>
                <p className="text-sm text-slate-600 mb-4">This persona defines the AI's behavior when generating content for all Research Plan sections.</p>
                <PersonaEditor persona={persona} onChange={onPersonaChange} />
            </div>

            <hr className="my-6 border-slate-200" />
            
            <ResearchApproachDescriptions />

            <hr className="my-6 border-slate-200" />

            <div>
                 <h3 className="text-lg font-bold text-slate-800">Section-Specific Generation Prompts</h3>
                 <p className="text-sm text-slate-600 mb-4">Customize the specific instructions the AI uses when generating the final written content for each section of the report.</p>
                 <div className="space-y-6">
                    {RESEARCH_PLAN_SECTIONS.map(section => (
                        <FormField key={section.key} label={`${section.label} Prompt`} htmlFor={`rp-prompt-${section.key}`}>
                            <TextareaWithCounter
                                id={`rp-prompt-${section.key}`}
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

export default ResearchPlanSettingsEditor;
