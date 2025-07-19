
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext.tsx';
import { Page, JobDescription } from '../../types.ts';
import FormField from '../ui/FormField.tsx';
import { Textarea } from '../ui/Textarea.tsx';
import { generateBulkJobDescriptions } from '../../services/ai/jobDescriptionGenerator.ts';
import * as api from '../../services/api.ts';

interface AutoGenerateJobsPageProps {
    onNavigate: (page: Page) => void;
}

const AutoGenerateJobsPage: React.FC<AutoGenerateJobsPageProps> = ({ onNavigate }) => {
    const { state, dispatch, notify } = useAppContext();
    const { experienceHubProjectId, projects } = state;

    const [additionalDetails, setAdditionalDetails] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [generatedCount, setGeneratedCount] = useState(0);

    const project = useMemo(() => {
        return projects.find(p => p.id === experienceHubProjectId);
    }, [experienceHubProjectId, projects]);

    const handleGenerate = async () => {
        if (!project) {
            notify('A project context is required to generate descriptions.', 'error');
            return;
        }

        setIsLoading(true);
        setIsSuccess(false);
        setGeneratedCount(0);
        
        try {
            const generatedDescriptions = await generateBulkJobDescriptions(project, { 
                additionalDetails,
                seniorityLevel: 'Mid-Career', // Default for bulk generation
                tailoringTags: [], // Default for bulk generation
            }, state);
            
            if (!generatedDescriptions || generatedDescriptions.length === 0) {
                throw new Error("The AI did not return any job descriptions.");
            }

            for (const desc of generatedDescriptions) {
                const jdToSave: Omit<JobDescription, 'id' | 'createdAt' | 'updatedAt'> = {
                    isSystemDefined: false,
                    isEditable: true,
                    projectId: project.id,
                    memberId: null, // Generic descriptions are unassigned
                    title: desc.title || 'Untitled Role',
                    seniorityLevel: desc.seniorityLevel || 'Mid-Career',
                    tailoringTags: [],
                    projectTagline: desc.projectTagline || '',
                    projectSummary: desc.projectSummary || '',
                    summary: desc.summary || '',
                    responsibilities: desc.responsibilities || [],
                    hardSkills: desc.hardSkills || '',
                    softSkills: desc.softSkills || '',
                    qualifications: desc.qualifications || [],
                    resumePoints: [], // These are generated per-member, not for generic roles
                    linkedinSummary: '', // Also per-member
                    aboutOrg: state.settings.general.organizationalDescription,
                    volunteerBenefits: desc.volunteerBenefits || '',
                    timeCommitment: desc.timeCommitment,
                    applicationProcess: desc.applicationProcess,
                    callToAction: desc.callToAction,
                };

                const savedJd = await api.addJobDescription(jdToSave);
                dispatch({ type: 'ADD_JOB_DESCRIPTION', payload: savedJd });
            }
            
            setGeneratedCount(generatedDescriptions.length);
            setIsSuccess(true);
            notify(`${generatedDescriptions.length} job descriptions generated and saved!`, 'success');

        } catch (error: any) {
            console.error("Bulk Generation Error:", error);
            notify(`An error occurred during generation: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (!project) {
        return (
            <div className="p-6 sm:p-8 rounded-xl shadow-lg text-center" style={{ backgroundColor: 'var(--color-surface-card)' }}>
                <i className="fa-solid fa-triangle-exclamation text-4xl text-yellow-500 mb-4"></i>
                <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-heading)' }}>No Project Selected</h2>
                <p className="mt-2" style={{ color: 'var(--color-text-muted)' }}>Please go back to the Experience Hub and select a project before using the auto-generator.</p>
                <button onClick={() => onNavigate('experienceHub')} className="btn btn-secondary mt-6">
                    <i className="fa-solid fa-arrow-left mr-2"></i>
                    Back to Experience Hub
                </button>
            </div>
        );
    }
    
    if (isLoading) {
        return (
             <div className="p-6 sm:p-8 rounded-xl shadow-lg text-center" style={{ backgroundColor: 'var(--color-surface-card)' }}>
                <i className="fa-solid fa-spinner fa-spin text-4xl text-teal-500 mb-4"></i>
                <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-heading)' }}>Generating Descriptions...</h2>
                <p className="mt-2" style={{ color: 'var(--color-text-muted)' }}>The AI is analyzing your project and crafting the ideal roles. This may take a moment.</p>
            </div>
        );
    }
    
    if (isSuccess) {
        return (
             <div className="p-6 sm:p-8 rounded-xl shadow-lg text-center" style={{ backgroundColor: 'var(--color-surface-card)' }}>
                <i className="fa-solid fa-check-circle text-4xl text-green-500 mb-4"></i>
                <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-heading)' }}>Success!</h2>
                <p className="mt-2" style={{ color: 'var(--color-text-muted)' }}>{generatedCount} generic job descriptions have been successfully generated and saved for "{project.projectTitle}".</p>
                <div className="mt-8 flex justify-center gap-4">
                    <button onClick={() => onNavigate('experienceHub')} className="btn btn-secondary">
                        <i className="fa-solid fa-arrow-left mr-2"></i>
                        Back to Experience Hub
                    </button>
                     <button onClick={() => onNavigate('reports')} className="btn btn-primary">
                        <i className="fa-solid fa-file-invoice mr-2"></i>
                        View in Reports & Archives
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 sm:p-8 rounded-xl shadow-lg max-w-3xl mx-auto" style={{ backgroundColor: 'var(--color-surface-card)' }}>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-heading)' }}>Automated Job Description Generator</h1>
            <p className="mt-2" style={{ color: 'var(--color-text-muted)' }}>For project: <strong className="font-semibold" style={{ color: 'var(--color-primary)' }}>{project.projectTitle}</strong></p>

            <div className="mt-8">
                 <FormField 
                    label="Additional Details (Optional)" 
                    htmlFor="additional_details"
                    instructions="Provide specific roles, focus areas, or keywords to guide the AI (e.g., 'marketing lead, community outreach coordinator, technical director'). If left blank, the AI will generate a balanced, general-purpose team."
                >
                    <Textarea 
                        id="additional_details"
                        value={additionalDetails}
                        onChange={(e) => setAdditionalDetails(e.target.value)}
                        rows={4}
                    />
                </FormField>
            </div>

            <div className="mt-8 pt-6 border-t flex justify-between items-center" style={{ borderColor: 'var(--color-border-subtle)' }}>
                 <button onClick={() => onNavigate('experienceHub')} className="btn btn-secondary">
                    <i className="fa-solid fa-arrow-left mr-2"></i>
                    Cancel
                </button>
                 <button onClick={handleGenerate} className="btn btn-primary px-6 py-3 text-lg font-semibold">
                    <i className="fa-solid fa-robot mr-2"></i>
                    Generate 5-7 Job Descriptions
                </button>
            </div>
        </div>
    );
};

export default AutoGenerateJobsPage;