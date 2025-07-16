import React, { useState, useMemo, useEffect } from 'react';
import { produce } from 'immer';
import { GoogleGenAI, Type } from "@google/genai";
import { useAppContext } from '../../context/AppContext.tsx';
import { RecreationFrameworkReport } from '../../types.ts';
import ConfirmationModal from '../ui/ConfirmationModal.tsx';
import NotesModal from '../ui/NotesModal.tsx';
import * as api from '../../services/api.ts';
import { generateRecreationFrameworkPdf } from '../../utils/pdfGenerator.ts';
import { TextareaWithCounter } from '../ui/TextareaWithCounter.tsx';
import FormField from '../ui/FormField.tsx';
import ProjectFilter from '../ui/ProjectFilter.tsx';

const FRAMEWORK_SECTIONS: { key: keyof Omit<RecreationFrameworkReport, 'id' | 'projectId' | 'createdAt' | 'notes' | 'fullReportText'>, label: string }[] = [
    { key: 'executiveSummary', label: 'Executive Summary' },
    { key: 'activeLiving', label: 'Active Living' },
    { key: 'inclusionAndAccess', label: 'Inclusion and Access' },
    { key: 'connectingPeopleWithNature', label: 'Connecting People with Nature' },
    { key: 'supportiveEnvironments', label: 'Supportive Environments' },
    { key: 'recreationCapacity', label: 'Recreation Capacity' },
    { key: 'closingSection', label: 'Closing Section' }
];

const formatAiTextToHtml = (text: string = ''): string => {
    if (!text) return '<p><em>Not provided.</em></p>';
    const sanitizedText = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    return sanitizedText.split(/\n\s*\n/).map(p => `<p>${p.trim().replace(/\n/g, '<br />')}</p>`).join('');
};

const ReportDisplay: React.FC<{ report: Partial<RecreationFrameworkReport> }> = ({ report }) => {
    return (
        <div className="space-y-6">
            {FRAMEWORK_SECTIONS.map(section => (
                <div key={section.key}>
                    <h3 className="text-xl font-bold text-slate-800 border-b-2 border-slate-200 pb-2 mb-3">{section.label}</h3>
                    <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: formatAiTextToHtml((report as any)[section.key]) }} />
                </div>
            ))}
        </div>
    );
};

const RESPONSE_SCHEMA = {
    type: Type.OBJECT,
    properties: {
      executiveSummary: { type: Type.STRING, description: 'A concise, professional overview of the project\'s alignment with the Framework for Recreation (2-3 paragraphs). Use double newlines (\\n\\n) for paragraph breaks.' },
      activeLiving: { type: Type.STRING, description: 'A detailed narrative on how the project promotes active living and physical literacy (2-3 paragraphs). Use double newlines (\\n\\n) for paragraph breaks.' },
      inclusionAndAccess: { type: Type.STRING, description: 'A detailed narrative on how the project ensures inclusion and equitable access (2-3 paragraphs). Use double newlines (\\n\\n) for paragraph breaks.' },
      connectingPeopleWithNature: { type: Type.STRING, description: 'A detailed narrative on how the project connects people with nature (2-3 paragraphs). Use double newlines (\\n\\n) for paragraph breaks.' },
      supportiveEnvironments: { type: Type.STRING, description: 'A detailed narrative on how the project builds supportive social and physical environments (2-3 paragraphs). Use double newlines (\\n\\n) for paragraph breaks.' },
      recreationCapacity: { type: Type.STRING, description: 'A detailed narrative on how the project enhances recreation capacity in the community (2-3 paragraphs). Use double newlines (\\n\\n) for paragraph breaks.' },
      closingSection: { type: Type.STRING, description: 'A powerful concluding statement summarizing the project\'s overall impact (1-2 paragraphs). Use double newlines (\\n\\n) for paragraph breaks.' }
    },
    required: ['executiveSummary', 'activeLiving', 'inclusionAndAccess', 'connectingPeopleWithNature', 'supportiveEnvironments', 'recreationCapacity', 'closingSection']
};

type TabId = 'report' | 'settings';

const FrameworkForRecreationPage: React.FC = () => {
    const { state, dispatch, notify } = useAppContext();
    const { projects, recreationFrameworkReports, settings } = state;

    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [activeTab, setActiveTab] = useState<TabId>('report');
    const [generatedReport, setGeneratedReport] = useState<Partial<RecreationFrameworkReport> | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [reportToDelete, setReportToDelete] = useState<RecreationFrameworkReport | null>(null);
    const [expandedReportId, setExpandedReportId] = useState<string | null>(null);
    const [aiInstructions, setAiInstructions] = useState(settings.ai.personas.recreation.instructions);

    const selectedProject = useMemo(() => projects.find(p => p.id === selectedProjectId), [selectedProjectId, projects]);
    
    const savedReportsForProject = useMemo(() => {
        if (!selectedProjectId) return [];
        return recreationFrameworkReports
            .filter(r => r.projectId === selectedProjectId)
            .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [selectedProjectId, recreationFrameworkReports]);

    const handleGenerateReport = async () => {
        if (!selectedProject || !state.settings.ai.enabled) return;
        setIsLoading(true);
        setGeneratedReport(null);
        
        const context = { projectTitle: selectedProject.projectTitle, projectDescription: selectedProject.projectDescription, background: selectedProject.background, audience: selectedProject.audience, schedule: selectedProject.schedule };
        const prompt = `Based on the provided project context, generate a comprehensive report for the Framework for Recreation in Canada. Your response MUST be a single, valid JSON object that strictly adheres to the provided schema. Do not add any text or explanation outside of the JSON object itself.\n\n### PROJECT CONTEXT ###\n${JSON.stringify(context, null, 2)}`;
    
        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
            const response = await ai.models.generateContent({
                model: settings.ai.personas.recreation.model,
                contents: [{role: 'user', parts: [{text: prompt}]}],
                config: {
                    responseMimeType: "application/json",
                    responseSchema: RESPONSE_SCHEMA,
                    temperature: settings.ai.personas.recreation.temperature,
                    systemInstruction: aiInstructions,
                }
            });
            const parsedResult = JSON.parse(response.text);
            setGeneratedReport(parsedResult);
            setActiveTab('report');
            notify('Report generated successfully. Review and save.', 'success');
        } catch (error: any) {
            console.error("AI Generation Error:", error);
            notify(`AI generation failed: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSaveReport = async (notes: string) => {
        if (!selectedProjectId || !generatedReport || !selectedProject) {
            notify('Cannot save report: missing required data.', 'error');
            return;
        };

        let reportHtml = `<h1>Framework for Recreation Report for: ${selectedProject.projectTitle}</h1>`;
        if (notes) {
            reportHtml += `<p><strong>Notes:</strong> ${notes.replace(/\n/g, '<br/>')}</p><hr/>`;
        }
        FRAMEWORK_SECTIONS.forEach(section => {
            const content = (generatedReport as any)[section.key];
            if (content && typeof content === 'string' && content.trim()) {
                reportHtml += `<h2>${section.label}</h2><div>${formatAiTextToHtml(content)}</div>`;
            }
        });
        
        const dataToSave: Omit<RecreationFrameworkReport, 'id' | 'createdAt'> = {
            projectId: selectedProjectId,
            notes: notes,
            fullReportText: reportHtml,
            executiveSummary: generatedReport.executiveSummary,
            activeLiving: generatedReport.activeLiving,
            inclusionAndAccess: generatedReport.inclusionAndAccess,
            connectingPeopleWithNature: generatedReport.connectingPeopleWithNature,
            supportiveEnvironments: generatedReport.supportiveEnvironments,
            recreationCapacity: generatedReport.recreationCapacity,
            closingSection: generatedReport.closingSection,
        };

        try {
            const savedReport = await api.addRecreationFrameworkReport(dataToSave as RecreationFrameworkReport);
            dispatch({ type: 'ADD_RECREATION_REPORT', payload: savedReport });
            setGeneratedReport(null);
            setIsSaveModalOpen(false);
            notify('Framework report saved!', 'success');
        } catch (error: any) {
            notify(`Error saving report: ${error.message}`, 'error');
        }
    };

    const handleDelete = async () => {
        if (!reportToDelete) return;
        try {
            await api.deleteRecreationFrameworkReport(reportToDelete.id);
            dispatch({ type: 'DELETE_RECREATION_REPORT', payload: reportToDelete.id });
            setReportToDelete(null);
            notify('Report deleted.', 'success');
        } catch(e: any) {
            notify(`Error deleting report: ${e.message}`, 'error');
        }
    };

    const handleDownloadPdf = (report: Partial<RecreationFrameworkReport>) => {
        if (!report || !selectedProject) {
            notify('Please generate or load a report first.', 'warning');
            return;
        }
        generateRecreationFrameworkPdf(report as RecreationFrameworkReport, selectedProject.projectTitle);
    };
    
    return (
        <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
            {reportToDelete && (
                <ConfirmationModal 
                    isOpen={!!reportToDelete} 
                    onClose={() => setReportToDelete(null)} 
                    onConfirm={handleDelete} 
                    title="Delete Report" 
                    message="Are you sure you want to delete this report? This cannot be undone."
                />
            )}
            {isSaveModalOpen && (
                <NotesModal
                    isOpen={isSaveModalOpen}
                    onClose={() => setIsSaveModalOpen(false)}
                    onSave={handleSaveReport}
                    title="Save Report"
                />
            )}
            <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
                <h1 className="text-3xl font-bold text-slate-900">Framework for Recreation</h1>
                <div className="w-full max-w-sm">
                    <ProjectFilter
                        value={selectedProjectId}
                        onChange={setSelectedProjectId}
                        allowAll={false}
                    />
                </div>
            </div>

            {selectedProjectId ? (
                <>
                    <div className="border-b border-slate-200 mb-6">
                        <nav className="-mb-px flex space-x-6">
                            <button onClick={() => setActiveTab('report')} className={`whitespace-nowrap py-3 px-3 border-b-2 font-semibold text-sm ${activeTab === 'report' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Report</button>
                            <button onClick={() => setActiveTab('settings')} className={`whitespace-nowrap py-3 px-3 border-b-2 font-semibold text-sm ${activeTab === 'settings' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>AI Instructions</button>
                        </nav>
                    </div>

                    {activeTab === 'report' ? (
                        <div>
                            <div className="text-right mb-4">
                                <button
                                    onClick={handleGenerateReport}
                                    disabled={isLoading}
                                    className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md shadow-sm hover:bg-teal-700 disabled:bg-slate-400"
                                >
                                    <i className={`fa-solid ${isLoading ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'} mr-2`}></i>
                                    {isLoading ? 'Generating...' : 'Generate New Report'}
                                </button>
                            </div>
                            
                            {isLoading && (
                                <div className="text-center py-20 text-slate-500">
                                    <i className="fa-solid fa-spinner fa-spin text-4xl text-slate-400"></i><p className="mt-2">Generating Report...</p>
                                </div>
                            )}

                            {generatedReport && (
                                <div className="p-4 border-2 border-dashed border-teal-500 rounded-lg mb-8 bg-teal-50/50">
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="text-xl font-bold text-teal-800">New Generated Report</h3>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleDownloadPdf(generatedReport)} className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 rounded-md shadow-sm hover:bg-rose-700"><i className="fa-solid fa-file-pdf mr-1"></i>PDF</button>
                                            <button onClick={() => setIsSaveModalOpen(true)} className="px-3 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-md shadow-sm hover:bg-green-700"><i className="fa-solid fa-save mr-1"></i>Save</button>
                                            <button onClick={() => setGeneratedReport(null)} className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-100 rounded-md shadow-sm hover:bg-red-200"><i className="fa-solid fa-times mr-1"></i>Discard</button>
                                        </div>
                                    </div>
                                    <ReportDisplay report={generatedReport} />
                                </div>
                            )}

                            <h3 className="text-lg font-semibold text-slate-700 mb-3">Saved Reports for {selectedProject?.projectTitle}</h3>
                            {savedReportsForProject.length > 0 ? (
                                <div className="space-y-3">
                                    {savedReportsForProject.map(report => (
                                        <div key={report.id} className="border border-slate-200 rounded-lg">
                                            <div className="w-full text-left p-4 flex justify-between items-center bg-slate-50">
                                                <button onClick={() => setExpandedReportId(prevId => prevId === report.id ? null : report.id)} className="text-left flex-grow">
                                                    <p className="font-semibold text-slate-800">Report from {new Date(report.createdAt).toLocaleString()}</p>
                                                    <p className="text-sm text-slate-600 italic">Notes: {report.notes || 'No notes'}</p>
                                                </button>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <button onClick={() => handleDownloadPdf(report)} className="px-3 py-1 text-xs font-semibold text-white bg-rose-600 rounded-md shadow-sm hover:bg-rose-700" title="Download as PDF"><i className="fa-solid fa-file-pdf mr-1"></i>PDF</button>
                                                    <button onClick={() => setReportToDelete(report)} className="px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-md hover:bg-red-200" title="Delete Report"><i className="fa-solid fa-trash mr-1"></i>Delete</button>
                                                </div>
                                            </div>
                                            {expandedReportId === report.id && (
                                                <div className="p-4 border-t border-slate-200 bg-white"><ReportDisplay report={report} /></div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 text-slate-500 border-2 border-dashed rounded-lg">No saved reports for this project.</div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <FormField label="AI Instructions" htmlFor="aiInstructions">
                                <TextareaWithCounter id="aiInstructions" rows={15} wordLimit={1000} value={aiInstructions} onChange={e => setAiInstructions(e.target.value)} />
                            </FormField>
                             <div className="text-right mt-4">
                                <button
                                    onClick={handleGenerateReport}
                                    disabled={isLoading}
                                    className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md shadow-sm hover:bg-teal-700 disabled:bg-slate-400"
                                >
                                    <i className={`fa-solid ${isLoading ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'} mr-2`}></i>
                                    {isLoading ? 'Generating...' : 'Generate With These Instructions'}
                                </button>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-20 text-slate-500"><i className="fa-solid fa-arrow-up text-6xl text-slate-300"></i><h3 className="mt-4 text-lg font-medium">Please select a project to begin.</h3></div>
            )}
        </div>
    );
};

export default FrameworkForRecreationPage;
