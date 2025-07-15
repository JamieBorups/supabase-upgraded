


import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { KpiReport, FormData as Project } from '../../types';
import ConfirmationModal from '../ui/ConfirmationModal';
import * as api from '../../services/api';
import KpiReportViewerModal from './KpiReportViewerModal';

interface KpiReportsTabProps {
    selectedProject: Project | null;
}

const KpiReportsTab: React.FC<KpiReportsTabProps> = ({ selectedProject }) => {
    const { state, dispatch, notify } = useAppContext();
    const { kpiReports } = state;
    
    const [reportToDelete, setReportToDelete] = useState<KpiReport | null>(null);
    const [viewingReport, setViewingReport] = useState<KpiReport | null>(null);

    const projectReports = useMemo(() => {
        if (!selectedProject) return [];
        return kpiReports
            .filter(report => report.projectId === selectedProject.id)
            .sort((a,b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
    }, [kpiReports, selectedProject]);
    
    const handleDeleteClick = (report: KpiReport) => {
        setReportToDelete(report);
    };

    const confirmDelete = async () => {
        if (!reportToDelete) return;
        try {
            await api.deleteKpiReport(reportToDelete.id);
            dispatch({ type: 'DELETE_KPI_REPORT', payload: reportToDelete.id });
            notify('KPI report deleted.', 'success');
        } catch (error: any) {
            notify(`Error deleting KPI report: ${error.message}`, 'error');
        }
        setReportToDelete(null);
    };

    if (!selectedProject) {
        return null;
    }

    return (
        <>
            {reportToDelete && (
                <ConfirmationModal
                    isOpen={!!reportToDelete}
                    onClose={() => setReportToDelete(null)}
                    onConfirm={confirmDelete}
                    title="Delete KPI Report"
                    message="Are you sure you want to permanently delete this report? This action cannot be undone."
                />
            )}
            {viewingReport && (
                <KpiReportViewerModal 
                    report={viewingReport} 
                    projectTitle={selectedProject.projectTitle}
                    onClose={() => setViewingReport(null)}
                />
            )}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">KPI Reports</h2>
                        <p className="text-sm text-slate-500">View and manage saved KPI reports for this project.</p>
                    </div>
                </div>

                {projectReports.length === 0 ? (
                     <div className="text-center py-20">
                        <i className="fa-solid fa-chart-line text-7xl text-slate-300"></i>
                        <h3 className="mt-6 text-xl font-medium text-slate-800">No KPI Reports Saved</h3>
                        <p className="text-slate-500 mt-2 text-base">You can create and save reports from the KPI Generator tool.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {projectReports.map(report => (
                            <div key={report.id} className="border border-slate-200 rounded-lg">
                                <div className="w-full text-left p-4 flex justify-between items-center bg-slate-50">
                                    <div className="flex-grow">
                                        <p className="font-semibold text-slate-800">Report from {new Date(report.createdAt!).toLocaleString()}</p>
                                        <p className="text-sm text-slate-600 italic">Notes: {report.notes || 'No notes'}</p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button onClick={() => setViewingReport(report)} className="px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200" title="View Report"><i className="fa-solid fa-eye mr-1"></i>View</button>
                                        <button onClick={() => handleDeleteClick(report)} className="px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-md hover:bg-red-200" title="Delete Report"><i className="fa-solid fa-trash mr-1"></i>Delete</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default KpiReportsTab;
