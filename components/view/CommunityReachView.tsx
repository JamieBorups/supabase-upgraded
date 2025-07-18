import React, { useState, useMemo, useEffect } from 'react';
import { produce } from 'immer';
import { useAppContext } from '../../context/AppContext.tsx';
import { CheckboxGroup } from '../ui/CheckboxGroup.tsx';
import { PEOPLE_INVOLVED_OPTIONS, GRANT_ACTIVITIES_OPTIONS, initialReportData } from '../../constants.ts';
import { Report, FormData as Project } from '../../types.ts';
import * as api from '../../services/api.ts';

const ViewDisplay: React.FC<{ label: string, values: string[], options: { value: string, label: string }[] }> = ({ label, values, options }) => {
    const displayLabels = values.map(val => options.find(opt => opt.value === val)?.label.replace('... ', '') || val);

    return (
        <div>
            <h3 className="text-md font-semibold" style={{ color: 'var(--color-text-heading)' }}>{label}</h3>
            {displayLabels.length > 0 ? (
                 <ul className="list-disc list-inside mt-2 space-y-1" style={{ color: 'var(--color-text-default)' }}>
                    {displayLabels.map(label => <li key={label}>{label}</li>)}
                </ul>
            ) : (
                <p className="italic mt-2" style={{ color: 'var(--color-text-muted)' }}>No items selected.</p>
            )}
        </div>
    );
};

interface CommunityReachViewProps {
    project: Project;
}

const CommunityReachView: React.FC<CommunityReachViewProps> = ({ project }) => {
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

    const handleCancel = () => {
        setTempReportData(null);
        setViewMode('view');
    };

    const handleSave = async () => {
        if (!tempReportData) return;

        try {
            const savedReport = await api.addOrUpdateReport(tempReportData);
            const actionType = state.reports.some(r => r.id === savedReport.id) ? 'UPDATE_REPORT' : 'ADD_REPORT';
            dispatch({ type: actionType, payload: savedReport });
            
            setViewMode('view');
            setTempReportData(null);
            notify('Community reach data saved successfully!', 'success');
        } catch (error: any) {
            notify(`Error saving data: ${error.message}`, 'error');
        }
    };

    const handleTempReportChange = (field: keyof Report, value: any) => {
        if (!tempReportData) return;
        setTempReportData(produce(tempReportData, draft => {
            (draft as any)[field] = value;
        }));
    };

    if (!project || !reportData) {
        return (
            <div className="text-center py-20">
                <i className="fa-solid fa-spinner fa-spin text-4xl text-slate-400"></i>
                <p className="mt-4 text-slate-500">Loading Community Reach data...</p>
            </div>
        );
    }
    
    return (
        <section>
            <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-bold text-slate-800 border-b-2 border-teal-500 pb-2">Community Reach</h2>
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
            
            {viewMode === 'view' ? (
                <div className="space-y-8 mt-4">
                     <ViewDisplay 
                        label="My activities actively involved individuals who identify as:"
                        values={reportData.involvedPeople}
                        options={PEOPLE_INVOLVED_OPTIONS}
                     />
                     <ViewDisplay 
                        label="The activities supported by this grant involved:"
                        values={reportData.involvedActivities}
                        options={GRANT_ACTIVITIES_OPTIONS}
                     />
                </div>
            ) : tempReportData && (
                <div className="space-y-8 mt-4">
                    <div>
                        <h3 className="text-md font-semibold" style={{ color: 'var(--color-text-heading)' }}>My activities actively involved individuals who identify as:</h3>
                        <p className="text-sm my-1" style={{ color: 'var(--color-text-muted)' }}>Select all that apply.</p>
                        <div className="mt-2">
                            <CheckboxGroup name="involvedPeople" options={PEOPLE_INVOLVED_OPTIONS} selectedValues={tempReportData.involvedPeople || []} onChange={value => handleTempReportChange('involvedPeople', value)} columns={2} />
                        </div>
                    </div>
                     <div>
                        <h3 className="text-md font-semibold" style={{ color: 'var(--color-text-heading)' }}>The activities supported by this grant involved:</h3>
                        <p className="text-sm my-1" style={{ color: 'var(--color-text-muted)' }}>Select all that apply.</p>
                        <div className="mt-2">
                            <CheckboxGroup name="involvedActivities" options={GRANT_ACTIVITIES_OPTIONS} selectedValues={tempReportData.involvedActivities || []} onChange={value => handleTempReportChange('involvedActivities', value)} columns={2} />
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default CommunityReachView;
