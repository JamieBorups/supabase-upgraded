
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { NewsRelease } from '../../types';
import NewsReleaseEditor from './NewsReleaseEditor';
import ConfirmationModal from '../ui/ConfirmationModal';
import NewsReleaseViewer from './NewsReleaseViewer';
import * as api from '../../services/api';

type ViewMode = 'list' | 'edit';

const MediaManager: React.FC = () => {
    const { state, dispatch, notify } = useAppContext();
    const { projects, newsReleases } = state;

    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [currentRelease, setCurrentRelease] = useState<NewsRelease | null>(null);
    const [currentProjectId, setCurrentProjectId] = useState<string>('');
    const [releaseToView, setReleaseToView] = useState<NewsRelease | null>(null);
    const [releaseToDelete, setReleaseToDelete] = useState<string | null>(null);

    const releasesByProject = useMemo(() => {
        const map = new Map<string, NewsRelease[]>();
        newsReleases.forEach(release => {
            const list = map.get(release.projectId) || [];
            list.push(release);
            map.set(release.projectId, list);
        });
        return map;
    }, [newsReleases]);
    
    const handleAddNew = (projectId: string) => {
        setCurrentProjectId(projectId);
        setCurrentRelease(null);
        setViewMode('edit');
    };
    
    const handleEdit = (release: NewsRelease) => {
        setCurrentProjectId(release.projectId);
        setCurrentRelease(release);
        setViewMode('edit');
    };

    const handleDelete = (releaseId: string) => {
        setReleaseToDelete(releaseId);
    };
    
    const confirmDelete = async () => {
        if (!releaseToDelete) return;
        try {
            await api.deleteNewsRelease(releaseToDelete);
            dispatch({ type: 'DELETE_NEWS_RELEASE', payload: releaseToDelete });
            notify('News release deleted.', 'success');
        } catch (error: any) {
            notify(`Error deleting news release: ${error.message}`, 'error');
        }
        setReleaseToDelete(null);
    };

    const handleCancelEdit = () => {
        setViewMode('list');
        setCurrentRelease(null);
        setCurrentProjectId('');
    };

    const handleSaveRelease = async (releaseToSave: NewsRelease) => {
        const isNew = !state.newsReleases.some(r => r.id === releaseToSave.id);
        try {
            if (isNew) {
                const newRelease = await api.addNewsRelease(releaseToSave);
                dispatch({ type: 'ADD_NEWS_RELEASE', payload: newRelease });
            } else {
                const updatedRelease = await api.updateNewsRelease(releaseToSave.id, releaseToSave);
                dispatch({ type: 'UPDATE_NEWS_RELEASE', payload: updatedRelease });
            }
            notify(`News release ${isNew ? 'created' : 'updated'} successfully!`, 'success');
            handleCancelEdit();
        } catch (error: any) {
            notify(`Error saving news release: ${error.message}`, 'error');
        }
    };

    const getStatusClass = (status: NewsRelease['status']) => {
        switch(status) {
            case 'Draft': return 'text-yellow-700';
            case 'For Review': return 'text-blue-700';
            case 'Approved': return 'text-green-700';
            default: return 'text-slate-700';
        }
    }

    return (
        <>
            {viewMode === 'edit' ? (
                 <NewsReleaseEditor 
                    projectId={currentProjectId}
                    release={currentRelease}
                    onSave={handleSaveRelease}
                    onCancel={handleCancelEdit}
                />
            ) : releaseToView ? (
                 <NewsReleaseViewer release={releaseToView} onClose={() => setReleaseToView(null)} />
            ) : (
                <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
                    {releaseToDelete && (
                        <ConfirmationModal 
                            isOpen={!!releaseToDelete}
                            onClose={() => setReleaseToDelete(null)}
                            onConfirm={confirmDelete}
                            title="Delete News Release"
                            message="Are you sure you want to permanently delete this news release?"
                        />
                    )}
                    <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
                        <h1 className="text-3xl font-bold text-slate-900">Media Center</h1>
                    </div>

                    {projects.length === 0 ? (
                         <div className="text-center py-20">
                            <i className="fa-solid fa-folder-open text-7xl text-slate-300"></i>
                            <h3 className="mt-6 text-xl font-medium text-slate-800">No Projects Found</h3>
                            <p className="text-slate-500 mt-2 text-base">You need to create a project before you can create media for it.</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {projects.map(project => {
                                const projectReleases = releasesByProject.get(project.id) || [];
                                return (
                                    <div key={project.id} className="bg-slate-50/70 p-4 rounded-lg border border-slate-200">
                                        <div className="flex justify-between items-center mb-3">
                                            <h2 className="text-xl font-bold text-teal-700">{project.projectTitle}</h2>
                                            <button onClick={() => handleAddNew(project.id)} className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700">
                                                <i className="fa-solid fa-plus mr-2"></i>New Release
                                            </button>
                                        </div>
                                        
                                        {projectReleases.length > 0 ? (
                                            <ul className="divide-y divide-slate-200 bg-white border border-slate-200 rounded-md">
                                                {projectReleases.sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).map(release => (
                                                    <li key={release.id} className="p-3 hover:bg-slate-50 flex justify-between items-center">
                                                        <div>
                                                            <p className="font-semibold text-slate-800">{release.headline || "Untitled Release"}</p>
                                                            <p className="text-xs text-slate-500">
                                                                Status: <span className={`font-semibold ${getStatusClass(release.status)}`}>{release.status}</span>
                                                                <span className="mx-2">|</span>
                                                                Last Updated: {new Date(release.updatedAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2 flex-shrink-0">
                                                            <button onClick={() => setReleaseToView(release)} className="px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md">View</button>
                                                            <button onClick={() => handleEdit(release)} className="px-3 py-1 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-md">Edit</button>
                                                            <button onClick={() => handleDelete(release.id)} className="px-3 py-1 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-md">Delete</button>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="text-center p-6 border-2 border-dashed border-slate-300 rounded-md">
                                                <p className="text-slate-500">No news releases for this project yet.</p>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default MediaManager;
