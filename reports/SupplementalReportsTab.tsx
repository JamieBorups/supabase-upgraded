
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
    onDelete: (report: any) => void;
    onEdit?: (report: any) => void;
    onView?: (report: any) => void;
    onDownloadPdf: (report: any) => void;
    onCopy: (htmlContent: string) => void;
    title: string;
    noReportsMessage: string;
    toolName: string;
}> = ({ reports, onDelete, onEdit, onView, onDownloadPdf, onCopy, title, noReportsMessage, toolName }) => {
    const [expandedReportId, setExpandedReportId] = useState<string | null>(null);

    const toggleReportExpansion = (reportId: string) => {
        setExpandedReportId(prevId => (prevId === reportId ? null : reportId));
    };

    if (!reports || reports.length === 0) {
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
                <details key={report.id} className="border border-slate-200 rounded-lg bg-slate-50/70 overflow-hidden" open={expandedReportId === report.id}>
                    <summary
                        className="w-full text-left p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 cursor-pointer hover:bg-slate-100/70 transition-colors list-none"
                        onClick={(e) => { e.preventDefault(); toggleReportExpansion(report.id); }}
                    >
                        <div className="flex-grow">
                            <p className="font-semibold text-slate-800">{report.title}</p>
                            <p className="text-sm text-slate-600 italic">Created: {new Date(report.createdAt).toLocaleString()}</p>
                            {report.notes && <p className="text-sm text-slate-600 italic">Notes: {report.notes}</p>}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                            {onView && <button onClick={(e) => { e.stopPropagation(); onView(report.originalReport); }} className="px-3 py-1 text-xs font-semibold text-white bg-sky-600 rounded-md shadow-sm hover:bg-sky-700" title="View Report"><i className="fa-solid fa-eye sm:mr-1"></i><span className="hidden sm:inline">View</span></button>}
                            {onEdit && <button onClick={(e) => { e.stopPropagation(); onEdit(report.originalReport); }} className="px-3 py-1 text-xs font-semibold text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700" title="Edit Report"><i className="fa-solid fa-pencil sm:mr-1"></i><span className="hidden sm:inline">Edit</span></button>}
                            <button onClick={(e) => { e.stopPropagation(); onCopy(report.fullReportHtml || ''); }} className="px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-200 rounded-md hover:bg-slate-300" title="Copy content to clipboard"><i className="fa-solid fa-copy sm:mr-1"></i><span className="hidden sm:inline">Copy</span></button>
                            <button onClick={(e) => { e.stopPropagation(); onDownloadPdf(report.originalReport); }} className="px-3 py-1 text-xs font-semibold text-white bg-rose-600 rounded-md shadow-sm hover:bg-rose-700" title="Download as PDF"><i className="fa-solid fa-file-pdf sm:mr-1"></i><span className="hidden sm:inline">PDF</span></button>
                            <button onClick={(e) => { e.stopPropagation(); onDelete(report.originalReport); }} className="px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-md hover:bg-red-200" title="Delete Report"><i className="fa-solid fa-trash sm:mr-1"></i><span className="hidden sm:inline">Delete</span></button>
                            <span className="p-2 text-slate-500 hover:text-slate-700" title={expandedReportId === report.id ? 'Collapse' : 'Expand'}>
                                <i className={`fa-solid fa-chevron-down transition-transform ${expandedReportId === report.id ? 'rotate-180' : ''}`}></i>
                            </span>
                        </div>
                    </summary>
                    <div className="border-t border-slate-200 bg-white">
                        <FormattedReportViewer htmlContent={report.fullReportHtml} />
                    </div>
                </details>
            ))}
        </div>
    );
};


// --- Main Tab Component ---

interface SupplementalReportsTabProps {
    selectedProject: Project | null;
}

const formatCurrency = (value: number) => value.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });

const generateOtfFullHtml = (app: OtfApplication): string => {
    let html = '';
    const addSection = (title: string) => { html += `<h2>${title}</h2>`; };
    const addField = (label: string, value: string | number | boolean | string[] | undefined | null) => {
        if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0)) return;
        const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : Array.isArray(value) ? `<ul>${value.map(v => `<li>${v}</li>`).join('')}</ul>` : String(value).replace(/\n/g, '<br/>');
        html += `<div><h4 style="margin-bottom: 0;">${label}</h4><p>${displayValue}</p></div>`;
    };
    const addTable = (headers: string[], rows: (string|number)[][]) => {
        html += '<table><thead><tr>';
        headers.forEach(h => { html += `<th>${h}</th>`; });
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => { html += `<td>${cell}</td>`; });
            html += '</tr>';
        });
        html += '</tbody></table>';
    };

    // Build HTML content
    addSection("Organization Information");
    addField("Mission Statement", app.missionStatement);
    addField("Typical Activities", app.activitiesDescription);
    addField("Sector", app.sector);
    addField("People Served Annually", app.peopleServedAnnually);
    addField("Leadership Reflects Community", app.leadershipReflectsCommunity);
    addField("Languages of population served", app.languagePopulationServed);

    addSection("Project Information");
    addField("Project Description", app.projDescription);
    addField("Why and Who Benefits", app.projWhyAndWhoBenefits);
    addField("Funding Priority", app.projFundingPriority);
    addField("Objective", app.projObjective);
    addField("Impact Explanation", app.projImpactExplanation);
    
    addSection("Project Plan");
    addField("Justification Introduction", app.justificationIntro);
    if(app.projectPlan && app.projectPlan.length > 0) {
        addTable(
            ["Deliverable", "Key Task", "Timing"],
            app.projectPlan.map(p => [p.deliverable, p.keyTask, p.timing])
        );
        app.projectPlan.forEach(item => {
            if (item.justification) {
                addField(`Justification for: ${item.deliverable}`, item.justification);
            }
        });
    }
    addField("Justification Conclusion", app.justificationOutro);

    addSection("Budget");
    if(app.budgetItems && app.budgetItems.length > 0) {
        const subtotal = app.budgetItems.filter(i => i.category !== 'Overhead and Administration Costs').reduce((sum, i) => sum + (i.requestedAmount || 0), 0);
        const adminFee = subtotal * 0.15;
        const total = subtotal + adminFee;

        addTable(
            ["Category", "Item", "Cost Breakdown", "Amount"],
            app.budgetItems.map(item => [item.category, item.itemDescription, item.costBreakdown, formatCurrency(item.requestedAmount || 0)])
        );
        html += `<div style="margin-top: 1rem; text-align: right; width: 50%; margin-left: auto;">
                    <p><strong>Subtotal:</strong> ${formatCurrency(subtotal)}</p>
                    <p><strong>Overhead & Admin (15%):</strong> ${formatCurrency(adminFee)}</p>
                    <p><strong>Total:</strong> ${formatCurrency(total)}</p>
                 </div>`;
    }
    
    return html || '<p>No content available.</p>';
};


const SupplementalReportsTab: React.FC<SupplementalReportsTabProps> = ({ selectedProject }) => {
    const { state, dispatch, notify } = useAppContext();
    const { ecostarReports, interestCompatibilityReports, sdgAlignmentReports, recreationFrameworkReports, researchPlans, otfApplications } = state;
    const [reportToDelete, setReportToDelete] = useState<(any) | null>(null);
    const [reportTypeToDelete, setReportTypeToDelete] = useState<ReportType | null>(null);
    const [activeTab, setActiveTab] = useState<ReportType>('research');
    const [viewingOtfApp, setViewingOtfApp] = useState<OtfApplication | null>(null);

    const TABS: { id: ReportType, label: string }[] = [
        {id: 'research', label: 'Research'},
        {id: 'otf', label: 'OTF Applications'},
        {id: 'ecostar', label: 'ECO-STAR'},
        {id: 'interest', label: 'Interest Compatibility'},
        {id: 'sdg', label: 'SDG Alignment'},
        {id: 'recreation', label: 'Recreation Framework'},
    ];

    const handleEditReport = useCallback((report: any, type: ReportType) => {
        if (type === 'research') {
            dispatch({ type: 'SET_RESEARCH_PLAN_TO_EDIT', payload: report });
        } else if (type === 'otf') {
            dispatch({ type: 'SET_OTF_APPLICATION_TO_EDIT', payload: report });
        }
    }, [dispatch]);

    const handleDeleteClick = (report: any, type: ReportType) => {
        setReportToDelete(report);
        setReportTypeToDelete(type);
    };

    const confirmDelete = async () => {
        if (!reportToDelete || !reportTypeToDelete) return;
        const deleteActions: Record<ReportType, (id: string) => Promise<any>> = {
            ecostar: api.deleteEcoStarReport,
            interest: api.deleteInterestCompatibilityReport,
            sdg: api.deleteSdgAlignmentReport,
            recreation: api.deleteRecreationFrameworkReport,
            research: api.deleteResearchPlan,
            otf: api.deleteOtfApplication,
        };

        const dispatchTypeMap: Record<ReportType, string> = {
            ecostar: 'DELETE_ECOSTAR_REPORT',
            interest: 'DELETE_INTEREST_COMPATIBILITY_REPORT',
            sdg: 'DELETE_SDG_REPORT',
            recreation: 'DELETE_RECREATION_REPORT',
            research: 'DELETE_RESEARCH_PLAN',
            otf: 'DELETE_OTF_APPLICATION',
        };

        try {
            await deleteActions[reportTypeToDelete](reportToDelete.id);
            dispatch({ type: dispatchTypeMap[reportTypeToDelete] as any, payload: reportToDelete.id });
            notify('Report deleted successfully.', 'success');
        } catch (error: any) {
            notify(`Error deleting report: ${error.message}`, 'error');
        } finally {
            setReportToDelete(null);
            setReportTypeToDelete(null);
        }
    };
    
    const handleDownloadPdf = (report: any, type: ReportType) => {
        if (!selectedProject) { notify("A project must be selected.", "error"); return; }
        try {
            switch(type) {
                case 'ecostar': generateEcoStarPdf(report, selectedProject.projectTitle); break;
                case 'interest': generateInterestCompatibilityPdf(report, selectedProject.projectTitle); break;
                case 'sdg': generateSdgPdf(report, selectedProject.projectTitle); break;
                case 'recreation': generateRecreationFrameworkPdf(report, selectedProject.projectTitle); break;
                case 'research': generateResearchPlanPdf(report, selectedProject.projectTitle); break;
                case 'otf': generateOtfPdf(report); break;
            }
        } catch (e: any) {
            notify(`Could not generate PDF: ${e.message}`, "error");
        }
    };

    const handleCopyToClipboard = (htmlContent: string) => {
        if (!htmlContent) { notify('No content to copy.', 'warning'); return; }
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        navigator.clipboard.writeText(tempDiv.innerText)
            .then(() => notify('Report content copied to clipboard!', 'success'))
            .catch(() => notify('Failed to copy content.', 'error'));
    };
    
    const activeReportData = useMemo((): ReportItem[] => {
        if (!selectedProject) return [];
        const projectId = selectedProject.id;
        
        switch (activeTab) {
            case 'research':
                return researchPlans.filter(r => r.projectId === projectId).map(report => ({
                    id: report.id, title: `Research Plan from ${new Date(report.createdAt).toLocaleString()}`, notes: report.notes || '',
                    createdAt: report.createdAt, fullReportHtml: report.fullReportHtml || '', originalReport: report,
                })).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            
            case 'otf':
                return otfApplications.filter(a => a.projectId === projectId).map(report => ({
                    id: report.id, title: report.title || `OTF Application from ${new Date(report.createdAt).toLocaleString()}`, notes: '',
                    createdAt: report.createdAt, fullReportHtml: generateOtfFullHtml(report), originalReport: report,
                })).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            case 'ecostar':
                return ecostarReports.filter(r => r.projectId === projectId).map(report => ({
                    id: report.id, title: `ECO-STAR Report from ${new Date(report.createdAt).toLocaleString()}`, notes: report.notes,
                    createdAt: report.createdAt, fullReportHtml: report.fullReportText, originalReport: report
                })).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                
            case 'interest':
                return interestCompatibilityReports.filter(r => r.projectId === projectId).map(report => ({
                    id: report.id, title: `Interest Compatibility Report from ${new Date(report.createdAt).toLocaleString()}`, notes: report.notes,
                    createdAt: report.createdAt, fullReportHtml: report.fullReportText, originalReport: report
                })).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            case 'sdg':
                 return sdgAlignmentReports.filter(r => r.projectId === projectId).map(report => ({
                    id: report.id, title: `SDG Alignment Report from ${new Date(report.createdAt).toLocaleString()}`, notes: report.notes,
                    createdAt: report.createdAt, fullReportHtml: report.fullReportText, originalReport: report
                })).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                
            case 'recreation':
                 return recreationFrameworkReports.filter(r => r.projectId === projectId).map(report => ({
                    id: report.id, title: `Recreation Framework Report from ${new Date(report.createdAt).toLocaleString()}`, notes: report.notes,
                    createdAt: report.createdAt, fullReportHtml: report.fullReportText, originalReport: report
                })).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            default:
                return [];
        }
    }, [activeTab, selectedProject, ecostarReports, interestCompatibilityReports, sdgAlignmentReports, recreationFrameworkReports, researchPlans, otfApplications]);

    const activeReportConfig = useMemo(() => {
        const configs: Record<ReportType, { title: string, noReportsMessage: string, toolName: string, onEdit?: (report: any) => void, onView?: (report: any) => void }> = {
            research: { title: "Research Plans", noReportsMessage: "No Research Plans found.", toolName: "Research Plan Generator", onEdit: (r) => handleEditReport(r, 'research') },
            otf: { title: "OTF Applications", noReportsMessage: "No OTF Applications found.", toolName: "OTF Module", onEdit: (r) => handleEditReport(r, 'otf'), onView: (app) => setViewingOtfApp(app) },
            ecostar: { title: "ECO-STAR Reports", noReportsMessage: "No ECO-STAR reports found.", toolName: "ECO-STAR AI Workshop" },
            interest: { title: "Interest Compatibility Reports", noReportsMessage: "No Interest Compatibility reports found.", toolName: "Interest Compatibility Assessment" },
            sdg: { title: "SDG Alignment Reports", noReportsMessage: "No SDG Alignment reports found.", toolName: "SDG Alignment Report" },
            recreation: { title: "Recreation Framework Reports", noReportsMessage: "No Recreation Framework reports found.", toolName: "Framework for Recreation tool" }
        };
        return configs[activeTab];
    }, [activeTab, handleEditReport]);

    if (!selectedProject) return null;
    if (viewingOtfApp) return <OtfApplicationViewer application={viewingOtfApp} onBack={() => setViewingOtfApp(null)} />;
    
    return (
        <div>
            {reportToDelete && ( <ConfirmationModal isOpen={!!reportToDelete} onClose={() => { setReportToDelete(null); setReportTypeToDelete(null); }} onConfirm={confirmDelete} title="Delete Report" message="Are you sure you want to permanently delete this report?" /> )}
            
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Supplemental Reports & Applications</h2>
                    <p className="text-sm text-slate-500">View archived strategic reports and application drafts for this project.</p>
                </div>
            </div>
            
            <div className="border-b border-slate-200 mb-6">
                <nav className="-mb-px flex space-x-6 overflow-x-auto">
                    {TABS.map(item => ( <button key={item.id} type="button" onClick={() => setActiveTab(item.id)} className={`whitespace-nowrap py-3 px-3 border-b-2 font-semibold text-sm transition-all ${activeTab === item.id ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>{item.label}</button>))}
                </nav>
            </div>

            <div className="mt-6">
                <ReportList 
                    reports={activeReportData}
                    onDelete={(r) => handleDeleteClick(r, activeTab)}
                    onEdit={activeReportConfig.onEdit}
                    onView={activeReportConfig.onView}
                    onDownloadPdf={(r) => handleDownloadPdf(r, activeTab)}
                    onCopy={handleCopyToClipboard}
                    title={activeReportConfig.title}
                    noReportsMessage={activeReportConfig.noReportsMessage}
                    toolName={activeReportConfig.toolName}
                />
            </div>
        </div>
    );
};

export default SupplementalReportsTab;
