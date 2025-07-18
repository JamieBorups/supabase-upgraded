import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { JobDescription, FormData as Project } from '../../types';
import { generateJobDescriptionsPdf } from '../../utils/pdfGenerator';

const JobDescriptionsSection: React.FC<{ selectedProject: Project }> = ({ selectedProject }) => {
    const { state, notify } = useAppContext();
    const [isGenerating, setIsGenerating] = useState(false);

    const genericJds = React.useMemo(() => {
        return state.jobDescriptions.filter(jd => jd.projectId === selectedProject.id && !jd.memberId);
    }, [state.jobDescriptions, selectedProject.id]);

    const handleGeneratePdf = async () => {
        if (genericJds.length === 0) {
            notify("No generic job descriptions to include in the PDF.", "info");
            return;
        }
        setIsGenerating(true);
        notify("Generating PDF...", "info");
        try {
            await generateJobDescriptionsPdf(genericJds, selectedProject.projectTitle);
        } catch (error: any) {
            notify(`Failed to generate PDF: ${error.message}`, "error");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="report-section-heading">Generic Job Descriptions</h2>
                <button
                    onClick={handleGeneratePdf}
                    disabled={isGenerating || genericJds.length === 0}
                    className="btn btn-secondary"
                >
                    <i className={`fa-solid ${isGenerating ? 'fa-spinner fa-spin' : 'fa-file-pdf'} mr-2`}></i>
                    {isGenerating ? 'Generating...' : 'Generate PDF'}
                </button>
            </div>
             <p className="text-base mb-6 -mt-2" style={{ color: 'var(--color-text-muted)' }}>
                This section lists all generic (unassigned) job descriptions created for this project. These are useful for grant proposals and project planning. Member-specific descriptions can be found in the Member Viewer.
            </p>
            {genericJds.length > 0 ? (
                <div className="space-y-4">
                    {genericJds.map(jd => (
                        <details key={jd.id} className="border rounded-lg bg-white overflow-hidden" style={{ borderColor: 'var(--color-border-subtle)' }}>
                            <summary className="p-4 font-semibold text-lg cursor-pointer list-none flex justify-between items-center hover:bg-slate-50">{jd.title}<i className="fa-solid fa-chevron-down transform transition-transform details-arrow"></i></summary>
                            <div className="p-4 border-t prose prose-sm max-w-none" style={{ borderColor: 'var(--color-border-subtle)' }}>
                                <h4 className="font-bold">Summary</h4>
                                <p className="text-sm mt-1 mb-3 whitespace-pre-wrap">{jd.summary}</p>
                                <h4 className="font-bold">Responsibilities</h4>
                                <ul className="list-disc list-inside text-sm mt-1">
                                    {jd.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
                                </ul>
                            </div>
                        </details>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 rounded-lg" style={{ backgroundColor: 'var(--color-surface-muted)' }}>
                    <p style={{ color: 'var(--color-text-muted)' }}>No generic job descriptions have been created for this project.</p>
                </div>
            )}
        </div>
    );
};

export default JobDescriptionsSection;
