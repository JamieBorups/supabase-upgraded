
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { produce } from 'immer';
import { useAppContext } from '../../context/AppContext';
import { Select } from '../ui/Select';
import { InterestCompatibilityReport, FormData as ProjectData, AppSettings } from '../../types';
import ConfirmationModal from '../ui/ConfirmationModal';
import { Input } from '../ui/Input';
import NotesModal from '../ui/NotesModal';
import * as api from '../../services/api';
import { getInterestCompatibilityContext } from '../../services/interestCompatibilityService';
import { generateInterestCompatibilitySection } from '../../services/ai/interestCompatibilityGenerator';
import { REPORT_SECTIONS } from '../../constants';


const formatAiTextToHtml = (text: string = ''): string => {
    if (!text) return '';
    const sanitizedText = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    const paragraphs = sanitizedText.split(/\n\s*\n/);
    return paragraphs
        .filter(p => p.trim() !== '')
        .map(p => `<p>${p.trim().replace(/\n/g, '<br />')}</p>`)
        .join('');
};

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
    
    // Chat state is currently unused in this version but kept for potential future re-integration
    const [messages, setMessages] = useState<Message[]>([]);
    const [chatIsLoading, setChatIsLoading] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [activeChatTopic, setActiveChatTopic] = useState<string | null>(null);

    const chatEndRef = useRef<HTMLDivElement>(null);
    const hasInitialized = useRef(false);

    useEffect(() => {
        if (!hasInitialized.current) {
            setMessages([{ id: `sys_${Date.now()}`, sender: 'system', text: 'Select a project to begin your assessment.' }]);
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
    
    // --- REPORT GENERATION LOGIC ---
    const handleGenerateSection = async (section: typeof REPORT_SECTIONS[0], isFullReportMode = false) => {
        if (!selectedProject || loadingSection || isGeneratingFullReport) return;
        if(!isFullReportMode) setLoadingSection(section.key);

        try {
            const context = getInterestCompatibilityContext(selectedProject, members);
            const sectionData = await generateInterestCompatibilitySection(context, state.settings.ai, section.key as keyof AppSettings['ai']['interestCompatibilitySectionSettings']);
            
            setReportData(prev => ({ ...prev, ...sectionData }));
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
                                        <button disabled={true} className="flex-1 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
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
                     {/* Right Column: Placeholder */}
                    <div className="lg:col-span-2 lg:h-[75vh] flex flex-col bg-slate-100 p-4 rounded-lg border border-slate-200">
                         <h3 className="font-bold text-lg text-slate-800 mb-4 flex-shrink-0 border-b border-slate-300 pb-3">
                           Instructions
                        </h3>
                        <div className="prose prose-sm max-w-none text-slate-600">
                            <p>This tool is designed for automated report generation.</p>
                            <ol>
                                <li>Select a project from the dropdown menu.</li>
                                <li>Use the controls on the left to generate individual sections of the report or the full report at once.</li>
                                <li>The AI will analyze your project's data—including its description, collaborators' bios, and budget—to assess how different stakeholder interests align.</li>
                                <li>Once generated, you can review the report below, save it for your records, or copy its contents.</li>
                            </ol>
                            <p className="p-2 bg-slate-200 border-l-4 border-slate-400">The chat functionality for this tool is currently disabled pending future updates.</p>
                        </div>
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
                             <button onClick={handleClearReport} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"><i className="fa-solid fa-trash-alt mr-2"></i>Clear Report</button>
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