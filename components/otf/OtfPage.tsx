
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { OtfApplication } from '../../types';
import * as api from '../../services/api';
import { initialOtfApplicationData } from '../../constants';
import OtfList from './OtfList';
import OtfEditor from './OtfEditor';
import ConfirmationModal from '../ui/ConfirmationModal';
import OtfProgramGuidelinesEditor from './OtfProgramGuidelinesEditor.tsx';

type ViewMode = 'list' | 'edit';
type OtfTab = 'applications' | 'guidelines';

const OtfPage: React.FC = () => {
    const { state, dispatch, notify } = useAppContext();
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [activeTab, setActiveTab] = useState<OtfTab>('applications');
    const [currentApplication, setCurrentApplication] = useState<OtfApplication | null>(null);
    const [appToDelete, setAppToDelete] = useState<OtfApplication | null>(null);

    useEffect(() => {
        if (state.otfApplicationToEdit) {
            setCurrentApplication(state.otfApplicationToEdit);
            setViewMode('edit');
            dispatch({ type: 'SET_OTF_APPLICATION_TO_EDIT', payload: null });
        }
    }, [state.otfApplicationToEdit, dispatch]);

    const handleAddNew = () => {
        const now = new Date().toISOString();
        const newApp: OtfApplication = {
            ...initialOtfApplicationData,
            id: `new_otf_${Date.now()}`,
            createdAt: now,
            updatedAt: now,
        };
        setCurrentApplication(newApp);
        setViewMode('edit');
    };

    const handleEdit = (id: string) => {
        const app = state.otfApplications.find(a => a.id === id);
        if (app) {
            setCurrentApplication(app);
            setViewMode('edit');
        }
    };

    const handleDelete = (app: OtfApplication) => {
        setAppToDelete(app);
    };

    const confirmDelete = async () => {
        if (!appToDelete) return;
        try {
            await api.deleteOtfApplication(appToDelete.id);
            dispatch({ type: 'DELETE_OTF_APPLICATION', payload: appToDelete.id });
            notify('Application deleted.', 'success');
        } catch (error: any) {
            notify(`Error: ${error.message}`, 'error');
        }
        setAppToDelete(null);
    };

    const handleSave = async (app: OtfApplication) => {
        const isNew = app.id.startsWith('new_otf_');
        try {
            let savedApp: OtfApplication;
            if (isNew) {
                const { id, createdAt, updatedAt, ...appPayload } = app;
                savedApp = await api.addOtfApplication(appPayload);
                dispatch({ type: 'ADD_OTF_APPLICATION', payload: savedApp });
            } else {
                savedApp = await api.updateOtfApplication(app.id, app);
                dispatch({ type: 'UPDATE_OTF_APPLICATION', payload: savedApp });
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

    const TABS: { id: OtfTab, label: string }[] = [
        { id: 'applications', label: 'My Applications' },
        { id: 'guidelines', label: 'Program Guidelines' },
    ];
    
    if (viewMode === 'edit' && currentApplication) {
        return (
            <OtfEditor 
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
                    title="Delete OTF Application"
                    message="Are you sure you want to permanently delete this application draft? This cannot be undone."
                />
            )}
            
             <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
                <h1 className="text-2xl font-bold text-slate-900">OTF Module</h1>
            </div>

            <div className="border-b border-slate-200 mb-6">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {TABS.map(tab => (
                        <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`whitespace-nowrap py-3 px-3 border-b-2 font-semibold text-sm transition-all ${activeTab === tab.id ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>{tab.label}</button>
                    ))}
                </nav>
            </div>
            
            {activeTab === 'applications' && (
                <OtfList 
                    applications={state.otfApplications}
                    onAdd={handleAddNew}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}
            
            {activeTab === 'guidelines' && (
                <OtfProgramGuidelinesEditor />
            )}
        </div>
    );
};

export default OtfPage;
