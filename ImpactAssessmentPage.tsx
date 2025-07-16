import React, { useState, useMemo, useEffect } from 'react';
import { produce } from 'immer';
import { useAppContext } from '../context/AppContext.tsx';
import FormField from './ui/FormField.tsx';
import { RadioGroup } from './ui/RadioGroup.tsx';
import { IMPACT_QUESTIONS, IMPACT_OPTIONS, initialReportData } from '../constants.ts';
import { Report } from '../types.ts';
import * as api from '../services/api.ts';
import ProjectFilter from './ui/ProjectFilter.tsx';

const ViewDisplay: React.FC<{ label: string, instructions?: React.ReactNode, value: string, options: { value: string, label: string }[] }> = ({ label, instructions, value, options }) => {
    const displayLabel = options.find(opt => opt.value === value)?.label || 'Not answered';

    return (
        <div>
            <h3 className="text-md font-semibold text-slate-800">{label}</h3>
            {instructions && <p className="text-sm text-slate-500 my-1 prose-sm">{instructions}</p>}
            <p className="text-slate-700 italic mt-2 bg-slate-100 p-2 rounded-md">{displayLabel}</p>
        </div>
    );
};


const ImpactAssessmentPage: React.FC = () => {
    const { state, dispatch, notify } = useAppContext();
    const { projects, reports } = state;
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [viewMode, setViewMode] = useState<'view' | 'edit'>('view');
    
    const [reportData, setReportData] = useState<Report | null>(null);
    const [tempReportData, setTempReportData] = useState<Report | null>(null);


    const selectedProject = useMemo(() => {
        return projects.find(p => p.id === selectedProjectId);
    }, [projects, selectedProjectId]);
    
    useEffect(() => {
        if (!selectedProjectId) {
            setReportData(null);
            setViewMode('view');
            setTempReportData(null);
            return;
        }

        const existingReport = reports.find(r => r.projectId === selectedProjectId);
        if (existingReport) {
            setReportData(existingReport);
        } else {
            const newReport: Report = {
                ...initialReportData,
                id: `rep_${Date.now()}`,
                projectId: selectedProjectId,
            };
            setReportData(newReport);
        }
        setViewMode('view');
        setTempReportData(null);
    }, [selectedProjectId, reports]);

    const handleEdit = () => {
        if (!reportData) return;
        setTempReportData(reportData);
        setViewMode('edit');
    };

    const handleSave = async () => {
        if (!tempReportData) return;
        try {
            const savedReport = await api.addOrUpdateReport(tempReportData);
            const actionType = state.reports.some(r => r.id === savedReport.id) ? 'UPDATE_REPORT' : 'ADD_REPORT';
            dispatch({ type: actionType, payload: savedReport });

            setViewMode('view');
            setTempReportData(null);
            notify('Impact assessment data saved successfully!', 'success');
        } catch (error: any) {
             notify(`Error saving data: ${error.message}`, 'error');
        }
    };

    const handleCancel = () => {
        setTempReportData(null);
        setViewMode('view');
    };

    const handleImpactChange = (questionId: string, value: string) => {
        if (!tempReportData) return;
        setTempReportData(produce(tempReportData, draft => {
            draft.impactStatements[questionId] = value;
        }));
    };

    return (
        <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
            <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
                <h1 className="text-3xl font-bold text-slate-900">Impact Assessment</h1>
                <div className="w-full max-w-sm">
                    <FormField label="Select a Project to View/Edit Impact Data" htmlFor="impact_project_select" className="mb-0">
                        <ProjectFilter
                            value={selectedProjectId}
                            onChange={setSelectedProjectId}
                            allowAll={false}
                        />
                    </FormField>
                </div>
            </div>

            {!selectedProject ? (
                <div className="text-center py-20">
                    <i className="fa-solid fa-magnifying-glass-chart text-7xl text-slate-300"></i>
                    <h3 className="mt-6 text-xl font-medium text-slate-800">No Project Selected</h3>
                    <p className="text-slate-500 mt-2 text-base">Please select a project from the dropdown above to manage its impact assessment data.</p>
                </div>
            ) : !reportData ? (
                 <div className="text-center py-20">
                    <i className="fa-solid fa-spinner fa-spin text-7xl text-slate-300"></i>
                    <h3 className="mt-6 text-xl font-medium text-slate-800">Loading Report Data...</h3>
                </div>
            ) : (
                <div>
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold text-teal-700">{selectedProject.projectTitle}</h2>
                        {viewMode === 'view' ? (
                            <button onClick={handleEdit} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700">
                                <i className="fa-solid fa-pencil mr-2"></i>Edit
                            </button>
                        ) : (
                             <div className="flex items-center gap-3">
                                <button onClick={handleCancel} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100">Cancel</button>
                                <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md shadow-sm hover:bg-teal-700">Save Changes</button>
                            </div>
                        )}
                    </div>
                    
                    <div className="space-y-8">
                         {IMPACT_QUESTIONS.map(q => (
                             viewMode === 'view' ? (
                                <ViewDisplay
                                    key={q.id}
                                    label={q.label}
                                    instructions={q.instructions}
                                    value={reportData.impactStatements[q.id] || ''}
                                    options={IMPACT_OPTIONS}
                                />
                             ) : tempReportData && (
                                <div key={q.id}>
                                    <h3 className="text-md font-semibold text-slate-800">{q.label}</h3>
                                    {q.instructions && <p className="text-sm text-slate-500 my-1 prose-sm">{q.instructions}</p>}
                                    <div className="mt-2">
                                        <RadioGroup
                                            name={q.id}
                                            options={IMPACT_OPTIONS}
                                            selectedValue={tempReportData.impactStatements[q.id] || ''}
                                            onChange={value => handleImpactChange(q.id, value)}
                                        />
                                    </div>
                                </div>
                             )
                         ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImpactAssessmentPage;
