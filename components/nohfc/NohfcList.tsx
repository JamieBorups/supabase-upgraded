
import React from 'react';
import { NohfcApplication } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { generateNohfcPdf } from '../../utils/pdfGenerator';

interface NohfcListProps {
    applications: NohfcApplication[];
    onAdd: () => void;
    onEdit: (id: string) => void;
    onDelete: (application: NohfcApplication) => void;
}

const NohfcList: React.FC<NohfcListProps> = ({ applications, onAdd, onEdit, onDelete }) => {
    const { state, notify } = useAppContext();
    const { projects } = state;
    const projectMap = React.useMemo(() => new Map(projects.map(p => [p.id, p.projectTitle])), [projects]);

    const handleDownloadPdf = async (app: NohfcApplication) => {
        const projectTitle = app.projectId ? projectMap.get(app.projectId) || 'Project' : 'Project';
        notify('Generating PDF...', 'info');
        try {
            await generateNohfcPdf(app, projectTitle);
        } catch (error: any) {
            notify(`Failed to generate PDF: ${error.message}`, 'error');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">My NOHFC Applications</h2>
                <button onClick={onAdd} className="btn btn-primary">
                    <i className="fa-solid fa-plus mr-2"></i>New Application
                </button>
            </div>
            {applications.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg">
                    <i className="fa-solid fa-file-signature text-6xl text-slate-400"></i>
                    <h2 className="mt-4 text-xl font-semibold text-slate-700">No Applications Started</h2>
                    <p className="mt-1 text-slate-500">Click "New Application" to begin drafting.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {applications.map(app => (
                        <div key={app.id} className="p-4 bg-white border border-slate-200 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-slate-800">{app.title || 'Untitled Application'}</p>
                                <p className="text-sm text-slate-500">Last updated: {new Date(app.updatedAt).toLocaleString()}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleDownloadPdf(app)} className="btn btn-secondary">PDF</button>
                                <button onClick={() => onEdit(app.id)} className="btn btn-secondary">Edit</button>
                                <button onClick={() => onDelete(app)} className="btn btn-danger">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NohfcList;