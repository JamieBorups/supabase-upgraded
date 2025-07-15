
import React, { useMemo } from 'react';
import { ResearchPlan } from '../../../types';
import { generateResearchPlanPdf } from '../../../utils/pdfGenerator';
import { useAppContext } from '../../../context/AppContext';

const FormattedReportViewer: React.FC<{ htmlContent: string }> = ({ htmlContent = '' }) => {
    return <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};

interface GenerateReportTabProps {
    plan: ResearchPlan;
    onBack: () => void;
}

const GenerateReportTab: React.FC<GenerateReportTabProps> = ({ plan, onBack }) => {
    const { state } = useAppContext();
    const project = useMemo(() => state.projects.find(p => p.id === plan.projectId), [state.projects, plan.projectId]);

    const handleDownloadPdf = () => {
        if (project) {
            generateResearchPlanPdf(plan, project.projectTitle);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <button onClick={onBack} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100">
                    <i className="fa-solid fa-arrow-left mr-2"></i>Back to All Plans
                </button>
                <button
                    onClick={handleDownloadPdf}
                    className="px-6 py-2 text-base font-semibold text-white bg-rose-600 rounded-md shadow-sm hover:bg-rose-700"
                >
                    <i className="fa-solid fa-file-pdf mr-2"></i>Download as PDF
                </button>
            </div>

            <div className="p-8 border border-slate-300 rounded-lg bg-white">
                <FormattedReportViewer htmlContent={plan.fullReportHtml || ''} />
            </div>
        </div>
    );
};

export default GenerateReportTab;
