import React, { useMemo } from 'react';
import { useAppContext } from '../../context/AppContext.tsx';
import { Select } from './Select.tsx';

interface ProjectFilterProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  label?: string;
  allowAll?: boolean;
  statusFilter?: string[]; // Array of allowed statuses
}

const ProjectFilter: React.FC<ProjectFilterProps> = ({ value, onChange, className, label, allowAll = true, statusFilter }) => {
  const { state } = useAppContext();
  const { projects } = state;

  const projectOptions = useMemo(() => {
    let filteredProjects = projects;

    if (statusFilter && statusFilter.length > 0) {
      filteredProjects = projects.filter(p => statusFilter.includes(p.status));
    }
    
    const sortedProjects = [...filteredProjects].sort((a, b) => {
      // id is a timestamp-based string like 'proj_1625241445000'
      return b.id.localeCompare(a.id);
    });

    const options = sortedProjects.map(p => ({
      value: p.id,
      label: p.projectTitle
    }));
    
    const defaultLabel = allowAll ? 'All Projects' : 'Select a project...';

    return [{ value: '', label: defaultLabel }, ...options];

  }, [projects, allowAll, statusFilter]);

  return (
    <Select
      id="project-filter-select"
      value={value}
      onChange={e => onChange(e.target.value)}
      options={projectOptions}
      className={className}
      aria-label={label || 'Filter by Project'}
    />
  );
};

export default ProjectFilter;
