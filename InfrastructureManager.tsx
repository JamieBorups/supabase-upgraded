
import React, { useState } from 'react';
import { useAppContext } from './context/AppContext.tsx';
import { Infrastructure } from './types.ts';
import * as api from './services/api.ts';
import ConfirmationModal from './components/ui/ConfirmationModal.tsx';
import InfrastructureList from './components/infrastructure/InfrastructureList.tsx';
import InfrastructureEditor from './components/infrastructure/InfrastructureEditor.tsx';
import { initialInfrastructureData } from './constants.ts';

type ViewMode = 'list' | 'edit';

const InfrastructureManager: React.FC = () => {
    const { state, dispatch, notify } = useAppContext();
    const { infrastructure } = state;
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [currentItem, setCurrentItem] = useState<Infrastructure | null>(null);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    const handleAdd = () => {
        const now = new Date().toISOString();
        const newItem: Infrastructure = {
            ...initialInfrastructureData,
            id: `new_infra_${Date.now()}`,
            createdAt: now,
            updatedAt: now,
        };
        setCurrentItem(newItem);
        setViewMode('edit');
    };

    const handleEdit = (id: string) => {
        const item = infrastructure.find(i => i.id === id);
        if (item) {
            setCurrentItem(item);
            setViewMode('edit');
        }
    };

    const handleDelete = (id: string) => {
        setItemToDelete(id);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await api.deleteInfrastructure(itemToDelete);
            dispatch({ type: 'DELETE_INFRASTRUCTURE', payload: itemToDelete });
            notify('Facility deleted.', 'success');
        } catch (error: any) {
            notify(`Error deleting facility: ${error.message}`, 'error');
        }
        setItemToDelete(null);
    };

    const handleSave = async (item: Infrastructure) => {
        const isNew = item.id.startsWith('new_');
        try {
            if (isNew) {
                const { id, createdAt, updatedAt, ...payload } = item;
                const newItem = await api.addInfrastructure(payload);
                dispatch({ type: 'ADD_INFRASTRUCTURE', payload: newItem });
            } else {
                const updatedItem = await api.updateInfrastructure(item.id, { ...item, updatedAt: new Date().toISOString() });
                dispatch({ type: 'UPDATE_INFRASTRUCTURE', payload: updatedItem });
            }
            notify(`Facility ${isNew ? 'created' : 'updated'}.`, 'success');
            setViewMode('list');
            setCurrentItem(null);
        } catch(error: any) {
            notify(`Error: ${error.message}`, 'error');
        }
    };
    
    const handleCancel = () => {
        setViewMode('list');
        setCurrentItem(null);
    };

    return (
        <>
            {itemToDelete && (
                <ConfirmationModal
                    isOpen={!!itemToDelete}
                    onClose={() => setItemToDelete(null)}
                    onConfirm={confirmDelete}
                    title="Delete Facility"
                    message="Are you sure you want to delete this facility record? This cannot be undone."
                />
            )}
            
            {viewMode === 'list' && (
                <InfrastructureList
                    items={infrastructure}
                    onAdd={handleAdd}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}
            
            {viewMode === 'edit' && currentItem && (
                <InfrastructureEditor
                    item={currentItem}
                    onSave={handleSave}
                    onCancel={handleCancel}
                />
            )}
        </>
    );
};

export default InfrastructureManager;
