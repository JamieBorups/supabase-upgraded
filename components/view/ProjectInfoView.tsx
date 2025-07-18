import React from 'react';
import { FormData, ProjectStatus } from '../../types';
import { 
    ARTISTIC_DISCIPLINES,
    CRAFT_GENRES,
    DANCE_GENRES,
    LITERARY_GENRES,
    MEDIA_GENRES,
    MUSIC_GENRES,
    THEATRE_GENRES,
    VISUAL_ARTS_GENRES,
    ACTIVITY_TYPES
} from '../../constants';
import { useAppContext } from '../../context/AppContext';

interface ProjectInfoViewProps {
    project: FormData;
    hideTitle?: boolean;
}

const ViewField: React.FC<{ label: string; value?: React.ReactNode; children?: React.ReactNode }> = ({ label, value, children }) => (
    <div className="mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)'}}>{label}</h3>
        {value && <div className="mt-1" style={{ color: 'var(--color-text-default)'}}>{value}</div>}
        {children && <div className="mt-1" style={{ color: 'var(--color-text-default)'}}>{children}</div>}
    </div>
);

const StatusBadge: React.FC<{ status: ProjectStatus | string }> = ({ status }) => {
    const { state } = useAppContext();
    const { theme } = state.settings;

    const defaultStatusStyles: Record<ProjectStatus, { bg: string; text: string }> = {
        'Active': { bg: theme.statusSuccessBg, text: theme.statusSuccessText },
        'On Hold': { bg: theme.statusWarningBg, text: theme.statusWarningText },
        'Completed': { bg: theme.statusInfoBg, text: theme.statusInfoText },
        'Pending': { bg: theme.surfaceMuted, text: theme.textDefault },
        'Terminated': { bg: theme.statusErrorBg, text: theme.statusErrorText },
    };
    
    let style = defaultStatusStyles['Pending']; // Default fallback
    const customStatus = state.settings.projects.statuses.find(s => s.label === status);

    if (customStatus) {
        // This is a workaround since custom statuses store Tailwind classes not colors
        // A better long term solution is to store hex colors in settings
        return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${customStatus.color}`}>{status}</span>;
    } else if (status in defaultStatusStyles) {
        style = defaultStatusStyles[status as ProjectStatus];
    }
    
    return (
        <span 
            className="px-2 py-0.5 text-xs font-semibold rounded-full"
            style={{ backgroundColor: style.bg, color: style.text }}
        >
            {status}
        </span>
    );
};

const ProjectInfoView: React.FC<ProjectInfoViewProps> = ({ project, hideTitle = false }) => {

    const genreMap: Record<string, { data: string[], definitions: {value: string, label: string}[]}> = {
        craft: { data: project.craftGenres, definitions: CRAFT_GENRES },
        dance: { data: project.danceGenres, definitions: DANCE_GENRES },
        literary: { data: project.literaryGenres, definitions: LITERARY_GENRES },
        media: { data: project.mediaGenres, definitions: MEDIA_GENRES },
        music: { data: project.musicGenres, definitions: MUSIC_GENRES },
        theatre: { data: project.theatreGenres, definitions: THEATRE_GENRES },
        visual: { data: project.visualArtsGenres, definitions: VISUAL_ARTS_GENRES },
    };

    const renderArtisticDisciplines = () => {
        if (!project.artisticDisciplines || project.artisticDisciplines.length === 0) return 'N/A';
    
        const labels = project.artisticDisciplines
            .filter(d => d !== 'other')
            .map(disciplineKey => {
                const disciplineLabel = ARTISTIC_DISCIPLINES.find(d => d.value === disciplineKey)?.label || disciplineKey;
                
                const genreInfo = genreMap[disciplineKey];
                if (genreInfo && genreInfo.data && genreInfo.data.length > 0) {
                    const genreLabels = genreInfo.data.map(genreKey => 
                        genreInfo.definitions.find(g => g.value === genreKey)?.label || genreKey
                    ).join(', ');
                    return `${disciplineLabel} (${genreLabels})`;
                }
                
                return disciplineLabel;
            });
    
        if (project.artisticDisciplines.includes('other') && project.otherArtisticDisciplineSpecify) {
            labels.push(`Other: ${project.otherArtisticDisciplineSpecify}`);
        } else if (project.artisticDisciplines.includes('other')) {
            labels.push('Other');
        }
    
        return labels.join('; ');
    };
    
    const activityTypeLabel = ACTIVITY_TYPES.find(t => t.value === project.activityType)?.label || project.activityType;

    return (
        <section>
            {!hideTitle && <h2 className="text-2xl font-bold border-b-2 pb-2 mb-6" style={{ color: 'var(--color-text-heading)', borderColor: 'var(--color-primary)'}}>Project Information</h2>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                 <ViewField label="Project Status">
                    <StatusBadge status={project.status} />
                </ViewField>
                <ViewField label="Type of Activity" value={activityTypeLabel} />
            </div>

            <ViewField label="Artistic Disciplines & Genres" value={renderArtisticDisciplines()} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <ViewField label="Project Start Date" value={project.projectStartDate ? new Date(project.projectStartDate).toLocaleDateString() : 'N/A'} />
                <ViewField label="Project End Date" value={project.projectEndDate ? new Date(project.projectEndDate).toLocaleDateString() : 'N/A'} />
            </div>

            <ViewField label="Background">
                <p className="whitespace-pre-wrap">{project.background || 'N/A'}</p>
            </ViewField>
            
            <ViewField label="Project Description">
                <p className="whitespace-pre-wrap">{project.projectDescription || 'N/A'}</p>
            </ViewField>

            <ViewField label="Audience/Participants">
                <p className="whitespace-pre-wrap">{project.audience || 'N/A'}</p>
            </ViewField>
            
            <ViewField label="Schedule">
                <p className="whitespace-pre-wrap">{project.schedule || 'N/A'}</p>
            </ViewField>

             <ViewField label="Payment & Conditions">
                <p className="whitespace-pre-wrap">{project.paymentAndConditions || 'N/A'}</p>
            </ViewField>
            
            <ViewField label="Cultural Integrity">
                <p className="whitespace-pre-wrap">{project.culturalIntegrity || 'N/A'}</p>
            </ViewField>

            <ViewField label="Community Impact">
                <p className="whitespace-pre-wrap">{project.communityImpact || 'N/A'}</p>
            </ViewField>

            <ViewField label="Organizational Rationale">
                <p className="whitespace-pre-wrap">{project.organizationalRationale || 'N/A'}</p>
            </ViewField>

            <ViewField label="Artistic Development">
                <p className="whitespace-pre-wrap">{project.artisticDevelopment || 'N/A'}</p>
            </ViewField>
            
            <ViewField label="Additional Information">
                <p className="whitespace-pre-wrap">{project.additionalInfo || 'N/A'}</p>
            </ViewField>

             <ViewField label="Project Image">
                {project.imageUrl ? (
                    <img src={project.imageUrl} alt="Project" className="mt-2 rounded-lg shadow-lg max-w-md border" />
                ) : (
                    'N/A'
                )}
            </ViewField>

            <ViewField label="Permission/Confirmation Files">
                {project.permissionConfirmationFiles && project.permissionConfirmationFiles.length > 0 ? (
                    <ul className="list-disc list-inside">
                        {project.permissionConfirmationFiles.map(file => <li key={file.name}>{file.name}</li>)}
                    </ul>
                ) : (
                    'N/A'
                )}
            </ViewField>
        </section>
    );
};

export default ProjectInfoView;