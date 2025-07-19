
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import FormField from './ui/FormField.tsx';
import { FormData as Project } from '../types.ts';
import ProjectFilter from './ui/ProjectFilter.tsx';
import FinalReportSection from './reports/FinalReportSection.tsx';
import ProposalSnapshotsSection from './reports/ProposalSnapshotsSection.tsx';
import SupplementalReportsSection from './reports/SupplementalReportsSection.tsx';
import ProjectReportCard from './reports/ProjectReportCard.tsx';
import JobDescriptionsSection from './reports/JobDescriptionsSection.tsx';

const ReportsPage: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { projects } = state;
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    useEffect(() => {
        const projectIdToOpen = state.reportProjectIdToOpen;
        if (projectIdToOpen) {
            const projectToSelect = projects.find(p => p.id === projectIdToOpen) || null;
            setSelectedProject(projectToSelect);
            dispatch({ type: 'SET_REPORT_PROJECT_ID_TO_OPEN', payload: null });
        }
    }, [state.reportProjectIdToOpen, projects, dispatch]);
    
    const handleProjectSelectionChange = (projectId: string) => {
        const project = projects.find(p => p.id === projectId) || null;
        setSelectedProject(project);
    };
    
    const sortedProjects = [...projects].sort((a,b) => b.id.localeCompare(a.id));

    return (
        <div className="p-6 sm:p-8 rounded-xl shadow-lg" style={{ backgroundColor: 'var(--color-surface-card)', color: 'var(--color-text-default)' }}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 border-b pb-4 gap-4" style={{ borderColor: 'var(--color-border-subtle)' }}>
                <h1 className="report-page-title">Reporting & Archives</h1>
                <div className="w-full md:w-auto md:max-w-xs">
                     <FormField label="Filter Reports by Project" htmlFor="report_project_select" className="mb-0">
                        <ProjectFilter
                            value={selectedProject?.id || ''}
                            onChange={handleProjectSelectionChange}
                            allowAll={false}
                            statusFilter={['Completed', 'Pending', 'Active', 'On Hold', 'Terminated']}
                        />
                    </FormField>
                </div>
            </div>
            
            <p className="text-base mb-8 -mt-2" style={{ color: 'var(--color-text-muted)' }}>
                This section is your central hub for all project documentation. Use the filter to select a project and view its final report, historical proposal snapshots, and any saved supplemental reports. This page provides a comprehensive archive of your project's lifecycle for funders, partners, and your own records.
            </p>

            {selectedProject && (
                <h2 className="report-project-subtitle">
                    Reports for: {selectedProject.projectTitle}
                </h2>
            )}

            <div className="mt-8">
                {!selectedProject ? (
                    <div>
                        <h2 className="report-section-heading">Select a Project</h2>
                        <p className="text-base mb-6 -mt-2" style={{ color: 'var(--color-text-muted)' }}>
                            To view archived reports and snapshots, please select a project from the filter above. Or, browse the cards below for a quick overview.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sortedProjects.map(project => (
                                <ProjectReportCard 
                                    key={project.id}
                                    project={project}
                                    onSelect={() => handleProjectSelectionChange(project.id)}
                                />
                            ))}
                        </div>
                         {sortedProjects.length === 0 && (
                            <div className="text-center py-20">
                                <i className="fa-solid fa-folder-open text-7xl text-slate-300"></i>
                                <h3 className="mt-6 text-xl font-medium text-slate-800">No Projects Found</h3>
                                <p className="text-slate-500 mt-2 text-base">Create a project to begin managing reports.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-12">
                        <ProposalSnapshotsSection selectedProject={selectedProject} />
                        <SupplementalReportsSection selectedProject={selectedProject} />
                        <JobDescriptionsSection selectedProject={selectedProject} />
                        <FinalReportSection selectedProject={selectedProject} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportsPage;
