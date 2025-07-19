
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { JobDescription, FormData as Project } from '../../types';
import { generateJobDescriptionsPdf } from '../../utils/pdfGenerator';

const FullJobDescriptionView: React.FC<{ jd: JobDescription }> = ({ jd }) => {
    return (
        <div className="prose prose-sm max-w-none text-slate-700 space-y-4">
            {jd.projectTagline && <p className="lead italic text-slate-600">"{jd.projectTagline}"</p>}
            
            {jd.aboutOrg && <div><h4>About the Organization</h4><p className="whitespace-pre-wrap">{jd.aboutOrg}</p></div>}
            {jd.projectSummary && <div><h4>Project Summary</h4><p className="whitespace-pre-wrap">{jd.projectSummary}</p></div>}
            
            <h4>Role Summary</h4>
            <p className="whitespace-pre-wrap">{jd.summary}</p>
            
            <h4>Key Responsibilities</h4>
            <ul className="list-disc list-inside">{jd.responsibilities.map((r, i) => <li key={i}>{r}</li>)}</ul>

            <h4>Qualifications</h4>
            <ul className="list-disc list-inside">{jd.qualifications.map((q, i) => <li key={i}>{q}</li>)}</ul>

            {jd.hardSkills && <div><h4>Hard Skills</h4><p className="whitespace-pre-wrap">{jd.hardSkills}</p></div>}
            {jd.softSkills && <div><h4>Soft Skills</h4><p className="whitespace-pre-wrap">{jd.softSkills}</p></div>}
            
            {jd.volunteerBenefits && <div><h4>What You'll Gain</h4><p className="whitespace-pre-wrap">{jd.volunteerBenefits}</p></div>}
            {jd.timeCommitment && <div><h4>Time Commitment & Logistics</h4><p className="whitespace-pre-wrap">{jd.timeCommitment}</p></div>}
            {jd.applicationProcess && <div><h4>How to Get Involved</h4><p className="whitespace-pre-wrap">{jd.applicationProcess}</p></div>}
            {jd.callToAction && <div><h4>Get Involved!</h4><p className="whitespace-pre-wrap">{jd.callToAction}</p></div>}
        </div>
    );
};


const JobDescriptionsSection: React.FC<{ selectedProject: Project }> = ({ selectedProject }) => {
    const { state, notify } = useAppContext();
    const [isGeneratingAll, setIsGeneratingAll] = useState(false);
    const [generatingPdfId, setGeneratingPdfId] = useState<string | null>(null);

    const genericJds = React.useMemo(() => {
        return state.jobDescriptions.filter(jd => jd.projectId === selectedProject.id && !jd.memberId);
    }, [state.jobDescriptions, selectedProject.id]);

    const handleGenerateAllPdf = async () => {
        if (genericJds.length === 0) {
            notify("No volunteer job descriptions to include in the PDF.", "info");
            return;
        }
        setIsGeneratingAll(true);
        notify("Generating PDF for all descriptions...", "info");
        try {
            await generateJobDescriptionsPdf(genericJds, selectedProject.projectTitle, state.settings);
        } catch (error: any) {
            notify(`Failed to generate PDF: ${error.message}`, "error");
        } finally {
            setIsGeneratingAll(false);
        }
    };
    
    const handleGenerateSinglePdf = async (jd: JobDescription) => {
        setGeneratingPdfId(jd.id);
        notify(`Generating PDF for ${jd.title}...`, "info");
        try {
            await generateJobDescriptionsPdf([jd], selectedProject.projectTitle, state.settings);
        } catch (error: any) {
            notify(`Failed to generate PDF: ${error.message}`, "error");
        } finally {
            setGeneratingPdfId(null);
        }
    };


    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="report-section-heading">Volunteer Job Descriptions</h2>
                <button
                    onClick={handleGenerateAllPdf}
                    disabled={isGeneratingAll || genericJds.length === 0}
                    className="btn btn-secondary"
                >
                    <i className={`fa-solid ${isGeneratingAll ? 'fa-spinner fa-spin' : 'fa-file-pdf'} mr-2`}></i>
                    {isGeneratingAll ? 'Generating...' : 'Generate PDF (All)'}
                </button>
            </div>
             <p className="text-base mb-6 -mt-2" style={{ color: 'var(--color-text-muted)' }}>
                This section lists all generic (unassigned) job descriptions created for this project. These are useful for grant proposals and project planning. Member-specific descriptions can be found in the Member Viewer.
            </p>
            {genericJds.length > 0 ? (
                <div className="space-y-4">
                    {genericJds.map(jd => (
                        <details key={jd.id} className="border rounded-lg bg-white overflow-hidden" style={{ borderColor: 'var(--color-border-subtle)' }}>
                            <summary className="p-4 font-semibold text-lg cursor-pointer list-none flex justify-between items-center hover:bg-slate-50">
                                {jd.title}
                                <i className="fa-solid fa-chevron-down transform transition-transform details-arrow"></i>
                            </summary>
                            <div className="p-4 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
                                <div className="flex justify-end mb-4">
                                     <button
                                        onClick={() => handleGenerateSinglePdf(jd)}
                                        disabled={!!generatingPdfId}
                                        className="btn btn-secondary"
                                    >
                                        <i className={`fa-solid ${generatingPdfId === jd.id ? 'fa-spinner fa-spin' : 'fa-file-pdf'} mr-2`}></i>
                                        {generatingPdfId === jd.id ? 'Generating...' : 'Generate PDF'}
                                    </button>
                                </div>
                                <FullJobDescriptionView jd={jd} />
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
