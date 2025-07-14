
import React, { useState, useMemo } from 'react';
import ProjectList from './components/ProjectList';
import ProjectEditor from './components/ProjectEditor';
import ProjectViewer from './components/ProjectViewer';
import ConfirmationModal from './components/ui/ConfirmationModal';
import { initialFormData as initialFormDataConstant } from './constants';
import { FormData as FormData_type, ProjectStatus, Page } from './types';
import { useAppContext } from './context/AppContext';
import * as api from './services/api';

type ViewMode = 'list' | 'edit' | 'view';

interface ProjectManagerProps {
  onNavigate: (page: Page) => void;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({ onNavigate }) => {
  const { state, dispatch, notify } = useAppContext();
  const { projects } = state;
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentProject, setCurrentProject] = useState<FormData_type | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [projectToComplete, setProjectToComplete] = useState<string | null>(null);

  // This dynamic key forces the editor/viewer to remount when underlying data changes, solving the refresh issue.
  const componentKey = useMemo(() => {
    if (!currentProject) return null;
    
    const projectEvents = state.events.filter(e => e.projectId === currentProject.id);
    const relevantEventIds = new Set(projectEvents.map(e => e.id));
    
    const relevantEventTickets = state.eventTickets.filter(et => relevantEventIds.has(et.eventId));
    
    const relevantVenueIds = new Set(projectEvents.map(e => e.venueId));
    const relevantVenues = state.venues.filter(v => relevantVenueIds.has(v.id));

    const eventsSignature = JSON.stringify(projectEvents.map(e => ({id: e.id, v: e.venueId, s: e.status})));
    const ticketsSignature = JSON.stringify(relevantEventTickets.map(t => ({id: t.id, p: t.price, c: t.capacity})));
    const venuesSignature = JSON.stringify(relevantVenues.map(v => ({id: v.id, c: v.capacity})));

    return `${currentProject.id}-${eventsSignature}-${ticketsSignature}-${venuesSignature}`;
  }, [currentProject, state.events, state.eventTickets, state.venues]);


  const handleAddProject = () => {
    const newProject: FormData_type = {
      ...initialFormDataConstant,
      id: `proj_${Date.now()}`,
      projectTitle: 'New Project'
    };
    setCurrentProject(newProject);
    setViewMode('edit');
  };
  
  const handleViewProject = (id: string) => {
    const projectToView = projects.find(p => p.id === id);
    if (projectToView) {
      setCurrentProject(projectToView);
      setViewMode('view');
    }
  };

  const handleEditProject = (id: string) => {
    const projectToEdit = projects.find(p => p.id === id);
    if (projectToEdit) {
      setCurrentProject(projectToEdit);
      setViewMode('edit');
    }
  };

  const handleDeleteProject = (id: string) => {
    setProjectToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;
    
    try {
        await api.deleteProject(projectToDelete);
        dispatch({ type: 'DELETE_PROJECT', payload: projectToDelete });
        notify('Project and all associated data deleted.', 'success');
    } catch (error: any) {
        notify(`Error deleting project: ${error.message}`, 'error');
    }

    // Reset state
    setViewMode('list');
    setCurrentProject(null);
    setIsDeleteModalOpen(false);
    setProjectToDelete(null);
  };


  const handleSaveProject = async (projectToSave: FormData_type) => {
    const isNewProject = !projects.some(p => p.id === projectToSave.id);
    const originalProject = projects.find(p => p.id === projectToSave.id);

    try {
        let savedProject: FormData_type;
        if (isNewProject) {
            savedProject = await api.addProject(projectToSave);
            dispatch({ type: 'ADD_PROJECT', payload: savedProject });
        } else {
            savedProject = await api.updateProject(projectToSave.id, projectToSave);
            dispatch({ type: 'UPDATE_PROJECT', payload: savedProject });
        }

        if (originalProject && originalProject.status !== 'Completed' && savedProject.status === 'Completed') {
            setProjectToComplete(savedProject.id);
            setIsReportModalOpen(true);
        }
    
        if (viewMode === 'edit') {
            notify(isNewProject ? 'Project created successfully!' : 'Project saved successfully!', 'success');
            setViewMode('list');
            setCurrentProject(null);
        } else if (viewMode === 'view') {
            notify('Project updated successfully!', 'success');
            setCurrentProject(savedProject);
        }
    } catch (error: any) {
        notify(`Error saving project: ${error.message}`, 'error');
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    setCurrentProject(null);
  };
  
  const handleUpdateProjectStatus = async (projectId: string, status: ProjectStatus | string) => {
    const originalProject = projects.find(p => p.id === projectId);
    if (!originalProject) return;

    try {
        await api.updateProjectStatus(projectId, status);
        dispatch({ type: 'UPDATE_PROJECT_STATUS', payload: { projectId, status } });
        notify(`Project status updated to ${status}.`, 'success');
    
        if (originalProject.status !== 'Completed' && status === 'Completed') {
          setProjectToComplete(projectId);
          setIsReportModalOpen(true);
        }
    } catch (error: any) {
        notify(`Error updating status: ${error.message}`, 'error');
    }
  };

  const confirmGenerateReport = () => {
    if (!projectToComplete) return;
    dispatch({ type: 'SET_REPORT_PROJECT_ID_TO_OPEN', payload: projectToComplete });
    onNavigate('reports');
    setIsReportModalOpen(false);
    setProjectToComplete(null);
  };

  const renderContent = () => {
      switch(viewMode) {
          case 'edit':
              return currentProject && <ProjectEditor
                key={componentKey}
                project={currentProject}
                onSave={handleSaveProject}
                onCancel={handleBackToList}
              />;
          case 'view':
              return currentProject && <ProjectViewer 
                key={componentKey}
                project={currentProject} 
                onBack={handleBackToList} 
                onSave={handleSaveProject}
              />;
          case 'list':
          default:
            return <ProjectList
                projects={projects}
                onAddProject={handleAddProject}
                onEditProject={handleEditProject}
                onDeleteProject={handleDeleteProject}
                onViewProject={handleViewProject}
                onUpdateProjectStatus={handleUpdateProjectStatus}
              />;
      }
  }

  return (
    <div className="font-sans text-slate-800">
      <main className="w-full">
        {renderContent()}
         {isDeleteModalOpen && (
            <ConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={confirmDeleteProject}
            title="Delete Project"
            message={
                <>
                Are you sure you want to delete this project? 
                <br />
                <strong className="font-bold text-red-700">This action cannot be undone.</strong> All associated tasks, activities, and expenses will also be permanently deleted.
                </>
            }
            confirmButtonText="Delete Project"
            />
        )}
        {isReportModalOpen && (
            <ConfirmationModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                onConfirm={confirmGenerateReport}
                title="Project Complete"
                message="This project is now complete. Would you like to generate the final report now?"
                confirmButtonText="Generate Report"
                cancelButtonText="Later"
            />
        )}
      </main>
    </div>
  );
};

export default ProjectManager;
