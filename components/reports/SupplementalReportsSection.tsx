
import React, { useState, useMemo, useCallback } from 'react';
import { useAppContext } from '../../context/AppContext';
import { EcoStarReport, InterestCompatibilityReport, SdgAlignmentReport, RecreationFrameworkReport, FormData as Project, ResearchPlan, OtfApplication } from '../../types';
import ConfirmationModal from '../ui/ConfirmationModal';
import * as api from '../../services/api';
import { generateEcoStarPdf, generateInterestCompatibilityPdf, generateSdgPdf, generateRecreationFrameworkPdf, generateResearchPlanPdf, generateOtfPdf } from '../../utils/pdfGenerator';
import OtfApplicationViewer from '../otf/OtfApplicationViewer';

// --- Types & Interfaces ---
type ReportType = 'research' | 'otf' | 'ecostar' | 'interest' | 'sdg' | 'recreation';

interface ReportItem {
    id: string;
    type: ReportType;
    title: string;
    notes: string;
    createdAt: string;
    originalReport: any;
}

// --- Helper UI Components ---
const ReportList: React.FC<{
    reports: ReportItem[];
    onDelete: (report: any, type: ReportType) => void;
    onEdit?: (report: any, type: ReportType) => void;
    onDownloadPdf: (report: any, type: ReportType) => void;
}> = ({ reports, onDelete, onEdit, onDownloadPdf }) => {

    if (!reports || reports.length === 0) {
        return null; 
    }

    return (
        <div className="space-y-3">
            {reports.map(report => (
                 <div key={report.id} className="p-4 bg-white border border-slate-200 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div className="flex-grow">
                        <p className="font-semibold text-slate-800">{report.title}</p>
                        <p className="text-sm text-slate-500 italic">Created: {new Date(report.createdAt).toLocaleString()}</p>
                        {report.notes && <p className="text-sm text-slate-600 italic mt-1">Notes: {report.notes}</p>}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                        {onEdit && <button onClick={() => onEdit(report.originalReport, report.type)} className="btn btn-primary" title="Edit Report"><i className="fa-solid fa-pencil sm:mr-1"></i><span className="hidden sm:inline">Edit</span></button>}
                        <button onClick={() => onDownloadPdf(report.originalReport, report.type)} className="btn btn-secondary" title="Download as PDF"><i className="fa-solid fa-file-pdf sm:mr-1"></i><span className="hidden sm:inline">Generate PDF</span></button>
                        <button onClick={() => onDelete(report.originalReport, report.type)} className="btn btn-danger" title="Delete Report"><i className="fa-solid fa-trash sm:mr-1"></i><span className="hidden sm:inline">Delete</span></button>
                    </div>
                </div>
            ))}
        </div>
    );
};


// --- Main Section Component ---

interface SupplementalReportsSectionProps {
    selectedProject: Project;
}

const SupplementalReportsSection: React.FC<SupplementalReportsSectionProps> = ({ selectedProject }) => {
    const { state, dispatch, notify } = useAppContext();
    const [reportToDelete, setReportToDelete] = useState<{ report: any, type: ReportType } | null>(null);
    
    const reportCategoriesConfig = useMemo(() => {
        const projectId = selectedProject.id;
        const mapReport = (report: any, type: ReportType, titlePrefix: string): ReportItem => ({
            id: report.id, type, createdAt: report.createdAt, originalReport: report,
            title: report.title || `${titlePrefix} from ${new Date(report.createdAt).toLocaleString()}`,
            notes: (report as any).notes || '',
        });

        return [
            { type: 'research' as ReportType, title: "Research Plans", reports: state.researchPlans.filter(r => r.projectId === projectId).map(r => mapReport(r, 'research', 'Research Plan')).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), onEdit: true },
            { type: 'otf' as ReportType, title: "OTF Applications", reports: state.otfApplications.filter(a => a.projectId === projectId).map(a => mapReport(a, 'otf', 'OTF Application')).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), onEdit: true },
            { type: 'ecostar' as ReportType, title: "ECO-STAR Reports", reports: state.ecostarReports.filter(r => r.projectId === projectId).map(r => mapReport(r, 'ecostar', 'ECO-STAR Report')).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) },
            { type: 'interest' as ReportType, title: "Interest Compatibility Reports", reports: state.interestCompatibilityReports.filter(r => r.projectId === projectId).map(r => mapReport(r, 'interest', 'Interest Compatibility Report')).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) },
            { type: 'sdg' as ReportType, title: "SDG Alignment Reports", reports: state.sdgAlignmentReports.filter(r => r.projectId === projectId).map(r => mapReport(r, 'sdg', 'SDG Alignment Report')).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) },
            { type: 'recreation' as ReportType, title: "Recreation Framework Reports", reports: state.recreationFrameworkReports.filter(r => r.projectId === projectId).map(r => mapReport(r, 'recreation', 'Recreation Framework Report')).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) },
        ];
    }, [selectedProject, state]);
    
    const handleEditReport = useCallback((report: any, type: ReportType) => {
        if (type === 'research') dispatch({ type: 'SET_RESEARCH_PLAN_TO_EDIT', payload: report });
        else if (type === 'otf') dispatch({ type: 'SET_OTF_APPLICATION_TO_EDIT', payload: report });
    }, [dispatch]);

    const handleDeleteClick = (report: any, type: ReportType) => {
        setReportToDelete({ report, type });
    };

    const confirmDelete = async () => {
        if (!reportToDelete) return;
        const { report, type } = reportToDelete;
        const deleteActions: Record<ReportType, (id: string) => Promise<any>> = { ecostar: api.deleteEcoStarReport, interest: api.deleteInterestCompatibilityReport, sdg: api.deleteSdgAlignmentReport, recreation: api.deleteRecreationFrameworkReport, research: api.deleteResearchPlan, otf: api.deleteOtfApplication };
        const dispatchTypeMap: Record<ReportType, string> = { ecostar: 'DELETE_ECOSTAR_REPORT', interest: 'DELETE_INTEREST_COMPATIBILITY_REPORT', sdg: 'DELETE_SDG_REPORT', recreation: 'DELETE_RECREATION_REPORT', research: 'DELETE_RESEARCH_PLAN', otf: 'DELETE_OTF_APPLICATION' };

        try {
            await deleteActions[type](report.id);
            dispatch({ type: dispatchTypeMap[type] as any, payload: report.id });
            notify('Report deleted.', 'success');
            setReportToDelete(null);
        } catch (error: any) {
            notify(`Error: ${error.message}`, 'error');
            setReportToDelete(null);
        }
    };
    
    const handleDownloadPdf = async (report: any, type: ReportType) => {
        if (!selectedProject) return;
        notify('Generating PDF...', 'info');
        try {
            switch(type) {
                case 'ecostar': await generateEcoStarPdf(report, selectedProject.projectTitle); break;
                case 'interest': await generateInterestCompatibilityPdf(report, selectedProject.projectTitle); break;
                case 'sdg': await generateSdgPdf(report, selectedProject.projectTitle); break;
                case 'recreation': await generateRecreationFrameworkPdf(report, selectedProject.projectTitle); break;
                case 'research': await generateResearchPlanPdf(report, selectedProject.projectTitle); break;
                case 'otf': await generateOtfPdf(report, selectedProject.projectTitle); break;
            }
        } catch (e: any) {
            notify(`Could not generate PDF: ${e.message}`, "error");
        }
    };
    
    const totalSupplementalReports = reportCategoriesConfig.reduce((acc, cat) => acc + cat.reports.length, 0);
    if (totalSupplementalReports === 0) {
        return (
             <div className="space-y-12">
                <h2 className="report-section-heading">Supplemental Reports & Applications</h2>
                 <div className="text-center py-10 rounded-lg" style={{ backgroundColor: 'var(--color-surface-muted)' }}>
                    <p style={{ color: 'var(--color-text-muted)' }}>No supplemental reports or applications have been saved for this project.</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Use the "Tools" menu to generate reports.</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="space-y-12">
            {reportToDelete && ( <ConfirmationModal isOpen={true} onClose={() => setReportToDelete(null)} onConfirm={confirmDelete} title="Delete Report" message="Are you sure?" /> )}
            
            {reportCategoriesConfig.map(category => (
                category.reports.length > 0 && (
                    <div key={category.type}>
                        <h2 className="report-section-heading">{category.title}</h2>
                        <ReportList
                            reports={category.reports}
                            onDelete={(r) => handleDeleteClick(r, category.type)}
                            onEdit={category.onEdit ? (r) => handleEditReport(r, category.type) : undefined}
                            onDownloadPdf={(r) => handleDownloadPdf(r, category.type)}
                        />
                    </div>
                )
            ))}
        </div>
    );
};

export default SupplementalReportsSection;
