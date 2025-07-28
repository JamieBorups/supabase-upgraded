
import React, { useState, useMemo, useCallback } from 'react';
import { produce } from 'immer';
import { useAppContext } from '../../../context/AppContext';
import { ResearchPlan, ResearchPlanSection, AiPersonaName } from '../../../types';
import FormField from '../../ui/FormField';
import { TextareaWithCounter } from '../../ui/TextareaWithCounter';
import * as api from '../../../services/api';
import { getAiResponse } from '../../../services/aiService';
import { marked } from 'marked';
import { RESEARCH_PLAN_SECTIONS } from '../../../constants';

const SectionEditor: React.FC<{
    section: typeof RESEARCH_PLAN_SECTIONS[0];
    content: string;
    onContentChange: (content: string) => void;
    onGenerate: () => void;
    isLoading: boolean;
}> = ({ section, content, onContentChange, onGenerate, isLoading }) => {
    return (
        <details className="bg-slate-50 border border-slate-200 rounded-lg open:shadow-lg" open>
            <summary className="p-4 font-bold text-lg text-slate-800 cursor-pointer flex justify-between items-center hover:bg-slate-200/70 transition-colors">
                {section.label}
                <i className={`fa-solid fa-chevron-down transform transition-transform details-arrow ${isLoading ? 'text-blue-500 fa-spin' : ''}`}></i>
            </summary>
            <div className="p-4 border-t border-slate-200 bg-white">
                <FormField label="Content" htmlFor={section.key}>
                    <TextareaWithCounter
                        id={section.key}
                        value={content}
                        onChange={(e) => onContentChange(e.target.value)}
                        rows={10}
                        wordLimit={section.wordLimit}
                    />
                </FormField>
                <div className="text-right mt-2">
                    <button
                        onClick={onGenerate}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md shadow-sm hover:bg-purple-700 disabled:bg-slate-400"
                    >
                        <i className={`fa-solid ${isLoading ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'} mr-2`}></i>
                        {isLoading ? 'Generating...' : (content ? 'Regenerate' : 'Generate')}
                    </button>
                </div>
            </div>
        </details>
    );
};

interface EditReportTabProps {
    plan: ResearchPlan;
    onFinish: (plan: ResearchPlan) => void;
    onBack: () => void;
    setDirty: (isDirty: boolean) => void;
}

const EditReportTab: React.FC<EditReportTabProps> = ({ plan, onFinish, onBack, setDirty }) => {
    const { state, dispatch, notify } = useAppContext();
    const { projects, members, tasks, ecostarReports, interestCompatibilityReports, sdgAlignmentReports, recreationFrameworkReports, otfApplications, risks } = state;
    const [localPlan, setLocalPlan] = useState(plan);
    const [loadingSection, setLoadingSection] = useState<ResearchPlanSection | null>(null);

    const project = useMemo(() => projects.find(p => p.id === plan.projectId), [plan.projectId, projects]);

    const handleContentChange = (section: ResearchPlanSection, content: string) => {
        setLocalPlan(produce(draft => { (draft as any)[section] = content; }));
        setDirty(true);
    };
    
    const constructPrompt = useCallback((sectionKey: ResearchPlanSection, currentPlanState: ResearchPlan) => {
        if (!project) return '';

        const sectionConfig = state.settings.ai.researchPlanSectionSettings[sectionKey];
        if (!sectionConfig) {
            notify(`AI settings for section "${sectionKey}" not found.`, 'error');
            return '';
        }

        const getMostRecent = <T extends { createdAt?: string; updatedAt?: string; projectId: string | null; }>(items: T[]): T | undefined => {
            return items
                .filter(item => item.projectId === project.id)
                .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime())[0];
        };

        const projectTasks = tasks.filter(t => t.projectId === project.id);
        const projectMembers = project.collaboratorDetails.map(c => members.find(m => m.id === c.memberId)).filter(Boolean);
        const projectRisks = risks.filter(r => r.projectId === project.id);
        
        // Gather all supplementary context
        const supplementaryDocsContext: any = {};
        const latestEcoStar = getMostRecent(ecostarReports);
        if (latestEcoStar) supplementaryDocsContext.ecoStar = { environmentSummary: latestEcoStar.environmentReport?.summary, customerSummary: latestEcoStar.customerReport?.summary };

        const latestInterest = getMostRecent(interestCompatibilityReports);
        if (latestInterest) supplementaryDocsContext.interestCompatibility = { executiveSummary: latestInterest.executiveSummary, highCompatibilityAreas: latestInterest.highCompatibilityAreas?.map(a => a.area).join(', ') };

        const latestSdg = getMostRecent(sdgAlignmentReports);
        if (latestSdg) supplementaryDocsContext.sdgAlignment = { executiveSummary: latestSdg.executiveSummary, alignedGoals: latestSdg.detailedAnalysis?.map(g => g.goalTitle).join(', ') };

        const latestRecreation = getMostRecent(recreationFrameworkReports);
        if (latestRecreation) supplementaryDocsContext.recreationFramework = { executiveSummary: latestRecreation.executiveSummary };

        const latestOtf = getMostRecent(otfApplications);
        if (latestOtf) supplementaryDocsContext.otfApplication = { title: latestOtf.title, objective: latestOtf.projObjective, fundingPriority: latestOtf.projFundingPriority };

        const additionalContextParts = [
            { label: 'Focus Areas', data: currentPlanState.researchTypes },
            { label: 'Epistemologies', data: currentPlanState.epistemologies },
            { label: 'Pedagogies', data: currentPlanState.pedagogies },
            { label: 'Methodologies', data: currentPlanState.methodologies },
            { label: 'Mixed Methods', data: currentPlanState.mixedMethods },
        ];
        const additionalContext = additionalContextParts.filter(part => part.data && part.data.length > 0).map(part => `\n- ${part.label}: [${part.data.join(', ')}]`).join('');

        let prompt = sectionConfig.prompt;
        if (additionalContext) {
            prompt = `You must integrate the principles of the following selected approaches into your response:\n${additionalContext}\n\n${prompt}`;
        }
        
        const coreProjectContext = {
            project,
            tasks: projectTasks,
            team: projectMembers,
            riskManagement: {
                introductoryText: project.riskIntroText,
                identifiedRisks: projectRisks.map(r => ({ heading: r.heading, description: r.riskDescription, level: r.riskLevel, mitigation: r.mitigationPlan }))
            }
        };
        
        const generatedSectionsContext = RESEARCH_PLAN_SECTIONS
            .filter(sec => (currentPlanState as any)[sec.key] && sec.key !== sectionKey)
            .map(sec => `### ${sec.label} (Already Generated) ###\n${(currentPlanState as any)[sec.key]}`)
            .join('\n\n');

        let finalPrompt = `${prompt}\n\n### CORE PROJECT CONTEXT ###\n${JSON.stringify(coreProjectContext, null, 2)}`;
        if (Object.keys(supplementaryDocsContext).length > 0) {
            finalPrompt += `\n\n### SUPPLEMENTARY REPORTS CONTEXT (For Strategic Alignment) ###\n${JSON.stringify(supplementaryDocsContext, null, 2)}`;
        }
        if (generatedSectionsContext) {
            finalPrompt += `\n\n### PREVIOUSLY GENERATED SECTIONS (For Context Only) ###\n${generatedSectionsContext}`;
        }
        
        return finalPrompt;
    }, [project, state.settings.ai.researchPlanSectionSettings, tasks, members, ecostarReports, interestCompatibilityReports, sdgAlignmentReports, recreationFrameworkReports, otfApplications, risks, notify]);

    const handleGenerateSection = async (sectionKey: ResearchPlanSection, currentPlanForPrompt: ResearchPlan): Promise<string | null> => {
        setLoadingSection(sectionKey);
        
        const finalPrompt = constructPrompt(sectionKey, currentPlanForPrompt);
        if (!finalPrompt) {
            setLoadingSection(null);
            return null;
        }

        try {
            const result = await getAiResponse('researchPlan', finalPrompt, state.settings.ai);
            let aiContent = result.text.trim();
            setDirty(true);
            return aiContent;
        } catch (error: any) {
            notify(`AI generation failed for "${sectionKey}": ${error.message}`, 'error');
            return null;
        } finally {
            setLoadingSection(null);
        }
    };
    
    const handleGenerateSingle = async (sectionKey: ResearchPlanSection) => {
        const generatedContent = await handleGenerateSection(sectionKey, localPlan);
        if(generatedContent !== null) {
            handleContentChange(sectionKey, generatedContent);
        }
    };

    const handleGenerateFullDraft = async () => {
        let currentDraft = { ...localPlan };
        for (const section of RESEARCH_PLAN_SECTIONS) {
            const content = await handleGenerateSection(section.key, currentDraft);
            if (content !== null) {
                currentDraft = produce(currentDraft, draft => {
                    (draft as any)[section.key] = content;
                });
                setLocalPlan(currentDraft); // Update UI after each section
            } else {
                notify(`Draft generation stopped due to an error at section: ${section.label}`, 'error');
                return; // Stop if there's an error
            }
        }
        notify('Full draft generated successfully!', 'success');
    };

    const handleSaveDraft = async () => {
        try {
            const updatedPlan = await api.updateResearchPlan(localPlan.id, localPlan);
            dispatch({ type: 'UPDATE_RESEARCH_PLAN', payload: updatedPlan });
            setDirty(false);
            notify('Draft saved successfully!', 'success');
        } catch (error: any) {
            notify(`Error saving draft: ${error.message}`, 'error');
        }
    };

    const handleFinishEditing = async () => {
        const formatTextToHtml = (text: string) => {
            if (!text || typeof text !== 'string') return '<p><em>Not provided.</em></p>';
            return marked.parse(text) as string;
        };

        const reportHtml = RESEARCH_PLAN_SECTIONS.map(section => {
            const content = (localPlan as any)[section.key];
            const formattedContent = formatTextToHtml(content);
            return `<h2 class="text-2xl font-bold text-slate-800 border-b-2 border-teal-500 pb-2 mb-6">${section.label}</h2>${formattedContent}`;
        }).join('');

        const finalPlan = { ...localPlan, fullReportHtml: reportHtml };
        
        try {
            const updatedPlan = await api.updateResearchPlan(localPlan.id, finalPlan);
            dispatch({ type: 'UPDATE_RESEARCH_PLAN', payload: updatedPlan });
            notify('Final plan saved.', 'success');
            onFinish(updatedPlan);
        } catch (error: any) {
            notify(`Error saving plan: ${error.message}`, 'error');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <button onClick={onBack} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100">
                    <i className="fa-solid fa-arrow-left mr-2"></i>Back to All Plans
                </button>
                 <div className="flex items-center gap-3">
                    <button onClick={handleSaveDraft} className="px-6 py-2 text-base font-semibold text-teal-700 bg-white border border-teal-500 rounded-md shadow-sm hover:bg-teal-50">
                        <i className="fa-solid fa-save mr-2"></i>Save Draft
                    </button>
                    <button onClick={handleFinishEditing} className="px-6 py-2 text-base font-semibold text-white bg-teal-600 rounded-md shadow-sm hover:bg-teal-700">
                        Finish & View Report<i className="fa-solid fa-arrow-right ml-2"></i>
                    </button>
                </div>
            </div>
             <div className="mb-6 p-4 bg-slate-100 border border-slate-200 rounded-lg">
                <button
                    onClick={handleGenerateFullDraft}
                    disabled={!!loadingSection}
                    className="w-full px-4 py-3 text-lg font-semibold text-white bg-blue-600 border border-transparent rounded-md shadow-lg hover:bg-blue-700 disabled:bg-slate-400"
                >
                    <i className={`fa-solid ${loadingSection ? 'fa-spinner fa-spin' : 'fa-rocket'} mr-2`}></i>
                    {loadingSection ? 'Generating...' : 'Generate Full Draft'}
                </button>
                <p className="text-xs text-slate-500 text-center mt-2">This will generate content for all sections below based on your project data. This may take a moment.</p>
            </div>
            <div className="space-y-4">
                {RESEARCH_PLAN_SECTIONS.map(section => (
                    <SectionEditor
                        key={section.key}
                        section={section}
                        content={(localPlan as any)[section.key] || ''}
                        onContentChange={(content) => handleContentChange(section.key, content)}
                        onGenerate={() => handleGenerateSingle(section.key)}
                        isLoading={loadingSection === section.key}
                    />
                ))}
            </div>
        </div>
    );
};

export default EditReportTab;