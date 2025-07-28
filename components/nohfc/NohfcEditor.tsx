
import React, { useState, useMemo, useCallback } from 'react';
import { produce } from 'immer';
import { useAppContext } from '../../context/AppContext';
import { NohfcApplication, NohfcBudgetItem } from '../../types';
import FormField from '../ui/FormField';
import { Input } from '../ui/Input';
import { TextareaWithCounter } from '../ui/TextareaWithCounter';
import { TextareaWithCharacterCounter } from '../ui/TextareaWithCharacterCounter';
import ProjectFilter from '../ui/ProjectFilter';
import { getAiResponse } from '../../services/aiService';
import NohfcBudgetTable from './NohfcBudgetTable';
import { NOHFC_SECTIONS, NOHFC_BUDGET_SCHEMA } from '../../constants';
import { NOHFC_GUIDELINES, NSBA_GUIDELINES } from '../../constants';
import { Select } from '../ui/Select';

const AiDraftButton: React.FC<{
    field: string;
    onGenerate: (field: string) => void;
    isLoading: boolean;
    loadingField: string | null;
}> = ({ field, onGenerate, isLoading, loadingField }) => (
    <div className="text-right mt-1">
        <button
            type="button"
            onClick={() => onGenerate(field)}
            disabled={isLoading}
            className="px-3 py-1 text-xs font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:bg-slate-400"
        >
            <i className={`fa-solid ${isLoading && loadingField === field ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'} mr-2`}></i>
            Draft Section
        </button>
    </div>
);

interface NohfcEditorProps {
    application: NohfcApplication;
    onSave: (application: NohfcApplication) => void;
    onCancel: () => void;
}

const SECTION_TITLES: { [key: number]: string } = {
    1: 'Section 1: About the Project',
    2: 'Section 2: Project Outcomes and Benefits',
    3: 'Section 3: Technical, Managerial and Financial Capacity',
    4: 'Section 4: Justification'
};

const NohfcEditor: React.FC<NohfcEditorProps> = ({ application, onSave, onCancel }) => {
    const { state, notify } = useAppContext();
    const { infrastructure } = state;
    const [formData, setFormData] = useState<NohfcApplication>(application);
    const [selectedContextProjectId, setSelectedContextProjectId] = useState<string>(application.projectId || '');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingField, setLoadingField] = useState<string | null>(null);

    const handleFieldChange = (field: keyof NohfcApplication, value: any) => {
        setFormData(produce(draft => { (draft as any)[field] = value; }));
    };
    
    const contextForAi = useMemo(() => {
        const project = state.projects.find(p => p.id === selectedContextProjectId);
        const selectedInfrastructure = formData.infrastructureId ? infrastructure.find(i => i.id === formData.infrastructureId) : null;
        
        let infrastructureContext = "### INFRASTRUCTURE CONTEXT (PRIMARY SOURCE OF TRUTH) ###\n";
        if (selectedInfrastructure) {
            infrastructureContext += JSON.stringify(selectedInfrastructure, null, 2);
        } else {
            infrastructureContext += "No specific infrastructure asset has been selected for this application.";
        }

        let projectContext = `### PROGRAMMATIC CONTEXT (SECONDARY) ###\n`;
        if (project) {
            projectContext += `Project Title: ${project.projectTitle}\nProject Description: ${project.projectDescription}\nBackground: ${project.background}\n\n`;
        } else {
            projectContext += "No specific project has been selected for this application.\n\n"
        }

        const nohfcGuidelines = state.programGuidelines.find(g => g.name === 'NOHFC Community Enhancement');
        const guidelinesContext = `### NOHFC GUIDELINES (MUST ADHERE TO) ###\n${nohfcGuidelines ? JSON.stringify(nohfcGuidelines.guidelineData, null, 2) : "No guidelines found."}\n\n${NSBA_GUIDELINES}`;
        
        return `${infrastructureContext}\n\n${projectContext}\n\n${guidelinesContext}`;
    }, [selectedContextProjectId, formData.infrastructureId, state.projects, state.programGuidelines, infrastructure]);

    const handleDraftNarrativeSection = useCallback(async (field: string, draftForContext: NohfcApplication): Promise<string | null> => {
        setLoadingField(field);

        const instruction = (state.settings.ai.nohfcFieldSettings as any)[field];
        if (!instruction) {
            notify(`No AI instruction found for the field: ${field}`, 'error');
            setLoadingField(null);
            return null;
        }

        const finalPrompt = `${instruction}\n\n${contextForAi}\n\n### CURRENT APPLICATION DRAFT ###\n${JSON.stringify(draftForContext, null, 2)}`;
        
        try {
            const result = await getAiResponse('nohfc', finalPrompt, state.settings.ai);
            return result.text.trim();
        } catch (error: any) {
            notify(`AI Error on field ${field}: ${error.message}`, 'error');
            return null;
        } finally {
            setLoadingField(null);
        }
    }, [contextForAi, state.settings.ai, notify]);

    const handleDraftSection = async (field: string) => {
        if (!selectedContextProjectId && !formData.infrastructureId) {
            notify('Please select a context project or infrastructure asset first.', 'warning');
            return;
        }
        setIsLoading(true);
        const newText = await handleDraftNarrativeSection(field, formData);
        if (newText !== null) {
            handleFieldChange(field as keyof NohfcApplication, newText);
            notify(`Draft generated for ${field}.`, 'success');
        }
        setIsLoading(false);
    };

    const handleDraftBudget = useCallback(async (draftForContext: NohfcApplication): Promise<NohfcBudgetItem[] | null> => {
        setLoadingField('budgetItems');
        
        const instruction = state.settings.ai.nohfcFieldSettings.projectBudget;
        if (!instruction) {
             notify('No AI instruction found for the budget.', 'error');
            setLoadingField(null);
            return null;
        }

        const finalPrompt = `${instruction}\n\n${contextForAi}\n\n### CURRENT APPLICATION DRAFT ###\n${JSON.stringify(draftForContext, null, 2)}`;

        try {
            const budgetResult = await getAiResponse(
                'nohfc',
                finalPrompt,
                state.settings.ai,
                [],
                { responseSchema: NOHFC_BUDGET_SCHEMA }
            );
            
            const parsed = JSON.parse(budgetResult.text);
            if (parsed.budgetItems && Array.isArray(parsed.budgetItems)) {
                return parsed.budgetItems.map((item: Omit<NohfcBudgetItem, 'id'>) => ({
                    ...item,
                    id: `budget_${Date.now()}_${Math.random()}`
                }));
            } else {
                throw new Error("AI response did not contain a 'budgetItems' array.");
            }
        } catch (error: any) {
             notify(`AI Error generating Budget: ${error.message}`, 'error');
             return null;
        } finally {
            setLoadingField(null);
        }
    }, [contextForAi, state.settings.ai, notify]);

    const handleDraftProjectBudget = async () => {
        if (!selectedContextProjectId && !formData.infrastructureId) {
            notify('Please select a context project or infrastructure asset first.', 'warning');
            return;
        }
        setIsLoading(true);
        notify('Drafting project budget...', 'info');
        const newBudgetItems = await handleDraftBudget(formData);
        if (newBudgetItems) {
            handleFieldChange('budgetItems', newBudgetItems);
            notify('Budget draft generated successfully!', 'success');
        }
        setIsLoading(false);
    };
    
    const handleDraftFullApplication = async () => {
        if (!selectedContextProjectId && !formData.infrastructureId) {
            notify('Please select a context project or infrastructure asset first.', 'warning');
            return;
        }
        setIsLoading(true);
        setLoadingField('full_draft');
        let currentDraft = formData;

        for (const section of NOHFC_SECTIONS) {
            notify(`Drafting: ${section.label}...`, 'info');
            const newText = await handleDraftNarrativeSection(section.key, currentDraft);
            if (newText !== null) {
                currentDraft = produce(currentDraft, d => { (d as any)[section.key] = newText; });
                setFormData(currentDraft);
            } else {
                notify(`AI generation failed for "${section.label}". Stopping draft.`, 'error');
                setIsLoading(false);
                setLoadingField(null);
                return;
            }
        }
        
        notify('Drafting project budget...', 'info');
        const newBudgetItems = await handleDraftBudget(currentDraft);
        if (newBudgetItems) {
            currentDraft = produce(currentDraft, d => { d.budgetItems = newBudgetItems; });
            setFormData(currentDraft);
            notify('Budget generated successfully!', 'success');
        } else {
            notify('Budget generation failed. The full draft is incomplete.', 'warning');
        }

        notify('Full application draft completed!', 'success');
        setIsLoading(false);
        setLoadingField(null);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, projectId: selectedContextProjectId || null });
    };

    const infrastructureOptions = useMemo(() => {
        return [{ value: '', label: 'Select Facility (Primary)' }, ...infrastructure.map(i => ({ value: i.id, label: i.name }))]
    }, [infrastructure]);

    return (
        <form onSubmit={handleSave}>
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
                <div className="flex justify-between items-start mb-6 pb-4 border-b border-slate-200">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">{application.id.startsWith('new_') ? 'New' : 'Edit'} NOHFC Application</h1>
                        <FormField label="" htmlFor="title" className="mt-2 mb-0">
                           <Input id="title" value={formData.title} onChange={e => handleFieldChange('title', e.target.value)} placeholder="Application Title" />
                        </FormField>
                    </div>
                    <button type="button" onClick={onCancel} className="btn btn-secondary flex-shrink-0"><i className="fa-solid fa-times mr-2"></i>Close</button>
                </div>

                <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <h3 className="font-semibold text-lg text-slate-700 mb-2">AI Content Generation</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                        <FormField label="Primary Infrastructure Asset" htmlFor="infrastructure_select" instructions="This is the primary source of truth for the AI.">
                            <Select options={infrastructureOptions} value={formData.infrastructureId || ''} onChange={e => handleFieldChange('infrastructureId', e.target.value || null)} />
                        </FormField>
                        <FormField label="Supporting Project" htmlFor="context_project" instructions="Provides secondary, programmatic context.">
                            <ProjectFilter value={selectedContextProjectId} onChange={setSelectedContextProjectId} allowAll={false} />
                        </FormField>
                        <div className="flex-shrink-0">
                            <button type="button" onClick={handleDraftFullApplication} disabled={!selectedContextProjectId && !formData.infrastructureId || isLoading} className="btn btn-special w-full">
                                <i className={`fa-solid ${loadingField === 'full_draft' ? 'fa-spinner fa-spin' : 'fa-rocket'} mr-2`}></i>
                                {isLoading && loadingField === 'full_draft' ? 'Drafting...' : 'Draft Full Application'}
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="space-y-8">
                    {Object.entries(SECTION_TITLES).map(([sectionNum, sectionTitle]) => (
                        <details key={sectionNum} className="p-4 border rounded-lg bg-slate-50 border-slate-200" open>
                            <summary className="text-xl font-bold text-slate-800 cursor-pointer list-none flex justify-between items-center">
                                {sectionTitle}
                                <i className="fa-solid fa-chevron-down transform transition-transform details-arrow"></i>
                            </summary>
                            <div className="mt-4 pt-4 border-t border-slate-300 space-y-6">
                                {NOHFC_SECTIONS.filter(s => s.section.toString() === sectionNum).map(section => (
                                    <FormField key={section.key} label={section.label} htmlFor={section.key}>
                                        {section.limitType === 'char' ? (
                                            <TextareaWithCharacterCounter
                                                id={section.key}
                                                value={(formData as any)[section.key]}
                                                onChange={e => handleFieldChange(section.key as keyof NohfcApplication, e.target.value)}
                                                rows={5}
                                                characterLimit={section.limit}
                                            />
                                        ) : (
                                            <TextareaWithCounter 
                                                id={section.key}
                                                value={(formData as any)[section.key]} 
                                                onChange={e => handleFieldChange(section.key as keyof NohfcApplication, e.target.value)} 
                                                rows={12}
                                                wordLimit={section.limit}
                                            />
                                        )}
                                        <AiDraftButton field={section.key} onGenerate={handleDraftSection} isLoading={isLoading} loadingField={loadingField} />
                                    </FormField>
                                ))}
                            </div>
                        </details>
                    ))}

                    <details className="p-4 border rounded-lg bg-slate-50 border-slate-200" open>
                        <summary className="text-xl font-bold text-slate-800 cursor-pointer list-none flex justify-between items-center">
                            Project Budget
                             <button
                                type="button"
                                onClick={handleDraftProjectBudget}
                                disabled={isLoading || (!selectedContextProjectId && !formData.infrastructureId)}
                                className="btn btn-secondary text-sm"
                            >
                                <i className={`fa-solid ${loadingField === 'budgetItems' ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'} mr-2`}></i>
                                Draft Project Budget
                            </button>
                        </summary>
                         <div className="mt-4 pt-4 border-t border-slate-300 space-y-6">
                            <FormField label="" htmlFor="budgetItems">
                                <NohfcBudgetTable items={formData.budgetItems} onChange={v => handleFieldChange('budgetItems', v)} />
                            </FormField>
                         </div>
                    </details>
                </div>

                <div className="mt-8 pt-5 border-t flex justify-end">
                    <button type="submit" className="px-8 py-3 text-lg font-semibold text-white bg-teal-600 rounded-md shadow-lg hover:bg-teal-700 disabled:bg-slate-400">
                        <i className="fa-solid fa-save mr-2"></i>Save Application
                    </button>
                </div>
            </div>
        </form>
    );
};

export default NohfcEditor;
