
import React from 'react';
import { useAppContext } from '../../context/AppContext.tsx';
import { RelatedProject } from '../../types';

interface RelatedProjectsListProps {
    relatedProjects: RelatedProject[];
    onAdd: () => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}

const RelatedProjectsList: React.FC<RelatedProjectsListProps> = ({ relatedProjects, onAdd, onEdit, onDelete }) => {
    const { state } = useAppContext();
    const projectMap = new Map(state.projects.map(p => [p.id, p.projectTitle]));

    return (
        <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h1 className="text-3xl font-bold text-slate-900">Related Projects</h1>
                <button onClick={onAdd} className="btn btn-primary">
                    <i className="fa-solid fa-plus mr-2"></i>Add New
                </button>
            </div>
            
            <p className="text-base mb-8 -mt-2 text-slate-600">
                Manage a library of related projects—internal or external—that can be cited in your research plans to provide context and demonstrate a foundation of prior work.
            </p>

            {relatedProjects.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg">
                    <i className="fa-solid fa-sitemap text-6xl text-slate-400"></i>
                    <h2 className="mt-4 text-xl font-semibold text-slate-700">No Related Projects</h2>
                    <p className="mt-1 text-slate-500">Click "Add New" to create your first related project record.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {relatedProjects.map(rp => (
                        <div key={rp.id} className="p-4 border border-slate-200 rounded-lg bg-white shadow-sm">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg text-teal-700">{rp.title}</h3>
                                    <p className="text-sm font-semibold text-slate-600">{rp.organizations}</p>
                                    <p className="text-sm text-slate-500 mt-2">{rp.description}</p>
                                    {rp.associatedProjectIds.length > 0 && (
                                        <div className="mt-2 text-xs">
                                            <span className="font-semibold text-slate-500">Associated with:</span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {rp.associatedProjectIds.map(id => (
                                                    <span key={id} className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full">{projectMap.get(id) || 'Unknown Project'}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-shrink-0 flex gap-2">
                                    <button onClick={() => onEdit(rp.id)} className="btn btn-secondary">Edit</button>
                                    <button onClick={() => onDelete(rp.id)} className="btn btn-danger">Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RelatedProjectsList;
