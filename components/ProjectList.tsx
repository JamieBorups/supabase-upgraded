import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FormData, ProjectStatus } from '../types';
import { PROJECT_STATUS_OPTIONS } from '../constants';
import { useAppContext } from '../context/AppContext';

interface ProjectListProps {
  projects: FormData[];
  onAddProject: () => void;
  onEditProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onViewProject: (id: string) => void;
  onUpdateProjectStatus: (id: string, status: ProjectStatus | string) => void;
}

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
    
    // This logic is complex because custom statuses store Tailwind classes, not colors.
    // For now, we'll manually map theme vars to the default statuses.
    // A future refactor could store colors in custom statuses instead.
    
    let style = defaultStatusStyles['Pending']; // Default fallback
    if (status in defaultStatusStyles) {
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

const StatusDropdown: React.FC<{
  project: FormData;
  onUpdate: (id: string, status: ProjectStatus | string) => void;
}> = ({ project, onUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { state } = useAppContext();

  const projectStatusOptions = useMemo(() => {
    if (state.settings.projects.statuses && state.settings.projects.statuses.length > 0) {
        return state.settings.projects.statuses.map(s => ({ value: s.label, label: s.label }));
    }
    return PROJECT_STATUS_OPTIONS;
  }, [state.settings.projects.statuses]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUpdate = (status: ProjectStatus | string) => {
    onUpdate(project.id, status);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md"
        aria-label="Change project status"
        style={{ color: 'var(--color-text-muted)', backgroundColor: isOpen ? 'var(--color-surface-muted)' : 'transparent' }}
      >
        <i className="fa-solid fa-ellipsis-vertical"></i>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10" style={{ backgroundColor: 'var(--color-surface-card)'}}>
          <div className="py-1">
            {projectStatusOptions.map(option => (
              <button
                key={option.value}
                onClick={() => handleUpdate(option.value)}
                disabled={project.status === option.value}
                className="block w-full text-left px-4 py-2 text-sm disabled:cursor-not-allowed"
                style={{
                    color: project.status === option.value ? 'var(--color-text-muted)' : 'var(--color-text-default)',
                    backgroundColor: project.status === option.value ? 'var(--color-surface-muted)' : 'transparent'
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ProjectList: React.FC<ProjectListProps> = ({ projects, onAddProject, onEditProject, onDeleteProject, onViewProject, onUpdateProjectStatus }) => {
  const activeAndOnHoldProjects = projects.filter(p => ['Pending', 'Active', 'On Hold'].includes(p.status));
  const finishedProjects = projects.filter(p => ['Completed', 'Terminated'].includes(p.status));

  const renderProjectItem = (project: FormData) => (
     <li key={project.id} className={`py-4 px-2 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-slate-50 rounded-md -mx-2 transition-all duration-200 ${project.status === 'On Hold' ? 'opacity-70' : ''}`}>
        <div className="mb-3 sm:mb-0">
          <div className="flex items-center gap-3">
            <p className="text-lg font-semibold hover:underline cursor-pointer" style={{color: 'var(--color-primary)'}} onClick={() => onViewProject(project.id)}>
              {project.projectTitle || 'Untitled Project'}
            </p>
            <StatusBadge status={project.status || 'Active'} />
          </div>
          <p className="text-sm mt-1" style={{color: 'var(--color-text-muted)'}}>
            {project.projectStartDate ? new Date(project.projectStartDate).toLocaleDateString() : 'No start date'} - {project.projectEndDate ? new Date(project.projectEndDate).toLocaleDateString() : 'No end date'}
          </p>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-3 flex-shrink-0">
            <button
            onClick={() => onViewProject(project.id)}
            className="btn btn-secondary"
            aria-label={`View ${project.projectTitle}`}
            >
            <i className="fa-solid fa-eye mr-2" style={{color: 'var(--color-text-muted)'}}></i>
            View
            </button>
            <button
            onClick={() => onEditProject(project.id)}
            className="btn btn-secondary"
            aria-label={`Edit ${project.projectTitle}`}
            >
            <i className="fa-solid fa-pencil mr-2" style={{color: 'var(--color-text-muted)'}}></i>
            Edit
            </button>
            <button
            onClick={() => onDeleteProject(project.id)}
            className="btn btn-danger"
            aria-label={`Delete ${project.projectTitle}`}
            >
            <i className="fa-solid fa-trash-alt mr-2"></i>
            Delete
            </button>
            <StatusDropdown project={project} onUpdate={onUpdateProjectStatus} />
        </div>
    </li>
  );

  return (
    <div className="p-6 sm:p-8 rounded-xl shadow-lg" style={{ backgroundColor: 'var(--color-surface-card)' }}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b pb-4 gap-4" style={{ borderColor: 'var(--color-border-subtle)'}}>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-heading)'}}>Your Projects</h1>
        <button
          onClick={onAddProject}
          className="btn btn-primary"
        >
          <i className="fa-solid fa-plus mr-2"></i>
          Add New Project
        </button>
      </div>
      
      <p className="text-base mb-8 -mt-2" style={{ color: 'var(--color-text-muted)' }}>
        This section is your main dashboard for all projects. From here, you can add, view, edit, or delete any project your collective is working on. Use the controls on each project to manage its status and access the detailed viewer or editor.
      </p>

      {projects.length === 0 ? (
        <div className="text-center py-20">
          <i className="fa-solid fa-folder-open text-7xl" style={{color: 'var(--color-border-default)'}}></i>
          <h3 className="mt-6 text-xl font-medium" style={{color: 'var(--color-text-heading)'}}>You haven't created any projects yet.</h3>
          <p className="mt-2 text-base" style={{color: 'var(--color-text-muted)'}}>Click the "Add New Project" button above to get started!</p>
        </div>
      ) : (
        <div>
            <h2 className="text-xl font-bold mb-2" style={{color: 'var(--color-text-heading)'}}>Active & On Hold</h2>
            {activeAndOnHoldProjects.length > 0 ? (
                 <ul className="divide-y" style={{borderColor: 'var(--color-border-subtle)'}}>
                    {activeAndOnHoldProjects.map(renderProjectItem)}
                </ul>
            ) : (
                <p className="italic py-4" style={{color: 'var(--color-text-muted)'}}>No active projects.</p>
            )}

            {finishedProjects.length > 0 && (
                <details className="mt-8 group">
                    <summary className="text-xl font-bold cursor-pointer list-none flex items-center gap-2" style={{color: 'var(--color-text-heading)'}}>
                        <i className="fa-solid fa-chevron-right transition-transform duration-200 group-open:rotate-90"></i>
                        Finished Projects ({finishedProjects.length})
                    </summary>
                    <div className="mt-2 border-t pt-2" style={{borderColor: 'var(--color-border-subtle)'}}>
                        <ul className="divide-y" style={{borderColor: 'var(--color-border-subtle)'}}>
                            {finishedProjects.map(renderProjectItem)}
                        </ul>
                    </div>
                </details>
            )}
        </div>
      )}
    </div>
  );
};

export default ProjectList;