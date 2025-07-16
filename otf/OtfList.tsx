
import React from 'react';
import { OtfApplication } from '../../types';

interface OtfListProps {
    applications: OtfApplication[];
    onAdd: () => void;
    onEdit: (id: string) => void;
    onDelete: (application: OtfApplication) => void;
}

const OtfList: React.FC<OtfListProps> = ({ applications, onAdd, onEdit, onDelete }) => {
    return (
        <div>
            <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
                <h1 className="text-2xl font-bold text-slate-900">OTF Applications</h1>
                <button onClick={onAdd} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md shadow-sm hover:bg-teal-700">
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
                                <button onClick={() => onEdit(app.id)} className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700">Edit</button>
                                <button onClick={() => onDelete(app)} className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 rounded-md shadow-sm hover:bg-red-200">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OtfList;
