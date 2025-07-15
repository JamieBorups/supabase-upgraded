


import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { EcoStarReport, InterestCompatibilityReport, SdgAlignmentReport, RecreationFrameworkReport, KpiReport, FormData as Project } from '../../types';
import ConfirmationModal from '../ui/ConfirmationModal';
import * as api from '../../services/api';
import { generateEcoStarPdf, generateInterestCompatibilityPdf, generateSdgPdf, generateRecreationFrameworkPdf, generateKpiPdf } from '../../utils/pdfGenerator';

const FormattedReportViewer: React.FC<{ htmlContent: string }> = ({ htmlContent = '' }) => {
    return <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};

const ReportList: React.FC<{
    reports: (EcoStarReport | InterestCompatibilityReport | SdgAlignmentReport | RecreationFrameworkReport | KpiReport)[];
    onDelete: (report: any) => void;
    onDownloadPdf: (report: any) => void;
    onCopy: (htmlContent: string) => void;
    title: string;
    noReportsMessage: string;
    toolName: string;
}> = ({ reports, onDelete, onDownloadPdf, onCopy, title, noReportsMessage, toolName }) => {
    const [expandedReportId, setExpandedReportId] = useState<string | null>(null);

    const toggleReportExpansion = (reportId: string) => {
        setExpandedReportId(prevId => (prevId === reportId ? null : reportId));
    };

    if (reports.length === 0) {
        return (
            <div className="text-center py-20 text-slate-500">
                <i className="fa-solid fa-box-open text-6xl text-slate-300"></i>
                <h3 className="mt-4 text-lg font-medium">{noReportsMessage}</h3>
                <p className="mt-1">You can save reports from the {toolName} tool.</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-700">{title}</h3>
            {reports.map(report => (
                <div key={report.id} className="border border-slate-200 rounded-lg">
                    <div className="w-full text-left p-4 flex justify-between items-center bg-slate-50">
                        <button onClick={() => toggleReportExpansion(report.id)} className="text-left flex-grow">
                            <p className="font-semibold text-slate-800">Report saved on {new Date(report.createdAt!).toLocaleString()}</p>
                            <p className="text-sm text-slate-600 italic">Notes: {report.notes || 'No notes'}</p>
                        </button>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <button onClick={() => onCopy(report.fullReportText || '')} className="px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-200 rounded-md hover:bg-slate-300" title="Copy content to clipboard"><i className="fa-solid fa-copy mr-1"></i>Copy</button>
                            <button onClick={() => onDownloadPdf(report)} className="px-3 py-1 text-xs font-semibold text-white bg-rose-600 rounded-md shadow-sm hover:bg-rose-700" title="Download as PDF"><i className="fa-solid fa-file-pdf mr-1"></i>PDF</button>
                            <button onClick={() => onDelete(report)} className="px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-md hover:bg-red-200" title="Delete Report"><i className="fa-solid fa-trash mr-1"></i>Delete</button>
                            <button onClick={() => toggleReportExpansion(report.id)} className="p-2 text-slate-500 hover:text-slate-700" title={expandedReportId === report.id ? 'Collapse' : 'Expand'}>
                                <i className={`fa-solid fa-chevron-down transition-transform ${expandedReportId === report.id ? 'rotate-180' : ''}`}></i>
                            </button>
                        </div>
                    </div>
                    {expandedReportId === report.id && (
                        <div className="p-4 border-t border-slate-200 bg-white">
                            <FormattedReportViewer htmlContent={report.fullReportText || '<p>No content available.</p>'} />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

type ReportType = 'ecostar' | 'interest' | 'sdg' | 'recreation' | 'kpi';

interface SupplementalReportsTabProps {
    selectedProject: Project | null;
    kpiReports: KpiReport[];
}

const SupplementalReportsTab: React.FC<SupplementalReportsTabProps> = ({ selectedProject, kpiReports }) => {
    const { state, dispatch, notify } = useAppContext();
    const { ecostarReports, interestCompatibilityReports, sdgAlignmentReports, recreationFrameworkReports } = state;
    const [reportToDelete, setReportToDelete] = useState<(EcoStarReport | InterestCompatibilityReport | SdgAlignmentReport | RecreationFrameworkReport | KpiReport) | null>(null);
    const [reportTypeToDelete, setReportTypeToDelete] = useState<ReportType | null>(null);
    const [activeReportType, setActiveReportType] = useState<ReportType>('ecostar');

    const filteredReports = useMemo(() => {
        if (!selectedProject) return { ecostar: [], interest: [], sdg: [], recreation: [], kpi: [] };
        const projectId = selectedProject.id;
        return {
            ecostar: ecostarReports.filter(r => r.projectId === projectId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
            interest: interestCompatibilityReports.filter(r => r.projectId === projectId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
            sdg: sdgAlignmentReports.filter(r => r.projectId === projectId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
            recreation: recreationFrameworkReports.filter(r => r.projectId === projectId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
            kpi: kpiReports.filter(r => r.projectId === projectId).sort((a,b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()),
        };
    }, [selectedProject, ecostarReports, interestCompatibilityReports, sdgAlignmentReports, recreationFrameworkReports, kpiReports]);

    const handleDeleteClick = (report: any, type: ReportType) => {
        setReportToDelete(report);
        setReportTypeToDelete(type);
    };

    const confirmDelete = async () => {
        if (!reportToDelete || !reportTypeToDelete) return;

        try {
            if (reportTypeToDelete === 'ecostar') await api.deleteEcoStarReport(reportToDelete.id);
            else if (reportTypeToDelete === 'interest') await api.deleteInterestCompatibilityReport(reportToDelete.id);
            else if (reportTypeToDelete === 'sdg') await api.deleteSdgAlignmentReport(reportToDelete.id);
            else if (reportTypeToDelete === 'recreation') await api.deleteRecreationFrameworkReport(reportToDelete.id);
            else if (reportTypeToDelete === 'kpi') await api.deleteKpiReport(reportToDelete.id);
            
            dispatch({ type: `DELETE_${reportTypeToDelete.toUpperCase()}_REPORT` as any, payload: reportToDelete.id });
            notify('Report deleted successfully.', 'success');
        } catch (error: any) {
            notify(`Error deleting report: ${error.message}`, 'error');
        } finally {
            setReportToDelete(null);
            setReportTypeToDelete(null);
        }
    };
    
    const handleDownloadPdf = (report: any, type: ReportType) => {
        if (!selectedProject) {
            notify("A project must be selected.", "error");
            return;
        }
        
        if (!report || typeof report !== 'object' || !report.id) {
            notify("The report data appears to be corrupted and cannot be downloaded.", "error");
            return;
        }

        try {
            if (type === 'ecostar') generateEcoStarPdf(report, selectedProject.projectTitle);
            else if (type === 'interest') generateInterestCompatibilityPdf(report, selectedProject.projectTitle);
            else if (type === 'sdg') generateSdgPdf(report, selectedProject.projectTitle);
            else if (type === 'recreation') generateRecreationFrameworkPdf(report, selectedProject.projectTitle);
            else if (type === 'kpi') generateKpiPdf(report, selectedProject.projectTitle);
            else notify("Unknown report type.", 'error');
        } catch (e: any) {
            console.error("PDF Generation Error:", e);
            notify(`Could not generate PDF: ${e.message}`, "error");
        }
    };

    const handleCopyToClipboard = async (htmlContent: string) => {
        if (!htmlContent) {
            notify('No content to copy.', 'warning');
            return;
        }
        try {
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const clipboardItem = new ClipboardItem({ 'text/html': blob });
            await navigator.clipboard.write([clipboardItem]);
            notify('Formatted report copied to clipboard!', 'success');
        } catch (error) {
            console.error('Clipboard API error, falling back to plain text:', error);
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlContent;
            navigator.clipboard.writeText(tempDiv.innerText).then(() => {
                notify('Copied as plain text (rich format not supported by browser).', 'info');
            }, () => {
                notify('Failed to copy content to clipboard.', 'error');
            });
        }
    };

    const navItems: {id: ReportType, label: string}[] = [
        {id: 'ecostar', label: 'ECO-STAR'}, {id: 'interest', label: 'Interest Compatibility'},
        {id: 'sdg', label: 'SDG Alignment'}, {id: 'recreation', label: 'Recreation Framework'},
        {id: 'kpi', label: 'KPIs'}
    ];

    if (!selectedProject) {
        return null; // Guard against rendering without a selected project
    }
    
    return (
        <div>
            {reportToDelete && (
                <ConfirmationModal 
                    isOpen={!!reportToDelete}
                    onClose={() => { setReportToDelete(null); setReportTypeToDelete(null); }}
                    onConfirm={confirmDelete}
                    title="Delete Report"
                    message="Are you sure you want to permanently delete this supplemental report?"
                />
            )}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Supplemental Reports</h2>
                    <p className="text-sm text-slate-500">View archived reports generated from the AI tools for this project.</p>
                </div>
            </div>
            
            <div className="border-b border-slate-200 mb-6">
                <nav className="-mb-px flex space-x-6 overflow-x-auto">
                    {navItems.map(item => (
                         <button
                            key={item.id}
                            type="button"
                            onClick={() => setActiveReportType(item.id)}
                            className={`whitespace-nowrap py-3 px-3 border-b-2 font-semibold text-sm transition-all duration-200 rounded-t-md ${
                            activeReportType === item.id
                                ? 'border-teal-500 text-teal-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div>
                {activeReportType === 'ecostar' && <ReportList reports={filteredReports.ecostar} onDelete={(r) => handleDeleteClick(r, 'ecostar')} onDownloadPdf={(r) => handleDownloadPdf(r, 'ecostar')} onCopy={handleCopyToClipboard} title="ECO-STAR Reports" noReportsMessage="No ECO-STAR reports found." toolName="ECO-STAR AI Workshop" />}
                {activeReportType === 'interest' && <ReportList reports={filteredReports.interest} onDelete={(r) => handleDeleteClick(r, 'interest')} onDownloadPdf={(r) => handleDownloadPdf(r, 'interest')} onCopy={handleCopyToClipboard} title="Interest Compatibility Reports" noReportsMessage="No Interest Compatibility reports found." toolName="Interest Compatibility Assessment" />}
                {activeReportType === 'sdg' && <ReportList reports={filteredReports.sdg} onDelete={(r) => handleDeleteClick(r, 'sdg')} onDownloadPdf={(r) => handleDownloadPdf(r, 'sdg')} onCopy={handleCopyToClipboard} title="SDG Alignment Reports" noReportsMessage="No SDG Alignment reports found." toolName="SDG Alignment Report" />}
                {activeReportType === 'recreation' && <ReportList reports={filteredReports.recreation} onDelete={(r) => handleDeleteClick(r, 'recreation')} onDownloadPdf={(r) => handleDownloadPdf(r, 'recreation')} onCopy={handleCopyToClipboard} title="Recreation Framework Reports" noReportsMessage="No Recreation Framework reports found." toolName="Framework for Recreation tool" />}
                {activeReportType === 'kpi' && <ReportList reports={filteredReports.kpi} onDelete={(r) => handleDeleteClick(r, 'kpi')} onDownloadPdf={(r) => handleDownloadPdf(r, 'kpi')} onCopy={handleCopyToClipboard} title="KPI Reports" noReportsMessage="No KPI reports found." toolName="KPI Generator Tool" />}
            </div>
        </div>
    );
};

export default SupplementalReportsTab;