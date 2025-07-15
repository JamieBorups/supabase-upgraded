
import React from 'react';
import { KpiReport } from '../../types';

interface KpiReportViewerModalProps {
    report: KpiReport;
    projectTitle: string;
    onClose: () => void;
}

const KpiReportViewerModal: React.FC<KpiReportViewerModalProps> = ({ report, projectTitle, onClose }) => {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-[60] flex justify-center items-center p-4 print:bg-transparent print:block print:p-0">
            <div id="printable-kpi-report" className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col print:h-auto print:shadow-none print:p-8 print:w-full print:max-w-none print:border-none">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200 flex-shrink-0 print:hidden">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">View KPI Report</h2>
                        <p className="text-sm text-slate-500">Project: <span className="font-semibold">{projectTitle}</span></p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handlePrint} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700">
                            <i className="fa-solid fa-print mr-2"></i>Print
                        </button>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 transition-colors">
                            <i className="fa-solid fa-times text-slate-600"></i>
                        </button>
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto pr-4 -mr-4 space-y-5 print:overflow-visible print:pr-0 print:-mr-0">
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: report.fullReportText || '<p>No content available.</p>' }} />
                </div>
                 {/* Non-printable footer */}
                 <div className="mt-6 pt-4 border-t border-slate-200 flex-shrink-0 flex justify-end print:hidden">
                     <button onClick={onClose} className="px-6 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-md hover:bg-slate-200">
                        Close
                    </button>
                 </div>
            </div>
        </div>
    );
};
export default KpiReportViewerModal;
