
import React, { useState, useMemo, useCallback } from 'react';
import { produce } from 'immer';
import { useAppContext } from '../../context/AppContext';
import { Page, FormData as ProjectData, AiPersonaName } from '../../types';
import { Select } from '../ui/Select';
import { TextareaWithCounter } from '../ui/TextareaWithCounter';
import { CheckboxGroup } from '../ui/CheckboxGroup';
import { getAiResponse } from '../../services/aiService';
import { initialFormData, ARTISTIC_DISCIPLINES, CRAFT_GENRES, DANCE_GENRES, LITERARY_GENRES, MEDIA_GENRES, MUSIC_GENRES, THEATRE_GENRES, VISUAL_ARTS_GENRES, initialSettings, GENERATOR_FIELDS, PROJECT_GENERATOR_ENHANCE_INSTRUCTIONS } from '../../constants';
import * as api from '../../services/api';
import FormField from '../ui/FormField';

const SuggestionPanel: React.FC<{
    suggestions: any[];
    field: string;
    onIntegrate: (field: string, value: any) => void;
}> = ({ suggestions, field, onIntegrate }) => (
    <div className="p-3 bg-blue-100 border border-blue-200 rounded-lg space-y-2 mt-2">
        <h4 className="font-bold text-blue-800">Suggestions for {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</h4>
        {suggestions.map((suggestion, index) => (
            <div key={index} className="flex items-start justify-between gap-2 p-2 bg-white rounded-md">
                <p className="text-sm text-slate-700 flex-grow">{typeof suggestion === 'object' ? suggestion.title || JSON.stringify(suggestion) : suggestion}</p>
                <button onClick={() => onIntegrate(field, suggestion)} className="px-2 py-1 text-xs font-semibold text-white bg-teal-600 rounded-md shadow-sm hover:bg-teal-700 flex-shrink-0">
                    Integrate
                </button>
            </div>
        ))}
    </div>
);

const AiProjectGeneratorPage: React.FC<{ onNavigate: (page: Page) => void }> = ({ onNavigate }) => {
    const { state, dispatch, notify } = useAppContext();
    const { projects, settings } = state;
    
    const [selectedProjectId, setSelectedProjectId] = useState<string | 'new' | null>(null);
    const [projectData, setProjectData] = useState<ProjectData | null>(null);
    const [selectedPersona, setSelectedPersona] = useState<AiPersonaName>('projects');
    const [activeTab, setActiveTab] = useState<'generator' | 'instructions'>('generator');
    const [isLoading, setIsLoading] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState<{ field: string, data: any[] } | null>(null);

    const [instructions, setInstructions] = useState(settings.ai.projectGeneratorFieldInstructions || initialSettings.ai.projectGeneratorFieldInstructions);
    const [isInstructionsDirty, setIsInstructionsDirty] = useState(false);
    
    const personaOptions = useMemo(() => {
        return Object.keys(settings.ai.personas).map(key => ({
            value: key,
            label: key.charAt(0).toUpperCase() + key.slice(1) + ' Persona'
        }));
    }, [settings.ai.personas]);

    const handleProjectLoad = (id: string | 'new') => {
        setSelectedProjectId(id);
        if (id === 'new') {
            setProjectData({ ...initialFormData, id: `proj_${Date.now()}` });
        } else {
            const project = projects.find(p => p.id === id);
            setProjectData(project || null);
        }
    };

    const handleFieldChange = useCallback((field: keyof ProjectData, value: any) => {
        if (!projectData) return;
        setProjectData(produce(draft => { (draft as any)[field] = value; }));
    }, [projectData]);
    
    const handleAiCall = useCallback(async (field: keyof ProjectData, instruction: string) => {
        if (!projectData) return;
        setIsLoading(true);
        setAiSuggestions(null);

        const finalPrompt = `${instruction}\n\n### CONTEXT ###\n${JSON.stringify({ project: projectData }, null, 2)}`;
        
        try {
            const result = await getAiResponse(selectedPersona, finalPrompt, state.settings.ai, [], { forceJson: true });
            const parsed = JSON.parse(result.text);

            if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
                setAiSuggestions({ field, data: parsed.suggestions });
            } else {
                 notify(`AI couldn't generate suggestions in the right format.`, 'error');
            }
        } catch (error: any) {
             notify(`AI Error: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [projectData, state.settings.ai, notify, selectedPersona]);

    const handleSuggest = (field: keyof ProjectData) => {
        const instruction = instructions[field as keyof typeof instructions];
        if (!instruction) {
             notify(`No AI instruction found for field: ${field}`, 'error');
             return;
        }
        handleAiCall(field, instruction);
    };

    const handleEnhance = (field: keyof ProjectData) => {
        const currentText = projectData?.[field] as string;
        if (!currentText?.trim()) {
            notify('There is no content to enhance.', 'warning');
            return;
        }
        const instruction = PROJECT_GENERATOR_ENHANCE_INSTRUCTIONS[field as keyof typeof PROJECT_GENERATOR_ENHANCE_INSTRUCTIONS];
        if (!instruction) {
             notify(`Enhancement is not available for this field.`, 'error');
             return;
        }
        const prompt = `${instruction}\n\n### TEXT TO ENHANCE ###\n${currentText}`;
        handleAiCall(field, prompt);
    };

    const handleIntegrate = useCallback((field: string, value: any) => {
        if (!projectData) return;
        handleFieldChange(field as keyof ProjectData, value);
        setAiSuggestions(null);
    }, [projectData, handleFieldChange]);

    const handleInstructionChange = useCallback((field: string, value: string) => {
        setInstructions(prev => ({ ...prev, [field]: value }));
        setIsInstructionsDirty(true);
    }, []);

    const handleSaveInstructions = useCallback(async () => {
        const newSettings = produce(settings, draft => {
            draft.ai.projectGeneratorFieldInstructions = instructions;
        });
        try {
            await api.updateSettings(newSettings);
            dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
            setIsInstructionsDirty(false);
            notify('AI Instructions saved successfully!', 'success');
        } catch (error: any) {
            notify(`Error saving instructions: ${error.message}`, 'error');
        }
    }, [settings, instructions, dispatch, notify]);

    const handleResetInstructions = useCallback(() => {
        setInstructions(initialSettings.ai.projectGeneratorFieldInstructions);
        setIsInstructionsDirty(true);
    }, []);

    const handleSaveProject = async () => {
        if (!projectData) return;
        setIsLoading(true);
        const isNew = selectedProjectId === 'new';
        
        try {
            if (isNew) {
                const savedProject = await api.addProject(projectData);
                dispatch({ type: 'ADD_PROJECT', payload: savedProject });
                notify('Project created successfully!', 'success');
            } else {
                const savedProject = await api.updateProject(projectData.id, projectData);
                dispatch({ type: 'UPDATE_PROJECT', payload: savedProject });
                notify('Project updated successfully!', 'success');
            }
            onNavigate('projects');
        } catch(error: any) {
            notify(`Error saving project: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const renderGenerator = () => (
        <div className="space-y-6">
            {GENERATOR_FIELDS.map(field => (
                <div key={field.key} className="pt-4 border-t">
                    <FormField label={field.label} htmlFor={field.key}>
                        <TextareaWithCounter
                            id={field.key}
                            rows={field.key === 'projectDescription' ? 8 : (field.key === 'background' ? 5 : 3)}
                            wordLimit={field.wordLimit}
                            value={projectData![field.key] as string}
                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        />
                    </FormField>
                    <div className="mt-2 text-right flex gap-2 justify-end">
                        <button onClick={() => handleEnhance(field.key)} disabled={isLoading || !(projectData && projectData[field.key])} className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed">
                            <i className="fa-solid fa-wand-magic-sparkles mr-2"></i>Enhance
                        </button>
                        <button onClick={() => handleSuggest(field.key)} disabled={isLoading} className="px-4 py-1.5 text-xs font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:bg-slate-400">
                            <i className="fa-solid fa-lightbulb mr-2"></i>Suggest
                        </button>
                    </div>
                    {aiSuggestions?.field === field.key && (
                        <SuggestionPanel suggestions={aiSuggestions.data} field={aiSuggestions.field} onIntegrate={handleIntegrate} />
                    )}
                </div>
            ))}
             <div className="mt-8 pt-5 border-t flex justify-end">
                <button onClick={handleSaveProject} disabled={isLoading} className="px-6 py-2 text-sm font-medium text-white bg-teal-600 rounded-md shadow-sm hover:bg-teal-700 disabled:bg-slate-400">Save Project</button>
            </div>
        </div>
    );
    
    const renderInstructions = () => (
        <div className="space-y-6">
            <p className="text-sm text-slate-600">Customize the instructions given to the AI for generating content for each field. The AI's general persona is determined by the dropdown above, and these instructions provide specific guidance for each task.</p>
            {GENERATOR_FIELDS.map(field => (
                <FormField key={field.key} label={field.label} htmlFor={`instr-${field.key}`}>
                    <TextareaWithCounter
                        id={`instr-${field.key}`}
                        rows={3}
                        wordLimit={200}
                        value={instructions[field.key] || ''}
                        onChange={(e) => handleInstructionChange(field.key, e.target.value)}
                    />
                </FormField>
            ))}
            <div className="mt-8 pt-5 border-t flex justify-between">
                <button onClick={handleSaveInstructions} disabled={!isInstructionsDirty} className="px-6 py-2 text-sm font-medium text-white bg-teal-600 rounded-md shadow-sm hover:bg-teal-700 disabled:bg-slate-400">Save Instructions</button>
                <button onClick={handleResetInstructions} className="px-6 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100">Reset to Defaults</button>
            </div>
        </div>
    );

    const renderProjectSelector = () => (
        <div className="text-center py-20 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg">
            <h3 className="text-xl font-medium text-slate-800">Start by creating a new project or loading an existing one.</h3>
            <div className="mt-6 flex justify-center items-center gap-4">
                <button onClick={() => handleProjectLoad('new')} className="px-6 py-3 text-lg font-semibold text-white bg-teal-600 border border-transparent rounded-md shadow-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-transform hover:scale-105">
                    <i className="fa-solid fa-plus mr-2"></i>Create New Project
                </button>
                <div className="flex items-center gap-2">
                    <span className="text-slate-500">or</span>
                    <Select value={selectedProjectId || ''} onChange={(e) => handleProjectLoad(e.target.value)} options={[{ value: '', label: 'Load Existing Project...' }, ...projects.map(p => ({ value: p.id, label: p.projectTitle }))]} />
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 pb-3 border-b border-slate-200 gap-4">
                <h2 className="text-xl font-bold text-slate-800">AI Project Generator</h2>
                <button onClick={() => onNavigate('projects')} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 flex-shrink-0">
                    Back to Projects
                </button>
            </div>

            {!projectData ? renderProjectSelector() : (
                 <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center mb-6 p-4 bg-slate-50 rounded-lg">
                        <h3 className="font-bold text-lg text-slate-800">{projectData.projectTitle || 'New Project'}</h3>
                        <FormField label="Select AI Persona" htmlFor="persona-select" className="mb-0">
                            <Select id="persona-select" value={selectedPersona} onChange={e => setSelectedPersona(e.target.value as AiPersonaName)} options={personaOptions} />
                        </FormField>
                    </div>

                    <div className="border-b border-slate-200 mb-6">
                        <nav className="-mb-px flex space-x-6">
                            <button onClick={() => setActiveTab('generator')} className={`whitespace-nowrap py-3 px-3 border-b-2 font-semibold text-sm ${activeTab === 'generator' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                                Generator
                            </button>
                            <button onClick={() => setActiveTab('instructions')} className={`whitespace-nowrap py-3 px-3 border-b-2 font-semibold text-sm ${activeTab === 'instructions' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                                Instructions
                            </button>
                        </nav>
                    </div>

                    {activeTab === 'generator' ? renderGenerator() : renderInstructions()}
                 </>
            )}
        </div>
    );
};

export default AiProjectGeneratorPage;
