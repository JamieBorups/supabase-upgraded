

import React, { useState, useMemo } from 'react';
import { produce } from 'immer';
import { useAppContext } from '../../context/AppContext';
import { ProposalSnapshot } from '../../types';
import ConfirmationModal from '../ui/ConfirmationModal';
import { useTicketRevenueCalculations } from '../../hooks/useBudgetCalculations';

const ProposalSettings: React.FC = () => {
    const { state, dispatch, notify } = useAppContext();
    const { proposals, projects, tasks, events, venues, eventTickets } = state;
    const [snapshotToUpdate, setSnapshotToUpdate] = useState<ProposalSnapshot | null>(null);

    const projectMap = useMemo(() => new Map(projects.map(p => [p.id, p.projectTitle])), [projects]);

    const handleUpdateClick = (snapshot: ProposalSnapshot) => {
        setSnapshotToUpdate(snapshot);
    };

    const confirmUpdate = () => {
        if (!snapshotToUpdate) return;
        
        const project = projects.find(p => p.id === snapshotToUpdate.projectId);
        if (!project) {
            notify('Could not find the original project for this snapshot.', 'error');
            setSnapshotToUpdate(null);
            return;
        }

        const projectTasks = tasks.filter(t => t.projectId === project.id);
        const projectEvents = events.filter(e => e.projectId === project.id);
        const ticketCalcs = useTicketRevenueCalculations(project.id, projectEvents, venues, eventTickets);

        const newSnapshotData = produce(snapshotToUpdate, draft => {
            draft.projectData = JSON.parse(JSON.stringify(project));
            draft.tasks = JSON.parse(JSON.stringify(projectTasks));
            draft.calculatedMetrics = ticketCalcs;
            draft.updatedAt = new Date().toISOString();
        });
        
        dispatch({ type: 'UPDATE_PROPOSAL_SNAPSHOT', payload: newSnapshotData });
        notify('Snapshot updated with the latest project data.', 'success');
        setSnapshotToUpdate(null);
    };

    return (
        <div>
            {snapshotToUpdate && (
                <ConfirmationModal
                    isOpen={!!snapshotToUpdate}
                    onClose={() => setSnapshotToUpdate(null)}
                    onConfirm={confirmUpdate}
                    title="Update Proposal Snapshot"
                    message={
                        <>
                            Are you sure you want to update this snapshot?
                            <br />
                            This will <strong className="font-bold text-red-700">replace the snapshot's data</strong> with the current live data from the project <strong className="font-bold text-slate-800">'{projectMap.get(snapshotToUpdate.projectId)}'</strong>. This action cannot be undone.
                        </>
                    }
                    confirmButtonText="Yes, Update Snapshot"
                />
            )}
            <h2 className="text-2xl font-bold text-slate-900">Proposal Snapshot Management</h2>
            <p className="mt-1 text-sm text-slate-500">Administratively update existing proposal snapshots with the latest data from their live projects.</p>
            
            <div className="mt-8">
                {proposals.length === 0 ? (
                    <div className="text-center py-16 bg-slate-50 rounded-lg">
                        <i className="fa-solid fa-camera-retro text-6xl text-slate-300"></i>
                        <h3 className="mt-4 text-lg font-medium text-slate-800">No snapshots to manage.</h3>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {proposals.map(snapshot => (
                            <div key={snapshot.id} className="p-4 bg-white border border-slate-200 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-slate-800">{projectMap.get(snapshot.projectId) || 'Unknown Project'}</p>
                                    <p className="text-sm text-slate-500">
                                        Created: {new Date(snapshot.createdAt).toLocaleString()}
                                        {snapshot.updatedAt && <span className="text-xs text-blue-600 ml-2">(Updated: {new Date(snapshot.updatedAt).toLocaleString()})</span>}
                                    </p>
                                    <p className="text-xs text-slate-400 italic mt-1">Notes: {snapshot.notes || 'N/A'}</p>
                                </div>
                                <button
                                    onClick={() => handleUpdateClick(snapshot)}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700"
                                >
                                    <i className="fa-solid fa-sync-alt mr-2"></i>
                                    Update
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProposalSettings;
