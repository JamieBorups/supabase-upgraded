
import React, { useState, useMemo, useCallback } from 'react';
import { produce } from 'immer';
import { useAppContext } from '../../context/AppContext.tsx';
import { Page, FormData as ProjectData, AiPersonaName } from '../../types.ts';
import { TextareaWithCounter } from '../ui/TextareaWithCounter.tsx';
import { getAiResponse } from '../../services/aiService.ts';
import { initialFormData, GENERATOR_FIELDS } from '../../constants.ts';
import * as api from '../../services/api.ts';
import FormField from '../ui/FormField.tsx';
import ProjectFilter from '../ui/ProjectFilter.tsx';

const SuggestionPanel: React.FC<{
    suggestions: any[];
    field: string;
    onIntegrate: (field: string, value: any) => void;
    isLoading: boolean;
}> = ({ suggestions, field, onIntegrate, isLoading }) => (
    <div className="p-3 bg-blue-100 border border-blue-200 rounded-lg space-y-2 mt-2">
        <h4 className="font-bold text-blue-800">Suggestions for {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</h4>
        {suggestions.map((suggestion, index) => (
            <div key={index} className="flex items-start justify-between gap-2 p-2 bg-white rounded-md shadow-sm">
                <p className="text-sm text-slate-700 flex-grow whitespace-pre-wrap">{typeof suggestion === 'object' ? suggestion.title || JSON.stringify(suggestion) : suggestion}</p>
                <button onClick={() => onIntegrate(field, suggestion)} disabled={isLoading} className="px-2 py-1 text-xs font-semibold text-white bg-teal-600 rounded-md shadow-sm hover:bg-teal-700 flex-shrink-0 disabled:opacity-50">
                    Integrate
                </button>
            </div>
        ))}
    </div>
);

const AiProjectGeneratorPage: React.FC<{ onNavigate: (page: Page) => void }> = ({ onNavigate }) => {
    const { state, dispatch, notify } = useAppContext();
    const { projects, researchPlans, ecostarReports, interestCompatibilityReports, tasks } = state;
    
    const [selectedProjectId, setSelectedProjectId] = useState<string | 'new' | null>(null);
    const [projectData, setProjectData] = useState<ProjectData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState<{ field: string, data: any[] } | null>(null);
    const [loadingField, setLoadingField] = useState<string | null>(null);
    const [selectedPersona] = useState<AiPersonaName>('projectGenerator');

    const contextForAi = useMemo(() => {
        if (!selectedProjectId || selectedProjectId === 'new') return 'No context available for a new project.';
        
        const getMostRecent = <T extends { createdAt: string }>(items: T[]): T | undefined => {
            return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        };

        const researchPlan = getMostRecent(researchPlans.filter(r => r.projectId === selectedProjectId));
        const ecoStarReport = getMostRecent(ecostarReports.filter(r => r.projectId === selectedProjectId));
        const interestReport = getMostRecent(interestCompatibilityReports.filter(r => r.projectId === selectedProjectId));
        const projectTasks = tasks.filter(t => t.projectId === selectedProjectId);

        let context = "### STRATEGIC CONTEXT ###\n";
        context += "This information provides strategic direction. Your primary goal is to synthesize these points into the generated content.\n\n";

        context += "#### LATEST RESEARCH PLAN ####\n";
        if (researchPlan) {
            context += `Title: ${researchPlan.titleAndOverview}\nQuestions: ${researchPlan.researchQuestions}\nMethodology: ${researchPlan.designAndMethodology}\n\n`;
        } else {
            context += "No Research Plan provided.\n\n";
        }

        context += "#### LATEST ECO-STAR REPORT ####\n";
        if (ecoStarReport) {
            context += `Environment: ${ecoStarReport.environmentReport?.summary}\nCustomer: ${ecoStarReport.customerReport?.summary}\nOpportunity: ${ecoStarReport.opportunityReport?.summary}\n\n`;
        } else {
            context += "No ECO-STAR report provided.\n\n";
        }
        
        context += "#### LATEST INTEREST COMPATIBILITY REPORT ####\n";
        if (interestReport) {
            context += `Executive Summary: ${interestReport.executiveSummary}\nHigh Compatibility: ${interestReport.highCompatibilityAreas?.map(a => a.area).join(', ')}\nPotential Conflicts: ${interestReport.potentialConflicts?.map(c => c.area).join(', ')}\n\n`;
        } else {
            context += "No Interest Compatibility report provided.\n\n";
        }

        context += "#### PROJECT TASKS ####\n";
        if (projectTasks.length > 0) {
            context += projectTasks.slice(0, 15).map(t => `- ${t.title} (${t.status})`).join('\n') + '\n';
        } else {
            context += "No tasks defined for this project yet.\n";
        }

        return context;
    }, [selectedProjectId, researchPlans, ecostarReports, interestCompatibilityReports, tasks]);

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
    
    const performAiCall = useCallback(async (instruction: string, currentProjectState: ProjectData, currentContent?: string): Promise<any> => {
        let finalPrompt = `${instruction}\n\n${contextForAi}\n\n`;
        finalPrompt += `### CURRENT PROJECT DRAFT ###\n${JSON.stringify({ project: currentProjectState }, null, 2)}`;
        if (currentContent) {
            finalPrompt += `\n\n### TEXT TO ENHANCE ###\n${currentContent}`;
        }
        
        try {
            const result = await getAiResponse(selectedPersona, finalPrompt, state.settings.ai, [], { forceJson: true });
            const parsed = JSON.parse(result.text);
            return parsed;
        } catch (error: any) {
             notify(`AI Error: ${error.message}`, 'error');
             return null;
        }
    }, [contextForAi, selectedPersona, state.settings.ai, notify]);

    const handleSuggest = useCallback(async (field: keyof ProjectData) => {
        if (!projectData) return;
        setLoadingField(field);
        setIsLoading(true);
        setAiSuggestions(null);

        const fieldConfig = GENERATOR_FIELDS.find(f => f.key === field);
        if (!fieldConfig) { setIsLoading(false); setLoadingField(null); return; }
        
        const instruction = `Based on the provided project context, generate 3 distinct options for the '${fieldConfig.label}' section. Each option should be a well-written paragraph of approximately ${fieldConfig.wordLimit} words. Respond ONLY with a valid JSON object like: { "suggestions": ["Option 1 text...", "Option 2 text...", "Option 3 text..."] }.`;
        
        const result = await performAiCall(instruction, projectData);
        
        if (result && result.suggestions && Array.isArray(result.suggestions)) {
            setAiSuggestions({ field, data: result.suggestions });
        } else {
             notify(`AI couldn't generate suggestions in the right format.`, 'error');
        }
        setIsLoading(false);
        setLoadingField(null);
    }, [projectData, performAiCall, notify]);

    const handleEnhance = useCallback(async (field: keyof ProjectData) => {
        if (!projectData) return;
        const currentText = projectData[field] as string;
        if (!currentText?.trim()) {
            notify('There is no content to enhance.', 'warning');
            return;
        }
        setLoadingField(field);
        setIsLoading(true);
        setAiSuggestions(null);
        
        const fieldConfig = GENERATOR_FIELDS.find(f => f.key === field);
        if (!fieldConfig) { setIsLoading(false); setLoadingField(null); return; }

        const instruction = `Enhance the provided text for the "${fieldConfig.label}" section. Deeply align it with the strategic context. DO NOT summarize or shorten the text. Instead, expand upon it, incorporating key details, goals, and language from the context to make it more persuasive and comprehensive. Aim to be as close to the word count of ${fieldConfig.wordLimit} words as possible. Respond ONLY with a valid JSON object like: { "suggestions": ["Full enhanced text as a single string."] }.`;
        
        const result = await performAiCall(instruction, projectData, currentText);

        if (result && result.suggestions && Array.isArray(result.suggestions)) {
            setAiSuggestions({ field, data: result.suggestions });
        } else {
             notify(`AI couldn't generate suggestions in the right format.`, 'error');
        }
        setIsLoading(false);
        setLoadingField(null);
    }, [projectData, performAiCall, notify]);

    const handleGenerateFullDraft = useCallback(async () => {
        if (!projectData) return;
        setIsLoading(true);
        setLoadingField('full_draft');
        setAiSuggestions(null);

        let currentDraft = projectData;

        for (const field of GENERATOR_FIELDS) {
            setLoadingField(field.key);
            notify(`Generating: ${field.label}...`, 'info');

            const instruction = `Based on the provided project context, generate the single best, most compelling option for the '${field.label}' section. The response should be a well-written paragraph (or title) of approximately ${field.wordLimit} words. Respond ONLY with a valid JSON object like: { "suggestions": ["The single best generated text..."] }.`;
            
            const result = await performAiCall(instruction, currentDraft);

            if (result && result.suggestions && typeof result.suggestions[0] === 'string') {
                const newContent = result.suggestions[0];
                currentDraft = produce(currentDraft, draft => {
                    (draft as any)[field.key] = newContent;
                });
                setProjectData(currentDraft); // Update UI progressively
            } else {
                notify(`Failed to generate content for "${field.label}". Stopping draft generation.`, 'error');
                setIsLoading(false);
                setLoadingField(null);
                return;
            }
        }

        notify('Full project draft completed!', 'success');
        setIsLoading(false);
        setLoadingField(null);
    }, [projectData, performAiCall, notify]);

    const handleIntegrate = useCallback((field: string, value: any) => {
        if (!projectData) return;
        handleFieldChange(field as keyof ProjectData, value);
        setAiSuggestions(null);
    }, [projectData, handleFieldChange]);

    const handleSaveProject = async () => {
        if (!projectData) return;
        setIsLoading(true);
        const isNew = selectedProjectId === 'new';
        
        try {
            let savedProject: ProjectData;
            if (isNew) {
                savedProject = await api.addProject(projectData);
                dispatch({ type: 'ADD_PROJECT', payload: savedProject });
            } else {
                savedProject = await api.updateProject(projectData.id, projectData);
                dispatch({ type: 'UPDATE_PROJECT', payload: savedProject });
            }
            notify('Project saved successfully!', 'success');
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
                            value={(projectData![field.key] as string) || ''}
                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        />
                    </FormField>
                    <div className="mt-2 text-right flex gap-2 justify-end">
                        <button onClick={() => handleEnhance(field.key)} disabled={isLoading || !(projectData && (projectData as any)[field.key])} className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed">
                             <i className={`fa-solid ${loadingField === field.key ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'} mr-2`}></i>Enhance
                        </button>
                        <button onClick={() => handleSuggest(field.key)} disabled={isLoading} className="px-4 py-1.5 text-xs font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:bg-slate-400">
                             <i className={`fa-solid ${loadingField === field.key ? 'fa-spinner fa-spin' : 'fa-lightbulb'} mr-2`}></i>Suggest
                        </button>
                    </div>
                    {aiSuggestions?.field === field.key && (
                        <SuggestionPanel suggestions={aiSuggestions.data} field={aiSuggestions.field} onIntegrate={handleIntegrate} isLoading={isLoading} />
                    )}
                </div>
            ))}
             <div className="mt-8 pt-5 border-t flex justify-end">
                <button onClick={handleSaveProject} disabled={isLoading} className="btn btn-primary">
                    <i className="fa-solid fa-save mr-2"></i>
                    Save Project
                </button>
            </div>
        </div>
    );
    
    const renderProjectSelector = () => (
        <div className="text-center py-20 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg">
            <h3 className="text-xl font-medium text-slate-800">Start by creating a new project or loading an existing one.</h3>
            <div className="mt-6 flex justify-center items-center gap-4">
                <button onClick={() => handleProjectLoad('new')} className="btn btn-primary px-6 py-3 text-lg font-semibold shadow-lg transition-transform hover:scale-105">
                    <i className="fa-solid fa-plus mr-2"></i>Create New Project
                </button>
                <div className="flex items-center gap-2">
                    <span className="text-slate-500">or</span>
                    <ProjectFilter
                        value={selectedProjectId || ''}
                        onChange={handleProjectLoad}
                        allowAll={false}
                        className="w-64"
                    />
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 pb-3 border-b border-slate-200 gap-4">
                <h2 className="text-xl font-bold text-slate-800">AI Project Generator</h2>
                <button onClick={() => onNavigate('projects')} className="btn btn-secondary flex-shrink-0">
                    Back to Projects
                </button>
            </div>

            {!projectData ? renderProjectSelector() : (
                 <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center mb-6 p-4 bg-slate-50 rounded-lg">
                        <h3 className="font-bold text-lg text-slate-800">{projectData.projectTitle || 'New Project'}</h3>
                        <div className="flex justify-end items-center gap-2">
                             <button
                                type="button"
                                onClick={handleGenerateFullDraft}
                                disabled={isLoading}
                                className="btn btn-special"
                            >
                                <i className={`fa-solid ${loadingField === 'full_draft' ? 'fa-spinner fa-spin' : 'fa-rocket'} mr-2`}></i>
                                {isLoading && loadingField === 'full_draft' ? 'Generating...' : 'Generate Full Draft'}
                            </button>
                             <button
                                onClick={handleSaveProject}
                                disabled={isLoading}
                                className="btn btn-primary"
                            >
                                <i className="fa-solid fa-save mr-2"></i>
                                Save Project
                            </button>
                        </div>
                    </div>
                    {renderGenerator()}
                 </>
            )}
        </div>
    );
};

export default AiProjectGeneratorPage;
