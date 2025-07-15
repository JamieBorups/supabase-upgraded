



import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { Select } from './ui/Select.tsx';
import FormField from './ui/FormField.tsx';
import FinalReportTab from './reports/FinalReportTab.tsx';
import ProposalSnapshotsTab from './reports/ProposalSnapshotsTab.tsx';
import SupplementalReportsTab from './reports/SupplementalReportsTab.tsx';
import { FormData as Project, KpiReport } from '../types.ts';

type ReportTab = 'final' | 'proposals' | 'supplemental';

const ReportsPage: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { projects, kpiReports } = state;
    const [activeTab, setActiveTab] = useState<ReportTab>('final');
    
    // The core architectural change: manage the full project object, not just the ID.
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

const projectOptions = useMemo(() => {
    const allowedStatuses = ['Completed', 'Pending', 'Active'];
    return projects
        .filter(p => allowedStatuses.includes(p.status))
        .map(p => ({
            value: p.id,
            label: p.projectTitle
        }));
}, [projects]);

    // This effect runs when the page loads or when a project is completed elsewhere.
    useEffect(() => {
        const projectIdToOpen = state.reportProjectIdToOpen;
        if (projectIdToOpen) {
            const projectToSelect = projects.find(p => p.id === projectIdToOpen) || null;
            setSelectedProject(projectToSelect);
            // Reset the global state trigger so it doesn't fire again on re-renders.
            dispatch({ type: 'SET_REPORT_PROJECT_ID_TO_OPEN', payload: null });
        }
    }, [state.reportProjectIdToOpen, projects, dispatch]);
    
    const handleProjectSelectionChange = (projectId: string) => {
        const project = projects.find(p => p.id === projectId) || null;
        setSelectedProject(project);
    };
    
    const renderContent = () => {
        switch (activeTab) {
            case 'final':
                return <FinalReportTab selectedProject={selectedProject} />;
            case 'proposals':
                return <ProposalSnapshotsTab selectedProject={selectedProject} />;
            case 'supplemental':
                return <SupplementalReportsTab selectedProject={selectedProject} kpiReports={kpiReports} />;
            default:
                return null;
        }
    };
    
    return (
        <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-slate-200 pb-4 gap-4">
                <h1 className="text-3xl font-bold text-slate-900">Reporting & Archives</h1>
                <div className="w-full md:w-auto md:max-w-xs">
                     <FormField label="Filter by Project" htmlFor="report_project_select" className="mb-0">
                        <Select
                            id="report_project_select"
                            value={selectedProject?.id || ''}
                            onChange={(e) => handleProjectSelectionChange(e.target.value)}
                            options={[{ value: '', label: 'Select a project...' }, ...projectOptions]}
                        />
                    </FormField>
                </div>
            </div>

            <div className="border-b border-slate-200 mb-6">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button type="button" onClick={() => setActiveTab('final')} className={`whitespace-nowrap py-3 px-3 border-b-2 font-semibold text-sm transition-all duration-200 rounded-t-md ${activeTab === 'final' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Final Reporting</button>
                    <button type="button" onClick={() => setActiveTab('proposals')} className={`whitespace-nowrap py-3 px-3 border-b-2 font-semibold text-sm transition-all duration-200 rounded-t-md ${activeTab === 'proposals' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Proposal Snapshots</button>
                    <button type="button" onClick={() => setActiveTab('supplemental')} className={`whitespace-nowrap py-3 px-3 border-b-2 font-semibold text-sm transition-all duration-200 rounded-t-md ${activeTab === 'supplemental' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Supplemental Reports</button>
                </nav>
            </div>
            
            <div>
                {!selectedProject ? (
                    <div className="text-center py-20">
                        <i className="fa-solid fa-file-invoice text-7xl text-slate-300"></i>
                        <h3 className="mt-6 text-xl font-medium text-slate-800">No Project Selected</h3>
                        <p className="text-slate-500 mt-2 text-base">Please select a completed project from the dropdown above to view its reports.</p>
                    </div>
                ) : renderContent()}
            </div>
        </div>
    );
};

export default ReportsPage;