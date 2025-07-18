

import React, { useState, useMemo, useCallback } from 'react';
import { produce } from 'immer';
import { Type } from '@google/genai';
import { useAppContext } from './context/AppContext';
import { JobDescription, Page, Member, FormData as Project } from './types';
import * as api from './services/api';
import { getAiResponse } from './services/aiService';
import ProjectFilter from './components/ui/ProjectFilter';
import FormField from './components/ui/FormField';
import { Input } from './components/ui/Input';
import { Textarea } from './components/ui/Textarea';
import { Select } from './components/ui/Select';
import { CheckboxGroup } from './components/ui/CheckboxGroup';
import ConfirmationModal from './components/ui/ConfirmationModal';
import { SENIORITY_LEVELS, TAILORING_TAGS, initialJobDescription } from './constants';

// --- LIST VIEW ---
interface JobDescriptionListProps {
    jobDescriptions: JobDescription[];
    selectedProjectId: string;
    onProjectChange: (id: string) => void;
    onStartGenerate: () => void;
    onView: (jd: JobDescription) => void;
    onDelete: (jd: JobDescription) => void;
}

const JobDescriptionList: React.FC<JobDescriptionListProps> = ({ jobDescriptions, selectedProjectId, onProjectChange, onStartGenerate, onView, onDelete }) => {
    const { state } = useAppContext();
    const memberMap = useMemo(() => new Map(state.members.map(m => [m.id, `${m.firstName} ${m.lastName}`])), [state.members]);
    
    return (
        <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b pb-4 gap-4" style={{ borderColor: 'var(--color-border-subtle)' }}>
                <div>
                    <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-heading)' }}>Experience Hub</h1>
                    <p style={{ color: 'var(--color-text-muted)' }} className="mt-1">Translate project contributions into professional job descriptions and resume-ready assets.</p>
                </div>
                <div className="w-full md:w-auto md:max-w-xs">
                    <FormField label="Filter by Project" htmlFor="exp_project_select" className="mb-0">
                        <ProjectFilter value={selectedProjectId} onChange={onProjectChange} allowAll={true} />
                    </FormField>
                </div>
            </div>
             <div className="text-right mb-6">
                 <button 
                    onClick={onStartGenerate}
                    disabled={!selectedProjectId}
                    className="btn btn-primary"
                    title={!selectedProjectId ? 'Please select a project to generate a description' : ''}
                >
                    <i className="fa-solid fa-wand-magic-sparkles mr-2"></i>
                    Generate New Description
                </button>
            </div>

            {jobDescriptions.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed rounded-lg" style={{ backgroundColor: 'var(--color-surface-muted)', borderColor: 'var(--color-border-subtle)' }}>
                    <i className="fa-solid fa-award text-6xl" style={{ color: 'var(--color-border-default)' }}></i>
                    <h2 className="mt-4 text-xl font-semibold" style={{ color: 'var(--color-text-heading)' }}>No Descriptions Yet</h2>
                    <p className="mt-1" style={{ color: 'var(--color-text-muted)' }}>{selectedProjectId ? 'Click "Generate New" to create the first description for this project.' : 'Select a project to view its descriptions, or view system-wide templates.'}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobDescriptions.map(jd => (
                        <div key={jd.id} className="p-4 border rounded-lg shadow-sm flex flex-col h-full" style={{ backgroundColor: 'var(--color-surface-card)', borderColor: 'var(--color-border-subtle)' }}>
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-lg" style={{ color: 'var(--color-primary)' }}>{jd.title}</h3>
                                {jd.isSystemDefined ? (
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-surface-muted)', color: 'var(--color-text-muted)' }}>System Template</span>
                                ) : jd.memberId ? (
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-status-info-bg)', color: 'var(--color-status-info-text)' }}>For: {memberMap.get(jd.memberId)}</span>
                                ) : (
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-status-warning-bg)', color: 'var(--color-status-warning-text)' }}>Generic Role</span>
                                )}
                            </div>
                            <p className="text-xs font-semibold uppercase" style={{ color: 'var(--color-text-muted)' }}>{jd.seniorityLevel}</p>
                            <p className="text-sm my-3 flex-grow" style={{ color: 'var(--color-text-default)' }}>{jd.summary}</p>
                            <div className="flex-shrink-0 mt-auto pt-3 border-t flex justify-end gap-2" style={{ borderColor: 'var(--color-border-subtle)' }}>
                                <button onClick={() => onView(jd)} className="btn btn-secondary">View</button>
                                <button disabled={!jd.isEditable} onClick={() => jd.isEditable && onDelete(jd)} className="btn btn-danger disabled:opacity-50 disabled:cursor-not-allowed">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


// --- GENERATION FORM VIEW ---
interface GenerationFormProps {
    onCancel: () => void;
    onGenerate: (config: any) => void;
    project: Project | undefined;
    members: Member[];
    isGenerating: boolean;
}

const GenerationForm: React.FC<GenerationFormProps> = ({ onCancel, onGenerate, project, members, isGenerating }) => {
    const [config, setConfig] = useState({ title: '', seniorityLevel: 'Mid-Career', memberId: '', tailoringTags: [] as string[] });

    const availableMembers = useMemo(() => {
        if (!project) return [];
        const collaboratorIds = new Set(project.collaboratorDetails.map(c => c.memberId));
        return members.filter(m => collaboratorIds.has(m.id));
    }, [project, members]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onGenerate(config);
    };
    
    if (isGenerating) {
        return (
            <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
                <div className="text-center py-20">
                    <i className="fa-solid fa-spinner fa-spin text-4xl text-teal-500"></i>
                    <p className="mt-4 text-lg text-slate-600">AI is crafting your description...</p>
                    <p className="text-sm text-slate-500">This may take a moment.</p>
                </div>
            </div>
        );
    }

    return (
         <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
            <form onSubmit={handleSubmit}>
                <h3 className="text-2xl font-bold mb-6 pb-4 border-b" style={{ color: 'var(--color-text-heading)', borderColor: 'var(--color-border-subtle)' }}>Generate New Description</h3>
                <p className="text-base mb-6 -mt-2" style={{ color: 'var(--color-text-muted)' }}>Provide the AI with some initial parameters to generate a tailored job description for the project: <strong>{project?.projectTitle}</strong></p>
                <div className="space-y-6 max-w-2xl mx-auto">
                    <FormField label="Role Title" htmlFor="role_title" required><Input id="role_title" value={config.title} onChange={e => setConfig(p => ({...p, title: e.target.value}))} /></FormField>
                    <FormField label="Seniority Level" htmlFor="seniority"><Select id="seniority" value={config.seniorityLevel} onChange={e => setConfig(p => ({...p, seniorityLevel: e.target.value}))} options={SENIORITY_LEVELS} /></FormField>
                    <FormField label="Assign to Member (Optional)" htmlFor="member" instructions="AI will use their bio as context."><Select id="member" value={config.memberId} onChange={e => setConfig(p => ({...p, memberId: e.target.value}))} options={[{value: '', label: 'Generic Role'}, ...availableMembers.map(m => ({value: m.id, label: `${m.firstName} ${m.lastName}`))]} /></FormField>
                    <FormField label="Tailor Description" htmlFor="tags" instructions="Select skills to emphasize."><CheckboxGroup name="tags" options={TAILORING_TAGS} selectedValues={config.tailoringTags} onChange={v => setConfig(p => ({...p, tailoringTags: v}))} columns={2} /></FormField>
                </div>
                <div className="mt-8 flex justify-end space-x-3 pt-5 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
                    <button type="button" onClick={onCancel} className="btn btn-secondary" disabled={isGenerating}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={isGenerating || !config.title}>
                        <i className="fa-solid fa-wand-magic-sparkles mr-2"></i>
                        Generate
                    </button>
                </div>
            </form>
        </div>
    );
};

// --- VIEWER ---

const CopyButton: React.FC<{ textToCopy: string }> = ({ textToCopy }) => {
    const { notify } = useAppContext();
    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy)
            .then(() => notify('Copied to clipboard!', 'success'))
            .catch(() => notify('Failed to copy.', 'error'));
    };
    return (
        <button onClick={handleCopy} className="btn btn-secondary px-2 py-1 text-xs">
            <i className="fa-solid fa-copy mr-1"></i> Copy
        </button>
    );
};

const ViewField: React.FC<{ label: string; children: React.ReactNode; textToCopy: string; }> = ({ label, children, textToCopy }) => (
    <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-surface-muted)' }}>
        <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{label}</h4>
            <CopyButton textToCopy={textToCopy} />
        </div>
        <div className="text-sm" style={{ color: 'var(--color-text-default)' }}>{children}</div>
    </div>
);

const JobDescriptionViewer: React.FC<{jd: JobDescription; onBack: () => void; onEdit: (jd: JobDescription) => void}> = ({ jd, onBack, onEdit }) => {
    return (
         <div className="p-6 sm:p-8 rounded-xl shadow-lg" style={{ backgroundColor: 'var(--color-surface-card)' }}>
            <div className="flex justify-between items-center mb-6 border-b pb-4" style={{ borderColor: 'var(--color-border-subtle)' }}>
                <div>
                    <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-heading)' }}>{jd.title}</h1>
                    <p className="font-semibold" style={{ color: 'var(--color-text-muted)' }}>{jd.seniorityLevel}</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={onBack} className="btn btn-secondary">Back to List</button>
                    {jd.isEditable && <button onClick={() => onEdit(jd)} className="btn btn-primary">Edit</button>}
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <ViewField label="Summary" textToCopy={jd.summary}><p className="whitespace-pre-wrap">{jd.summary}</p></ViewField>
                    <ViewField label="Key Responsibilities" textToCopy={jd.responsibilities.join('\n')}><ul className="list-disc list-inside space-y-1">{jd.responsibilities.map((r, i) => <li key={i}>{r}</li>)}</ul></ViewField>
                    <ViewField label="Qualifications" textToCopy={jd.qualifications.join('\n')}><ul className="list-disc list-inside space-y-1">{jd.qualifications.map((q, i) => <li key={i}>{q}</li>)}</ul></ViewField>
                </div>
                 <div className="space-y-4">
                    <ViewField label="Hard Skills" textToCopy={jd.hardSkills.join(', ')}><p>{jd.hardSkills.join(', ')}</p></ViewField>
                    <ViewField label="Soft Skills" textToCopy={jd.softSkills.join(', ')}><p>{jd.softSkills.join(', ')}</p></ViewField>
                    <ViewField label="Resume / CV Points" textToCopy={jd.resumePoints.join('\n')}><ul className="list-disc list-inside space-y-1">{jd.resumePoints.map((p, i) => <li key={i}>{p}</li>)}</ul></ViewField>
                    <ViewField label="LinkedIn Summary" textToCopy={jd.linkedinSummary}><p className="whitespace-pre-wrap">{jd.linkedinSummary}</p></ViewField>
                </div>
            </div>
        </div>
    );
};

// --- EDITOR ---
const JobDescriptionEditor: React.FC<{jd: JobDescription; onSave: (jd: JobDescription) => void; onCancel: () => void;}> = ({ jd, onSave, onCancel }) => {
    const [formData, setFormData] = useState(jd);

    const handleChange = (field: keyof JobDescription, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleArrayChange = (field: 'responsibilities' | 'hardSkills' | 'softSkills' | 'qualifications' | 'resumePoints', value: string) => {
        handleChange(field, value.split('\n'));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
         <div className="p-6 sm:p-8 rounded-xl shadow-lg" style={{ backgroundColor: 'var(--color-surface-card)' }}>
            <form onSubmit={handleSubmit}>
                 <div className="flex justify-between items-center mb-6 border-b pb-4" style={{ borderColor: 'var(--color-border-subtle)' }}>
                    <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-heading)' }}>Edit Description</h1>
                 </div>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <FormField label="Title" htmlFor="jd_title"><Input id="jd_title" value={formData.title} onChange={e => handleChange('title', e.target.value)} /></FormField>
                        <FormField label="Summary" htmlFor="jd_summary"><Textarea id="jd_summary" value={formData.summary} onChange={e => handleChange('summary', e.target.value)} rows={5} /></FormField>
                        <FormField label="Key Responsibilities (one per line)" htmlFor="jd_responsibilities"><Textarea id="jd_responsibilities" value={formData.responsibilities.join('\n')} onChange={e => handleArrayChange('responsibilities', e.target.value)} rows={8} /></FormField>
                        <FormField label="Qualifications (one per line)" htmlFor="jd_qualifications"><Textarea id="jd_qualifications" value={formData.qualifications.join('\n')} onChange={e => handleArrayChange('qualifications', e.target.value)} rows={5} /></FormField>
                    </div>
                     <div className="space-y-4">
                        <FormField label="Hard Skills (comma-separated)" htmlFor="jd_hardSkills"><Input id="jd_hardSkills" value={formData.hardSkills.join(', ')} onChange={e => handleChange('hardSkills', e.target.value.split(',').map(s => s.trim()))} /></FormField>
                        <FormField label="Soft Skills (comma-separated)" htmlFor="jd_softSkills"><Input id="jd_softSkills" value={formData.softSkills.join(', ')} onChange={e => handleChange('softSkills', e.target.value.split(',').map(s => s.trim()))} /></FormField>
                        <FormField label="Resume / CV Points (one per line)" htmlFor="jd_resumePoints"><Textarea id="jd_resumePoints" value={formData.resumePoints.join('\n')} onChange={e => handleArrayChange('resumePoints', e.target.value)} rows={6} /></FormField>
                        <FormField label="LinkedIn Summary" htmlFor="jd_linkedinSummary"><Textarea id="jd_linkedinSummary" value={formData.linkedinSummary} onChange={e => handleChange('linkedinSummary', e.target.value)} rows={6} /></FormField>
                    </div>
                 </div>
                 <div className="mt-8 pt-6 border-t flex justify-end gap-3" style={{ borderColor: 'var(--color-border-subtle)' }}>
                     <button type="button" onClick={onCancel} className="btn btn-secondary">Cancel</button>
                     <button type="submit" className="btn btn-primary">Save Changes</button>
                 </div>
            </form>
         </div>
    );
};


// --- MAIN MANAGER COMPONENT ---
const ExperienceHubManager: React.FC = () => {
    const { state, dispatch, notify } = useAppContext();
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [viewMode, setViewMode] = useState<'list' | 'edit' | 'view' | 'generate'>('list');
    const [currentJd, setCurrentJd] = useState<JobDescription | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [jdToDelete, setJdToDelete] = useState<JobDescription | null>(null);
    
    const projectMap = useMemo(() => new Map(state.projects.map(p => [p.id, p])), [state.projects]);
    const memberMap = useMemo(() => new Map(state.members.map(m => [m.id, m])), [state.members]);

    const filteredJds = useMemo(() => {
        const sortedJds = [...state.jobDescriptions].sort((a,b) => b.updatedAt.localeCompare(a.updatedAt));
        if (!selectedProjectId) {
            return sortedJds.filter(jd => jd.isSystemDefined);
        }
        return sortedJds.filter(jd => jd.projectId === selectedProjectId);
    }, [selectedProjectId, state.jobDescriptions]);

    const handleGenerate = async (config: { title: string; seniorityLevel: string; memberId: string | null; tailoringTags: string[] }) => {
        if (!selectedProjectId) {
            notify('Please select a project to generate a description for.', 'warning');
            return;
        }
        const project = projectMap.get(selectedProjectId);
        const member = config.memberId ? memberMap.get(config.memberId) : null;
        if (!project) return;
        
        setIsGenerating(true);
        setViewMode('generate'); // Switch to the loading view

        const context = {
            project: {
                title: project.projectTitle,
                description: project.projectDescription,
                background: project.background,
                schedule: project.schedule,
                goals: project.artisticDevelopment,
                collaborators: project.collaboratorDetails.map(c => ({ role: c.role, memberName: memberMap.get(c.memberId)?.firstName || 'A team member' })),
            },
            role: {
                title: config.title,
                seniority: config.seniorityLevel,
                assignedMember: member ? { name: `${member.firstName} ${member.lastName}`, bio: member.artistBio || member.shortBio } : null,
            },
            tailoringTags: config.tailoringTags,
        };
        
        const prompt = `Generate a job description based on the following context:\n${JSON.stringify(context, null, 2)}`;
        
        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                summary: { type: Type.STRING },
                responsibilities: { type: Type.ARRAY, items: { type: Type.STRING } },
                hardSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                softSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                qualifications: { type: Type.ARRAY, items: { type: Type.STRING } },
                resumePoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                linkedinSummary: { type: Type.STRING },
            },
            required: ['summary', 'responsibilities', 'hardSkills', 'softSkills', 'qualifications', 'resumePoints', 'linkedinSummary']
        };

        try {
            const result = await getAiResponse('experienceHub', prompt, state.settings.ai, [], { responseSchema });
            const parsedData = JSON.parse(result.text);

            const newJd: JobDescription = {
                ...initialJobDescription,
                // Do NOT set an ID on the client. The DB will do it.
                id: '', 
                projectId: selectedProjectId,
                memberId: config.memberId,
                title: config.title,
                seniorityLevel: config.seniorityLevel,
                tailoringTags: config.tailoringTags,
                ...parsedData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            
            setCurrentJd(newJd);
            setViewMode('edit');
        } catch (error: any) {
            notify(`AI generation failed: ${error.message}`, 'error');
            setViewMode('list');
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleSave = async (jdToSave: JobDescription) => {
        const isNew = !jdToSave.id || !state.jobDescriptions.some(j => j.id === jdToSave.id);
        
        // Prepare data for saving by ensuring empty string memberId becomes null
        const dataForApi = { ...jdToSave };
        if (dataForApi.memberId === '') {
            dataForApi.memberId = null;
        }
        
        try {
            if (isNew) {
                // The API expects an object without id, createdAt, updatedAt
                const { id, createdAt, updatedAt, ...payload } = dataForApi;
                const addedJd = await api.addJobDescription(payload);
                dispatch({ type: 'ADD_JOB_DESCRIPTION', payload: addedJd });
                notify('Description saved!', 'success');
            } else {
                const updatedJd = await api.updateJobDescription(dataForApi.id, dataForApi);
                dispatch({ type: 'UPDATE_JOB_DESCRIPTION', payload: updatedJd });
                notify('Description updated!', 'success');
            }
            setViewMode('list');
            setCurrentJd(null);
        } catch (error: any) {
            notify(`Error: ${error.message}`, 'error');
        }
    };

    const confirmDelete = async () => {
        if (!jdToDelete) return;
        try {
            await api.deleteJobDescription(jdToDelete.id);
            dispatch({ type: 'DELETE_JOB_DESCRIPTION', payload: jdToDelete.id });
            notify('Description deleted.', 'success');
        } catch (error: any) {
             notify(`Error: ${error.message}`, 'error');
        }
        setJdToDelete(null);
    };
    
    const renderContent = () => {
        switch(viewMode) {
            case 'generate':
                return (
                     <GenerationForm
                        onCancel={() => setViewMode('list')}
                        onGenerate={handleGenerate}
                        project={state.projects.find(p => p.id === selectedProjectId)}
                        members={state.members}
                        isGenerating={isGenerating}
                    />
                );
            case 'edit':
                return currentJd && <JobDescriptionEditor jd={currentJd} onSave={handleSave} onCancel={() => setViewMode('list')} />;
            case 'view':
                return currentJd && <JobDescriptionViewer jd={currentJd} onBack={() => setViewMode('list')} onEdit={(jd) => { setCurrentJd(jd); setViewMode('edit'); }} />;
            case 'list':
            default:
                 return (
                    <div>
                        {jdToDelete && (
                            <ConfirmationModal isOpen={true} onClose={() => setJdToDelete(null)} onConfirm={confirmDelete} title="Delete Description" message="Are you sure you want to delete this job description?" />
                        )}
                        <JobDescriptionList
                            jobDescriptions={filteredJds}
                            selectedProjectId={selectedProjectId}
                            onProjectChange={setSelectedProjectId}
                            onStartGenerate={() => setViewMode('generate')}
                            onView={(jd) => { setCurrentJd(jd); setViewMode('view'); }}
                            onDelete={setJdToDelete}
                        />
                    </div>
                );
        }
    };
    
    return <div>{renderContent()}</div>;
};

export default ExperienceHubManager;
