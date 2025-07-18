




import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { ProposalSnapshot, FormData as Project } from '../../types';
import ProposalViewer from '../proposals/ProposalViewer';
import ConfirmationModal from '../ui/ConfirmationModal';
import * as api from '../../services/api';
import { generateProposalSnapshotPdf } from '../../utils/pdfGenerator';

interface ProposalSnapshotsTabProps {
    selectedProject: Project | null;
}

const ProposalSnapshotsTab: React.FC<ProposalSnapshotsTabProps> = ({ selectedProject }) => {
    const { state, dispatch, notify } = useAppContext();
    const { proposals } = state;
    const [viewingSnapshot, setViewingSnapshot] = useState<ProposalSnapshot | null>(null);
    const [snapshotToDelete, setSnapshotToDelete] = useState<ProposalSnapshot | null>(null);

    const contextValue = { state, dispatch, notify };

    const projectProposals = useMemo(() => {
        if (!selectedProject) return [];
        return proposals
            .filter(snapshot => snapshot.projectId === selectedProject.id)
            .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [proposals, selectedProject]);

    const handleDeleteClick = (snapshot: ProposalSnapshot) => {
        setSnapshotToDelete(snapshot);
    };
    
    const confirmDelete = async () => {
        if (!snapshotToDelete) return;
        try {
            await api.deleteProposal(snapshotToDelete.id);
            dispatch({ type: 'DELETE_PROPOSAL_SNAPSHOT', payload: snapshotToDelete.id });
            notify('Proposal snapshot deleted.', 'success');
        } catch (error: any) {
            notify(`Error deleting proposal: ${error.message}`, 'error');
        }
        setSnapshotToDelete(null);
    };

    const handleDownloadPdf = async (snapshot: ProposalSnapshot) => {
        try {
            await generateProposalSnapshotPdf(snapshot, contextValue);
            notify('PDF generated successfully!', 'success');
        } catch (error: any) {
            console.error("PDF generation failed:", error);
            notify(`Failed to generate PDF: ${error.message}`, 'error');
        }
    };

    if (!selectedProject) {
        return null; // Guard against rendering without a selected project
    }

    if (viewingSnapshot) {
        return <ProposalViewer snapshot={viewingSnapshot} onBack={() => setViewingSnapshot(null)} />;
    }

    return (
        <>
            {snapshotToDelete && (
                <ConfirmationModal
                    isOpen={!!snapshotToDelete}
                    onClose={() => setSnapshotToDelete(null)}
                    onConfirm={confirmDelete}
                    title="Delete Proposal Snapshot"
                    message="Are you sure you want to permanently delete this snapshot? This action cannot be undone."
                />
            )}
            <div>
                 <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Proposal Snapshots</h2>
                        <p className="text-sm text-slate-500">View and manage point-in-time snapshots for this project.</p>
                    </div>
                </div>

                {projectProposals.length === 0 ? (
                     <div className="text-center py-20">
                        <i className="fa-solid fa-camera-retro text-7xl text-slate-300"></i>
                        <h3 className="mt-6 text-xl font-medium text-slate-800">No Snapshots Created</h3>
                        <p className="text-slate-500 mt-2 text-base">Go to this project's detail view to create a snapshot of its current state for your records.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-slate-50/70 p-4 rounded-lg border border-slate-200">
                            <ul className="divide-y divide-slate-200">
                                {projectProposals.map(snapshot => (
                                    <li key={snapshot.id} className="p-3 hover:bg-slate-100 flex flex-col md:flex-row justify-between md:items-center gap-3">
                                        <div>
                                            <p className="font-semibold text-slate-800">
                                                Snapshot from {new Date(snapshot.createdAt).toLocaleString()}
                                                {snapshot.updatedAt && <span className="text-xs text-slate-500 ml-2">(updated {new Date(snapshot.updatedAt).toLocaleDateString()})</span>}
                                            </p>
                                            <p className="text-sm text-slate-600 italic whitespace-pre-wrap">Notes: {snapshot.notes || "No notes"}</p>
                                        </div>
                                        <div className="flex-shrink-0 flex items-center gap-2">
                                            <button onClick={() => setViewingSnapshot(snapshot)} className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700">View</button>
                                            <button onClick={() => handleDownloadPdf(snapshot)} className="px-3 py-1.5 text-sm font-medium text-white bg-rose-600 rounded-md shadow-sm hover:bg-rose-700">PDF</button>
                                            <button onClick={() => handleDeleteClick(snapshot)} className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 rounded-md shadow-sm hover:bg-red-200">Delete</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default ProposalSnapshotsTab;