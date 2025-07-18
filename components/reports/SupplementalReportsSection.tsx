import React, { useState, useMemo, useCallback } from 'react';
import { useAppContext } from '../../context/AppContext';
import { EcoStarReport, InterestCompatibilityReport, SdgAlignmentReport, RecreationFrameworkReport, FormData as Project, ResearchPlan, OtfApplication } from '../../types';
import ConfirmationModal from '../ui/ConfirmationModal';
import * as api from '../../services/api';
import { generateEcoStarPdf, generateInterestCompatibilityPdf, generateSdgPdf, generateRecreationFrameworkPdf, generateResearchPlanPdf } from '../../utils/pdfGenerator';
import { generateOtfPdf } from '../../utils/otfPdfGenerator';
import OtfApplicationViewer from '../otf/OtfApplicationViewer';

// --- Types & Interfaces ---
type ReportType = 'research' | 'otf' | 'ecostar' | 'interest' | 'sdg' | 'recreation';

interface ReportItem {
    id: string;
    type: ReportType;
    title: string;
    notes: string;
    createdAt: string;
    fullReportHtml: string;
    originalReport: any;
}

// --- Helper UI Components ---
const FormattedReportViewer: React.FC<{ htmlContent: string }> = ({ htmlContent = '' }) => {
    // This is a simplified sanitizer for demonstration. In a real-world app, use a library like DOMPurify.
    const sanitizedHtml = htmlContent.replace(/<script.*?>.*?<\/script>/gi, '');
    return <div className="prose prose-slate max-w-none p-4" dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
};

const ReportList: React.FC<{
    reports: ReportItem[];
    onDelete: (report: any, type: ReportType) => void;
    onEdit?: (report: any, type: ReportType) => void;
    onDownloadPdf: (report: any, type: ReportType) => void;
    onCopy: (htmlContent: string) => void;
}> = ({ reports, onDelete, onEdit, onDownloadPdf, onCopy }) => {

    const [expandedReportId, setExpandedReportId] = useState<string | null>(null);

    const toggleReportExpansion = (reportId: string) => {
        setExpandedReportId(prevId => (prevId === reportId ? null : reportId));
    };

    if (!reports || reports.length === 0) {
        return null; // Should be handled by the parent component
    }

    return (
        <div className="space-y-3">
            {reports.map(report => (
                <details key={report.id} open={expandedReportId === report.id} className="group border rounded-lg bg-white overflow-hidden transition-shadow hover:shadow-md" style={{ borderColor: 'var(--color-border-subtle)' }}>
                    <summary
                        className="w-full text-left p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors list-none"
                        onClick={(e) => { e.preventDefault(); toggleReportExpansion(report.id); }}
                    >
                        <div className="flex-grow">
                            <p className="font-semibold" style={{ color: 'var(--color-text-heading)' }}>{report.title}</p>
                            <p className="text-sm italic" style={{ color: 'var(--color-text-muted)' }}>Created: {new Date(report.createdAt).toLocaleString()}</p>
                            {report.notes && <p className="text-sm italic" style={{ color: 'var(--color-text-muted)' }}>Notes: {report.notes}</p>}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                            {onEdit && <button onClick={(e) => { e.stopPropagation(); onEdit(report.originalReport, report.type); }} className="btn btn-primary" title="Edit Report"><i className="fa-solid fa-pencil sm:mr-1"></i><span className="hidden sm:inline">Edit</span></button>}
                            <button onClick={(e) => { e.stopPropagation(); onCopy(report.fullReportHtml || ''); }} className="btn btn-secondary" title="Copy content to clipboard"><i className="fa-solid fa-copy sm:mr-1"></i><span className="hidden sm:inline">Copy</span></button>
                            <button onClick={(e) => { e.stopPropagation(); onDownloadPdf(report.originalReport, report.type); }} className="btn btn-secondary" title="Download as PDF"><i className="fa-solid fa-file-pdf sm:mr-1"></i><span className="hidden sm:inline">PDF</span></button>
                            <button onClick={(e) => { e.stopPropagation(); onDelete(report.originalReport, report.type); }} className="btn btn-danger" title="Delete Report"><i className="fa-solid fa-trash sm:mr-1"></i><span className="hidden sm:inline">Delete</span></button>
                            <span className="p-2 text-slate-500 hover:text-slate-700" title={expandedReportId === report.id ? 'Collapse' : 'Expand'}>
                                <i className={`fa-solid fa-chevron-down transition-transform ${expandedReportId === report.id ? 'rotate-180' : ''}`}></i>
                            </span>
                        </div>
                    </summary>
                    <div className="border-t bg-white" style={{ borderColor: 'var(--color-border-subtle)' }}>
                        {report.type === 'otf' ? (
                            <OtfApplicationViewer application={report.originalReport} onBack={() => {}} isEmbedded={true} />
                        ) : (
                            <FormattedReportViewer htmlContent={report.fullReportHtml} />
                        )}
                    </div>
                </details>
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
        const mapReport = (report: any, type: ReportType, titlePrefix: string, htmlKey: string, notesKey: string = 'notes'): ReportItem => ({
            id: report.id, type, createdAt: report.createdAt, originalReport: report,
            title: report.title || `${titlePrefix} from ${new Date(report.createdAt).toLocaleString()}`,
            notes: (report as any)[notesKey] || '',
            fullReportHtml: (report as any)[htmlKey] || '',
        });

        return [
            { 
                type: 'research' as ReportType, 
                title: "Research Plans",
                description: "This section archives all Community-Based Research Plans for your project. These formal documents outline the project's research questions, methodologies, and ethical considerations, and are essential for academic or research-focused grant applications.",
                reports: state.researchPlans.filter(r => r.projectId === projectId).map(r => mapReport(r, 'research', 'Research Plan', 'fullReportHtml')).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
                onEdit: true 
            },
            { 
                type: 'otf' as ReportType, 
                title: "OTF Applications",
                description: "This section contains all saved drafts of your Ontario Trillium Foundation (OTF) applications. Each entry is a complete, point-in-time snapshot of your application, allowing you to track versions and manage your submission process.",
                reports: state.otfApplications.filter(a => a.projectId === projectId).map(a => mapReport(a, 'otf', 'OTF Application', '')).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
                onEdit: true, 
            },
            { 
                type: 'ecostar' as ReportType, 
                title: "ECO-STAR Reports",
                description: "ECO-STAR reports provide a strategic analysis of your project's impact through a business and sustainability lens. Use these documents to articulate your value proposition for social enterprise grants or community economic development partners.",
                reports: state.ecostarReports.filter(r => r.projectId === projectId).map(r => mapReport(r, 'ecostar', 'ECO-STAR Report', 'fullReportText')).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
            },
            { 
                type: 'interest' as ReportType, 
                title: "Interest Compatibility Reports",
                description: "These reports offer an AI-powered analysis of stakeholder interest alignment for your project. They are valuable internal tools for strategic planning, partnership negotiation, and proactive risk management.",
                reports: state.interestCompatibilityReports.filter(r => r.projectId === projectId).map(r => mapReport(r, 'interest', 'Interest Compatibility Report', 'fullReportText')).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
            },
            { 
                type: 'sdg' as ReportType, 
                title: "SDG Alignment Reports",
                description: "This section archives reports that connect your project to the UN Sustainable Development Goals. These are powerful documents for communicating your project's global relevance to large foundations and corporate sponsors.",
                reports: state.sdgAlignmentReports.filter(r => r.projectId === projectId).map(r => mapReport(r, 'sdg', 'SDG Alignment Report', 'fullReportText')).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
            },
            { 
                type: 'recreation' as ReportType, 
                title: "Recreation Framework Reports",
                description: "These reports reframe your arts project in the language of community recreation and wellness, aligning it with the Framework for Recreation in Canada. They are ideal for municipal grants or funders focused on health and community well-being.",
                reports: state.recreationFrameworkReports.filter(r => r.projectId === projectId).map(r => mapReport(r, 'recreation', 'Recreation Framework Report', 'fullReportText')).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
            },
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
    
    const handleDownloadPdf = (report: any, type: ReportType) => {
        if (!selectedProject) return;
        try {
            switch(type) {
                case 'ecostar': generateEcoStarPdf(report, selectedProject.projectTitle); break;
                case 'interest': generateInterestCompatibilityPdf(report, selectedProject.projectTitle); break;
                case 'sdg': generateSdgPdf(report, selectedProject.projectTitle); break;
                case 'recreation': generateRecreationFrameworkPdf(report, selectedProject.projectTitle); break;
                case 'research': generateResearchPlanPdf(report, selectedProject.projectTitle); break;
                case 'otf': generateOtfPdf(report); break;
            }
        } catch (e: any) { notify(`PDF Error: ${e.message}`, "error"); }
    };

    const handleCopyToClipboard = (htmlContent: string) => {
        if (!htmlContent) { notify('No content to copy.', 'warning'); return; }
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        navigator.clipboard.writeText(tempDiv.innerText).then(() => notify('Report copied!', 'success')).catch(() => notify('Copy failed.', 'error'));
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
                        <p className="text-base mb-6 -mt-2" style={{ color: 'var(--color-text-muted)' }}>{category.description}</p>
                        <ReportList
                            reports={category.reports}
                            onDelete={handleDeleteClick}
                            onEdit={category.onEdit ? handleEditReport : undefined}
                            onDownloadPdf={handleDownloadPdf}
                            onCopy={handleCopyToClipboard}
                        />
                    </div>
                )
            ))}
        </div>
    );
};

export default SupplementalReportsSection;