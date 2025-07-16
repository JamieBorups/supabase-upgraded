


import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { produce } from 'immer';
import { useAppContext } from '../../context/AppContext';
import { OtfApplication, FormData as ProjectData, ResearchPlan, EcoStarReport, InterestCompatibilityReport, Task, OtfProjectPlanItem, OtfBudgetItem } from '../../types';
import FormField from '../ui/FormField';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { TextareaWithCounter } from '../ui/TextareaWithCounter';
import { CheckboxGroup } from '../ui/CheckboxGroup';
import { RadioGroup } from '../ui/RadioGroup';
import {
    SECTOR_OPTIONS, BILINGUAL_MANDATE_OPTIONS, POPULATION_PERCENTAGE_OPTIONS,
    POPULATION_LANGUAGE_OPTIONS, POPULATION_GENDER_OPTIONS, POPULATION_LIVED_EXPERIENCE_OPTIONS,
    POPULATION_IDENTITY_OPTIONS, LEADERSHIP_REFLECTION_OPTIONS, OTF_SUPPORTS_OPTIONS,
    PROJ_AGE_OPTIONS, COMMUNITY_SIZE_OPTIONS, TERM_OPTIONS, FUNDING_PRIORITY_OPTIONS,
    OBJECTIVE_OPTIONS
} from '../../constants';
import OtfBoardMemberTable from './OtfBoardMemberTable';
import OtfSeniorStaffTable from './OtfSeniorStaffTable';
import OtfCollaboratorsTable from './OtfCollaboratorsTable';
import OtfProjectPlanTable from './OtfProjectPlanTable';
import OtfBudgetTable from './OtfBudgetTable';
import ProjectFilter from '../ui/ProjectFilter';
import { getAiResponse } from '../../services/aiService';
import OtfLargerProjectFundingTable from './OtfLargerProjectFundingTable';
import OtfQuotesTable from './OtfQuotesTable';
import { OTF_PROJECT_PLAN_SCHEMA, OTF_BUDGET_SCHEMA } from '../../constants/ai/otf.constants';

type TabId = 'org' | 'project' | 'budget' | 'ack';

interface OtfEditorProps {
    application: OtfApplication;
    onSave: (application: OtfApplication) => void;
    onCancel: () => void;
}

const RULE_TEMPLATE = (wordLimit: number, lowerBound: number) => `Your response MUST follow these strict rules:
1. The output must be plain text paragraphs ONLY. Use double newlines (\\n\\n) to separate paragraphs. Do not use markdown, headings, bold, italics, or lists.
2. Word count is critical. You must write as close to the ${wordLimit}-word limit as possible, and your response MUST be between ${lowerBound} and ${wordLimit} words. NEVER exceed the word count.
3. Do not include any section titles or headings in your response. Respond only with the requested content.`;

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


const OtfEditor: React.FC<OtfEditorProps> = ({ application, onSave, onCancel }) => {
    const { state, notify } = useAppContext();
    const [formData, setFormData] = useState<OtfApplication>(application);
    const [activeTab, setActiveTab] = useState<TabId>('org');
    const [selectedContextProjectId, setSelectedContextProjectId] = useState<string>(application.projectId || '');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingField, setLoadingField] = useState<string | null>(null);

    useEffect(() => {
        setFormData(prev => produce(prev, draft => {
            draft.projOtfCatchment = 'Northwestern catchment';
            draft.projCensusDivision = 'Kenora';
        }));
    }, [application.id]);

    const handleFieldChange = useCallback((field: keyof OtfApplication, value: any) => {
        setFormData(produce(draft => { (draft as any)[field] = value; }));
    }, []);

    useEffect(() => {
        if (selectedContextProjectId) {
            const project = state.projects.find(p => p.id === selectedContextProjectId);
            if (project) {
                const newTitle = `OTF Application - ${project.projectTitle}`;
                handleFieldChange('title', newTitle);
            }
        }
    }, [selectedContextProjectId, state.projects, handleFieldChange]);

    const contextForAi = useMemo(() => {
        if (!selectedContextProjectId) return 'No context project selected.';
        
        const project = state.projects.find(p => p.id === selectedContextProjectId);
        if (!project) return 'Selected context project not found.';

        const getMostRecent = <T extends { createdAt: string; projectId: string; }>(items: T[]): T | undefined => {
            return items
                .filter((item: any) => item.projectId === selectedContextProjectId)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        };

        const researchPlan = getMostRecent(state.researchPlans);
        const ecoStarReport = getMostRecent(state.ecostarReports);
        const interestReport = getMostRecent(state.interestCompatibilityReports);
        const projectTasks = state.tasks.filter(t => t.projectId === selectedContextProjectId);
        const otfGuidelines = state.programGuidelines.find(g => g.name === 'OTF Seed Grant');

        let context = "### PRIMARY PROJECT CONTEXT ###\n";
        context += `Project Title: ${project.projectTitle}\n`;
        context += `Project Description: ${project.projectDescription}\n`;
        context += `Background: ${project.background}\n\n`;

        context += "### OTF SEED GRANT GUIDELINES (MUST ADHERE TO) ###\n";
        if (otfGuidelines) {
            context += JSON.stringify(otfGuidelines.guidelineData, null, 2) + "\n\n";
        } else {
            context += "No guidelines found.\n\n";
        }

        if (formData.projFundingPriority) {
            context += `### CRITICAL FUNDING PRIORITY (MUST ALIGN WITH) ###\n${formData.projFundingPriority}\n\n`;
        }

        context += "### SUPPLEMENTARY STRATEGIC CONTEXT ###\n";
        context += "Use this supplementary information to inform the tone, strategic alignment, and specific details of your response.\n\n";

        context += "#### LATEST RESEARCH PLAN ####\n";
        if (researchPlan) {
            context += `Title & Overview: ${researchPlan.titleAndOverview}\nQuestions: ${researchPlan.researchQuestions}\nMethodology: ${researchPlan.designAndMethodology}\nCommunity Engagement: ${researchPlan.communityEngagement}\n\n`;
        } else {
            context += "No Research Plan provided.\n\n";
        }

        context += "#### LATEST ECO-STAR REPORT ####\n";
        if (ecoStarReport) {
            context += `Environment Summary: ${ecoStarReport.environmentReport?.summary}\nCustomer Summary: ${ecoStarReport.customerReport?.summary}\nOpportunity Summary: ${ecoStarReport.opportunityReport?.summary}\n\n`;
        } else {
            context += "No ECO-STAR report provided.\n\n";
        }
        
        context += "#### LATEST INTEREST COMPATIBILITY REPORT ####\n";
        if (interestReport) {
            context += `Executive Summary: ${interestReport.executiveSummary}\nHigh Compatibility Areas: ${interestReport.highCompatibilityAreas?.map(a => a.area).join(', ')}\nPotential Conflicts: ${interestReport.potentialConflicts?.map(c => c.area).join(', ')}\n\n`;
        } else {
            context += "No Interest Compatibility report provided.\n\n";
        }

        context += "#### EXISTING PROJECT TASKS ####\n";
        if (projectTasks.length > 0) {
            context += projectTasks.slice(0, 15).map(t => `- ${t.title} (${t.status})`).join('\n') + '\n';
        } else {
            context += "No tasks defined for this project yet.\n";
        }

        return context;
    }, [selectedContextProjectId, state, formData.projFundingPriority]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        let finalData = { ...formData, projectId: selectedContextProjectId || null };

        if (!finalData.title || finalData.title.trim() === '') {
            const project = state.projects.find(p => p.id === selectedContextProjectId);
            if (project) {
                finalData.title = `OTF Application - ${project.projectTitle}`;
            } else {
                finalData.title = `Untitled OTF Application`;
            }
        }
        
        onSave(finalData);
    };

    const handleLoadProjectData = () => {
        if (!selectedContextProjectId) return;
        const project = state.projects.find(p => p.id === selectedContextProjectId);
        if (!project) return;

        setFormData(produce(draft => {
            draft.projDescription = project.projectDescription;
            draft.projWhyAndWhoBenefits = project.audience;
        }));
        notify('Data loaded from selected project.', 'success');
    };

    const handleGenerateJustification = useCallback(async (item: OtfProjectPlanItem, draftForContext: OtfApplication): Promise<string | null> => {
        if (!selectedContextProjectId) return null;
        
        const instruction = `Based on the project context and OTF guidelines, write a 500-word justification for the following project plan item. The justification must explicitly link the deliverable, tasks, and timing to be 100% aligned with the Framework for Recreation in Canada (2024 Update) goals, appropriate for the project's selected sector: ${draftForContext.sector}.
        
**Project Plan Item Details:**
- Deliverable: "${item.deliverable}"
- Key Task: "${item.keyTask}"
- Timing: "${item.timing}"

${RULE_TEMPLATE(500, 450)}`;
        
        const finalPrompt = `${instruction}\n\n${contextForAi}\n\n### CURRENT APPLICATION DRAFT ###\n${JSON.stringify(draftForContext, null, 2)}`;
        
        try {
            const result = await getAiResponse('otf', finalPrompt, state.settings.ai);
            return result.text.trim();
        } catch (error: any) {
             notify(`AI Error generating justification: ${error.message}`, 'error');
             return null;
        }
    }, [selectedContextProjectId, contextForAi, state.settings.ai, notify]);
    
    const handleDraftSection = useCallback(async (field: string, draftForContext: OtfApplication): Promise<string | null> => {
        setLoadingField(field);

        let instruction = (state.settings.ai.otfFieldSettings as any)[field];
        
        if (field === 'justificationIntro' || field === 'justificationOutro') {
            const wordCount = field === 'justificationIntro' ? 250 : 250;
            const lowerBound = field === 'justificationIntro' ? 200 : 200;
            const introOutroType = field === 'justificationIntro' ? 'introductory' : 'concluding';
            instruction = `Based on the provided project context, write an ${introOutroType} justification narrative of approximately ${wordCount} words, broken into multiple paragraphs. This narrative must explicitly reference the Northern Services Boards Act, R.S.O. 1990, c. L.28 and justify how the proposed project activities align with the prescribed powers for recreation. The specific powers are: "(a) contract for the use of recreation facilities or participation in programs of recreation; (b) provide for the carrying out of programs of recreation; or (c) acquire, establish, construct, operate and maintain recreation facilities". The justification must be irrefutable and iron-clad.\n${RULE_TEMPLATE(wordCount, lowerBound)}`;
        }
        
        if (!instruction) {
            notify(`No AI instruction found for the field: ${field}`, 'error');
            setLoadingField(null);
            return null;
        }

        if (draftForContext.sector) {
            instruction += `\n\n**CRITICAL REQUIREMENT:** Your response MUST be tailored to the **${draftForContext.sector}** sector. Frame all content from the perspective of this sector.`;
        }
        
        const finalPrompt = `${instruction}\n\n${contextForAi}\n\n### CURRENT APPLICATION DRAFT ###\n${JSON.stringify(draftForContext, null, 2)}`;

        try {
            const result = await getAiResponse('otf', finalPrompt, state.settings.ai);
            return result.text.trim();
        } catch (error: any) {
            notify(`AI Error on field ${field}: ${error.message}`, 'error');
            return null;
        } finally {
            setLoadingField(null);
        }
    }, [contextForAi, state.settings.ai, notify]);

    const handleDraftProjectPlan = useCallback(async (draftForContext: OtfApplication): Promise<OtfProjectPlanItem[] | null> => {
        setLoadingField('projectPlan');
        let instruction = state.settings.ai.otfFieldSettings.projectPlan;
        if (draftForContext.sector) {
            instruction += `\n\n**CRITICAL REQUIREMENT:** The entire project plan MUST be contextually relevant to the **${draftForContext.sector}** sector.`;
        }
        const finalPrompt = `${instruction}\n\n${contextForAi}\n\n### CURRENT APPLICATION DRAFT ###\n${JSON.stringify(draftForContext, null, 2)}`;
        try {
            const result = await getAiResponse('otf', finalPrompt, state.settings.ai, [], { responseSchema: OTF_PROJECT_PLAN_SCHEMA });
            const parsed = JSON.parse(result.text) as { projectPlan: Omit<OtfProjectPlanItem, 'id' | 'order'>[] };
            if (parsed.projectPlan && Array.isArray(parsed.projectPlan)) {
                return produce(draftForContext.projectPlan, draft => {
                    parsed.projectPlan.forEach((generatedItem, index) => {
                        if (draft[index]) {
                            draft[index].deliverable = generatedItem.deliverable;
                            draft[index].keyTask = generatedItem.keyTask;
                            draft[index].timing = generatedItem.timing;
                        }
                    });
                });
            } else { throw new Error("AI response did not contain a 'projectPlan' array."); }
        } catch (e: any) {
            notify(`AI Error generating Project Plan: ${e.message}`, 'error');
            return null;
        } finally { setLoadingField(null); }
    }, [contextForAi, state.settings.ai, notify]);

    const handleDraftBudget = useCallback(async (draftForContext: OtfApplication): Promise<OtfBudgetItem[] | null> => {
        setLoadingField('budgetItems');
        let instruction = state.settings.ai.otfFieldSettings.projectBudget;
        if (draftForContext.sector) { instruction += `\n\n**CRITICAL REQUIREMENT:** All budget items must be realistic and appropriate for a project in the **${draftForContext.sector}** sector.`; }
        const finalPrompt = `${instruction}\n\n${contextForAi}\n\n### CURRENT APPLICATION DRAFT ###\n${JSON.stringify(draftForContext, null, 2)}`;
        try {
            const result = await getAiResponse('otf', finalPrompt, state.settings.ai, [], { responseSchema: OTF_BUDGET_SCHEMA });
            const parsed = JSON.parse(result.text) as { budgetItems: OtfBudgetItem[] };
            if (parsed.budgetItems && Array.isArray(parsed.budgetItems)) {
                return parsed.budgetItems.map((item, index) => ({...item, id: `budget_${Date.now()}_${index}`}));
            } else { throw new Error("AI response did not contain a 'budgetItems' array."); }
        } catch (e: any) {
            notify(`AI Error generating Budget: ${e.message}`, 'error');
            return null;
        } finally { setLoadingField(null); }
    }, [contextForAi, state.settings.ai, notify]);
    
    const handleDraftFullApplication = async () => {
        if (!selectedContextProjectId) { notify('Please select a context project first.', 'warning'); return; }
        setIsLoading(true);
        setLoadingField('full_application');
        let currentDraft = formData;

        const narrativeFields: (keyof OtfApplication)[] = [ 'basicIdea', 'activitiesDescription', 'projDescription', 'projImpactExplanation', 'projWhyAndWhoBenefits', 'projBarriersExplanation', 'justificationIntro', 'justificationOutro', 'projFinalDescription' ];
        for (const field of narrativeFields) {
            notify(`Drafting: ${field}...`, 'info');
            const newText = await handleDraftSection(field, currentDraft);
            if (newText !== null) { currentDraft = produce(currentDraft, d => { (d as any)[field] = newText; }); setFormData(currentDraft); }
             else { setIsLoading(false); setLoadingField(null); return; }
        }

        try {
            notify('Drafting Project Plan...', 'info');
            const newPlanItems = await handleDraftProjectPlan(currentDraft);
            if (newPlanItems) {
                currentDraft = produce(currentDraft, d => { d.projectPlan = newPlanItems; });
                setFormData(currentDraft);
                
                let planWithJustifications = [...newPlanItems];
                for (const [index, item] of newPlanItems.entries()) {
                    notify(`Drafting justification for: ${item.deliverable}...`, 'info');
                    const justification = await handleGenerateJustification(item, currentDraft);
                    if (justification) {
                         planWithJustifications = produce(planWithJustifications, d => { d[index].justification = justification; });
                         currentDraft = produce(currentDraft, d => { d.projectPlan = planWithJustifications; });
                         setFormData(currentDraft);
                    } else { throw new Error(`Failed to generate justification for item ${index + 1}.`); }
                }
            }
            
            notify('Drafting Budget...', 'info');
            const newBudgetItems = await handleDraftBudget(currentDraft);
            if (newBudgetItems) { currentDraft = produce(currentDraft, d => { d.budgetItems = newBudgetItems; }); setFormData(currentDraft); }
            
            notify('Full application draft completed!', 'success');
        } catch (e: any) {
            notify(e.message || 'Full draft generation stopped due to an error.', 'warning');
        } finally {
            setIsLoading(false);
            setLoadingField(null);
        }
    };

    const TABS: { id: TabId, label: string }[] = [
        { id: 'org', label: 'Organization Information' },
        { id: 'project', label: 'Project Information' },
        { id: 'budget', label: 'Budget & Plan' },
        { id: 'ack', label: 'Acknowledgements' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'org': return (
                <div className="space-y-6">
                    <FormField label="Application Title" htmlFor="title" instructions="A unique name to identify this application draft.">
                        <Input id="title" value={formData.title} onChange={e => handleFieldChange('title', e.target.value)} />
                    </FormField>
                    <FormField label="Basic Idea" htmlFor="basicIdea" instructions="In a few sentences, describe the core idea or concept of your project. This will be used to focus the AI's suggestions. Max 100 words.">
                        <TextareaWithCounter id="basicIdea" value={formData.basicIdea} onChange={e => handleFieldChange('basicIdea', e.target.value)} rows={3} wordLimit={100} />
                        <AiDraftButton field="basicIdea" onGenerate={() => handleDraftSection('basicIdea', formData)} isLoading={isLoading} loadingField={loadingField} />
                    </FormField>
                    <FormField label="Mission Statement" htmlFor="missionStatement" instructions="Max 200 words.">
                        <TextareaWithCounter id="missionStatement" value={formData.missionStatement} onChange={e => handleFieldChange('missionStatement', e.target.value)} rows={5} wordLimit={200} readOnly />
                    </FormField>
                    <FormField label="Typical Activities" htmlFor="activitiesDescription" instructions="Max 200 words.">
                        <TextareaWithCounter id="activitiesDescription" value={formData.activitiesDescription} onChange={e => handleFieldChange('activitiesDescription', e.target.value)} rows={5} wordLimit={200} />
                        <AiDraftButton field="activitiesDescription" onGenerate={() => handleDraftSection('activitiesDescription', formData)} isLoading={isLoading} loadingField={loadingField} />
                    </FormField>
                    <FormField label="Sector" htmlFor="sector"><Select id="sector" value={formData.sector} onChange={e => handleFieldChange('sector', e.target.value)} options={SECTOR_OPTIONS} /></FormField>
                    <FormField label="People Served Annually" htmlFor="peopleServedAnnually"><Input type="number" id="peopleServedAnnually" value={formData.peopleServedAnnually} onChange={e => handleFieldChange('peopleServedAnnually', parseInt(e.target.value))} /></FormField>
                    <FormField label="Offer bilingual services?" htmlFor="offersBilingualServices"><RadioGroup name="offersBilingualServices" selectedValue={formData.offersBilingualServices ? 'yes' : 'no'} onChange={val => handleFieldChange('offersBilingualServices', val === 'yes')} options={[{value: 'yes', label: 'Yes'}, {value: 'no', label: 'No'}]} /></FormField>
                    {formData.offersBilingualServices && ( <FormField label="Bilingual Mandate" htmlFor="bilingualMandateType"><Select id="bilingualMandateType" value={formData.bilingualMandateType} onChange={e => handleFieldChange('bilingualMandateType', e.target.value)} options={BILINGUAL_MANDATE_OPTIONS} /></FormField> )}
                    <FormField label="Serve Francophone population?" htmlFor="servesFrancophonePopulation"><RadioGroup name="servesFrancophonePopulation" selectedValue={formData.servesFrancophonePopulation ? 'yes' : 'no'} onChange={val => handleFieldChange('servesFrancophonePopulation', val === 'yes')} options={[{value: 'yes', label: 'Yes'}, {value: 'no', label: 'No'}]} /></FormField>
                    {formData.servesFrancophonePopulation && (
                        <div className="grid grid-cols-2 gap-4">
                        <FormField label="% of people served in French" htmlFor="frenchServicesPeoplePercentage"><Select id="frenchServicesPeoplePercentage" value={String(formData.frenchServicesPeoplePercentage)} onChange={e => handleFieldChange('frenchServicesPeoplePercentage', parseInt(e.target.value))} options={POPULATION_PERCENTAGE_OPTIONS} /></FormField>
                        <FormField label="% of programs in French" htmlFor="frenchProgramsPercentage"><Select id="frenchProgramsPercentage" value={String(formData.frenchProgramsPercentage)} onChange={e => handleFieldChange('frenchProgramsPercentage', parseInt(e.target.value))} options={POPULATION_PERCENTAGE_OPTIONS} /></FormField>
                        </div>
                    )}
                    <FormField label="Paid Staff" htmlFor="paidStaffCount"><Input type="number" id="paidStaffCount" value={formData.paidStaffCount} onChange={e => handleFieldChange('paidStaffCount', parseInt(e.target.value))} /></FormField>
                    <FormField label="Volunteers" htmlFor="volunteerCount"><Input type="number" id="volunteerCount" value={formData.volunteerCount} onChange={e => handleFieldChange('volunteerCount', parseInt(e.target.value))} /></FormField>
                    <FormField label="Language of population served" htmlFor="languagePopulationServed"><CheckboxGroup name="languagePopulationServed" options={POPULATION_LANGUAGE_OPTIONS} selectedValues={formData.languagePopulationServed} onChange={v => handleFieldChange('languagePopulationServed', v)} /></FormField>
                    <FormField label="Gender of population served" htmlFor="genderPopulationServed"><CheckboxGroup name="genderPopulationServed" options={POPULATION_GENDER_OPTIONS} selectedValues={formData.genderPopulationServed} onChange={v => handleFieldChange('genderPopulationServed', v)} /></FormField>
                    <FormField label="Lived-experience of population served" htmlFor="livedExperiencePopulationServed"><CheckboxGroup name="livedExperiencePopulationServed" options={POPULATION_LIVED_EXPERIENCE_OPTIONS} selectedValues={formData.livedExperiencePopulationServed} onChange={v => handleFieldChange('livedExperiencePopulationServed', v)} /></FormField>
                    <FormField label="Identity of population served" htmlFor="identityPopulationServed"><CheckboxGroup name="identityPopulationServed" options={POPULATION_IDENTITY_OPTIONS} selectedValues={formData.identityPopulationServed} onChange={v => handleFieldChange('identityPopulationServed', v)} /></FormField>
                    <FormField label="Does leadership reflect communities served?" htmlFor="leadershipReflectsCommunity"><Select id="leadershipReflectsCommunity" value={formData.leadershipReflectsCommunity} onChange={e => handleFieldChange('leadershipReflectsCommunity', e.target.value)} options={LEADERSHIP_REFLECTION_OPTIONS} /></FormField>
                </div>
            );
            case 'project': return (
                 <div className="space-y-6">
                    <FormField label="OTF supports used" htmlFor="otfSupportsUsed"><CheckboxGroup name="otfSupportsUsed" options={OTF_SUPPORTS_OPTIONS} selectedValues={formData.otfSupportsUsed} onChange={v => handleFieldChange('otfSupportsUsed', v)} /></FormField>
                    <FormField label="Primary benefiting population (Age)" htmlFor="projAgeGroup"><Select id="projAgeGroup" value={formData.projAgeGroup} onChange={e => handleFieldChange('projAgeGroup', e.target.value)} options={PROJ_AGE_OPTIONS} /></FormField>
                    <FormField label="Primary benefiting population (Language)" htmlFor="projLanguage"><Select id="projLanguage" value={formData.projLanguage} onChange={e => handleFieldChange('projLanguage', e.target.value)} options={POPULATION_LANGUAGE_OPTIONS} /></FormField>
                    <FormField label="Primary benefiting population (Gender)" htmlFor="projGender"><Select id="projGender" value={formData.projGender} onChange={e => handleFieldChange('projGender', e.target.value)} options={POPULATION_GENDER_OPTIONS} /></FormField>
                    <FormField label="Primary benefiting population (Lived Experience)" htmlFor="projLivedExperience"><Select id="projLivedExperience" value={formData.projLivedExperience} onChange={e => handleFieldChange('projLivedExperience', e.target.value)} options={POPULATION_LIVED_EXPERIENCE_OPTIONS} /></FormField>
                    <FormField label="Primary benefiting population (Identity)" htmlFor="projIdentity"><Select id="projIdentity" value={formData.projIdentity} onChange={e => handleFieldChange('projIdentity', e.target.value)} options={POPULATION_IDENTITY_OPTIONS} /></FormField>
                    <FormField label="Community Size" htmlFor="projCommunitySize"><Select id="projCommunitySize" value={formData.projCommunitySize} onChange={e => handleFieldChange('projCommunitySize', e.target.value)} options={COMMUNITY_SIZE_OPTIONS} /></FormField>
                    <FormField label="Project Description" htmlFor="projDescription" instructions="Max. 200 words."><TextareaWithCounter id="projDescription" value={formData.projDescription} onChange={e => handleFieldChange('projDescription', e.target.value)} rows={5} wordLimit={200} /><AiDraftButton field="projDescription" onGenerate={() => handleDraftSection('projDescription', formData)} isLoading={isLoading} loadingField={loadingField} /></FormField>
                    <FormField label="OTF Catchment Area" htmlFor="projOtfCatchment">
                        <div className="mt-1 p-2 bg-slate-100 border border-slate-300 rounded-md text-sm text-slate-700 min-h-[38px] flex items-center">
                            {formData.projOtfCatchment}
                        </div>
                    </FormField>
                    <FormField label="Census Division" htmlFor="projCensusDivision">
                        <div className="mt-1 p-2 bg-slate-100 border border-slate-300 rounded-md text-sm text-slate-700 min-h-[38px] flex items-center">
                            {formData.projCensusDivision}
                        </div>
                    </FormField>
                    <FormField label="Project Start Date" htmlFor="projStartDate"><Input type="date" id="projStartDate" value={formData.projStartDate} onChange={e => handleFieldChange('projStartDate', e.target.value)} /></FormField>
                    <FormField label="Requested Term" htmlFor="projRequestedTerm"><Select id="projRequestedTerm" value={String(formData.projRequestedTerm)} onChange={e => handleFieldChange('projRequestedTerm', parseInt(e.target.value))} options={TERM_OPTIONS} /></FormField>
                    <FormField label="Funding Priority" htmlFor="projFundingPriority"><Select id="projFundingPriority" value={formData.projFundingPriority} onChange={e => handleFieldChange('projFundingPriority', e.target.value)} options={FUNDING_PRIORITY_OPTIONS} /></FormField>
                    {formData.projObjective !== "Design and/or pilot an innovative program or service to address community need" && <FormField label="Impact Explanation" htmlFor="projImpactExplanation"><TextareaWithCounter id="projImpactExplanation" value={formData.projImpactExplanation} onChange={e => handleFieldChange('projImpactExplanation', e.target.value)} rows={4} wordLimit={200} /><AiDraftButton field="projImpactExplanation" onGenerate={() => handleDraftSection('projImpactExplanation', formData)} isLoading={isLoading} loadingField={loadingField} /></FormField>}
                    <FormField label="Why you are doing this project and who will primarily benefit" htmlFor="projWhyAndWhoBenefits" instructions="Max. 200 words."><TextareaWithCounter id="projWhyAndWhoBenefits" value={formData.projWhyAndWhoBenefits} onChange={e => handleFieldChange('projWhyAndWhoBenefits', e.target.value)} rows={5} wordLimit={200} /><AiDraftButton field="projWhyAndWhoBenefits" onGenerate={() => handleDraftSection('projWhyAndWhoBenefits', formData)} isLoading={isLoading} loadingField={loadingField} /></FormField>
                    <FormField label="Explain how project helps populations experiencing barriers" htmlFor="projBarriersExplanation" instructions="Max. 200 words."><TextareaWithCounter id="projBarriersExplanation" value={formData.projBarriersExplanation} onChange={e => handleFieldChange('projBarriersExplanation', e.target.value)} rows={5} wordLimit={200} /><AiDraftButton field="projBarriersExplanation" onGenerate={() => handleDraftSection('projBarriersExplanation', formData)} isLoading={isLoading} loadingField={loadingField} /></FormField>
                    <FormField label="Is this project part of a larger project?" htmlFor="isLargerProject">
                        <RadioGroup name="isLargerProject" selectedValue={formData.isLargerProject ? 'yes' : 'no'} onChange={val => handleFieldChange('isLargerProject', val === 'yes')} options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]} />
                    </FormField>
                    {formData.isLargerProject && (
                        <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 space-y-4">
                            <FormField label="What is the total project cost?" htmlFor="largerProjectTotalCost">
                                <Input type="number" step="0.01" id="largerProjectTotalCost" value={formData.largerProjectTotalCost || ''} onChange={e => handleFieldChange('largerProjectTotalCost', parseFloat(e.target.value) || 0)} />
                            </FormField>
                            <FormField label="How much funding have you secured from sources excluding OTF?" htmlFor="largerProjectSecuredFunding">
                                <Input type="number" step="0.01" id="largerProjectSecuredFunding" value={formData.largerProjectSecuredFunding || ''} onChange={e => handleFieldChange('largerProjectSecuredFunding', parseFloat(e.target.value) || 0)} />
                            </FormField>
                            <FormField label="List the sources of secured funding for this project and indicate how the funds will be used." htmlFor="largerProjectFundingSources">
                                <OtfLargerProjectFundingTable items={formData.largerProjectFundingSources || []} onChange={v => handleFieldChange('largerProjectFundingSources', v)} />
                            </FormField>
                            <FormField label="If applicable, what is your plan to obtain any unsecured funds required for this project?" htmlFor="largerProjectUnsecuredFundingPlan">
                                <TextareaWithCounter id="largerProjectUnsecuredFundingPlan" value={formData.largerProjectUnsecuredFundingPlan || ''} onChange={e => handleFieldChange('largerProjectUnsecuredFundingPlan', e.target.value)} rows={4} wordLimit={200} />
                            </FormField>
                        </div>
                    )}
                </div>
            );
            case 'budget': return (
                <div className="space-y-6">
                    <FormField label="Anticipated Beneficiaries" htmlFor="projAnticipatedBeneficiaries"><Input type="number" id="projAnticipatedBeneficiaries" value={formData.projAnticipatedBeneficiaries} onChange={e => handleFieldChange('projAnticipatedBeneficiaries', parseInt(e.target.value))} /></FormField>
                    <FormField label="Programs Impacted" htmlFor="projProgramsImpacted"><Input type="number" id="projProgramsImpacted" value={formData.projProgramsImpacted} onChange={e => handleFieldChange('projProgramsImpacted', parseInt(e.target.value))} /></FormField>
                    <FormField label="Staff/Volunteers Trained" htmlFor="projStaffVolunteersTrained"><Input type="number" id="projStaffVolunteersTrained" value={formData.projStaffVolunteersTrained} onChange={e => handleFieldChange('projStaffVolunteersTrained', parseInt(e.target.value))} /></FormField>
                    <FormField label="Plans/Reports Created" htmlFor="projPlansReportsCreated"><Input type="number" id="projPlansReportsCreated" value={formData.projPlansReportsCreated} onChange={e => handleFieldChange('projPlansReportsCreated', parseInt(e.target.value))} /></FormField>
                    <FormField label="Pilot Participants" htmlFor="projPilotParticipants"><Input type="number" id="projPilotParticipants" value={formData.projPilotParticipants} onChange={e => handleFieldChange('projPilotParticipants', parseInt(e.target.value))} /></FormField>
                    <FormField label="Project Plan Justification Intro" htmlFor="justificationIntro" instructions="Provide an introductory paragraph justifying the project's alignment with the Northern Services Boards Act, R.S.O. 1990, c. L.28. Max 250 words.">
                        <TextareaWithCounter id="justificationIntro" value={formData.justificationIntro} onChange={e => handleFieldChange('justificationIntro', e.target.value)} rows={5} wordLimit={250} />
                        <AiDraftButton field="justificationIntro" onGenerate={() => handleDraftSection('justificationIntro', formData)} isLoading={isLoading} loadingField={loadingField} />
                    </FormField>
                    <FormField label="Project Plan" htmlFor="projectPlan">
                        <OtfProjectPlanTable 
                            items={formData.projectPlan}
                            onChange={v => handleFieldChange('projectPlan', v)}
                            onGenerateJustification={(item, index) => handleGenerateJustification(item, formData).then(text => {if(text) handleFieldChange('projectPlan', produce(formData.projectPlan, d => {d[index].justification = text}))})}
                            isLoading={isLoading}
                            loadingField={loadingField}
                        />
                    </FormField>
                    <FormField label="Project Plan Justification Outro" htmlFor="justificationOutro" instructions="Provide a concluding paragraph summarizing the project's alignment and value. Max 250 words.">
                        <TextareaWithCounter id="justificationOutro" value={formData.justificationOutro} onChange={e => handleFieldChange('justificationOutro', e.target.value)} rows={5} wordLimit={250} />
                        <AiDraftButton field="justificationOutro" onGenerate={() => handleDraftSection('justificationOutro', formData)} isLoading={isLoading} loadingField={loadingField} />
                    </FormField>
                    <FormField label="Project Budget" htmlFor="budgetItems">
                        <OtfBudgetTable items={formData.budgetItems} onChange={v => handleFieldChange('budgetItems', v)} />
                    </FormField>
                     <FormField label="Quotes or Estimates" htmlFor="requiresQuotes">
                        <CheckboxGroup
                            name="requiresQuotes"
                            options={[{ value: 'yes', label: 'This application requires quotes and estimates and they have been provided below.' }]}
                            selectedValues={formData.requiresQuotes ? ['yes'] : []}
                            onChange={v => handleFieldChange('requiresQuotes', v.includes('yes'))}
                        />
                    </FormField>
                    {formData.requiresQuotes && (
                        <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                            <OtfQuotesTable items={formData.quotes || []} onChange={v => handleFieldChange('quotes', v)} />
                        </div>
                    )}
                </div>
            );
            case 'ack': return (
                <div className="space-y-6">
                    <FormField label="Confirmations" htmlFor="confirmFinancialManagement">
                        <CheckboxGroup 
                            name="confirmations" 
                            options={[
                                {value: 'financial', label: 'I confirm that the organization has financial management and conflict of interest policies in place.'}, 
                                {value: 'correct', label: 'I confirm that all the organization information provided is correct, up-to-date and complete.'}, 
                                {value: 'updated', label: 'I confirm that the correct type and year of financial statements have been uploaded and the Board of Directors table has been updated.'}
                            ]} 
                            selectedValues={[
                                ...(formData.confirmFinancialManagement ? ['financial'] : []), 
                                ...(formData.confirmInfoCorrect ? ['correct'] : []), 
                                ...(formData.confirmFinancialsUpdated ? ['updated'] : [])
                            ]} 
                            onChange={v => {
                                handleFieldChange('confirmFinancialManagement', v.includes('financial'));
                                handleFieldChange('confirmInfoCorrect', v.includes('correct'));
                                handleFieldChange('confirmFinancialsUpdated', v.includes('updated'));
                            }} 
                        />
                    </FormField>
                </div>
            );
        }
    }

    return (
        <form onSubmit={handleSave}>
            <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
                <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
                    <h1 className="text-2xl font-bold text-slate-900">{application.id.startsWith('new_') ? 'New' : 'Edit'} OTF Application</h1>
                    <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100">
                        <i className="fa-solid fa-times mr-2"></i>Close
                    </button>
                </div>
                
                <div className="grid grid-cols-12 gap-8">
                    <div className="col-span-12 lg:col-span-4 xl:col-span-3">
                         <div className="space-y-2 sticky top-20">
                             {TABS.map(tab => (
                                <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`w-full text-left p-3 rounded-md font-semibold text-sm transition-colors ${activeTab === tab.id ? 'bg-teal-100 text-teal-800' : 'text-slate-600 hover:bg-slate-100'}`}>
                                    {tab.label}
                                </button>
                             ))}
                        </div>
                    </div>

                    <div className="col-span-12 lg:col-span-8 xl:col-span-9">
                        <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                            <h3 className="font-semibold text-lg text-slate-700 mb-2">AI Content Generation</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                <FormField label="Context Project" htmlFor="context_project" instructions="Select a project to provide context for the AI.">
                                    <ProjectFilter value={selectedContextProjectId} onChange={setSelectedContextProjectId} allowAll={false} />
                                </FormField>
                                <div className="flex gap-2">
                                    <button type="button" onClick={handleLoadProjectData} disabled={!selectedContextProjectId || isLoading} className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 disabled:bg-slate-400">Load Data</button>
                                    <button type="button" onClick={handleDraftFullApplication} disabled={!selectedContextProjectId || isLoading} className="px-3 py-2 text-sm font-medium text-white bg-purple-600 rounded-md shadow-sm hover:bg-purple-700 disabled:bg-slate-400">
                                        <i className={`fa-solid ${loadingField === 'full_application' ? 'fa-spinner fa-spin' : 'fa-rocket'} mr-2`}></i>
                                        {loadingField === 'full_application' ? 'Drafting...' : 'Draft Full Application'}
                                    </button>
                                </div>
                            </div>
                        </div>
                        {renderContent()}
                    </div>
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

export default OtfEditor;
