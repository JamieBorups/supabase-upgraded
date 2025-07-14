
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { produce } from 'immer';
import { Content, GoogleGenAI, Type } from '@google/genai';
import { useAppContext } from '../../context/AppContext';
import { Select } from '../ui/Select';
import { InterestCompatibilityReport, BudgetItem, FormData as ProjectData } from '../../types';
import ConfirmationModal from '../ui/ConfirmationModal';
import { Input } from '../ui/Input';
import NotesModal from '../ui/NotesModal';
import * as api from '../../services/api';

const formatAiTextToHtml = (text: string = ''): string => {
    if (!text) return '';
    const sanitizedText = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    const paragraphs = sanitizedText.split(/\n\s*\n/);
    return paragraphs
        .filter(p => p.trim() !== '')
        .map(p => `<p>${p.trim().replace(/\n/g, '<br />')}</p>`)
        .join('');
};

const REPORT_SECTIONS: { 
    key: keyof Omit<InterestCompatibilityReport, 'id'|'projectId'|'createdAt'|'notes'|'fullReportText'>, 
    label: string, 
    chatPrompt: string, 
    reportPrompt: string,
    schema: any
}[] = [
    { 
        key: 'executiveSummary', 
        label: 'Executive Summary', 
        chatPrompt: 'Help me brainstorm an executive summary for this compatibility assessment.', 
        reportPrompt: 'Generate a detailed, multi-paragraph executive summary (minimum 250 words). This summary must serve as a strategic overview. It must begin by synthesizing the project\'s core mission from its description and background. Then, it must introduce the key stakeholder groups (e.g., collaborators, funders), referencing their roles. Following that, it must provide a high-level preview of the major areas of interest alignment and potential friction that will be detailed later in the report. Conclude with a forward-looking statement about the project\'s potential if these dynamics are managed effectively. The tone should be professional and insightful. Your entire response must be a single block of text with paragraphs separated by double newlines (\\n\\n).',
        schema: { type: Type.OBJECT, properties: { executiveSummary: { type: Type.STRING, description: "A detailed, multi-paragraph executive summary (minimum 250 words) that provides a strategic overview of the project's stakeholder dynamics, including key alignments, potential frictions, and a concluding statement. The text must use double newlines (\\n\\n) to separate paragraphs." } } }
    },
    { 
        key: 'stakeholderAnalysis', 
        label: 'Stakeholder Analysis', 
        chatPrompt: 'Help me identify the key stakeholders and their interests, considering their bios and roles.', 
        reportPrompt: 'Generate the "stakeholderAnalysis" section. For each key stakeholder, you must deduce a comprehensive list of their likely interests based on their provided bio, assigned tasks, and the project budget. Do not just list generic interests. For each stakeholder, provide at least 3-5 specific, detailed interests. For instance, instead of just "Financial accountability" for a funder, it could be "Ensuring grant funds are spent according to the proposed expense categories" or "Seeing measurable community engagement metrics". For an artist, instead of "artistic expression," it could be "Exploring themes of environmental justice through their specific medium" or "Receiving public recognition for their creative contribution". Be thorough and draw direct connections to the provided project context.',
        schema: {
          type: Type.OBJECT, properties: {
            stakeholderAnalysis: {
              type: Type.ARRAY,
              description: 'List of all key stakeholders and their inferred interests.',
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "The stakeholder's name or group." },
                  role: { type: Type.STRING, description: "The stakeholder's role in the project." },
                  interests: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of at least 3-5 specific, detailed interests for the stakeholder, justified by the project context." }
                },
                required: ['name', 'role', 'interests']
              }
            }
          }
        }
    },
    { 
        key: 'highCompatibilityAreas', 
        label: 'High Compatibility Areas', 
        chatPrompt: 'Help me brainstorm areas where stakeholder interests align.', 
        reportPrompt: 'Generate the "highCompatibilityAreas" section. For each identified area of strong synergy, you must provide a deeply detailed analysis. The "insight" field for each area must be a comprehensive, multi-paragraph explanation (at least 3-4 paragraphs), with paragraphs separated by double newlines (\\n\\n). It should explicitly state which stakeholders are involved, what specific interests of theirs are aligned, and how this alignment creates a powerful advantage for the project. Use the project context (description, budget, collaborator bios) to support your analysis with concrete examples.',
        schema: {
            type: Type.OBJECT, properties: {
                highCompatibilityAreas: {
                    type: Type.ARRAY, items: {
                        type: Type.OBJECT, properties: {
                            area: { type: Type.STRING, description: 'The area of synergy.' },
                            stakeholders: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Stakeholders involved in this synergy.' },
                            insight: { type: Type.STRING, description: 'A comprehensive, multi-paragraph (3-4 paragraphs minimum) explanation of the synergy, supported by concrete examples from the project context. Use double newlines (\\n\\n) to separate paragraphs.' },
                            followUpQuestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A list of 2-3 strategic, thought-provoking questions for team reflection.' },
                            guidance: { type: Type.STRING, description: 'A concrete suggestion for how to use the AI to act on this insight.' }
                        }, required: ['area', 'stakeholders', 'insight', 'followUpQuestions', 'guidance']
                    }
                }
            }
        }
    },
    { 
        key: 'potentialConflicts', 
        label: 'Potential Conflicts', 
        chatPrompt: 'Help me think about potential conflicts or misalignments.', 
        reportPrompt: 'Generate the "potentialConflicts" section as a critical risk analysis. For each potential conflict, provide a very detailed breakdown. The "insight" and "mitigation" fields must be multi-paragraph explorations (at least 3-4 paragraphs each), with paragraphs separated by double newlines (\\n\\n). The insight should detail the conflict\'s root cause, and the mitigation must offer a step-by-step strategy to address it. The "followUpQuestions" and "guidance" should be equally thoughtful and specific.',
        schema: {
            type: Type.OBJECT, properties: {
                potentialConflicts: {
                    type: Type.ARRAY, items: {
                        type: Type.OBJECT, properties: {
                            area: { type: Type.STRING, description: 'The area of potential conflict.' },
                            stakeholders: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Stakeholders involved in this conflict.' },
                            insight: { type: Type.STRING, description: 'A multi-paragraph (3-4 paragraphs minimum) exploration of the conflict\'s root cause. Use double newlines (\\n\\n) to separate paragraphs.' },
                            mitigation: { type: Type.STRING, description: 'A detailed, multi-paragraph strategy with step-by-step guidance for mitigating the conflict. Use double newlines (\\n\\n) to separate paragraphs.' },
                            followUpQuestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A list of 2-3 specific, difficult questions for team conversation.' },
                            guidance: { type: Type.STRING, description: 'A concrete suggestion for how the AI can help mediate or create alternatives.' }
                        }, required: ['area', 'stakeholders', 'insight', 'mitigation', 'followUpQuestions', 'guidance']
                    }
                }
            }
        }
    },
    { 
        key: 'actionableRecommendations', 
        label: 'Actionable Recommendations', 
        chatPrompt: 'Help me brainstorm some concrete next steps based on this analysis.', 
        reportPrompt: 'Generate "actionableRecommendations". Each recommendation in the array must be a full, detailed paragraph. Do not provide a simple to-do list. Each recommendation should be a strategic initiative that synthesizes findings from the entire analysis. For example, a recommendation shouldn\'t be "Hold a meeting," but rather, "Convene a project kick-off meeting focused on establishing shared goals. The agenda should include a review of the high-compatibility areas to build early momentum and an open discussion of the potential conflicts, using the mitigation strategies as a starting point for dialogue." Provide at least 3-5 such detailed, paragraph-length recommendations.',
        schema: {
            type: Type.OBJECT, properties: {
                actionableRecommendations: { type: Type.ARRAY, description: "A list of at least 3-5 strategic, high-level action items, where each item is a full, detailed paragraph.", items: { type: Type.STRING } }
            }
        }
    },
];

interface Message {
    id: string;
    sender: 'user' | 'ai' | 'system';
    text: string;
}

const ReportSectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <h4 className="font-bold text-base text-slate-800 border-b border-slate-300 pb-2 mb-3">{title}</h4>
        {children}
    </div>
);

const ReportDisplay: React.FC<{ report: Partial<InterestCompatibilityReport> }> = ({ report }) => {
    return (
        <div className="space-y-4 text-sm prose prose-slate max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5">
            {report.executiveSummary && (
                <ReportSectionCard title="Executive Summary">
                    <div className="text-slate-700 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatAiTextToHtml(report.executiveSummary) }}></div>
                </ReportSectionCard>
            )}
            {report.stakeholderAnalysis && Array.isArray(report.stakeholderAnalysis) && (
                 <ReportSectionCard title="Stakeholder Analysis">
                    <ul className="space-y-2">
                        {report.stakeholderAnalysis.map((s, i) => (
                            <li key={i} className="p-2 bg-white border border-slate-200 rounded">
                                <p className="font-semibold">{s.name} <span className="text-xs font-normal text-slate-500">- {s.role}</span></p>
                                <ul className="list-disc list-inside text-xs text-slate-600 pl-2">
                                    {Array.isArray(s.interests) && s.interests.map((interest, j) => <li key={j}>{interest}</li>)}
                                </ul>
                            </li>
                        ))}
                    </ul>
                </ReportSectionCard>
            )}
             {report.highCompatibilityAreas && Array.isArray(report.highCompatibilityAreas) && (
                <ReportSectionCard title="High Compatibility Areas">
                    <ul className="space-y-3">
                        {report.highCompatibilityAreas.map((item, i) => (
                           <li key={i} className="p-3 bg-white border border-slate-200 rounded-lg space-y-3">
                                <div className="flex items-start gap-3">
                                    <i className="fa-solid fa-check-circle text-green-500 mt-1" aria-hidden="true"></i>
                                    <div>
                                        <p className="font-semibold text-slate-800">{item.area}</p>
                                        <p className="text-xs text-slate-600">Stakeholders: {Array.isArray(item.stakeholders) ? item.stakeholders.join(', ') : ''}</p>
                                    </div>
                                </div>
                                <div className="pl-3 border-l-2 border-slate-300"><h5 className="text-xs font-bold uppercase text-slate-500">Insight</h5><div className="text-sm text-slate-700 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatAiTextToHtml(item.insight) }}></div></div>
                                <div className="pl-3 border-l-2 border-green-300"><h5 className="text-xs font-bold uppercase text-green-600">Follow-up Questions</h5><ul className="list-disc list-inside text-sm text-slate-700 space-y-1 mt-1">{Array.isArray(item.followUpQuestions) && item.followUpQuestions.map((q, qi) => <li key={qi}>{q}</li>)}</ul></div>
                                <div className="pl-3 border-l-2 border-purple-300"><h5 className="text-xs font-bold uppercase text-purple-600">AI Guidance</h5><p className="text-sm text-slate-700 whitespace-pre-wrap">{item.guidance}</p></div>
                           </li>
                        ))}
                    </ul>
                </ReportSectionCard>
            )}
            {report.potentialConflicts && Array.isArray(report.potentialConflicts) && (
                <ReportSectionCard title="Potential Conflicts">
                   <ul className="space-y-3">
                        {report.potentialConflicts.map((item, i) => (
                           <li key={i} className="p-3 bg-white border border-slate-200 rounded-lg space-y-3">
                               <div className="flex items-start gap-3">
                                    <i className="fa-solid fa-triangle-exclamation text-amber-500 mt-1" aria-hidden="true"></i>
                                    <div>
                                        <p className="font-semibold text-slate-800">{item.area}</p>
                                        <p className="text-xs text-slate-600">Stakeholders: {Array.isArray(item.stakeholders) ? item.stakeholders.join(', ') : ''}</p>
                                    </div>
                               </div>
                                <div className="pl-3 border-l-2 border-slate-300"><h5 className="text-xs font-bold uppercase text-slate-500">Insight</h5><div className="text-sm text-slate-700 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatAiTextToHtml(item.insight) }}></div></div>
                                <div className="pl-3 border-l-2 border-slate-300"><h5 className="text-xs font-bold uppercase text-slate-500">Mitigation</h5><div className="text-sm text-slate-700 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatAiTextToHtml(item.mitigation) }}></div></div>
                                <div className="pl-3 border-l-2 border-green-300"><h5 className="text-xs font-bold uppercase text-green-600">Follow-up Questions</h5><ul className="list-disc list-inside text-sm text-slate-700 space-y-1 mt-1">{Array.isArray(item.followUpQuestions) && item.followUpQuestions.map((q, qi) => <li key={qi}>{q}</li>)}</ul></div>
                                <div className="pl-3 border-l-2 border-purple-300"><h5 className="text-xs font-bold uppercase text-purple-600">AI Guidance</h5><p className="text-sm text-slate-700 whitespace-pre-wrap">{item.guidance}</p></div>
                           </li>
                        ))}
                    </ul>
                </ReportSectionCard>
            )}
             {report.actionableRecommendations && Array.isArray(report.actionableRecommendations) && (
                <ReportSectionCard title="Actionable Recommendations">
                    <div className="text-slate-700 space-y-2 pl-2">
                        {report.actionableRecommendations.map((item, i) => <div key={i} className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatAiTextToHtml(item) }}></div>)}
                    </div>
                </ReportSectionCard>
            )}
        </div>
    );
};

const generateFormattedHtml = (reportData: Partial<InterestCompatibilityReport>, selectedProject: ProjectData | undefined): string => {
    if (!reportData || !selectedProject) return '';
    let html = `<h1>Interest Compatibility Assessment Report for: ${selectedProject.projectTitle}</h1>`;

    if (reportData.executiveSummary) {
        html += `<h2>Executive Summary</h2>${formatAiTextToHtml(reportData.executiveSummary)}`;
    }
    if (Array.isArray(reportData.stakeholderAnalysis)) {
        html += `<h2>Stakeholder Analysis</h2>`;
        reportData.stakeholderAnalysis.forEach(s => {
            html += `<h3>${s.name} (${s.role})</h3><ul>`;
            (s.interests || []).forEach(i => { html += `<li>${i}</li>`; });
            html += `</ul>`;
        });
    }
    if (Array.isArray(reportData.highCompatibilityAreas)) {
        html += `<h2>High Compatibility Areas</h2>`;
        reportData.highCompatibilityAreas.forEach(item => {
            html += `<h3>${item.area}</h3><p><strong>Stakeholders:</strong> ${Array.isArray(item.stakeholders) ? item.stakeholders.join(', ') : ''}</p><div><strong>Insight:</strong> ${formatAiTextToHtml(item.insight)}</div>`;
        });
    }
    if (Array.isArray(reportData.potentialConflicts)) {
        html += `<h2>Potential Conflicts</h2>`;
        reportData.potentialConflicts.forEach(item => {
            html += `<h3>${item.area}</h3><p><strong>Stakeholders:</strong> ${Array.isArray(item.stakeholders) ? item.stakeholders.join(', ') : ''}</p><div><strong>Insight:</strong> ${formatAiTextToHtml(item.insight)}</div><div><strong>Mitigation:</strong> ${formatAiTextToHtml(item.mitigation)}</div>`;
        });
    }
    if (Array.isArray(reportData.actionableRecommendations)) {
        html += `<h2>Actionable Recommendations</h2>`;
        reportData.actionableRecommendations.forEach(item => { html += formatAiTextToHtml(item); });
    }
    return html;
};

const InterestCompatibilityPage: React.FC = () => {
    const { state, dispatch, notify } = useAppContext();
    const { projects, members, tasks } = state;

    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [reportData, setReportData] = useState<Partial<InterestCompatibilityReport>>({});
    const [loadingSection, setLoadingSection] = useState<string | null>(null);
    const [isGeneratingFullReport, setIsGeneratingFullReport] = useState(false);
    const [isClearModalOpen, setIsClearModalOpen] = useState(false);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    
    // Chat state
    const [messages, setMessages] = useState<Message[]>([]);
    const [chatIsLoading, setChatIsLoading] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [activeChatTopic, setActiveChatTopic] = useState<string | null>(null);

    const chatEndRef = useRef<HTMLDivElement>(null);
    const hasInitialized = useRef(false);

    useEffect(() => {
        if (!hasInitialized.current) {
            setMessages([{ id: `sys_${Date.now()}`, sender: 'system', text: 'Select a project and a topic to begin your assessment.' }]);
            hasInitialized.current = true;
        }
    }, []);

    const projectOptions = useMemo(() => [
        { value: '', label: 'Select a project to assess...' },
        ...projects.map(p => ({ value: p.id, label: p.projectTitle }))
    ], [projects]);

    const selectedProject = useMemo(() => projects.find(p => p.id === selectedProjectId), [selectedProjectId, projects]);

    const handleProjectChange = (projectId: string) => {
        setSelectedProjectId(projectId);
        setReportData({});
        setMessages([{ id: `sys_${Date.now()}`, sender: 'system', text: 'Select a topic to begin your assessment.' }]);
        setActiveChatTopic(null);
    };

    const constructContextPrompt = useCallback((basePrompt: string) => {
        if (!selectedProject) return basePrompt;
        const project = selectedProject;
        
        const collaboratorDetails = project.collaboratorDetails.map(c => {
            const member = members.find(m => m.id === c.memberId);
            return member ? { name: `${member.firstName} ${member.lastName}`, role: c.role, bio: member.shortBio } : { name: `Unknown Member`, role: c.role, bio: 'N/A' };
        });
        
        const projectTasks = tasks.filter(t => t.projectId === selectedProjectId);
        const taskSummary = projectTasks.reduce((acc, task) => {
            const status = task.status || 'Backlog';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        let budgetSummary = { totalRevenue: 0, totalExpenses: 0, expenseBreakdown: {} as Record<string, number> };
        if (project.budget) {
            const sumItems = (items: BudgetItem[] = []) => items.reduce((sum, item) => sum + (item.amount || 0), 0);
            budgetSummary.totalRevenue = Object.values(project.budget.revenues).reduce((sum, category) => Array.isArray(category) ? sum + sumItems(category) : sum, 0);
            budgetSummary.totalExpenses = Object.values(project.budget.expenses).reduce((sum, category) => sum + sumItems(category), 0);
            Object.entries(project.budget.expenses).forEach(([categoryKey, items]) => {
                budgetSummary.expenseBreakdown[categoryKey] = sumItems(items);
            });
        }

        const context = {
            project: { title: project.projectTitle, description: project.projectDescription, background: project.background, schedule: project.schedule, audience: project.audience },
            collaborators: collaboratorDetails,
            tasks: { summary: taskSummary, totalTasks: projectTasks.length },
            budget: budgetSummary,
        };
        return `${basePrompt}\n\n### PROJECT CONTEXT ###\n${JSON.stringify(context, null, 2)}`;
    }, [selectedProject, members, tasks]);
    
    // --- CHAT LOGIC ---
    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const handleChatRequest = async (prompt: string, userMessageText: string) => {
        setChatIsLoading(true);
        const updatedConversation = produce(messages, draft => {
            draft.push({ id: `user_${Date.now()}`, sender: 'user', text: userMessageText });
        });
        setMessages(updatedConversation);

        const history = updatedConversation.filter(m => m.sender !== 'system').map(m => ({
            role: m.sender === 'user' ? 'user' : 'model', parts: [{ text: m.text }]
        })) as Content[];
        
        try {
            const finalPrompt = constructContextPrompt(prompt);
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
            const response = await ai.models.generateContent({
                model: state.settings.ai.personas.interestCompatibility.model,
                contents: [{ role: 'user', parts: [{text: finalPrompt}] }],
                config: {
                    systemInstruction: state.settings.ai.personas.interestCompatibility.instructions,
                    temperature: state.settings.ai.personas.interestCompatibility.temperature,
                }
            });

            setMessages(prev => [...prev, { id: `ai_${Date.now()}`, sender: 'ai', text: response.text }]);
        } catch (error: any) {
            setMessages(prev => [...prev, { id: `err_${Date.now()}`, sender: 'ai', text: `Error: ${error.message}` }]);
        } finally {
            setChatIsLoading(false);
        }
    };
    
    const handleChatTopic = (topic: typeof REPORT_SECTIONS[0]) => {
        if (loadingSection || isGeneratingFullReport) return;
        setActiveChatTopic(topic.label);
        const userMessage = `Let's discuss the "${topic.label}" section of my project.`;
        setMessages([{ id: `sys_topic_${Date.now()}`, sender: 'system', text: `Now chatting about: ${topic.label}` }]);
        handleChatRequest(topic.chatPrompt, userMessage);
    };

    const handleUserInputSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || chatIsLoading || !activeChatTopic) return;
        handleChatRequest(userInput, userInput);
        setUserInput('');
    };

    // --- REPORT GENERATION LOGIC ---
    const handleGenerateSection = async (section: typeof REPORT_SECTIONS[0], isFullReportMode = false) => {
        if (!selectedProject || loadingSection || isGeneratingFullReport) return;
        if(!isFullReportMode) setLoadingSection(section.key);

        try {
            const finalPrompt = constructContextPrompt(section.reportPrompt);
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
            const response = await ai.models.generateContent({
                model: state.settings.ai.personas.interestCompatibility.model,
                contents: [{role: 'user', parts: [{text: finalPrompt}]}],
                config: {
                    responseMimeType: "application/json",
                    responseSchema: section.schema,
                    temperature: state.settings.ai.personas.interestCompatibility.temperature,
                    systemInstruction: state.settings.ai.personas.interestCompatibility.instructions,
                }
            });
            
            const parsedResult = JSON.parse(response.text);

            if (!parsedResult || typeof parsedResult !== 'object' || !(section.key in parsedResult)) {
                throw new Error(`AI response did not contain the expected '${section.key}' field.`);
            }

            setReportData(prev => ({ ...prev, ...parsedResult }));
            if(!isFullReportMode) notify(`${section.label} generated successfully.`, 'success');

        } catch (error: any) {
            console.error(`Failed to generate section ${section.key}:`, error);
            const errorMessage = `Error generating ${section.label}: ${error.message}`;
            if(!isFullReportMode) notify(errorMessage, 'error');
            else throw new Error(errorMessage);
        } finally {
            if(!isFullReportMode) setLoadingSection(null);
        }
    };
    
    const handleGenerateFullReport = async () => {
        if (!selectedProject || loadingSection || isGeneratingFullReport) return;
        setIsGeneratingFullReport(true);
        setReportData({});
        setActiveChatTopic(null);
        setMessages([{ id: `sys_${Date.now()}`, sender: 'system', text: 'Generating full report... This may take a moment.' }]);
        
        for (const section of REPORT_SECTIONS) {
            setLoadingSection(section.key);
            try {
                await handleGenerateSection(section, true);
            } catch (error: any) {
                notify(error.message, 'error');
                break;
            }
        }
        setLoadingSection(null);
        setIsGeneratingFullReport(false);
        setMessages(prev => [...prev, { id: `sys_done_${Date.now()}`, sender: 'system', text: 'Full report generated.' }]);
        notify('Full report generated successfully!', 'success');
    };

    const handleClearReport = () => {
        setReportData({});
        setIsClearModalOpen(false);
        notify('Report cleared.', 'info');
    };
    
    const handleCopyToClipboard = () => {
        const reportDiv = document.getElementById('ic-report-content');
        if(reportDiv) {
            navigator.clipboard.writeText(reportDiv.innerText);
            notify('Report copied to clipboard!', 'success');
        }
    };
    
    const handleSaveReport = async (notes: string) => {
        if (!selectedProjectId) return;
        const finalReport: Omit<InterestCompatibilityReport, 'id'|'createdAt'> = {
            projectId: selectedProjectId,
            notes,
            executiveSummary: reportData.executiveSummary,
            stakeholderAnalysis: reportData.stakeholderAnalysis,
            highCompatibilityAreas: reportData.highCompatibilityAreas,
            potentialConflicts: reportData.potentialConflicts,
            actionableRecommendations: reportData.actionableRecommendations,
            fullReportText: generateFormattedHtml(reportData, selectedProject),
        };
        
        try {
            const savedReport = await api.addInterestCompatibilityReport(finalReport);
            dispatch({ type: 'ADD_INTEREST_COMPATIBILITY_REPORT', payload: savedReport });
            notify('Compatibility report saved successfully!', 'success');
        } catch(error: any) {
            notify(`Error saving report: ${error.message}`, 'error');
        } finally {
            setIsSaveModalOpen(false);
        }
    };

    return (
        <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
            {isClearModalOpen && ( <ConfirmationModal isOpen={isClearModalOpen} onClose={() => setIsClearModalOpen(false)} onConfirm={handleClearReport} title="Clear Assessment" message="Are you sure you want to clear the current report?" /> )}
            {isSaveModalOpen && (
                <NotesModal
                    isOpen={isSaveModalOpen}
                    onClose={() => setIsSaveModalOpen(false)}
                    onSave={handleSaveReport}
                    title="Save Compatibility Report"
                />
             )}

            <h1 className="text-3xl font-bold text-slate-900">Interest Compatibility Assessment</h1>
            <p className="text-slate-500 mt-1 mb-6">Select a project to generate an AI-powered assessment of stakeholder interest alignment.</p>
            
            <div className="max-w-md mb-8">
                <Select value={selectedProjectId} onChange={(e) => handleProjectChange(e.target.value)} options={projectOptions} />
            </div>

            {!selectedProjectId ? (
                <div className="text-center py-20 text-slate-500"><i className="fa-solid fa-arrow-up text-6xl text-slate-300"></i><h3 className="mt-4 text-lg font-medium">Please select a project to begin.</h3></div>
            ) : (
                <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Controls */}
                    <div className="lg:col-span-1">
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Assessment Builder</h3>
                        <div className=" bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                            <button onClick={handleGenerateFullReport} disabled={!!loadingSection || isGeneratingFullReport} className="w-full p-3 border rounded-lg text-left transition-all duration-200 font-semibold bg-purple-600 text-white hover:bg-purple-700 disabled:bg-slate-400 flex justify-between items-center">
                                <span><i className="fa-solid fa-file-invoice mr-3"></i>Generate Full Report</span>
                                {isGeneratingFullReport && !loadingSection && <i className="fa-solid fa-spinner fa-spin"></i>}
                            </button>
                            <div className="relative py-2"><div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-slate-300"></div></div><div className="relative flex justify-center"><span className="bg-slate-50 px-2 text-sm text-slate-500">Or work section by section</span></div></div>
                            {REPORT_SECTIONS.map(section => (
                                <div key={section.key} className="p-3 border rounded-lg bg-white border-slate-300">
                                    <p className="font-semibold text-slate-800">{section.label}</p>
                                    <div className="flex gap-2 mt-2">
                                        <button onClick={() => handleChatTopic(section)} disabled={!!loadingSection || isGeneratingFullReport} className="flex-1 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-md hover:bg-slate-100 disabled:opacity-60 flex items-center justify-center gap-2">
                                            <i className="fa-solid fa-comments"></i>Chat
                                        </button>
                                        <button onClick={() => handleGenerateSection(section)} disabled={!!loadingSection || isGeneratingFullReport} className="flex-1 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 border rounded-md hover:bg-blue-700 disabled:bg-slate-400 flex items-center justify-center gap-2">
                                            {loadingSection === section.key ? <><i className="fa-solid fa-spinner fa-spin"></i>Generating...</> : <><i className="fa-solid fa-wand-magic-sparkles"></i>Generate</>}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                     {/* Right Column: Chat */}
                    <div className="lg:col-span-2 lg:h-[75vh] flex flex-col bg-slate-100 p-2 rounded-lg border border-slate-200">
                         <h3 className="text-sm font-bold text-slate-800 mb-2 px-2 flex-shrink-0">{activeChatTopic ? `Chatting about: ${activeChatTopic}` : 'AI Chat'}</h3>
                         <div ref={chatEndRef} className="flex-grow bg-white rounded-md p-3 text-sm text-slate-700 space-y-4 overflow-y-auto min-h-96">
                            {messages.map(msg => (
                                <div key={msg.id}>
                                    {msg.sender === 'system' && <p className="text-xs text-center italic text-slate-500 p-2">{msg.text}</p>}
                                    {msg.sender === 'user' && <div className="flex justify-end"><p className="bg-blue-200 rounded-lg px-3 py-2 inline-block max-w-xl text-blue-900">{msg.text}</p></div>}
                                    {msg.sender === 'ai' && <div className="flex justify-start"><div className="bg-slate-200 text-slate-800 rounded-lg px-3 py-2 inline-block max-w-xl whitespace-pre-wrap font-sans">{msg.text}</div></div>}
                                </div>
                            ))}
                            {chatIsLoading && <div className="flex items-center gap-2 text-slate-500 p-2"><i className="fa-solid fa-spinner fa-spin"></i><span>AI is thinking...</span></div>}
                         </div>
                         <form onSubmit={handleUserInputSubmit} className="mt-2 pt-2 border-t border-slate-300 flex gap-2 flex-shrink-0">
                            <Input type="text" value={userInput} onChange={e => setUserInput(e.target.value)} placeholder="Type a follow-up message..." className="flex-grow" disabled={chatIsLoading || !activeChatTopic} />
                            <button type="submit" disabled={chatIsLoading || !userInput.trim() || !activeChatTopic} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 disabled:bg-slate-400">Send</button>
                        </form>
                    </div>
                </div>

                {/* Full-width report display at the bottom */}
                {reportData && Object.keys(reportData).length > 0 && (
                <div id="ic-report-content" className="mt-12 pt-8 border-t-2 border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-slate-800">Generated Assessment Report</h2>
                        <div className="flex gap-2">
                             <button onClick={() => setIsSaveModalOpen(true)} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"><i className="fa-solid fa-save mr-2"></i>Save Report</button>
                             <button onClick={handleCopyToClipboard} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-md hover:bg-slate-300"><i className="fa-solid fa-copy mr-2"></i>Copy to Clipboard</button>
                             <button onClick={() => setIsClearModalOpen(true)} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"><i className="fa-solid fa-trash-alt mr-2"></i>Clear Report</button>
                        </div>
                    </div>
                    <div className="space-y-4 p-6 border rounded-lg bg-white shadow-md">
                       <ReportDisplay report={reportData} />
                    </div>
                </div>
            )}
            </>
            )}
        </div>
    );
};

export default InterestCompatibilityPage;
