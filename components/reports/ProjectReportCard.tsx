import React from 'react';
import { FormData as Project, ProjectStatus } from '../../types';
import { useAppContext } from '../../context/AppContext';

const StatusBadge: React.FC<{ status: ProjectStatus | string }> = ({ status }) => {
    const { state } = useAppContext();
    const defaultStatusStyles: Record<string, string> = {
        'Active': 'bg-green-100 text-green-800',
        'On Hold': 'bg-yellow-100 text-yellow-800',
        'Completed': 'bg-blue-100 text-blue-800',
        'Pending': 'bg-slate-100 text-slate-800',
        'Terminated': 'bg-rose-100 text-rose-800',
    };
    
    const customStatus = state.settings.projects.statuses.find(s => s.label === status);
    
    let style = 'bg-gray-100 text-gray-800'; // Default fallback
    if (customStatus) {
        style = customStatus.color;
    } else if (status in defaultStatusStyles) {
        style = defaultStatusStyles[status as ProjectStatus];
    }
    
    return (
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${style}`}>
            {status}
        </span>
    );
};


interface ProjectReportCardProps {
    project: Project;
    onSelect: () => void;
}

const ProjectReportCard: React.FC<ProjectReportCardProps> = ({ project, onSelect }) => {
    const { reports, proposals, ecostarReports, interestCompatibilityReports, sdgAlignmentReports, recreationFrameworkReports, researchPlans, otfApplications } = useAppContext().state;
    
    const finalReportCount = reports.filter(r => r.projectId === project.id).length;
    const snapshotCount = proposals.filter(p => p.projectId === project.id).length;
    const supplementalCount = 
        ecostarReports.filter(r => r.projectId === project.id).length +
        interestCompatibilityReports.filter(r => r.projectId === project.id).length +
        sdgAlignmentReports.filter(r => r.projectId === project.id).length +
        recreationFrameworkReports.filter(r => r.projectId === project.id).length +
        researchPlans.filter(r => r.projectId === project.id).length +
        otfApplications.filter(r => r.projectId === project.id).length;

    const allReportDates = [
        ...reports.filter(r => r.projectId === project.id).map(r => new Date(parseInt(r.id.split('_')[1])).getTime()),
        ...proposals.filter(p => p.projectId === project.id).map(p => new Date(p.updatedAt || p.createdAt).getTime()),
        ...ecostarReports.filter(r => r.projectId === project.id).map(r => new Date(r.createdAt).getTime()),
        ...interestCompatibilityReports.filter(r => r.projectId === project.id).map(r => new Date(r.createdAt).getTime()),
        ...sdgAlignmentReports.filter(r => r.projectId === project.id).map(r => new Date(r.createdAt).getTime()),
        ...recreationFrameworkReports.filter(r => r.projectId === project.id).map(r => new Date(r.createdAt).getTime()),
        ...researchPlans.filter(r => r.projectId === project.id).map(r => new Date(r.updatedAt || r.createdAt).getTime()),
        ...otfApplications.filter(r => r.projectId === project.id).map(r => new Date(r.updatedAt || r.createdAt).getTime()),
    ];

    const lastUpdated = allReportDates.length > 0 ? new Date(Math.max(...allReportDates)) : null;

    return (
        <button 
            onClick={onSelect} 
            className="group block w-full text-left p-6 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
            style={{ 
                backgroundColor: 'var(--color-surface-card)', 
                border: '1px solid var(--color-border-subtle)'
            }}
        >
            <div className="flex flex-col h-full">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg" style={{ color: 'var(--color-primary)' }}>{project.projectTitle}</h3>
                    <StatusBadge status={project.status} />
                </div>
                <p className="text-sm mt-1 mb-4" style={{ color: 'var(--color-text-muted)' }}>
                    {project.projectStartDate ? new Date(project.projectStartDate).toLocaleDateString() : 'No start date'} - {project.projectEndDate ? new Date(project.projectEndDate).toLocaleDateString() : 'No end date'}
                </p>
                <div className="flex-grow border-t pt-3 space-y-2 text-sm" style={{ borderColor: 'var(--color-border-subtle)' }}>
                    <dl className="space-y-2">
                        <div className="flex justify-between items-center" style={{ color: 'var(--color-text-default)' }}>
                            <dt>Final Report:</dt>
                             <dd 
                                className="font-semibold px-2 py-0.5 rounded-full text-xs"
                                style={finalReportCount > 0 ? {
                                    backgroundColor: 'var(--color-status-success-bg)',
                                    color: 'var(--color-status-success-text)'
                                } : {
                                    backgroundColor: 'var(--color-surface-muted)',
                                    color: 'var(--color-text-muted)'
                                }}
                            >
                                {finalReportCount > 0 ? 'Created' : 'Not Created'}
                            </dd>
                        </div>
                        <div className="flex justify-between items-center" style={{ color: 'var(--color-text-default)' }}>
                            <dt>Proposal Snapshots:</dt>
                            <dd className="font-semibold" style={{ color: 'var(--color-text-heading)' }}>{snapshotCount}</dd>
                        </div>
                        <div className="flex justify-between items-center" style={{ color: 'var(--color-text-default)' }}>
                            <dt>Supplemental Reports:</dt>
                            <dd className="font-semibold" style={{ color: 'var(--color-text-heading)' }}>{supplementalCount}</dd>
                        </div>
                    </dl>
                </div>
                {lastUpdated && (
                     <p className="text-xs mt-4 text-right" style={{ color: 'var(--color-text-muted)' }}>
                        Last activity: {lastUpdated.toLocaleDateString()}
                     </p>
                )}
            </div>
            <style>{`
                .group:hover {
                    border-color: var(--color-primary);
                }
            `}</style>
        </button>
    );
};

export default ProjectReportCard;