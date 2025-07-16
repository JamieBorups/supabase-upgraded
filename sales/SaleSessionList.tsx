
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext.tsx';
import { SaleSession } from '../../types.ts';
import ConfirmationModal from '../ui/ConfirmationModal.tsx';
import SaleSessionEditorModal from './SaleSessionEditorModal.tsx';
import * as api from '../../services/api.ts';
import { Select } from '../ui/Select.tsx';
import FormField from '../ui/FormField.tsx';

const formatCurrency = (value: number) => value.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });

const ProgressBar: React.FC<{ value: number; max: number; }> = ({ value, max }) => {
    const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    return (
        <div className="w-full bg-slate-200 rounded-full h-2.5">
            <div 
                className="bg-teal-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
            ></div>
        </div>
    );
};

interface SaleSessionListProps {
    onEnterSession: (session: SaleSession) => void;
}

const SaleSessionList: React.FC<SaleSessionListProps> = ({ onEnterSession }) => {
    const { state, dispatch, notify } = useAppContext();
    const { saleSessions, salesTransactions, projects, events } = state;
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [currentItem, setCurrentItem] = useState<SaleSession | null>(null);
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [selectedEventId, setSelectedEventId] = useState<string>('');

    const projectMap = useMemo(() => new Map(projects.map(p => [p.id, p.projectTitle])), [projects]);
    const eventMap = useMemo(() => new Map(events.map(e => [e.id, e.title])), [events]);
    
    const actualRevenueMap = useMemo(() => {
        const revenueMap = new Map<string, number>();
        salesTransactions.forEach(tx => {
            if (tx.saleSessionId) {
                const currentRevenue = revenueMap.get(tx.saleSessionId) || 0;
                revenueMap.set(tx.saleSessionId, currentRevenue + tx.total);
            }
        });
        return revenueMap;
    }, [salesTransactions]);

    const salesEventOptions = useMemo(() => {
        const eventIdsWithSales = new Set(saleSessions.map(s => s.eventId).filter((id): id is string => !!id));
        let relevantSalesEvents = events.filter(e => eventIdsWithSales.has(e.id) && !e.isTemplate);
        if (selectedProjectId) {
            relevantSalesEvents = relevantSalesEvents.filter(e => e.projectId === selectedProjectId);
        }
        return [{ value: '', label: 'All Sales Events' }, ...relevantSalesEvents.map(e => ({ value: e.id, label: e.title }))];
    }, [events, saleSessions, selectedProjectId]);

    const handleProjectFilterChange = (projectId: string) => {
        setSelectedProjectId(projectId);
        setSelectedEventId(''); // Reset event filter when project changes
    };

    const handleEventFilterChange = (eventId: string) => {
        // Only set the event ID. Do not change the project filter.
        setSelectedEventId(eventId);
    };

    const filteredSaleSessions = useMemo(() => {
        let sessions = saleSessions;
        // If an event is selected, it's the most specific filter.
        if (selectedEventId) {
            return sessions.filter(s => s.eventId === selectedEventId);
        }
        // If only a project is selected, filter by that.
        if (selectedProjectId) {
            const projectEventIds = new Set(events.filter(e => e.projectId === selectedProjectId).map(e => e.id));
            return sessions.filter(s => s.projectId === selectedProjectId || (s.eventId && projectEventIds.has(s.eventId)));
        }
        // If no filters, return all.
        return sessions;
    }, [saleSessions, events, selectedProjectId, selectedEventId]);

    const handleAdd = () => {
        setCurrentItem(null);
        setIsEditorOpen(true);
    };

    const handleEdit = (item: SaleSession) => {
        setCurrentItem(item);
        setIsEditorOpen(true);
    };

    const handleDelete = (id: string) => {
        setItemToDelete(id);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await api.deleteSaleSession(itemToDelete);
            dispatch({ type: 'DELETE_SALE_SESSION', payload: itemToDelete });
            notify('Sale Session deleted.', 'success');
        } catch (e: any) { notify(e.message, 'error'); }
        setItemToDelete(null);
    };

    const handleSave = async (item: SaleSession) => {
        const isNew = !item.id || item.id.startsWith('new_session_');
        let savedSession: SaleSession;
        
        try {
            if (isNew) {
                savedSession = await api.addSaleSession(item);
                dispatch({ type: 'ADD_SALE_SESSION', payload: savedSession });
            } else {
                savedSession = await api.updateSaleSession(item.id, item);
                dispatch({ type: 'UPDATE_SALE_SESSION', payload: savedSession });
            }
            notify(`Sale Session ${isNew ? 'created' : 'updated'}.`, 'success');
        } catch (e: any) {
             notify(`Error saving session: ${e.message}`, 'error');
        }
        
        setIsEditorOpen(false);
        setCurrentItem(null);
    };

    const getContextDisplay = (session: SaleSession) => {
        switch (session.associationType) {
            case 'event':
                return `Event: ${eventMap.get(session.eventId || '') || 'Unknown'}`;
            case 'project':
                return `Project: ${projectMap.get(session.projectId || '') || 'Unknown'}`;
            case 'general':
                 return "General Sale";
        }
        if(session.organizerType === 'partner') {
            return `Partner: ${session.partnerName}`;
        }
        return 'Internal Sale';
    }

    return (
        <div>
            {isEditorOpen && <SaleSessionEditorModal session={currentItem} onSave={handleSave} onCancel={() => setIsEditorOpen(false)} />}
            {itemToDelete && <ConfirmationModal isOpen={!!itemToDelete} onClose={() => setItemToDelete(null)} onConfirm={confirmDelete} title="Delete Session" message="Are you sure? This will not delete past sales transactions, but you will no longer be able to add new sales to this session." />}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="w-full md:w-auto flex flex-col md:flex-row gap-4">
                    <FormField label="Filter by Project" htmlFor="sales_project_select" className="mb-0 flex-grow">
                        <Select id="sales_project_select" value={selectedProjectId} onChange={(e) => handleProjectFilterChange(e.target.value)} options={[{ value: '', label: 'All Projects' }, ...projects.map(p => ({ value: p.id, label: p.projectTitle }))]} />
                    </FormField>
                    <FormField label="Filter by Sales Event" htmlFor="sales_event_select" className="mb-0 flex-grow">
                        <Select id="sales_event_select" value={selectedEventId} onChange={(e) => handleEventFilterChange(e.target.value)} options={salesEventOptions} />
                    </FormField>
                </div>
                 <div className="flex-shrink-0">
                    <button onClick={handleAdd} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md shadow-sm hover:bg-teal-700">
                        <i className="fa-solid fa-plus mr-2"></i>Create New Sale
                    </button>
                </div>
            </div>
            
            {filteredSaleSessions.length === 0 ? (
                <div className="text-center py-16 text-slate-500 border-2 border-dashed border-slate-300 rounded-lg">
                    <i className="fa-solid fa-flag text-5xl text-slate-400"></i>
                    <h3 className="mt-4 text-lg font-medium">No sale sessions found.</h3>
                    <p className="mt-1">{saleSessions.length > 0 ? 'Try clearing your filters.' : 'Click "Create New Sale" to get started.'}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredSaleSessions.map(session => {
                        const actualRevenue = actualRevenueMap.get(session.id) || 0;
                        const expectedRevenue = session.expectedRevenue || 0;
                        return (
                             <div key={session.id} className="p-4 bg-white border border-slate-200 rounded-lg flex flex-col gap-4">
                                <div className="flex flex-col md:flex-row justify-between md:items-start gap-3">
                                    <div>
                                        <p className="font-semibold text-lg text-slate-800">{session.name}</p>
                                        <p className="text-sm text-slate-600">{getContextDisplay(session)}</p>
                                        <p className="text-xs text-slate-400 mt-1">Created: {new Date(session.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex-shrink-0 flex items-center gap-2 self-start">
                                        <button onClick={() => onEnterSession(session)} className="px-4 py-2 text-sm font-bold text-white bg-green-600 rounded-md shadow-sm hover:bg-green-700">Enter Session</button>
                                        <button onClick={() => handleEdit(session)} className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-100">Edit</button>
                                        <button onClick={() => handleDelete(session.id)} className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 rounded-md shadow-sm hover:bg-red-200">Delete</button>
                                    </div>
                                </div>
                                <div className="space-y-2 pt-3 border-t border-slate-200">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-semibold text-slate-600">Revenue</span>
                                        <span className="font-bold text-teal-700">{formatCurrency(actualRevenue)} / <span className="text-slate-500 font-medium">{formatCurrency(expectedRevenue)}</span></span>
                                    </div>
                                    <ProgressBar value={actualRevenue} max={expectedRevenue} />
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
};
export default SaleSessionList;
