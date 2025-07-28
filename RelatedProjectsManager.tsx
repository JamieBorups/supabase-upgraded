
import React, { useState, useMemo } from 'react';
import { useAppContext } from './context/AppContext.tsx';
import { RelatedProject } from './types.ts';
import * as api from './services/api.ts';
import ConfirmationModal from './components/ui/ConfirmationModal.tsx';
import RelatedProjectsList from './components/related-projects/RelatedProjectsList.tsx';
import RelatedProjectsEditor from './components/related-projects/RelatedProjectsEditor.tsx';
import { initialRelatedProjectData } from './constants.ts';

type ViewMode = 'list' | 'edit';

const RelatedProjectsManager: React.FC = () => {
    const { state, dispatch, notify } = useAppContext();
    const { relatedProjects } = state;
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [currentProject, setCurrentProject] = useState<RelatedProject | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

    const handleAdd = () => {
        const now = new Date().toISOString();
        const newProject: RelatedProject = {
            ...initialRelatedProjectData,
            id: `new_rp_${Date.now()}`,
            createdAt: now,
            updatedAt: now,
        };
        setCurrentProject(newProject);
        setViewMode('edit');
    };
    
    const handleEdit = (id: string) => {
        const project = relatedProjects.find(p => p.id === id);
        if (project) {
            setCurrentProject(project);
            setViewMode('edit');
        }
    };

    const handleDelete = (id: string) => {
        setProjectToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!projectToDelete) return;
        try {
            await api.deleteRelatedProject(projectToDelete);
            dispatch({ type: 'DELETE_RELATED_PROJECT', payload: projectToDelete });
            notify('Related project deleted.', 'success');
        } catch (error: any) {
            notify(`Error deleting project: ${error.message}`, 'error');
        }
        setIsDeleteModalOpen(false);
        setProjectToDelete(null);
    };
    
    const handleSave = async (project: RelatedProject) => {
        const isNew = project.id.startsWith('new_');
        try {
            if (isNew) {
                const { id, ...payload } = project;
                const newProject = await api.addRelatedProject(payload as Omit<RelatedProject, 'id'>);
                dispatch({ type: 'ADD_RELATED_PROJECT', payload: newProject });
            } else {
                const updatedProject = await api.updateRelatedProject(project.id, project);
                dispatch({ type: 'UPDATE_RELATED_PROJECT', payload: updatedProject });
            }
            notify(`Related project ${isNew ? 'created' : 'updated'}.`, 'success');
            setViewMode('list');
            setCurrentProject(null);
        } catch(error: any) {
            notify(`Error: ${error.message}`, 'error');
        }
    };
    
    const handleCancel = () => {
        setViewMode('list');
        setCurrentProject(null);
    };

    return (
        <>
            {isDeleteModalOpen && (
                <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                    title="Delete Related Project"
                    message="Are you sure? This will remove it from any Research Plans it is linked to. This action cannot be undone."
                />
            )}
            
            {viewMode === 'list' && (
                <RelatedProjectsList
                    relatedProjects={relatedProjects}
                    onAdd={handleAdd}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}
            
            {viewMode === 'edit' && currentProject && (
                <RelatedProjectsEditor
                    project={currentProject}
                    onSave={handleSave}
                    onCancel={handleCancel}
                />
            )}
        </>
    );
};

export default RelatedProjectsManager;
