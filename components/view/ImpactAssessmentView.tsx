import React, { useState, useMemo, useEffect } from 'react';
import { produce } from 'immer';
import { useAppContext } from '../../context/AppContext.tsx';
import { RadioGroup } from '../ui/RadioGroup.tsx';
import { IMPACT_QUESTIONS, IMPACT_OPTIONS, initialReportData } from '../../constants.ts';
import { Report, FormData as Project } from '../../types.ts';
import * as api from '../../services/api.ts';

const ViewDisplay: React.FC<{ label: string, instructions?: React.ReactNode, value: string, options: { value: string, label: string }[] }> = ({ label, instructions, value, options }) => {
    const displayLabel = options.find(opt => opt.value === value)?.label || 'Not answered';

    return (
        <div>
            <h3 className="text-md font-semibold" style={{ color: 'var(--color-text-heading)' }}>{label}</h3>
            {instructions && <p className="text-sm my-1 prose-sm" style={{ color: 'var(--color-text-muted)' }}>{instructions}</p>}
            <p className="italic mt-2 p-2 rounded-md" style={{ color: 'var(--color-text-default)', backgroundColor: 'var(--color-surface-muted)' }}>{displayLabel}</p>
        </div>
    );
};

interface ImpactAssessmentViewProps {
    project: Project;
}

const ImpactAssessmentView: React.FC<ImpactAssessmentViewProps> = ({ project }) => {
    const { state, dispatch, notify } = useAppContext();
    const { reports } = state;
    const [viewMode, setViewMode] = useState<'view' | 'edit'>('view');
    
    const [reportData, setReportData] = useState<Report | null>(null);
    const [tempReportData, setTempReportData] = useState<Report | null>(null);

    useEffect(() => {
        if (!project) {
            setReportData(null);
            setViewMode('view');
            setTempReportData(null);
            return;
        }

        const existingReport = reports.find(r => r.projectId === project.id);
        if (existingReport) {
            setReportData(existingReport);
        } else {
            const newReport: Report = {
                ...initialReportData,
                id: `rep_${Date.now()}`,
                projectId: project.id,
            };
            setReportData(newReport);
        }
        setViewMode('view');
        setTempReportData(null);
    }, [project, reports]);

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
    
    if (!project || !reportData) {
        return (
            <div className="text-center py-20">
                <i className="fa-solid fa-spinner fa-spin text-4xl text-slate-400"></i>
                <p className="mt-4 text-slate-500">Loading Impact Assessment data...</p>
            </div>
        );
    }

    return (
        <section>
            <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-bold text-slate-800 border-b-2 border-teal-500 pb-2">Impact Assessment</h2>
                 {viewMode === 'view' ? (
                    <button onClick={handleEdit} className="btn btn-primary">
                        <i className="fa-solid fa-pencil mr-2"></i>Edit
                    </button>
                ) : (
                     <div className="flex items-center gap-3">
                        <button onClick={handleCancel} className="btn btn-secondary">Cancel</button>
                        <button onClick={handleSave} className="btn btn-primary">Save Changes</button>
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
                            <h3 className="text-md font-semibold" style={{ color: 'var(--color-text-heading)' }}>{q.label}</h3>
                            {q.instructions && <p className="text-sm my-1 prose-sm" style={{ color: 'var(--color-text-muted)' }}>{q.instructions}</p>}
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
        </section>
    );
};

export default ImpactAssessmentView;
