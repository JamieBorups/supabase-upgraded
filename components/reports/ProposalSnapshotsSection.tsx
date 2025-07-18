import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { ProposalSnapshot, FormData as Project } from '../../types';
import ProposalViewer from '../proposals/ProposalViewer';
import ConfirmationModal from '../ui/ConfirmationModal';
import * as api from '../../services/api';
import { generateProposalSnapshotPdf } from '../../utils/pdfGenerator';

interface ProposalSnapshotsSectionProps {
    selectedProject: Project;
}

const ProposalSnapshotsSection: React.FC<ProposalSnapshotsSectionProps> = ({ selectedProject }) => {
    const { state, dispatch, notify } = useAppContext();
    const { proposals, members } = state;
    const [snapshotToDelete, setSnapshotToDelete] = useState<ProposalSnapshot | null>(null);

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
            setSnapshotToDelete(null);
        } catch (error: any) {
            notify(`Error deleting proposal: ${error.message}`, 'error');
            setSnapshotToDelete(null);
        }
    };

    const handleDownloadPdf = (snapshot: ProposalSnapshot) => {
        try {
            generateProposalSnapshotPdf(snapshot, members);
            notify('PDF generated successfully!', 'success');
        } catch (error: any) {
            console.error("PDF generation failed:", error);
            notify(`Failed to generate PDF: ${error.message}`, 'error');
        }
    };

    return (
        <div>
            <h2 className="report-section-heading">Proposal Snapshots</h2>
            <p className="text-base mb-6 -mt-2" style={{ color: 'var(--color-text-muted)' }}>
                Proposal Snapshots are point-in-time, read-only copies of your project's data. They serve as essential records for grant submissions or versioning at key milestones. Create snapshots from the 'View Project' page to capture the project's state exactly as it was on a specific date.
            </p>
            {snapshotToDelete && (
                <ConfirmationModal
                    isOpen={!!snapshotToDelete}
                    onClose={() => setSnapshotToDelete(null)}
                    onConfirm={confirmDelete}
                    title="Delete Proposal Snapshot"
                    message="Are you sure you want to permanently delete this snapshot? This action cannot be undone."
                />
            )}
            
            {projectProposals.length === 0 ? (
                 <div className="text-center py-10 rounded-lg" style={{ backgroundColor: 'var(--color-surface-muted)' }}>
                    <p style={{ color: 'var(--color-text-muted)' }}>No snapshots have been created for this project.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {projectProposals.map(snapshot => (
                        <details key={snapshot.id} className="group border rounded-lg bg-white overflow-hidden transition-shadow hover:shadow-md" style={{ borderColor: 'var(--color-border-subtle)' }}>
                            <summary className="w-full text-left p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 cursor-pointer hover:bg-slate-50 list-none">
                                <div className="flex-grow">
                                    <p className="font-semibold" style={{ color: 'var(--color-text-heading)' }}>
                                        Snapshot from {new Date(snapshot.createdAt).toLocaleString()}
                                        {snapshot.updatedAt && <span className="text-xs ml-2" style={{ color: 'var(--color-text-muted)' }}>(updated {new Date(snapshot.updatedAt).toLocaleDateString()})</span>}
                                    </p>
                                    <p className="text-sm italic whitespace-pre-wrap" style={{ color: 'var(--color-text-muted)' }}>Notes: {snapshot.notes || "No notes"}</p>
                                </div>
                                <div className="flex-shrink-0 flex items-center gap-2 self-end sm:self-center">
                                    <button onClick={(e) => { e.stopPropagation(); handleDownloadPdf(snapshot); }} className="btn btn-secondary">PDF</button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(snapshot); }} className="btn btn-danger">Delete</button>
                                    <span className="p-2 text-slate-500 hover:text-slate-700">
                                        <i className="fa-solid fa-chevron-down transition-transform group-open:rotate-180"></i>
                                    </span>
                                </div>
                            </summary>
                            <div className="border-t bg-slate-50/50" style={{ borderColor: 'var(--color-border-subtle)' }}>
                                <ProposalViewer snapshot={snapshot} onBack={() => {}} isEmbedded={true} />
                            </div>
                        </details>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProposalSnapshotsSection;