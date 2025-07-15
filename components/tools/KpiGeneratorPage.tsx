




import React, { useState, useMemo, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { useAppContext } from '../../context/AppContext';
import { Select } from '../ui/Select';
import FormField from '../ui/FormField';
import { Kpi, ProjectKpi, FormData as Project, KpiReport } from '../../types';
import * as api from '../../services/api';
import { Input } from '../ui/Input';
import { TextareaWithCounter } from '../ui/TextareaWithCounter';
import NotesModal from '../ui/NotesModal';
import ConfirmationModal from '../ui/ConfirmationModal';

type AiKpiSuggestion = { title: string; description: string };

const KpiEditorModal: React.FC<{
    kpi: Partial<Kpi> | null;
    onSave: (kpi: Omit<Kpi, 'id' | 'createdAt'>) => void;
    onClose: () => void;
}> = ({ kpi, onSave, onClose }) => {
    const [formData, setFormData] = useState<Partial<Kpi>>(kpi || {});
    const isEditing = !!kpi?.id;

    const handleChange = <K extends keyof Kpi>(field: K, value: Kpi[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.description) return;
        onSave(formData as Omit<Kpi, 'id' | 'createdAt'>);
    }
    
    if (!kpi) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-[60] flex justify-center items-center p-4">
            <form onSubmit={handleSave} className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl">
                <h3 className="text-xl font-bold text-slate-800 mb-6">{isEditing ? 'Edit' : 'Add New'} KPI</h3>
                <div className="space-y-4">
                    <FormField label="KPI Title" htmlFor="kpi-title" required>
                        <Input id="kpi-title" value={formData.title || ''} onChange={(e) => handleChange('title', e.target.value)} />
                    </FormField>
                    <FormField label="Description" htmlFor="kpi-description" instructions="Explain the purpose of this KPI and why it's important." required>
                        <TextareaWithCounter id="kpi-description" value={formData.description || ''} onChange={(e) => handleChange('description', e.target.value)} rows={5} wordLimit={250} />
                    </FormField>
                </div>
                <div className="mt-8 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-md hover:bg-slate-200">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md shadow-sm hover:bg-teal-700">Save KPI</button>
                </div>
            </form>
        </div>
    )
}

const KpiGeneratorPage: React.FC = () => {
    const { state, dispatch, notify } = useAppContext();
    const { projects, kpiLibrary, projectKpis, settings } = state;

    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState<AiKpiSuggestion[]>([]);
    const [selectedAiKpis, setSelectedAiKpis] = useState<Set<number>>(new Set());
    const [editingKpi, setEditingKpi] = useState<Partial<Kpi> | null>(null);
    const [kpiToDelete, setKpiToDelete] = useState<Kpi | null>(null);
    const [projectKpiToUnlink, setProjectKpiToUnlink] = useState<ProjectKpi | null>(null);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    const projectOptions = useMemo(() => [
        { value: '', label: 'Select a project...' },
        ...projects.map(p => ({ value: p.id, label: p.projectTitle }))
    ], [projects]);

    const selectedProject = useMemo(() => projects.find(p => p.id === selectedProjectId), [selectedProjectId, projects]);
    
    const projectAssignedKpis = useMemo(() => {
        if (!selectedProject) return [];
        const kpiMap = new Map(kpiLibrary.map(k => [k.id, k]));
        return projectKpis
            .filter(pk => pk.projectId === selectedProject.id)
            .map(pk => ({
                ...pk,
                kpiDetails: kpiMap.get(pk.kpiLibraryId)
            }))
            .filter(item => item.kpiDetails);
    }, [selectedProject, projectKpis, kpiLibrary]);

    const handleGenerateSuggestions = async () => {
        if (!selectedProject) return;
        setIsLoading(true);
        setAiSuggestions([]);

        const projectContext = {
            title: selectedProject.projectTitle,
            description: selectedProject.projectDescription,
            communityImpact: selectedProject.communityImpact,
            schedule: selectedProject.schedule,
            background: selectedProject.background
        };

        const prompt = `Based on the following project context, generate a list of at least 10 relevant Key Performance Indicators (KPIs). For each KPI, provide a concise 'title' and a detailed 'description' explaining its purpose, how it can be measured, and why it's important to the project's success. Your response must be only a valid JSON object.
        
        ### PROJECT CONTEXT ###
        ${JSON.stringify(projectContext, null, 2)}`;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            const response = await ai.models.generateContent({
                model: settings.ai.personas.kpiGenerator.model,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            kpis: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        title: { type: Type.STRING },
                                        description: { type: Type.STRING }
                                    },
                                    required: ['title', 'description']
                                }
                            }
                        }
                    },
                    temperature: settings.ai.personas.kpiGenerator.temperature
                }
            });

            const parsed = JSON.parse(response.text);
            if (parsed && Array.isArray(parsed.kpis)) {
                setAiSuggestions(parsed.kpis);
                setSelectedAiKpis(new Set(parsed.kpis.map((_: any, i: number) => i)));
            } else {
                throw new Error("AI response was not in the expected format.");
            }
        } catch (error: any) {
            console.error("KPI Generation Error:", error);
            notify(`AI generation failed: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleIntegrateKpis = async () => {
        if (!selectedProject || selectedAiKpis.size === 0) return;
        setIsLoading(true);

        const newKpisToCreate = Array.from(selectedAiKpis)
            .map(index => aiSuggestions[index])
            .filter(kpi => !kpiLibrary.some(libKpi => libKpi.title.toLowerCase() === kpi.title.toLowerCase()));

        try {
            // Add new unique KPIs to the library
            if (newKpisToCreate.length > 0) {
                const maxKpiNum = kpiLibrary.reduce((max, k) => {
                    const num = parseInt(k.kpiId.replace('KPI', ''), 10);
                    return isNaN(num) ? max : Math.max(max, num);
                }, 0);

                const kpisForDb = newKpisToCreate.map((kpi, i) => ({
                    ...kpi,
                    kpiId: `KPI${(maxKpiNum + i + 1).toString().padStart(3, '0')}`
                }));

                const addedKpis = await api.addKpisToLibrary(kpisForDb as any);
                dispatch({ type: 'ADD_KPIS_TO_LIBRARY', payload: addedKpis });
            }

            // Refetch library to get all IDs
            const updatedLibrary = await api.getKpiLibrary();
            const libraryMap = new Map(updatedLibrary.map(k => [k.title.toLowerCase(), k.id]));
            
            const kpisToAssign = Array.from(selectedAiKpis).map(index => aiSuggestions[index]);
            const projectKpisToAdd = kpisToAssign
                .map(kpi => ({
                    projectId: selectedProject.id,
                    kpiLibraryId: libraryMap.get(kpi.title.toLowerCase())!,
                    relevanceNotes: kpi.description,
                }))
                .filter(pk => pk.kpiLibraryId && !projectAssignedKpis.some(assigned => assigned.kpiLibraryId === pk.kpiLibraryId));

            if (projectKpisToAdd.length > 0) {
                const addedProjectKpis = await api.addProjectKpis(projectKpisToAdd as any);
                dispatch({ type: 'ADD_PROJECT_KPIS', payload: addedProjectKpis });
            }
            
            notify(`${projectKpisToAdd.length} KPI(s) integrated with project.`, 'success');
            setAiSuggestions([]);
            setSelectedAiKpis(new Set());

        } catch (error: any) {
            notify(`Error integrating KPIs: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSaveKpi = async (kpiData: Omit<Kpi, 'id'|'createdAt'>) => {
        try {
            if (editingKpi?.id) { // Update existing
                const updatedKpi = await api.updateKpiInLibrary(editingKpi.id, kpiData);
                dispatch({ type: 'UPDATE_KPI_IN_LIBRARY', payload: updatedKpi });
                notify('KPI updated successfully!', 'success');
            } else { // Add new
                const maxKpiNum = kpiLibrary.reduce((max, k) => Math.max(max, parseInt(k.kpiId.replace('KPI', ''), 10)), 0);
                const newKpiData = { ...kpiData, kpiId: `KPI${(maxKpiNum + 1).toString().padStart(3, '0')}`};
                const newKpi = await api.addKpiToLibrary(newKpiData);
                dispatch({ type: 'ADD_KPI_TO_LIBRARY', payload: newKpi });
                notify('KPI added to library!', 'success');
            }
        } catch (error: any) {
            notify(`Error saving KPI: ${error.message}`, 'error');
        } finally {
            setEditingKpi(null);
        }
    };

    const handleDeleteKpi = async () => {
        if (!kpiToDelete) return;
        try {
            await api.deleteKpiFromLibrary(kpiToDelete.id);
            dispatch({ type: 'DELETE_KPI_FROM_LIBRARY', payload: kpiToDelete.id });
            notify('KPI deleted from library.', 'success');
        } catch(error: any) {
            notify(`Error deleting KPI: ${error.message}`, 'error');
        } finally {
            setKpiToDelete(null);
        }
    }
    
    const handleUnlinkKpi = async () => {
        if(!projectKpiToUnlink) return;
        try {
            await api.deleteProjectKpi(projectKpiToUnlink.id);
            dispatch({type: 'DELETE_PROJECT_KPI', payload: projectKpiToUnlink.id});
            notify('KPI unlinked from project.', 'success');
        } catch (e: any) {
            notify(`Error unlinking KPI: ${e.message}`, 'error');
        } finally {
            setProjectKpiToUnlink(null);
        }
    };

    const handleUpdateProjectKpi = async (id: string, field: 'targetValue' | 'currentValue' | 'relevanceNotes', value: string) => {
        try {
            const updated = await api.updateProjectKpi(id, { [field]: value });
            dispatch({ type: 'UPDATE_PROJECT_KPI', payload: updated });
        } catch (e: any) {
             notify(`Error updating KPI: ${e.message}`, 'error');
        }
    };

    const handleSaveReport = async (notes: string) => {
        if (!selectedProject || projectAssignedKpis.length === 0) return;
        
        let reportHtml = `<h1>Key Performance Indicators for: ${selectedProject.projectTitle}</h1>`;
        if (notes) reportHtml += `<p><strong>Notes:</strong> ${notes}</p><hr/>`;
        
        reportHtml += '<ul>';
        projectAssignedKpis.forEach(({ kpiDetails, relevanceNotes, targetValue, currentValue }) => {
            if (kpiDetails) {
                reportHtml += `<li><h3>${kpiDetails.kpiId}: ${kpiDetails.title}</h3>`;
                reportHtml += `<p><strong>Description:</strong> ${kpiDetails.description}</p>`;
                if (relevanceNotes) reportHtml += `<p><strong>Relevance to Project:</strong> ${relevanceNotes}</p>`;
                if (targetValue) reportHtml += `<p><strong>Target:</strong> ${targetValue}</p>`;
                if (currentValue) reportHtml += `<p><strong>Current:</strong> ${currentValue}</p></li>`;
            }
        });
        reportHtml += '</ul>';
        
        const kpiDataToSave = projectAssignedKpis.map(pk => ({
            kpiDetails: pk.kpiDetails,
            relevanceNotes: pk.relevanceNotes,
            targetValue: pk.targetValue,
            currentValue: pk.currentValue,
        }));

        try {
            const savedReport = await api.addKpiReport({ 
                projectId: selectedProject.id, 
                notes, 
                fullReportText: reportHtml,
                kpiData: kpiDataToSave,
            } as Omit<KpiReport, 'id' | 'createdAt'>);
            dispatch({ type: 'ADD_KPI_REPORT', payload: savedReport });
            notify('KPI Report saved!', 'success');
        } catch (error: any) {
            notify(`Error saving report: ${error.message}`, 'error');
        } finally {
            setIsReportModalOpen(false);
        }
    };
    
    const handleAddToProject = async (kpi: Kpi) => {
        if (!selectedProject) {
            notify('Please select a project first.', 'error');
            return;
        }

        if (projectAssignedKpis.some(pk => pk.kpiLibraryId === kpi.id)) {
            notify('This KPI is already assigned to the project.', 'info');
            return;
        }

        setIsLoading(true);
        try {
            const projectKpiData = [{ projectId: selectedProject.id, kpiLibraryId: kpi.id }];
            const newProjectKpis = await api.addProjectKpis(projectKpiData as any);
            dispatch({ type: 'ADD_PROJECT_KPIS', payload: newProjectKpis });
            notify(`KPI "${kpi.title}" added to project.`, 'success');
        } catch (error: any) {
            console.error("Failed to add KPI to project:", error);
            notify(`Error adding KPI: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
            {editingKpi && <KpiEditorModal kpi={editingKpi} onClose={() => setEditingKpi(null)} onSave={handleSaveKpi} />}
            {kpiToDelete && <ConfirmationModal isOpen={!!kpiToDelete} onClose={() => setKpiToDelete(null)} onConfirm={handleDeleteKpi} title="Delete KPI" message="Are you sure? This will remove the KPI from the library and all projects." />}
            {projectKpiToUnlink && <ConfirmationModal isOpen={!!projectKpiToUnlink} onClose={() => setProjectKpiToUnlink(null)} onConfirm={handleUnlinkKpi} title="Unlink KPI" message="Are you sure you want to remove this KPI from this project?" />}
            {isReportModalOpen && <NotesModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} onSave={handleSaveReport} title="Save KPI Report" />}
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-slate-200 pb-4 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Key Performance Indicator Generator</h1>
                    <p className="text-slate-500 mt-1">Develop and track relevant Key Performance Indicators (KPIs) for your projects, leveraging AI for suggestions.</p>
                </div>
                <div className="w-full md:w-auto md:max-w-xs">
                    <FormField label="Select a Project" htmlFor="kpi-project-select" className="mb-0">
                        <Select id="kpi-project-select" options={projectOptions} value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)} />
                    </FormField>
                </div>
            </div>

            {!selectedProject ? (
                 <div className="text-center py-20 text-slate-500"><i className="fa-solid fa-arrow-up text-6xl text-slate-300"></i><h3 className="mt-4 text-lg font-medium">Please select a project to begin.</h3></div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Project KPIs Section */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-slate-800">KPIs for {selectedProject.projectTitle}</h2>
                            <button onClick={() => setIsReportModalOpen(true)} disabled={projectAssignedKpis.length === 0} className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-md shadow-sm hover:bg-rose-700 disabled:bg-slate-400">
                                <i className="fa-solid fa-save mr-2"></i>Save KPI Report
                            </button>
                        </div>
                        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                            {projectAssignedKpis.length === 0 ? <p className="italic text-slate-500">No KPIs assigned. Add from the library or generate suggestions.</p> :
                            projectAssignedKpis.map(pk => (
                                <div key={pk.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-teal-700">{pk.kpiDetails?.kpiId}: {pk.kpiDetails?.title}</h4>
                                        <button onClick={() => setProjectKpiToUnlink(pk)} className="text-slate-400 hover:text-red-500 text-xs"><i className="fa-solid fa-times"></i></button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-2">
                                        <FormField label="Target Value" htmlFor={`target-${pk.id}`}><Input id={`target-${pk.id}`} defaultValue={pk.targetValue} onBlur={e => handleUpdateProjectKpi(pk.id, 'targetValue', e.target.value)} placeholder="e.g., 80% satisfaction" /></FormField>
                                        <FormField label="Current Value" htmlFor={`current-${pk.id}`}><Input id={`current-${pk.id}`} defaultValue={pk.currentValue} onBlur={e => handleUpdateProjectKpi(pk.id, 'currentValue', e.target.value)} placeholder="e.g., 75%" /></FormField>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* KPI Library & AI Section */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-slate-800">KPI Library</h2>
                            <button onClick={() => setEditingKpi({})} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700"><i className="fa-solid fa-plus mr-2"></i>Add to Library</button>
                        </div>
                         <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                            {kpiLibrary.length === 0 ? <p className="italic text-slate-500">No KPIs in the library. Add one or use the AI generator.</p> :
                            kpiLibrary.map(kpi => (
                                <div key={kpi.id} className="p-4 bg-white border border-slate-200 rounded-lg">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-slate-700">{kpi.kpiId}: {kpi.title}</h4>
                                        <div className="flex gap-2 text-xs">
                                            {!projectAssignedKpis.some(pk => pk.kpiLibraryId === kpi.id) && <button onClick={() => handleAddToProject(kpi)} className="px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200">Add to Project</button>}
                                            <button onClick={() => setEditingKpi(kpi)} className="px-2 py-1 bg-slate-100 text-slate-700 rounded hover:bg-slate-200">Edit</button>
                                            <button onClick={() => setKpiToDelete(kpi)} className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200">Delete</button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600">{kpi.description}</p>
                                </div>
                            ))}
                        </div>
                         <div className="mt-8 pt-6 border-t border-slate-200">
                             <h3 className="text-xl font-bold text-slate-800 mb-4">AI Suggestions</h3>
                             <button onClick={handleGenerateSuggestions} disabled={isLoading} className="w-full px-4 py-3 text-base font-bold text-white bg-purple-600 rounded-md shadow-lg hover:bg-purple-700 disabled:bg-slate-400">
                                <i className={`fa-solid ${isLoading ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'} mr-2`}></i>{isLoading ? 'Generating...' : 'Generate KPI Suggestions'}
                            </button>
                            {aiSuggestions.length > 0 && (
                                <div className="mt-4 space-y-3">
                                    {aiSuggestions.map((sugg, index) => (
                                        <div key={index} className="flex items-start gap-3 p-3 bg-slate-100 border border-slate-200 rounded-md">
                                            <input type="checkbox" checked={selectedAiKpis.has(index)} onChange={() => setSelectedAiKpis(prev => { const next = new Set(prev); if (next.has(index)) next.delete(index); else next.add(index); return next; })} className="h-5 w-5 mt-1 text-teal-600 border-slate-300 rounded focus:ring-teal-500" />
                                            <div>
                                                <h5 className="font-semibold text-slate-800">{sugg.title}</h5>
                                                <p className="text-sm text-slate-600 mt-1">{sugg.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={handleIntegrateKpis} disabled={isLoading || selectedAiKpis.size === 0} className="w-full mt-4 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md shadow-sm hover:bg-teal-700 disabled:bg-slate-400">
                                        Integrate {selectedAiKpis.size} Selected KPI(s)
                                    </button>
                                </div>
                            )}
                         </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default KpiGeneratorPage;
