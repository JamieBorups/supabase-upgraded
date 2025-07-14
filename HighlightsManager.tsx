
import React, { useState, useMemo } from 'react';
import { useAppContext } from './context/AppContext';
import { Highlight } from './types';
import ConfirmationModal from './components/ui/ConfirmationModal';
import { Input } from './components/ui/Input';
import { Select } from './components/ui/Select';
import FormField from './components/ui/FormField';
import * as api from './services/api';

const initialHighlight: Omit<Highlight, 'id'> = {
    projectId: '',
    title: '',
    url: ''
};

const HighlightEditorModal: React.FC<{
  highlight: Highlight | null;
  onSave: (highlight: Highlight) => void;
  onCancel: () => void;
}> = ({ highlight, onSave, onCancel }) => {
  const { state } = useAppContext();
  const [formData, setFormData] = useState<Omit<Highlight, 'id'>>(highlight || initialHighlight);

  const projectOptions = useMemo(() => [
    { value: '', label: 'Select a project...'},
    ...state.projects.map(p => ({ value: p.id, label: p.projectTitle }))
  ], [state.projects]);

  const handleChange = <K extends keyof typeof formData>(field: K, value: (typeof formData)[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectId || !formData.title || !formData.url) {
        alert("Please fill all fields.");
        return;
    }
    onSave({ ...formData, id: highlight?.id || `hl_${Date.now()}` });
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <form onSubmit={handleSave}>
          <h3 className="text-xl font-bold text-slate-800 mb-6">{highlight ? 'Edit Highlight' : 'Add New Highlight'}</h3>
          <div className="space-y-4">
            <FormField label="Project" htmlFor="hl_project" required>
              <Select id="hl_project" value={formData.projectId} onChange={e => handleChange('projectId', e.target.value)} options={projectOptions} />
            </FormField>
            <FormField label="Title" htmlFor="hl_title" required>
              <Input id="hl_title" value={formData.title} onChange={e => handleChange('title', e.target.value)} placeholder="e.g., CBC News Article" />
            </FormField>
            <FormField label="URL" htmlFor="hl_url" required>
              <Input id="hl_url" type="url" value={formData.url} onChange={e => handleChange('url', e.target.value)} placeholder="https://www.example.com/article" />
            </FormField>
          </div>
          <div className="mt-8 flex justify-end space-x-3">
            <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-md hover:bg-slate-200">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md shadow-sm hover:bg-teal-700">Save Highlight</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const HighlightLinksTab: React.FC = () => {
    const { state, dispatch, notify } = useAppContext();
    const { highlights, projects } = state;
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentHighlight, setCurrentHighlight] = useState<Highlight | null>(null);
    const [highlightToDelete, setHighlightToDelete] = useState<string | null>(null);
  
    const highlightsByProject = useMemo(() => {
      const grouped = new Map<string, Highlight[]>();
      const projectMap = new Map(projects.map(p => [p.id, p.projectTitle]));
      
      highlights.forEach(h => {
          const projectHighlights = grouped.get(h.projectId) || [];
          projectHighlights.push(h);
          grouped.set(h.projectId, projectHighlights);
      });
  
      const sortedGrouped = new Map([...grouped.entries()].sort((a, b) => (projectMap.get(a[0]) || '').localeCompare(projectMap.get(b[0]) || '')));
  
      return sortedGrouped;
    }, [highlights, projects]);
  
    const projectMap = useMemo(() => new Map(projects.map(p => [p.id, p.projectTitle])), [projects]);
  
    const handleAddClick = () => {
      setCurrentHighlight(null);
      setIsEditorOpen(true);
    };
  
    const handleEditClick = (highlight: Highlight) => {
      setCurrentHighlight(highlight);
      setIsEditorOpen(true);
    };
    
    const handleDeleteClick = (id: string) => {
      setHighlightToDelete(id);
      setIsDeleteModalOpen(true);
    };
    
    const confirmDelete = async () => {
      if (!highlightToDelete) return;
      try {
        await api.deleteHighlight(highlightToDelete);
        dispatch({ type: 'DELETE_HIGHLIGHT', payload: highlightToDelete });
        notify('Highlight deleted.', 'success');
      } catch (error: any) {
        notify(`Error: ${error.message}`, 'error');
      }
      setIsDeleteModalOpen(false);
      setHighlightToDelete(null);
    };
  
    const handleSave = async (highlight: Highlight) => {
      const isNew = !highlights.some(h => h.id === highlight.id);
      try {
        if (isNew) {
            const newHighlight = await api.addHighlight(highlight);
            dispatch({ type: 'ADD_HIGHLIGHT', payload: newHighlight });
        } else {
            const updatedHighlight = await api.updateHighlight(highlight.id, highlight);
            dispatch({ type: 'UPDATE_HIGHLIGHT', payload: updatedHighlight });
        }
        notify(isNew ? 'Highlight added!' : 'Highlight updated!', 'success');
      } catch(error: any) {
        notify(`Error: ${error.message}`, 'error');
      }
      setIsEditorOpen(false);
      setCurrentHighlight(null);
    };

    return (
        <>
        {isEditorOpen && <HighlightEditorModal highlight={currentHighlight} onSave={handleSave} onCancel={() => setIsEditorOpen(false)} />}
        {isDeleteModalOpen && <ConfirmationModal 
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={confirmDelete}
            title="Delete Highlight"
            message="Are you sure you want to delete this highlight? This action cannot be undone."
        />}
        <div className="flex justify-end mb-6">
             <button onClick={handleAddClick} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                <i className="fa fa-plus mr-2"></i>Add New Highlight
            </button>
        </div>
        {highlights.length === 0 ? (
            <div className="text-center py-20">
                <i className="fa-solid fa-link text-7xl text-slate-300"></i>
                <h3 className="mt-6 text-xl font-medium text-slate-800">No Highlights Added</h3>
                <p className="text-slate-500 mt-2 text-base">Add links to press, videos, or photos to document your project's success.</p>
            </div>
            ) : (
            <div className="space-y-8">
                {Array.from(highlightsByProject.entries()).map(([projectId, projectHighlights]) => (
                <div key={projectId} className="bg-slate-50/70 p-4 rounded-lg border border-slate-200">
                    <h2 className="text-xl font-bold text-teal-700">{projectMap.get(projectId) || 'Unlinked Project'}</h2>
                    <ul className="mt-3 divide-y divide-slate-200">
                    {projectHighlights.map(h => (
                        <li key={h.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3">
                        <div>
                            <p className="font-semibold text-slate-800">{h.title}</p>
                            <a href={h.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all">{h.url}</a>
                        </div>
                        <div className="flex items-center space-x-3 mt-2 sm:mt-0 flex-shrink-0">
                            <button onClick={() => handleEditClick(h)} className="px-3 py-1 text-sm text-slate-600 bg-white hover:bg-slate-50 rounded-md border border-slate-300">Edit</button>
                            <button onClick={() => handleDeleteClick(h.id)} className="px-3 py-1 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-md border border-red-200">Delete</button>
                        </div>
                        </li>
                    ))}
                    </ul>
                </div>
                ))}
            </div>
            )}
        </>
    )
}

const HighlightsManager: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'links' | 'gallery'>('links');
    
  return (
    <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
        <div className="mb-6 border-b border-slate-200">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Highlights</h1>
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                <button
                type="button"
                onClick={() => setActiveTab('links')}
                className={`whitespace-nowrap py-3 px-3 border-b-2 font-semibold text-sm transition-all duration-200 rounded-t-md ${
                    activeTab === 'links'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
                >
                Highlight Links
                </button>
                <button
                type="button"
                onClick={() => setActiveTab('gallery')}
                className={`whitespace-nowrap py-3 px-3 border-b-2 font-semibold text-sm transition-all duration-200 rounded-t-md ${
                    activeTab === 'gallery'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
                >
                Galleries (Coming Soon)
                </button>
            </nav>
        </div>

        <div>
            {activeTab === 'links' && <HighlightLinksTab />}
            {activeTab === 'gallery' && (
                <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 opacity-60 text-center py-20">
                     <i className="fa-solid fa-images text-7xl text-slate-300"></i>
                    <h3 className="text-lg font-semibold text-slate-800 mt-4">Galleries Coming Soon</h3>
                    <p className="text-sm text-slate-500 mt-1">This section will allow you to create curated galleries from your highlights.</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default HighlightsManager;
