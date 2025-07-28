
import React from 'react';
import { Infrastructure } from '../../types.ts';

interface InfrastructureListProps {
    items: Infrastructure[];
    onAdd: () => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}

const InfrastructureList: React.FC<InfrastructureListProps> = ({ items, onAdd, onEdit, onDelete }) => {
    return (
        <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h1 className="text-3xl font-bold text-slate-900">Infrastructure & Facilities</h1>
                <button onClick={onAdd} className="btn btn-primary">
                    <i className="fa-solid fa-plus mr-2"></i>Add New Facility
                </button>
            </div>
            
            <p className="text-base mb-8 -mt-2 text-slate-600">
                Manage your collective's physical assets. This information serves as a primary source of truth for infrastructure-focused grant applications like NOHFC.
            </p>

            {items.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg">
                    <i className="fa-solid fa-building-circle-exclamation text-6xl text-slate-400"></i>
                    <h2 className="mt-4 text-xl font-semibold text-slate-700">No Facilities Recorded</h2>
                    <p className="mt-1 text-slate-500">Click "Add New Facility" to get started.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {items.map(item => (
                        <div key={item.id} className="p-4 border border-slate-200 rounded-lg bg-white shadow-sm flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg text-teal-700">{item.name}</h3>
                                <p className="text-sm font-semibold text-slate-600">{item.location}</p>
                                <p className="text-sm text-slate-500 mt-2">{item.description}</p>
                            </div>
                            <div className="flex-shrink-0 flex gap-2">
                                <button onClick={() => onEdit(item.id)} className="btn btn-secondary">Edit</button>
                                <button onClick={() => onDelete(item.id)} className="btn btn-danger">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InfrastructureList;
