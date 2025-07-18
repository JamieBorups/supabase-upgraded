import React, { useState, useMemo, useEffect } from 'react';
import { produce } from 'immer';
import { useAppContext } from '../context/AppContext.tsx';
import FormField from './ui/FormField.tsx';
import { CheckboxGroup } from './ui/CheckboxGroup.tsx';
import { PEOPLE_INVOLVED_OPTIONS, GRANT_ACTIVITIES_OPTIONS, initialReportData } from '../constants.ts';
import { Report } from '../types.ts';
import * as api from '../services/api.ts';
import ProjectFilter from './ui/ProjectFilter.tsx';

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


const CommunityReachPage: React.FC = () => {
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

    return (
        <div className="p-6 sm:p-8 rounded-xl shadow-lg" style={{ backgroundColor: 'var(--color-surface-card)', color: 'var(--color-text-default)' }}>
            <div className="flex justify-between items-center mb-6 border-b pb-4" style={{ borderColor: 'var(--color-border-subtle)' }}>
                <h1 className="report-page-title">Community Reach</h1>
                <div className="w-full max-w-sm">
                    <FormField label="Select a Project to View/Edit Reach Data" htmlFor="reach_project_select" className="mb-0">
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
                    <i className="fa-solid fa-users-viewfinder text-7xl" style={{ color: 'var(--color-border-default)' }}></i>
                    <h3 className="mt-6 text-xl font-medium" style={{ color: 'var(--color-text-heading)' }}>No Project Selected</h3>
                    <p className="mt-2 text-base" style={{ color: 'var(--color-text-muted)' }}>Please select a project from the dropdown above to manage its community reach data.</p>
                </div>
            ) : !reportData ? (
                 <div className="text-center py-20">
                    <i className="fa-solid fa-spinner fa-spin text-7xl" style={{ color: 'var(--color-border-default)' }}></i>
                    <h3 className="mt-6 text-xl font-medium" style={{ color: 'var(--color-text-heading)' }}>Loading Report Data...</h3>
                </div>
            ) : (
                <div>
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="report-project-subtitle" style={{marginBottom: 0, paddingBottom: 0, borderBottom: 'none'}}>{selectedProject.projectTitle}</h2>
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
                </div>
            )}
        </div>
    );
};

export default CommunityReachPage;