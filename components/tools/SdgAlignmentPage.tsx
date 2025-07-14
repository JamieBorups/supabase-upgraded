
import React, { useState, useMemo } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { useAppContext } from '../../context/AppContext';
import { Select } from '../ui/Select';
import { SdgAlignmentReport, DetailedSdgAlignment } from '../../types';
import ConfirmationModal from '../ui/ConfirmationModal';
import NotesModal from '../ui/NotesModal';
import * as api from '../../services/api';
import { generateSdgPdf } from '../../utils/pdfGenerator';

const formatAiTextToHtml = (text: string = ''): string => {
    if (!text) return '';
    const sanitizedText = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    const paragraphs = sanitizedText.split(/\n\s*\n/);
    return paragraphs
        .filter(p => p.trim() !== '')
        .map(p => `<p>${p.trim().replace(/\n/g, '<br />')}</p>`)
        .join('');
};

const REPORT_PROMPT = `Based on the provided project context, you must generate a comprehensive, multi-section strategic SDG Alignment Report. Your analysis must be in-depth, insightful, and written in full, well-structured paragraphs. Do not use bullet points or lists; all output fields must be narrative text.
The response MUST be ONLY a single, valid JSON object that strictly adheres to the provided schema.
Do not add any text, markdown, or code block formatting outside of the JSON object itself.`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    executiveSummary: { 
      type: Type.STRING, 
      description: "A comprehensive, multi-paragraph executive summary (minimum 250 words) that provides a strategic overview of the project's SDG alignment. It must synthesize the project's core mission and highlight the key findings of the detailed analysis. Use double newlines (\\n\\n) to separate paragraphs."
    },
    detailedAnalysis: {
      type: Type.ARRAY,
      description: 'An in-depth analysis of the top 2-3 most relevant SDGs. Each item must be a detailed, narrative-driven exploration.',
      items: {
        type: Type.OBJECT,
        properties: {
          goalNumber: { type: Type.INTEGER, description: 'The number of the SDG (e.g., 4).' },
          goalTitle: { type: Type.STRING, description: 'The official title of the SDG (e.g., "Quality Education").' },
          alignmentNarrative: { 
            type: Type.STRING, 
            description: "A detailed, multi-paragraph narrative (minimum 400 words) explaining the project's alignment with this SDG. This must synthesize information from the project's description, budget, schedule, and collaborator bios to create a cohesive argument. Do not use bullet points. Use full paragraphs separated by double newlines (\\n\\n)."
          },
          strategicValue: { 
            type: Type.STRING, 
            description: "A detailed, multi-paragraph explanation of the strategic value of this alignment (e.g., funding opportunities, community support, long-term impact). Use double newlines (\\n\\n) to separate paragraphs."
          },
          challengesAndMitigation: {
            type: Type.STRING,
            description: "A detailed, multi-paragraph text identifying potential challenges in demonstrating this alignment and suggesting concrete mitigation strategies. Use double newlines (\\n\\n) to separate paragraphs."
          }
        },
        required: ['goalNumber', 'goalTitle', 'alignmentNarrative', 'strategicValue', 'challengesAndMitigation']
      }
    },
    strategicRecommendations: {
        type: Type.ARRAY,
        description: "A list of 2-3 high-level, paragraph-length strategic recommendations for the project as a whole, based on the complete SDG analysis.",
        items: { type: Type.STRING }
    }
  },
  required: ['executiveSummary', 'detailedAnalysis', 'strategicRecommendations']
};


const Section: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => (
    <details className="bg-slate-50 border border-slate-200 rounded-lg" open={defaultOpen}>
        <summary className="p-4 cursor-pointer font-bold text-lg text-slate-800 flex justify-between items-center">
            {title}
            <i className="fa-solid fa-chevron-down transition-transform duration-200"></i>
        </summary>
        <div className="p-4 border-t border-slate-200">
            {children}
        </div>
    </details>
);

const SdgAlignmentPage: React.FC = () => {
    const { state, dispatch, notify } = useAppContext();
    const { projects, members } = state;

    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedReport, setGeneratedReport] = useState<Partial<SdgAlignmentReport> | null>(null);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

    const projectOptions = useMemo(() => [
        { value: '', label: 'Select a project to assess...' },
        ...projects.map(p => ({ value: p.id, label: p.projectTitle }))
    ], [projects]);

    const selectedProject = useMemo(() => projects.find(p => p.id === selectedProjectId), [selectedProjectId, projects]);

    const handleGenerateReport = async () => {
        if (!selectedProject || !state.settings.ai.enabled) return;
        setIsLoading(true);
        setGeneratedReport(null);

        const collaboratorDetails = selectedProject.collaboratorDetails.map(c => {
            const member = members.find(m => m.id === c.memberId);
            return member ? `${member.firstName} ${member.lastName} (${c.role})` : `Unknown Member (${c.role})`;
        }).join(', ');
        const context = { projectTitle: selectedProject.projectTitle, projectDescription: selectedProject.projectDescription, background: selectedProject.background, schedule: selectedProject.schedule, collaborators: collaboratorDetails, culturalIntegrity: selectedProject.culturalIntegrity, budget: selectedProject.budget };
        const finalPrompt = `${REPORT_PROMPT}\n\n### PROJECT CONTEXT ###\n${JSON.stringify(context, null, 2)}`;
        
        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
            const response = await ai.models.generateContent({
                model: state.settings.ai.personas.sdgAlignment.model,
                contents: [{role: 'user', parts: [{text: finalPrompt}]}],
                config: {
                    responseMimeType: "application/json",
                    responseSchema: RESPONSE_SCHEMA,
                    temperature: state.settings.ai.personas.sdgAlignment.temperature,
                    systemInstruction: state.settings.ai.personas.sdgAlignment.instructions,
                }
            });
            
            // Step 1: Robustly parse the JSON response
            let parsedResult;
            try {
                parsedResult = JSON.parse(response.text);
            } catch (e) {
                console.error("Initial JSON.parse failed. Attempting to extract from markdown.", e);
                const jsonMatch = response.text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
                if (jsonMatch && jsonMatch[1]) {
                    try {
                         parsedResult = JSON.parse(jsonMatch[1]);
                    } catch (innerError) {
                        console.error("Parsing from markdown block failed.", innerError);
                        throw new Error("AI returned malformed JSON, even within a code block.");
                    }
                } else {
                    throw new Error("AI response was not valid JSON and could not be extracted.");
                }
            }
            
            // Step 2: Validate the structure of the parsed JSON
            if (typeof parsedResult !== 'object' || parsedResult === null ||
                !Array.isArray(parsedResult.detailedAnalysis) ||
                !parsedResult.detailedAnalysis.every((item: any) => 
                    typeof item === 'object' &&
                    typeof item.goalNumber === 'number' &&
                    typeof item.goalTitle === 'string' &&
                    typeof item.alignmentNarrative === 'string' &&
                    typeof item.strategicValue === 'string' &&
                    typeof item.challengesAndMitigation === 'string'
                )) {
                console.error("Validation failed. Received object:", parsedResult);
                throw new Error("The AI returned data in an unexpected structure. The 'detailedAnalysis' array is missing or contains malformed items.");
            }

            setGeneratedReport(parsedResult);
            notify('Report generated successfully.', 'success');
        } catch (error: any) {
            console.error("AI Generation Error:", error);
            notify(`AI generation failed: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSaveReport = async (notes: string) => {
        if (!selectedProjectId || !generatedReport || !selectedProject) return;

        // FINAL VALIDATION: Ensure the data is in the correct format before saving.
        if (!generatedReport || typeof generatedReport !== 'object' || !Array.isArray(generatedReport.detailedAnalysis)) {
            notify("Cannot save report: The generated data is corrupted. Please try generating the report again.", "error");
            return;
        }

        let reportHtml = `<h1>SDG Alignment Report for: ${selectedProject.projectTitle}</h1>`;
        
        if (generatedReport.executiveSummary) {
            reportHtml += `<h2>Executive Summary</h2>${formatAiTextToHtml(generatedReport.executiveSummary)}`;
        }
        
        reportHtml += `<h2>Detailed Analysis</h2>`;
        generatedReport.detailedAnalysis.forEach(goal => {
            reportHtml += `<h3>Goal ${goal.goalNumber}: ${goal.goalTitle}</h3>`;
            reportHtml += `<h4>Alignment Narrative</h4>${formatAiTextToHtml(goal.alignmentNarrative)}`;
            reportHtml += `<h4>Strategic Value</h4>${formatAiTextToHtml(goal.strategicValue)}`;
            reportHtml += `<h4>Challenges & Mitigation</h4>${formatAiTextToHtml(goal.challengesAndMitigation)}`;
        });
        
        if (Array.isArray(generatedReport.strategicRecommendations)) {
            reportHtml += `<h2>Strategic Recommendations</h2>`;
            generatedReport.strategicRecommendations.forEach(rec => {
                reportHtml += formatAiTextToHtml(rec);
            });
        }
        
        const reportToSave: Omit<SdgAlignmentReport, 'id' | 'createdAt'> = {
            projectId: selectedProjectId,
            notes,
            executiveSummary: generatedReport.executiveSummary || '',
            detailedAnalysis: generatedReport.detailedAnalysis, // No `|| []` needed, it's guaranteed to be an array.
            strategicRecommendations: generatedReport.strategicRecommendations || [],
            fullReportText: reportHtml
        };

        try {
            const savedReport = await api.addSdgAlignmentReport(reportToSave);
            dispatch({ type: 'ADD_SDG_REPORT', payload: savedReport });
            notify('SDG Alignment report saved successfully!', 'success');
        } catch (error: any) {
            notify(`Error saving report: ${error.message}`, 'error');
        } finally {
            setIsSaveModalOpen(false);
        }
    };

    const handleDownloadPdf = () => {
        if (!selectedProject || !generatedReport) {
            notify('Please generate a report before downloading.', 'error');
            return;
        }
        try {
            generateSdgPdf(generatedReport as SdgAlignmentReport, selectedProject.projectTitle);
        } catch (e: any) {
            console.error("PDF Generation Error:", e);
            notify(`Could not generate PDF: ${e.message}`, 'error');
        }
    };
    
    const handleClearReport = () => {
        setGeneratedReport(null);
    }
    
    return (
        <>
            {isSaveModalOpen && (
                <NotesModal
                    isOpen={isSaveModalOpen}
                    onClose={() => setIsSaveModalOpen(false)}
                    onSave={handleSaveReport}
                    title="Save SDG Alignment Report"
                />
            )}
            <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
                <h1 className="text-3xl font-bold text-slate-900">SDG Alignment Workshop</h1>
                <p className="text-slate-500 mt-1 mb-6">Generate a strategic report analyzing your project's alignment with the UN Sustainable Development Goals.</p>

                <div className="flex items-end gap-4 mb-8">
                    <div className="flex-grow max-w-md">
                        <Select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} options={projectOptions} />
                    </div>
                    <button
                        onClick={handleGenerateReport}
                        disabled={isLoading || !selectedProjectId}
                        className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md shadow-sm hover:bg-teal-700 disabled:bg-slate-400"
                    >
                        <i className={`fa-solid ${isLoading ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'} mr-2`}></i>
                        {isLoading ? 'Generating...' : 'Generate Report'}
                    </button>
                </div>
                
                {generatedReport && (
                    <div>
                        <div className="flex justify-end gap-2 mb-4">
                             <button onClick={handleDownloadPdf} className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-md shadow-sm hover:bg-rose-700"><i className="fa-solid fa-file-pdf mr-2"></i>Download PDF</button>
                            <button onClick={() => setIsSaveModalOpen(true)} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md shadow-sm hover:bg-green-700"><i className="fa-solid fa-save mr-2"></i>Save Report</button>
                            <button onClick={handleClearReport} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700"><i className="fa-solid fa-trash mr-2"></i>Clear</button>
                        </div>
                        <div className="p-4 border rounded-lg bg-white space-y-4">
                            <h2 className="text-2xl font-bold text-slate-800">Generated Report for: {selectedProject?.projectTitle}</h2>
                            {generatedReport.executiveSummary && (
                                <Section title="Executive Summary" defaultOpen={true}>
                                    <div className="prose prose-slate max-w-none whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatAiTextToHtml(generatedReport.executiveSummary) }}></div>
                                </Section>
                            )}
                            {Array.isArray(generatedReport.detailedAnalysis) && (
                                <Section title="Detailed Analysis" defaultOpen={true}>
                                    <div className="space-y-6">
                                        {(generatedReport.detailedAnalysis || []).map((goal, index) => (
                                            <div key={index} className="p-4 bg-white border border-slate-200 rounded-md">
                                                <h4 className="font-bold text-xl text-teal-700">Goal {goal.goalNumber}: {goal.goalTitle}</h4>
                                                <div className="mt-4 space-y-4">
                                                    <div>
                                                        <h5 className="font-semibold text-slate-700">Alignment Narrative</h5>
                                                        <div className="prose prose-slate max-w-none text-slate-600 whitespace-pre-wrap mt-1" dangerouslySetInnerHTML={{ __html: formatAiTextToHtml(goal.alignmentNarrative) }}></div>
                                                    </div>
                                                     <div>
                                                        <h5 className="font-semibold text-slate-700">Strategic Value</h5>
                                                        <div className="prose prose-sm max-w-none text-slate-600 whitespace-pre-wrap mt-1" dangerouslySetInnerHTML={{ __html: formatAiTextToHtml(goal.strategicValue) }}></div>
                                                    </div>
                                                     <div>
                                                        <h5 className="font-semibold text-slate-700">Challenges & Mitigation</h5>
                                                        <div className="prose prose-sm max-w-none text-slate-600 whitespace-pre-wrap mt-1" dangerouslySetInnerHTML={{ __html: formatAiTextToHtml(goal.challengesAndMitigation) }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Section>
                            )}
                            {Array.isArray(generatedReport.strategicRecommendations) && (
                                <Section title="Strategic Recommendations" defaultOpen={true}>
                                     <div className="prose prose-slate max-w-none space-y-4 whitespace-pre-wrap">
                                        {(generatedReport.strategicRecommendations || []).map((rec, index) => (
                                            <div key={index} dangerouslySetInnerHTML={{ __html: formatAiTextToHtml(rec)}}></div>
                                        ))}
                                    </div>
                                </Section>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default SdgAlignmentPage;
