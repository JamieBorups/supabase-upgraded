import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { NohfcApplication } from '../../types';
import * as api from '../../services/api';
import { initialNohfcApplicationData } from '../../constants';
import NohfcList from './NohfcList';
import NohfcEditor from './NohfcEditor';
import ConfirmationModal from '../ui/ConfirmationModal';
import NohfcProgramGuidelinesEditor from './NohfcProgramGuidelinesEditor';

type ViewMode = 'list' | 'edit';
type NohfcTab = 'applications' | 'guidelines';

const NohfcPage: React.FC = () => {
    const { state, dispatch, notify } = useAppContext();
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [activeTab, setActiveTab] = useState<NohfcTab>('applications');
    const [currentApplication, setCurrentApplication] = useState<NohfcApplication | null>(null);
    const [appToDelete, setAppToDelete] = useState<NohfcApplication | null>(null);

    useEffect(() => {
        if (state.nohfcApplicationToEdit) {
            setCurrentApplication(state.nohfcApplicationToEdit);
            setViewMode('edit');
            dispatch({ type: 'SET_NOHFC_APPLICATION_TO_EDIT', payload: null });
        }
    }, [state.nohfcApplicationToEdit, dispatch]);

    const handleAddNew = () => {
        const now = new Date().toISOString();
        const newApp: NohfcApplication = {
            ...initialNohfcApplicationData,
            id: `new_nohfc_${Date.now()}`,
            createdAt: now,
            updatedAt: now,
        };
        setCurrentApplication(newApp);
        setViewMode('edit');
    };

    const handleEdit = (id: string) => {
        const app = state.nohfcApplications.find(a => a.id === id);
        if (app) {
            setCurrentApplication(app);
            setViewMode('edit');
        }
    };

    const handleDelete = (app: NohfcApplication) => {
        setAppToDelete(app);
    };

    const confirmDelete = async () => {
        if (!appToDelete) return;
        try {
            await api.deleteNohfcApplication(appToDelete.id);
            dispatch({ type: 'DELETE_NOHFC_APPLICATION', payload: appToDelete.id });
            notify('Application deleted.', 'success');
        } catch (error: any) {
            notify(`Error: ${error.message}`, 'error');
        }
        setAppToDelete(null);
    };

    const handleSave = async (app: NohfcApplication) => {
        const isNew = app.id.startsWith('new_nohfc_');
        try {
            let savedApp: NohfcApplication;
            if (isNew) {
                const { id, createdAt, updatedAt, ...appPayload } = app;
                savedApp = await api.addNohfcApplication(appPayload as Omit<NohfcApplication, 'id' | 'createdAt' | 'updatedAt'>);
                dispatch({ type: 'ADD_NOHFC_APPLICATION', payload: savedApp });
            } else {
                savedApp = await api.updateNohfcApplication(app.id, app);
                dispatch({ type: 'UPDATE_NOHFC_APPLICATION', payload: savedApp });
            }
            notify(`Application ${isNew ? 'created' : 'saved'}.`, 'success');
            setViewMode('list');
            setCurrentApplication(null);
        } catch (error: any) {
            notify(`Error: ${error.message}`, 'error');
        }
    };

    const handleCancel = () => {
        setViewMode('list');
        setCurrentApplication(null);
    };

    const TABS: { id: NohfcTab, label: string }[] = [
        { id: 'applications', label: 'My Applications' },
        { id: 'guidelines', label: 'Program Guidelines' },
    ];
    
    if (viewMode === 'edit' && currentApplication) {
        return (
            <NohfcEditor 
                application={currentApplication}
                onSave={handleSave}
                onCancel={handleCancel}
            />
        );
    }

    return (
        <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
             {appToDelete && (
                <ConfirmationModal 
                    isOpen={!!appToDelete} 
                    onClose={() => setAppToDelete(null)}
                    onConfirm={confirmDelete}
                    title="Delete NOHFC Application"
                    message="Are you sure you want to permanently delete this application draft? This cannot be undone."
                />
            )}
            
             <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
                <h1 className="text-2xl font-bold text-slate-900">NOHFC Community Enhancement</h1>
            </div>
            
             <p className="text-base mb-8 -mt-2" style={{ color: 'var(--color-text-muted)' }}>
                This module is a specialized workspace for drafting and managing NOHFC Community Enhancement grant applications.
            </p>

            <div className="border-b border-slate-200 mb-6">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {TABS.map(tab => (
                        <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`whitespace-nowrap py-3 px-3 border-b-2 font-semibold text-sm transition-all ${activeTab === tab.id ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>{tab.label}</button>
                    ))}
                </nav>
            </div>
            
            {activeTab === 'applications' && (
                <NohfcList 
                    applications={state.nohfcApplications}
                    onAdd={handleAddNew}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}
            
            {activeTab === 'guidelines' && (
                <NohfcProgramGuidelinesEditor />
            )}
        </div>
    );
};

export default NohfcPage;