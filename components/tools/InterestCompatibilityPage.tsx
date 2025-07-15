
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { produce } from 'immer';
import { GoogleGenAI, Content } from "@google/genai";
import { marked } from 'https://esm.sh/marked@13.0.2';
import { useAppContext } from '../../context/AppContext';
import { InterestCompatibilityReport, FormData as ProjectData, AppSettings, Member, ResearchPlan } from '../../types';
import ConfirmationModal from '../ui/ConfirmationModal';
import NotesModal from '../ui/NotesModal';
import * as api from '../../services/api';
import { getInterestCompatibilityContext } from '../../services/interestCompatibilityService';
import { generateInterestCompatibilitySection } from '../../services/ai/interestCompatibilityGenerator';
import { REPORT_SECTIONS } from '../../constants';
import ProjectFilter from '../ui/ProjectFilter';
import { generateInterestCompatibilityPdf } from '../../utils/pdfGenerator';
import { Input } from '../ui/Input';

// --- HELPER COMPONENTS ---

const ReportSectionViewer: React.FC<{ sectionKey: string; content: any }> = ({ sectionKey, content }) => {
    if (!content) return <p className="italic text-slate-500">No content generated.</p>;
    const createMarkup = (text: string) => ({ __html: marked.parse(text) as string });

    switch(sectionKey) {
        case 'executiveSummary':
            return <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={createMarkup(content)} />;
        
        case 'stakeholderAnalysis':
            return (
                <div className="space-y-4">
                    {content.map((stakeholder: any, index: number) => (
                        <div key={index} className="p-3 bg-white border border-slate-200 rounded-md">
                            <h4 className="font-semibold text-md text-slate-700">{stakeholder.name} - <span className="font-normal italic">({stakeholder.role})</span></h4>
                            <ul className="list-disc list-inside pl-4 mt-1 space-y-1 text-slate-600">
                                {stakeholder.interests.map((interest: string, i: number) => <li key={i}>{interest}</li>)}
                            </ul>
                        </div>
                    ))}
                </div>
            );
            
        case 'highCompatibilityAreas':
        case 'potentialConflicts':
            return (
                <div className="space-y-4">
                    {content.map((area: any, index: number) => (
                         <div key={index} className="p-3 bg-white border border-slate-200 rounded-md">
                            <h4 className="font-semibold text-md text-slate-800">{area.area}</h4>
                            <p className="text-xs text-slate-500 font-medium mb-2">Stakeholders: {area.stakeholders.join(', ')}</p>
                            <div className="prose prose-sm max-w-none text-slate-600" dangerouslySetInnerHTML={createMarkup(area.insight)}/>
                            {sectionKey === 'potentialConflicts' && (
                                <>
                                    <h5 className="font-semibold text-sm mt-3 text-slate-700">Mitigation Strategy:</h5>
                                    <div className="prose prose-sm max-w-none text-slate-600" dangerouslySetInnerHTML={createMarkup(area.mitigation)}/>
                                </>
                            )}
                             <h5 className="font-semibold text-sm mt-3 text-slate-700">Guidance:</h5>
                            <p className="text-sm text-slate-600 italic">"{area.guidance}"</p>
                            <h5 className="font-semibold text-sm mt-3 text-slate-700">Follow-up Questions:</h5>
                            <ul className="list-disc list-inside pl-4 mt-1 space-y-1 text-sm text-slate-600">
                                {area.followUpQuestions.map((q: string, i: number) => <li key={i}>{q}</li>)}
                            </ul>
                        </div>
                    ))}
                </div>
            );

        case 'actionableRecommendations':
             return (
                <ul className="list-decimal list-inside space-y-2 text-slate-700">
                    {content.map((rec: string, index: number) => <li key={index} dangerouslySetInnerHTML={createMarkup(rec)} />)}
                </ul>
            );

        default:
            return <pre className="text-xs bg-slate-800 text-white p-2 rounded-md overflow-x-auto">{JSON.stringify(content, null, 2)}</pre>;
    }
};

interface ChatMessage {
    id: string;
    sender: 'user' | 'ai';
    text: string;
}

const AiMessage: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const { notify } = useAppContext();

    const handleCopy = () => {
        if (contentRef.current?.innerText) {
            navigator.clipboard.writeText(contentRef.current.innerText);
            notify('Copied to clipboard!', 'success');
        }
    };
    
    return (
        <div className="group relative">
            <div ref={contentRef} className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: marked.parse(message.text) }} />
            <button onClick={handleCopy} className="absolute -top-2 -right-2 p-1.5 bg-slate-200 text-slate-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" title="Copy text">
                <i className="fa-regular fa-copy fa-sm"></i>
            </button>
        </div>
    );
};

const ChatAssistant: React.FC<{ project: ProjectData | undefined, members: Member[], researchPlans: ResearchPlan[], settings: AppSettings }> = ({ project, members, researchPlans, settings }) => {
    const [history, setHistory] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const { notify } = useAppContext();

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [history, isLoading]);
    
    useEffect(() => {
        setHistory([]);
    }, [project?.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading && project) {
            const userMessage = input.trim();
            setInput('');
            setHistory(prev => [...prev, { id: `user_${Date.now()}`, sender: 'user', text: userMessage }]);
            setIsLoading(true);
            
            const context = getInterestCompatibilityContext(project, members, researchPlans);
            const finalPrompt = `The user is asking a general question related to the project's interest compatibility. Your role is a helpful, encouraging brainstorming partner. Keep your answers concise and focused on the user's query.\n\nUser's message: "${userMessage}"\n\n### PROJECT CONTEXT ###\n${JSON.stringify(context, null, 2)}`;
            
            const aiHistory = [...history, { id: `user_temp`, sender: 'user', text: userMessage }].map(m => ({
                role: m.sender,
                parts: [{ text: m.text }]
            })) as Content[];

            try {
                const ai = new GoogleGenAI({apiKey: process.env.API_KEY as string});
                const response = await ai.models.generateContent({
                    model: settings.ai.personas.interestCompatibility.model,
                    contents: aiHistory,
                    config: { temperature: 0.8, systemInstruction: "You are a helpful brainstorming assistant for arts projects." }
                });
                
                setHistory(prev => [...prev, { id: `ai_${Date.now()}`, sender: 'ai', text: response.text }]);
            } catch(error: any) {
                 if (error.message && error.message.includes('role')) {
                    notify('A chat mapping error occurred. Please try your message again.', 'error');
                } else {
                    notify(`Chat error: ${error.message}`, 'error');
                }
                setHistory(prev => prev.slice(0, -1)); // Remove the user's message on error
            } finally {
                setIsLoading(false);
            }
        }
    };
    
    return (
        <div className="flex flex-col h-full bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div ref={chatEndRef} className="flex-grow overflow-y-auto pr-2 mb-3 scrollbar-hide">
                {history.length === 0 && (
                    <p className="text-center text-sm text-slate-500 italic pt-32">Ask a question to start brainstorming about this project's stakeholder compatibility...</p>
                )}
                <div className="space-y-4">
                    {history.map(msg => (
                        <div key={msg.id} className="p-3">
                           <div className="flex items-start gap-3">
                                <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${msg.sender === 'user' ? 'bg-blue-600' : 'bg-purple-600'}`}>
                                    <i className={`fa-solid ${msg.sender === 'user' ? 'fa-user' : 'fa-robot'} text-white`}></i>
                                </div>
                                <div className="flex-grow bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                    <p className="font-bold text-xs uppercase tracking-wide mb-2 text-slate-500">{msg.sender === 'user' ? 'You' : 'AI'}</p>
                                     {msg.sender === 'ai' ? <AiMessage message={msg} /> : <p>{msg.text}</p>}
                                </div>
                           </div>
                        </div>
                    ))}
                </div>
                {isLoading && (
                    <div className="p-3 flex items-start gap-3">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-purple-600">
                             <i className="fa-solid fa-robot text-white"></i>
                        </div>
                         <p className="text-sm text-slate-500 italic p-3">
                             <i className="fa-solid fa-spinner fa-spin mr-2"></i>Thinking...
                         </p>
                    </div>
                )}
            </div>
             <form onSubmit={handleSubmit} className="flex-shrink-0 flex gap-2 pt-4 border-t border-slate-200">
                <Input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask a question..." disabled={isLoading} className="flex-grow" />
                <button type="submit" disabled={isLoading || !input.trim()} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 disabled:bg-slate-400">Send</button>
            </form>
        </div>
    );
};

// --- MAIN PAGE ---

const InterestCompatibilityPage: React.FC = () => {
    const { state, dispatch, notify } = useAppContext();
    const { projects, members, researchPlans } = state;
    const reportContainerRef = useRef<HTMLDivElement>(null);

    const [activeTab, setActiveTab] = useState<'report' | 'chat'>('report');
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [generatedSections, setGeneratedSections] = useState<Partial<InterestCompatibilityReport>>({});
    const [loadingSection, setLoadingSection] = useState<string | null>(null);
    const [isGeneratingFullReport, setIsGeneratingFullReport] = useState(false);
    
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isClearModalOpen, setIsClearModalOpen] = useState(false);

    const selectedProject = useMemo(() => projects.find(p => p.id === selectedProjectId), [selectedProjectId, projects]);

    const handleProjectChange = (projectId: string) => {
        setSelectedProjectId(projectId);
        setGeneratedSections({});
    };

    const handleGenerateSection = async (section: typeof REPORT_SECTIONS[0], isFullReportMode = false) => {
        if (!selectedProject || loadingSection || isGeneratingFullReport) return;
        if (!isFullReportMode) setLoadingSection(section.key);

        try {
            const context = getInterestCompatibilityContext(selectedProject, members, researchPlans);
            const sectionData = await generateInterestCompatibilitySection(context, state.settings.ai, section.key as keyof AppSettings['ai']['interestCompatibilitySectionSettings']);
            
            setGeneratedSections(prev => ({ ...prev, ...sectionData }));
            if (!isFullReportMode) notify(`${section.label} generated successfully.`, 'success');

        } catch (error: any) {
            console.error(`Failed to generate section ${section.key}:`, error);
            const errorMessage = `Error generating ${section.label}: ${error.message}`;
            if (!isFullReportMode) notify(errorMessage, 'error');
            else throw new Error(errorMessage);
        } finally {
            if (!isFullReportMode) setLoadingSection(null);
        }
    };
    
    const handleGenerateFullReport = async () => {
        if (!selectedProject || loadingSection || isGeneratingFullReport) return;
        setIsGeneratingFullReport(true);
        setGeneratedSections({});
        
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
        notify('Full report generated successfully!', 'success');
    };

    const handleSaveReport = async (notes: string) => {
        if (!selectedProjectId || !selectedProject) return;
        
        const finalReport: Omit<InterestCompatibilityReport, 'id'|'createdAt'> = {
            projectId: selectedProjectId,
            notes,
            executiveSummary: generatedSections.executiveSummary,
            stakeholderAnalysis: generatedSections.stakeholderAnalysis,
            highCompatibilityAreas: generatedSections.highCompatibilityAreas,
            potentialConflicts: generatedSections.potentialConflicts,
            actionableRecommendations: generatedSections.actionableRecommendations,
            fullReportText: reportContainerRef.current?.innerHTML || '',
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
    
    const handleClearReport = () => {
        setGeneratedSections({});
        setIsClearModalOpen(false);
    };
    
    const handleDownloadPdf = () => {
        if (!selectedProject || Object.keys(generatedSections).length === 0) {
            notify("Please generate a report first.", "error");
            return;
        }
        generateInterestCompatibilityPdf(generatedSections as InterestCompatibilityReport, selectedProject.projectTitle);
    };

    const renderReportGenerator = () => (
        <div className="space-y-6">
            <div ref={reportContainerRef} className="space-y-3">
                {REPORT_SECTIONS.map(section => {
                    const sectionContent = (generatedSections as any)[section.key];
                    const isLoadingThis = loadingSection === section.key;
                    let statusIcon;
                    let statusColor = 'text-slate-400';
                    if (isLoadingThis) {
                        statusIcon = <i className="fa-solid fa-spinner fa-spin text-blue-500"></i>;
                        statusColor = 'text-blue-500';
                    } else if (sectionContent) {
                        statusIcon = <i className="fa-solid fa-check-circle text-green-500"></i>;
                        statusColor = 'text-green-700';
                    } else {
                        statusIcon = <i className="fa-regular fa-circle text-slate-400"></i>;
                    }

                    return (
                        <details key={section.key} className="border border-slate-200 rounded-lg bg-white overflow-hidden" open={!!sectionContent}>
                            <summary className="p-4 cursor-pointer flex justify-between items-center hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="w-5 text-center">{statusIcon}</span>
                                    <h4 className={`font-bold text-lg ${statusColor}`}>{section.label}</h4>
                                </div>
                                <div className="flex-shrink-0">
                                    <button onClick={(e) => { e.preventDefault(); handleGenerateSection(section); }} disabled={!!loadingSection || isGeneratingFullReport} className="px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 disabled:opacity-50">
                                        <i className="fa-solid fa-wand-magic-sparkles mr-2"></i>Generate Section
                                    </button>
                                </div>
                            </summary>
                            <div className="p-4 border-t border-slate-200 bg-slate-50/70">
                                {sectionContent ? (
                                    <ReportSectionViewer sectionKey={section.key} content={sectionContent} />
                                ) : (
                                    <p className="text-sm italic text-slate-500">Click "Generate Section" to populate this area.</p>
                                )}
                            </div>
                        </details>
                    );
                })}
            </div>
        </div>
    );

    return (
        <>
            {isClearModalOpen && ( <ConfirmationModal isOpen={isClearModalOpen} onClose={() => setIsClearModalOpen(false)} onConfirm={handleClearReport} title="Clear Assessment" message="Are you sure you want to clear the current report?" /> )}
            {isSaveModalOpen && (<NotesModal isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)} onSave={handleSaveReport} title="Save Compatibility Report" />)}
            
            <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8 flex flex-col h-[calc(100vh-4rem-2*1.5rem)]">
                <div className="flex-shrink-0">
                     <div className="flex flex-wrap gap-4 justify-between items-center mb-4 pb-4 border-b border-slate-200">
                        <div>
                           <h1 className="text-2xl font-bold text-slate-900">Interest Compatibility Assessment</h1>
                           <p className="text-sm text-slate-500 mt-1">Generate an AI-powered assessment of stakeholder interest alignment.</p>
                        </div>
                       <div className="w-full sm:w-auto sm:min-w-64">
                           <ProjectFilter value={selectedProjectId} onChange={handleProjectChange} allowAll={false} />
                       </div>
                   </div>

                    {selectedProject && (
                         <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
                            <nav className="flex space-x-2 border-b-2 border-transparent">
                                <button onClick={() => setActiveTab('report')} className={`py-3 px-3 font-semibold text-sm rounded-t-md ${activeTab === 'report' ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:text-slate-800'}`}>Report Generator</button>
                                <button onClick={() => setActiveTab('chat')} className={`py-3 px-3 font-semibold text-sm rounded-t-md ${activeTab === 'chat' ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:text-slate-800'}`}>Chat Assistant</button>
                            </nav>
                             {activeTab === 'report' && (
                                <div className="flex gap-2 flex-wrap">
                                    <button onClick={handleGenerateFullReport} disabled={isGeneratingFullReport || !!loadingSection} className="px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 rounded-md shadow-sm hover:bg-purple-700 disabled:bg-slate-400"><i className={`fa-solid ${isGeneratingFullReport ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'} mr-2`}></i>{isGeneratingFullReport ? 'Generating...' : 'Generate Full Report'}</button>
                                    <button onClick={() => setIsSaveModalOpen(true)} disabled={Object.keys(generatedSections).length === 0} className="px-3 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-md shadow-sm hover:bg-green-700 disabled:bg-slate-400"><i className="fa-solid fa-save mr-2"></i>Save</button>
                                    <button onClick={handleDownloadPdf} disabled={Object.keys(generatedSections).length === 0} className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 rounded-md shadow-sm hover:bg-rose-700 disabled:bg-slate-400"><i className="fa-solid fa-file-pdf mr-2"></i>PDF</button>
                                    <button onClick={handleClearReport} disabled={Object.keys(generatedSections).length === 0} className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700 disabled:bg-slate-400"><i className="fa-solid fa-trash mr-2"></i>Clear</button>
                                </div>
                             )}
                        </div>
                    )}
                </div>

                <div className="flex-grow min-h-0">
                    {!selectedProject ? (
                        <div className="text-center py-20 text-slate-500 h-full flex flex-col justify-center items-center"><i className="fa-solid fa-arrow-up text-6xl text-slate-300"></i><h3 className="mt-4 text-lg font-medium">Please select a project to begin.</h3></div>
                    ) : (
                        <div className="h-full">
                            {activeTab === 'report' ? (
                                <div className="overflow-y-auto h-full scrollbar-hide pr-2 -mr-2">{renderReportGenerator()}</div>
                            ) : (
                                <ChatAssistant project={selectedProject} members={members} researchPlans={researchPlans} settings={state.settings} />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default InterestCompatibilityPage;
