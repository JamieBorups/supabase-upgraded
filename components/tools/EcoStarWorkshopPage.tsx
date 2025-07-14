

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { produce } from 'immer';
import { Content } from '@google/genai';
import { useAppContext } from '../../context/AppContext';
import { Page, FormData as Project, EcoStarReport, ReportSectionContent, EcoStarField } from '../../types';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { getAiResponse } from '../../services/aiService';
import { generateEcoStarSection } from '../../services/ecoStarService';
import ConfirmationModal from '../ui/ConfirmationModal';
import NotesModal from '../ui/NotesModal';
import * as api from '../../services/api';
import { ECOSTAR_PERSONA_INSTRUCTIONS } from '../../constants/ai/ecostar.persona';

const formatAiTextToHtml = (text: string = ''): string => {
    if (!text) return '';
    // 1. Sanitize to prevent XSS.
    const sanitizedText = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    
    // 2. Split into paragraphs on double newlines.
    const paragraphs = sanitizedText.split(/\n\s*\n/);
    
    // 3. Wrap each non-empty paragraph in <p> tags and handle single newlines as <br>.
    return paragraphs
        .filter(p => p.trim() !== '')
        .map(p => `<p>${p.trim().replace(/\n/g, '<br />')}</p>`)
        .join('');
};

const ECOSTAR_FIELDS: EcoStarField[] = [
    { key: 'Environment', label: 'E – Environment', description: 'What is the Context and Place?' },
    { key: 'Customer', label: 'C – Customer', description: 'Who Are You Creating Value For?' },
    { key: 'Opportunity', label: 'O – Opportunity', description: 'Why is This the Right Time to Act?' },
    { key: 'Solution', label: 'S – Solution', description: 'What Exactly Are You Offering?' },
    { key: 'Team', label: 'T – Team', description: 'Who is Making This Happen?' },
    { key: 'Advantage', label: 'A – Advantage', description: 'Why is Your Approach Better?' },
    { key: 'Results', label: 'R – Results', description: 'What Measurable Outcomes Will You Deliver?' },
];

// --- Refactored types for robust action handling ---
type ActionType = 'GENERATE_SECTION' | 'MORE_QUESTIONS' | 'ANSWER_FOR_ME' | 'NEXT_SECTION';

interface ActionButtonData {
    label: string;
    type: ActionType;
    style?: 'primary' | 'secondary';
}

interface Message {
    id: string;
    sender: 'user' | 'ai' | 'system';
    text: string;
    actions?: ActionButtonData[];
}


const SimpleMarkdown: React.FC<{ text: string }> = ({ text }) => {
    const createMarkup = (line: string) => {
        const bolded = line.split(/(\*\*.*?\*\*)/g).map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i}>{part.slice(2, -2)}</strong>;
            }
            return part;
        });
        return <>{bolded}</>;
    };

    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let listItems: React.ReactNode[] = [];

    const flushList = () => {
        if (listItems.length > 0) {
            elements.push(<ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-1 my-2">{listItems}</ul>);
            listItems = [];
        }
    };

    lines.forEach((line, index) => {
        if (line.trim().startsWith('# ')) {
            flushList();
            elements.push(<h3 key={index} className="text-xl font-bold mt-4 mb-2 text-slate-800 border-b border-slate-200 pb-1">{createMarkup(line.trim().substring(2))}</h3>);
        } else if (line.trim().startsWith('* ')) {
            listItems.push(<li key={index}>{createMarkup(line.trim().substring(2))}</li>);
        } else {
            flushList();
            if (line.trim() !== '') {
                elements.push(<p key={index} className="my-1">{createMarkup(line)}</p>);
            }
        }
    });

    flushList(); // Add any remaining list items

    return <>{elements}</>;
};

const EcoStarWorkshopPage: React.FC<{ onNavigate: (page: Page) => void; }> = ({ onNavigate }) => {
    const { state, dispatch, notify } = useAppContext();
    const { projects, members } = state;

    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [chatHistories, setChatHistories] = useState<Record<string, Message[]>>({
        _global: [{ id: `sys_init_${Date.now()}`, sender: 'system', text: 'Select a project to begin.' }]
    });
    const [isLoading, setIsLoading] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [currentTopic, setCurrentTopic] = useState<EcoStarField | null>(null);
    const [reportSections, setReportSections] = useState<Record<string, ReportSectionContent | string>>({});
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [isClearModalOpen, setIsClearModalOpen] = useState(false);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

    const chatEndRef = useRef<HTMLDivElement>(null);

    const projectOptions = useMemo(() => [
        { value: '', label: 'Select a project to assess...' },
        ...projects.map(p => ({ value: p.id, label: p.projectTitle }))
    ], [projects]);

    const activeChatMessages = useMemo(() => {
        return currentTopic ? chatHistories[currentTopic.key] || [] : chatHistories._global || [];
    }, [currentTopic, chatHistories]);

    const selectedProject = useMemo(() => projects.find(p => p.id === selectedProjectId), [selectedProjectId, projects]);
    
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeChatMessages]);
    
    const handleProjectChange = (projectId: string) => {
        setSelectedProjectId(projectId);
        setReportSections({});
        setCurrentTopic(null);
        if (projectId) {
            setChatHistories({
                _global: [{
                    id: `sys_welcome_${Date.now()}`,
                    sender: 'system',
                    text: "Welcome to the ECO-STAR workshop! This tool helps you frame your project's impact. Let's start with the first section.",
                    actions: [
                        { label: "Begin with Environment (E)", type: "NEXT_SECTION", style: 'primary' }
                    ]
                }]
            });
        } else {
            setChatHistories({ _global: [{ id: `sys_select_${Date.now()}`, sender: 'system', text: 'Select a project to begin.' }] });
        }
    }

    const constructContextPrompt = useCallback((basePrompt: string) => {
        if (!selectedProject) return basePrompt;

        const collaboratorDetails = selectedProject.collaboratorDetails.map(c => {
            const member = members.find(m => m.id === c.memberId);
            return member ? `${member.firstName} ${member.lastName} (${c.role})` : `Unknown Member (${c.role})`;
        }).join(', ');

        const context = {
            projectTitle: selectedProject.projectTitle,
            projectDescription: selectedProject.projectDescription,
            background: selectedProject.background,
            audience: selectedProject.audience,
            schedule: selectedProject.schedule,
            collaborators: collaboratorDetails,
            culturalIntegrity: selectedProject.culturalIntegrity,
            additionalInfo: selectedProject.additionalInfo,
        };

        return `${basePrompt}\n\n### PROJECT CONTEXT ###\n${JSON.stringify(context, null, 2)}`;
    }, [selectedProject, members]);
    
    const getNextTopic = useCallback((currentKey?: string): EcoStarField | null => {
        if (!currentKey) return ECOSTAR_FIELDS[0]; // Start from the beginning
        const currentIndex = ECOSTAR_FIELDS.findIndex(f => f.key === currentKey);
        if (currentIndex !== -1 && currentIndex < ECOSTAR_FIELDS.length - 1) {
            return ECOSTAR_FIELDS[currentIndex + 1];
        }
        return null;
    }, []);

    const handleGenerateSection = useCallback(async (topic: EcoStarField) => {
        if(isLoading || isGeneratingReport || !selectedProject) return;
        setIsLoading(true);
        setReportSections(prev => ({ ...prev, [topic.key]: 'Generating...' }));
        
        const historyForTopic = chatHistories[topic.key] || [];
        const chatHistoryText = historyForTopic.map(m => `${m.sender}: ${m.text}`).join('\n');
        
        try {
            const parsedResult = await generateEcoStarSection(topic, selectedProject, members, state.settings.ai, chatHistoryText);
            
            setReportSections(prev => ({...prev, [topic.key]: parsedResult}));
            
            const nextTopic = getNextTopic(topic.key);
            const systemMessage = nextTopic 
                ? `Generated content for ${topic.label}. Would you like to proceed to the next section?`
                : `Generated content for ${topic.label}. All sections are complete.`;

            const actions: ActionButtonData[] = [];
            if (nextTopic) {
                actions.push({ label: `Yes, begin "${nextTopic.label}"`, type: "NEXT_SECTION", style: 'primary' });
            }
            actions.push({ label: `Ask more about ${topic.label}`, type: "MORE_QUESTIONS", style: 'secondary' });
            
            setChatHistories(prev => ({ ...prev, [topic.key]: [...historyForTopic, {id: `sys_gen_${topic.key}`, sender: 'system', text: systemMessage, actions}]}));

        } catch (error: any) {
            setReportSections(prev => ({ ...prev, [topic.key]: `Error: The AI returned data in an unexpected format.` }));
            notify(`Error generating ${topic.label}: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, isGeneratingReport, selectedProject, members, state.settings.ai, chatHistories, getNextTopic, notify]);
    
    const handleAiRequest = useCallback(async (topic: EcoStarField, prompt: string, userMessageText: string) => {
        setIsLoading(true);
    
        const newMessages = produce(chatHistories[topic.key] || [], draft => {
            draft.push({ id: `user_${Date.now()}`, sender: 'user', text: userMessageText });
        });
        setChatHistories(prev => ({ ...prev, [topic.key]: newMessages }));
    
        const history = newMessages
            .filter(m => m.sender !== 'system' && m.text)
            .map(m => ({
                role: m.sender === 'user' ? 'user' : 'model',
                parts: [{ text: m.text as string }]
            })) as Content[];
        
        try {
            const finalPrompt = constructContextPrompt(prompt);
            const ecoStarSettings = produce(state.settings.ai, draft => {
                draft.personas.ecostar.instructions = ECOSTAR_PERSONA_INSTRUCTIONS;
                draft.personas.main.instructions = '';
            });

            const result = await getAiResponse('ecostar', finalPrompt, ecoStarSettings, history);
            
            let messageText = result.text;
            const actions: ActionButtonData[] = [];
            const actionRegex = /\[ACTION:([A-Z_]+)\]/g;
            let match;
            
            while ((match = actionRegex.exec(result.text)) !== null) {
                const actionType = match[1] as ActionType;
                if (actionType === 'GENERATE_SECTION') {
                    actions.push({ label: `Generate ${topic.label} Section`, type: 'GENERATE_SECTION', style: 'primary'});
                } else if (actionType === 'MORE_QUESTIONS') {
                    actions.push({ label: 'Suggest more questions', type: 'MORE_QUESTIONS', style: 'secondary'});
                } else if (actionType === 'ANSWER_FOR_ME') {
                    actions.push({ label: "Answer for me", type: 'ANSWER_FOR_ME', style: 'primary'});
                }
            }
            
            messageText = messageText.replace(actionRegex, "").trim();
    
            const finalMessage: Message = { 
                id: `ai_${Date.now()}`, 
                sender: 'ai', 
                text: messageText,
                actions: actions.length > 0 ? actions : undefined
            };
    
            setChatHistories(prev => ({ ...prev, [topic.key]: [...newMessages, finalMessage] }));
    
        } catch (error: any) {
            setChatHistories(prev => ({...prev, [topic.key]: [...newMessages, { id: `err_${Date.now()}`, sender: 'ai', text: `Error: ${error.message}` }] }));
        } finally {
            setIsLoading(false);
        }
    }, [chatHistories, constructContextPrompt, state.settings.ai]);
    
    const handleChatTopic = useCallback((topic: EcoStarField) => {
        if (isLoading || isGeneratingReport) return;
        setCurrentTopic(topic);

        const existingHistory = chatHistories[topic.key] || [];
        if (existingHistory.length === 0) {
            const userMessage = `I'm ready to start the "${topic.label}" section of the ECO-STAR workshop.`;
            const prompt = `The user wants to start the workshop on the "${topic.label}" section. Please initiate the conversation according to your core instructions. Provide a warm welcome, an introduction to the concept, a brief analysis based on the project context, and then ask 1-2 guiding questions.`;
            
            const initializingMessage: Message = { id: `sys_init_${topic.key}`, sender: 'system', text: `Initializing chat for ${topic.label}...` };
            setChatHistories(prev => ({ ...prev, [topic.key]: [initializingMessage] }));

            setTimeout(() => {
                handleAiRequest(topic, prompt, userMessage);
            }, 100);
        }
    }, [isLoading, isGeneratingReport, chatHistories, handleAiRequest]);
    
    const handleActionClick = (actionType: ActionType) => {
        if (!currentTopic && actionType !== 'NEXT_SECTION') return;
        
        switch(actionType) {
            case 'GENERATE_SECTION':
                if (currentTopic) handleGenerateSection(currentTopic);
                break;
            case 'NEXT_SECTION': {
                const nextTopic = getNextTopic(currentTopic?.key);
                if (nextTopic) {
                    handleChatTopic(nextTopic);
                }
                break;
            }
            case 'MORE_QUESTIONS': {
                if (currentTopic) {
                    handleAiRequest(currentTopic, 'Please ask another follow-up question to help me brainstorm.', 'Ask me another question.');
                }
                break;
            }
            case 'ANSWER_FOR_ME': {
                if (currentTopic) {
                    const lastAiMessage = (chatHistories[currentTopic.key] || []).filter(m => m.sender === 'ai').pop()?.text;
                    if (!lastAiMessage) return;
                    const prompt = `Based on the project context and our conversation so far, please provide a concise, well-written sample answer to your last question: "${lastAiMessage}"`;
                    handleAiRequest(currentTopic, prompt, "Answer that for me.");
                }
                break;
            }
        }
    };
    
    const handleUserInputSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading || isGeneratingReport || !currentTopic) return;
        handleAiRequest(currentTopic, userInput, userInput);
        setUserInput('');
    };

    const handleGenerateFullReport = async () => {
        if (!selectedProject || isLoading || isGeneratingReport) return;
        setIsGeneratingReport(true);
        setReportSections({});
        setCurrentTopic(null);
        setChatHistories(prev => ({...prev, _global: [{ id: `sys_report_${Date.now()}`, sender: 'system', text: 'Generating full ECO-STAR report. This may take a moment...' }]}));
    
        for (const field of ECOSTAR_FIELDS) {
            setChatHistories(prev => {
                const newHistory = { ...prev };
                newHistory._global = [...(newHistory._global || []), {id: `sys_gen_${field.key}`, sender: 'system', text: `Generating section: ${field.label}...`}];
                return newHistory;
            });
            setReportSections(prev => ({...prev, [field.key]: 'Generating...'}));
            try {
                const parsedResult = await generateEcoStarSection(field, selectedProject, members, state.settings.ai, '');
                setReportSections(prev => ({...prev, [field.key]: parsedResult}));
            } catch (error: any) {
                 setReportSections(prev => ({ ...prev, [field.key]: `Error: The AI returned data in an unexpected format.` }));
                 notify(`Failed on section: ${field.label}. ${error.message}`, 'error');
                 break;
            }
        }
    
        setChatHistories(prev => {
            const newHistory = { ...prev };
            newHistory._global = [...(newHistory._global || []), {id: `sys_done_${Date.now()}`, sender: 'system', text: 'Full report generated below.'}];
            return newHistory;
        });
        setIsGeneratingReport(false);
    };

    const handleClearReport = () => {
        setReportSections({});
        setIsClearModalOpen(false);
        notify('Report cleared.', 'info');
    };

    const handleCopyToClipboard = () => {
        const reportDiv = document.getElementById('ecostar-report-content');
        if (reportDiv) {
            navigator.clipboard.writeText(reportDiv.innerText);
            notify('Report copied to clipboard!', 'success');
        }
    };

    const handleSaveReport = async (notes: string) => {
        if (!selectedProjectId || !selectedProject) return;

        let reportHtml = `<h1>ECO-STAR Report for: ${selectedProject.projectTitle}</h1>`;
        
        const reportToSave: Partial<EcoStarReport> = {
            projectId: selectedProjectId,
            notes,
        };

        ECOSTAR_FIELDS.forEach(field => {
            const content = reportSections[field.key];
            const key = `${field.key.charAt(0).toLowerCase() + field.key.slice(1)}Report` as keyof EcoStarReport;

            if (content && typeof content === 'object' && 'summary' in content) {
                const typedContent = content as ReportSectionContent;
                (reportToSave as any)[key] = typedContent;
                
                reportHtml += `<h2>${field.label}</h2>`;
                reportHtml += `<h3>Summary</h3>${formatAiTextToHtml(typedContent.summary)}`;
                if (Array.isArray(typedContent.keyConsiderations) && typedContent.keyConsiderations.length > 0) {
                    reportHtml += `<h3>Key Considerations</h3><ul>${typedContent.keyConsiderations.map(item => `<li>${item}</li>`).join('')}</ul>`;
                }
                if (Array.isArray(typedContent.followUpQuestions) && typedContent.followUpQuestions.length > 0) {
                    reportHtml += `<h3>Follow-up Questions</h3>`;
                    typedContent.followUpQuestions.forEach(qa => {
                        reportHtml += `<h4>${qa.question}</h4><p><em>${qa.sampleAnswer}</em></p>`;
                    });
                }
            } else {
                (reportToSave as any)[key] = null;
            }
        });
        
        reportToSave.fullReportText = reportHtml;

        try {
            const savedReport = await api.addEcoStarReport(reportToSave as Omit<EcoStarReport, 'id' | 'createdAt'>);
            dispatch({ type: 'ADD_ECOSTAR_REPORT', payload: savedReport });
            notify('ECO-STAR report saved successfully!', 'success');
        } catch(error: any) {
            notify(`Error saving report: ${error.message}`, 'error');
        } finally {
            setIsSaveModalOpen(false);
        }
    };

    return (
        <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
             {isClearModalOpen && (
                <ConfirmationModal
                    isOpen={isClearModalOpen}
                    onClose={() => setIsClearModalOpen(false)}
                    onConfirm={handleClearReport}
                    title="Clear Report"
                    message="Are you sure you want to clear the entire generated report? This cannot be undone."
                    confirmButtonText="Yes, Clear Report"
                />
            )}
             {isSaveModalOpen && (
                <NotesModal
                    isOpen={isSaveModalOpen}
                    onClose={() => setIsSaveModalOpen(false)}
                    onSave={handleSaveReport}
                    title="Save ECO-STAR Report"
                />
             )}
            <h1 className="text-3xl font-bold text-slate-900">ECO-STAR AI Workshop</h1>
            <p className="text-slate-500 mt-1 mb-6">Brainstorm with an AI coach or generate polished summaries for your project's impact narrative.</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div>
                        <label htmlFor="project-select" className="block text-sm font-medium text-slate-700 mb-1">1. Select a Project</label>
                        <Select id="project-select" value={selectedProjectId} onChange={(e) => handleProjectChange(e.target.value)} options={projectOptions} />
                    </div>
                    {selectedProjectId && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">2. Choose an Option</label>
                             <div className="space-y-2">
                                <button
                                    onClick={handleGenerateFullReport}
                                    disabled={isLoading || isGeneratingReport || !selectedProjectId}
                                    className="w-full p-3 border rounded-lg text-left transition-all duration-200 font-semibold bg-purple-600 text-white hover:bg-purple-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
                                >
                                    <i className="fa-solid fa-file-invoice mr-2"></i>
                                    {isGeneratingReport ? 'Generating...' : 'Generate Full Report'}
                                </button>
                                <div className="relative py-2">
                                    <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-slate-300"></div></div>
                                    <div className="relative flex justify-center"><span className="bg-white px-2 text-sm text-slate-500">Or work section by section</span></div>
                                </div>
                                {ECOSTAR_FIELDS.map(field => {
                                    const isComplete = reportSections[field.key] && typeof reportSections[field.key] === 'object';
                                    return (
                                    <div key={field.key} className="p-3 border rounded-lg bg-slate-50 border-slate-300">
                                        <h3 className="font-semibold text-slate-800 flex items-center">
                                            {isComplete ? <i className="fa-solid fa-check-circle text-green-500 mr-2"></i> : <i className="fa-regular fa-circle text-slate-400 mr-2"></i>}
                                            {field.label}
                                        </h3>
                                        <p className="text-xs text-slate-600 mb-3 ml-6">{field.description}</p>
                                        <div className="flex gap-2 ml-6">
                                            <button onClick={() => handleChatTopic(field)} disabled={isLoading || isGeneratingReport} className="flex-1 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-md hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"><i className="fa-solid fa-comments mr-2"></i>Chat</button>
                                            <button onClick={() => handleGenerateSection(field)} disabled={isLoading || isGeneratingReport} className="flex-1 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed"><i className="fa-solid fa-wand-magic-sparkles mr-2"></i>Generate</button>
                                        </div>
                                    </div>
                                )})}
                            </div>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-2 bg-slate-100 p-4 rounded-lg border border-slate-200 flex flex-col h-[75vh]">
                    <h3 className="font-bold text-lg text-slate-800 mb-4 flex-shrink-0 border-b border-slate-300 pb-3">
                        {currentTopic ? `Chatting about: ${currentTopic.label}` : 'AI Coach'}
                    </h3>
                    <div ref={chatEndRef} className="flex-grow bg-white rounded-md p-3 text-sm text-slate-700 space-y-4 overflow-y-auto min-h-96 max-h-[65vh]">
                        {activeChatMessages.map(msg => (
                             <div key={msg.id}>
                                {msg.sender === 'system' && <p className="text-xs text-center italic text-slate-500 p-2 bg-slate-100 rounded-md"><pre className="whitespace-pre-wrap font-sans">{msg.text}</pre></p>}
                                {msg.sender === 'user' && <div className="flex justify-end"><p className="bg-blue-200 rounded-lg px-3 py-2 inline-block max-w-xl text-blue-900">{msg.text}</p></div>}
                                {msg.sender === 'ai' ? (
                                    <div className="flex justify-start">
                                        <div className="bg-slate-200 text-slate-800 rounded-lg px-3 py-2 inline-block max-w-xl">
                                            <SimpleMarkdown text={msg.text} />
                                            {msg.actions && msg.actions.length > 0 && (
                                                <div className="mt-3 pt-3 border-t border-slate-300/50 flex flex-wrap gap-2">
                                                    {msg.actions.map((action, i) => (
                                                        <button key={i} onClick={() => handleActionClick(action.type)} disabled={isLoading} className={`px-3 py-1.5 text-xs font-semibold rounded-md shadow-sm disabled:opacity-60 disabled:cursor-not-allowed ${action.style === 'primary' ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'}`}>
                                                            {action.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    msg.actions && msg.actions.length > 0 && (
                                         <div className="mt-3 flex flex-wrap gap-2 justify-center">
                                            {msg.actions.map((action, i) => (
                                                <button key={i} onClick={() => handleActionClick(action.type)} disabled={isLoading} className={`px-3 py-1.5 text-sm font-semibold rounded-md shadow-sm disabled:opacity-60 disabled:cursor-not-allowed ${action.style === 'primary' ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'}`}>
                                                    {action.label}
                                                </button>
                                            ))}
                                        </div>
                                    )
                                )}
                            </div>
                        ))}
                        {isLoading && !isGeneratingReport && <div className="flex items-center gap-2 text-slate-500 p-2"><i className="fa-solid fa-spinner fa-spin"></i><span>AI is thinking...</span></div>}
                     </div>
                     <form onSubmit={handleUserInputSubmit} className="mt-4 pt-4 border-t border-slate-300 flex gap-2 flex-shrink-0">
                        <Input type="text" value={userInput} onChange={e => setUserInput(e.target.value)} placeholder="Type a follow-up message..." className="flex-grow" disabled={isLoading || isGeneratingReport || !currentTopic} />
                        <button type="submit" disabled={isLoading || isGeneratingReport || !userInput.trim()} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 disabled:bg-slate-400">Send</button>
                    </form>
                </div>
            </div>
            
            {Object.keys(reportSections).length > 0 && (
                <div className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-slate-800">Generated ECO-STAR Report</h2>
                        <div className="flex gap-2">
                             <button onClick={() => setIsSaveModalOpen(true)} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"><i className="fa-solid fa-save mr-2"></i>Save Report</button>
                             <button onClick={handleCopyToClipboard} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-md hover:bg-slate-300"><i className="fa-solid fa-copy mr-2"></i>Copy to Clipboard</button>
                             <button onClick={() => setIsClearModalOpen(true)} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"><i className="fa-solid fa-trash-alt mr-2"></i>Clear Report</button>
                        </div>
                    </div>
                    <div id="ecostar-report-content" className="space-y-4 p-6 border rounded-lg bg-white">
                        {ECOSTAR_FIELDS.map(field => {
                            const content = reportSections[field.key];
                            if (!content) return null;
                            if (typeof content === 'string') {
                                return (
                                     <div key={field.key} className="p-4 bg-slate-50 border-l-4 border-teal-500">
                                         <h3 className="text-xl font-bold text-slate-800">{field.label}</h3>
                                         <div className="flex items-center gap-2 text-slate-500 p-2"><i className="fa-solid fa-spinner fa-spin"></i><span>{content}</span></div>
                                     </div>
                                );
                            }
                            
                            const typedContent = content as ReportSectionContent;
                            return (
                                <div key={field.key} className="p-4 bg-slate-50 border-l-4 border-teal-500">
                                    <h3 className="text-xl font-bold text-slate-800">{field.label}</h3>
                                    <div className="mt-4">
                                        <h4 className="text-md font-semibold text-slate-700">Summary</h4>
                                        <div className="prose prose-sm max-w-none text-slate-600 mt-1" dangerouslySetInnerHTML={{ __html: formatAiTextToHtml(typedContent.summary) }}></div>
                                    </div>
                                    <div className="mt-4">
                                        <h4 className="text-md font-semibold text-slate-700">Key Considerations</h4>
                                        <ul className="list-disc list-inside mt-1 space-y-1 text-slate-600">
                                            {Array.isArray(typedContent.keyConsiderations) && typedContent.keyConsiderations.map((item, i) => <li key={i}>{item}</li>)}
                                        </ul>
                                    </div>
                                    <div className="mt-4">
                                        <h4 className="text-md font-semibold text-slate-700">Follow-up Questions & Sample Answers</h4>
                                        <div className="space-y-3 mt-1">
                                            {Array.isArray(typedContent.followUpQuestions) && typedContent.followUpQuestions.map((item, i) => (
                                                <div key={i} className="p-2 bg-slate-100/70 rounded-md border border-slate-200">
                                                    <p className="font-semibold text-slate-800">{item.question}</p>
                                                    <p className="text-sm text-slate-600 pl-4 border-l-2 border-slate-300 ml-2 mt-1 italic">
                                                        <span className="font-bold not-italic text-slate-500">A:</span> {item.sampleAnswer}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EcoStarWorkshopPage;