

import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { NewsRelease, Member, CommunicationTemplate } from '../../types';
import FormField from '../ui/FormField';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { TextareaWithCounter } from '../ui/TextareaWithCounter';
import { getAiResponse } from '../../services/aiService';
import ConfirmationModal from '../ui/ConfirmationModal';

interface NewsReleaseEditorProps {
    projectId: string;
    release: NewsRelease | null;
    onSave: (release: NewsRelease) => void;
    onCancel: () => void;
}

const NewsReleaseEditor: React.FC<NewsReleaseEditorProps> = ({ projectId, release, onSave, onCancel }) => {
    const { state, notify } = useAppContext();
    const { settings, projects, tasks, highlights, members } = state;
    const [isGenerating, setIsGenerating] = useState(false);
    const [isAiConfirmModalOpen, setIsAiConfirmModalOpen] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    
    const project = useMemo(() => projects.find(p => p.id === projectId), [projectId, projects]);

    const initialFormData = useMemo<NewsRelease>(() => {
        const now = new Date().toISOString();
        if (release) return release;
        return {
            id: `nr_${Date.now()}`,
            projectId,
            type: settings.media.types[0]?.label || 'News Release',
            contactMemberId: '',
            headline: '',
            subhead: '',
            publishDate: now.split('T')[0],
            publishedUrl: '',
            location: '',
            introduction: '',
            body: '',
            quotes: '',
            boilerplate: settings.media.boilerplate,
            contactInfo: settings.media.contactInfo,
            status: 'Draft',
            createdAt: now,
            updatedAt: now,
        };
    }, [release, projectId, settings.media]);

    const [formData, setFormData] = useState<NewsRelease>(initialFormData);

    const projectCollaborators = useMemo(() => {
        if (!project) return [];
        return project.collaboratorDetails.map(c => {
            const member = members.find(m => m.id === c.memberId);
            return member ? { ...member, role: c.role } : null;
        }).filter((m): m is (Member & {role: string}) => m !== null);
    }, [project, members]);

    const datelinePreview = useMemo(() => {
        const city = (formData.location || '').split(',')[0]?.trim().toUpperCase();
        const province = (formData.location || '').split(',')[1]?.trim().toUpperCase();
        
        let datePart = '';
        if (formData.publishDate) {
            try {
                const date = new Date(formData.publishDate + 'T12:00:00Z'); // Use UTC time to avoid timezone issues
                datePart = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            } catch (e) {
                datePart = "Invalid Date"
            }
        }
        
        if (city && province && datePart) return `${city}, ${province} – ${datePart}`;
        if (city && datePart) return `${city} – ${datePart}`;
        if (datePart) return datePart;
        return 'Set Publish Date & Location';
    }, [formData.publishDate, formData.location]);


    useEffect(() => {
        const contactMember = projectCollaborators.find(c => c.id === formData.contactMemberId);
        let newLocation = '';
        if (contactMember && contactMember.city && contactMember.province) {
            newLocation = `${contactMember.city}, ${contactMember.province}`;
        } else if (settings.media.defaultCity && settings.media.defaultProvince) {
            newLocation = `${settings.media.defaultCity}, ${settings.media.defaultProvince}`;
        }
        setFormData(prev => ({...prev, location: newLocation}));
    
    }, [formData.contactMemberId, projectCollaborators, settings.media.defaultCity, settings.media.defaultProvince]);
    
    const handleChange = <K extends keyof NewsRelease>(field: K, value: NewsRelease[K]) => {
        setFormData(prev => ({ ...prev, [field]: value, updatedAt: new Date().toISOString() }));
    };

    const handleGenerateWithAi = async () => {
        if (!project) {
            notify('Project context is missing.', 'error');
            return;
        }

        setIsGenerating(true);
        notify('AI is generating a draft...', 'info');
        
        const selectedTemplate = settings.media.templates.find(t => t.id === selectedTemplateId);
        const aiInstructions = selectedTemplate ? selectedTemplate.instructions : settings.ai.personas.media.instructions;
        const templateName = selectedTemplate ? selectedTemplate.name : 'Default';

        const projectTasks = tasks.filter(t => t.projectId === projectId);
        const projectHighlights = highlights.filter(h => h.projectId === projectId);
        const contactMember = projectCollaborators.find(c => c.id === formData.contactMemberId);
        const allApprovedFunders = [];
        if (project.budget?.revenues) {
            const revenueCategories = Object.values(project.budget.revenues);
            revenueCategories.forEach(category => {
                if (Array.isArray(category)) {
                    category.forEach(item => {
                        if (item.status === 'Approved' && item.description) {
                            allApprovedFunders.push(item.description);
                        }
                    });
                }
            });
        }

        const context = {
            collectiveName: settings.general.collectiveName,
            communicationType: formData.type,
            publishDate: formData.publishDate,
            location: formData.location,
            project: { title: project.projectTitle, description: project.projectDescription, background: project.background, schedule: project.schedule },
            keyPeople: projectCollaborators.map(c => ({ name: `${c.firstName} ${c.lastName}`, role: c.role })),
            recentTasks: projectTasks.filter(t => t.status === 'Done').sort((a,b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()).slice(0, 5).map(t => ({ title: t.title, description: t.description, dueDate: t.dueDate })),
            upcomingTasks: projectTasks.filter(t => t.status !== 'Done').sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).slice(0, 5).map(t => ({ title: t.title, description: t.description, dueDate: t.dueDate })),
            supportingLinks: projectHighlights.map(h => ({ title: h.title, url: h.url })),
            approvedFunders: allApprovedFunders,
            quoteSourceMaterial: `Project Description: ${project.projectDescription}\n\nProject Background: ${project.background}`,
            contactPerson: contactMember ? { name: `${contactMember.firstName} ${contactMember.lastName}`, email: contactMember.email } : null,
        };

        const contextPrompt = `
You are generating a "${context.communicationType}" for the "${context.collectiveName}" collective, following the '${templateName}' template.
Your specific instructions are:
---
${aiInstructions}
---
Here is the context document. You MUST base your response exclusively on this information. The 'publishDate' and 'location' are for contextual awareness only; do not include a dateline in the body of your response.
${JSON.stringify(context, null, 2)}
Your response MUST be ONLY a single, valid JSON object following this TypeScript interface:
{ 
  "headline": string;
  "subhead": string; // A concise, secondary headline that elaborates on the main headline.
  "introduction": string; 
  "body": string;
  "quotes": Array<{ "quote": string; "attribution": string; }>;
}
In the "quotes" array, generate exactly 3 distinct, impactful pull quotes.
You MUST synthesize these quotes from the content provided in the 'quoteSourceMaterial' section.
You MUST attribute each quote to a relevant individual from the 'keyPeople' list, using their 'Name, Role' format for the attribution.
`;
        
        try {
            const result = await getAiResponse('media', contextPrompt, settings.ai, []);
            let jsonString = result.text.trim().match(/```(\w*)?\s*\n?(.*?)\n?\s*```$/s)?.[2] || result.text;
            const parsed = JSON.parse(jsonString);

            let formattedQuotes = '';
            if (Array.isArray(parsed.quotes)) {
                formattedQuotes = parsed.quotes.map((q: {quote: string, attribution: string}) => `"${q.quote}"\n- ${q.attribution}`).join('\n\n');
            } else if (typeof parsed.quotes === 'string') {
                // Fallback for older behavior, just in case
                formattedQuotes = parsed.quotes;
            }

            setFormData(prev => ({ ...prev, headline: parsed.headline, subhead: parsed.subhead, introduction: parsed.introduction, body: parsed.body, quotes: formattedQuotes, updatedAt: new Date().toISOString() }));
            notify('AI draft generated successfully!', 'success');
        } catch (error: any) {
            console.error("AI Generation Error:", error);
            notify(`AI generation failed: ${error.message}`, 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleConfirmAiGeneration = () => {
        setIsAiConfirmModalOpen(false);
        handleGenerateWithAi();
    };
    
    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.headline || !formData.projectId) {
            notify('Headline and project are required.', 'error');
            return;
        }
        onSave(formData);
    };

    return (
        <form onSubmit={handleSave}>
            {isAiConfirmModalOpen && (
                <ConfirmationModal isOpen={true} onClose={() => setIsAiConfirmModalOpen(false)} onConfirm={handleConfirmAiGeneration} title="Overwrite Existing Content?" message={<>Using the AI will replace any existing content in the Headline, Subhead, Introduction, Body, and Quotes fields.<br/><strong className="font-bold">This action cannot be undone.</strong></>} confirmButtonText="Yes, Generate Content" />
            )}
            <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
                <div className="flex justify-between items-start mb-6 pb-4 border-b border-slate-200">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">{release ? 'Edit' : 'Create'} Communication</h1>
                        <p className="text-sm text-slate-500">For project: <span className="font-semibold">{project?.projectTitle}</span></p>
                    </div>
                    <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100">Cancel</button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <FormField label="Headline" htmlFor="headline" required><Input id="headline" value={formData.headline} onChange={e => handleChange('headline', e.target.value)} /></FormField>
                        <FormField label="Subhead" htmlFor="subhead"><Input id="subhead" value={formData.subhead} onChange={e => handleChange('subhead', e.target.value)} /></FormField>
                        <FormField label="Introduction" htmlFor="introduction" instructions="A brief, one-paragraph summary."><TextareaWithCounter id="introduction" rows={3} value={formData.introduction} onChange={e => handleChange('introduction', e.target.value)} wordLimit={100} /></FormField>
                        <FormField label="Body" htmlFor="body" instructions="The main content."><TextareaWithCounter id="body" rows={10} value={formData.body} onChange={e => handleChange('body', e.target.value)} wordLimit={500} /></FormField>
                        <FormField label="Pull Quotes" htmlFor="quotes" instructions="Short, impactful quotes for reporters. Separate quotes with a new line."><TextareaWithCounter id="quotes" rows={4} value={formData.quotes} onChange={e => handleChange('quotes', e.target.value)} wordLimit={150} /></FormField>
                        <FormField label="Boilerplate" htmlFor="boilerplate" instructions="Standard 'About Us' section."><TextareaWithCounter id="boilerplate" rows={4} value={formData.boilerplate} onChange={e => handleChange('boilerplate', e.target.value)} wordLimit={100} /></FormField>
                    </div>

                    {/* Right Column: Controls & Metadata */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4 sticky top-20">
                            <h3 className="text-lg font-semibold text-slate-800">Controls & AI</h3>
                            <FormField label="AI Template" htmlFor="template"><Select id="template" value={selectedTemplateId} onChange={e => setSelectedTemplateId(e.target.value)} options={[{value: '', label: 'Use Default Persona'}, ...settings.media.templates.map(t => ({value: t.id, label: t.name}))]} /></FormField>
                            {settings.ai.enabled && (
                                <button type="button" onClick={() => setIsAiConfirmModalOpen(true)} disabled={isGenerating} className="w-full px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md shadow-sm hover:bg-purple-700 disabled:bg-slate-400">
                                    <i className={`fa-solid ${isGenerating ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'} mr-2`}></i>
                                    {isGenerating ? 'Generating...' : 'Generate with AI'}
                                </button>
                            )}
                        </div>

                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4">
                            <h3 className="text-lg font-semibold text-slate-800">Details</h3>
                            <FormField label="Status" htmlFor="status"><Select id="status" value={formData.status} onChange={e => handleChange('status', e.target.value as 'Draft' | 'For Review' | 'Approved')} options={[{value: 'Draft', label: 'Draft'}, {value: 'For Review', label: 'For Review'}, {value: 'Approved', label: 'Approved'}]} /></FormField>
                            <FormField label="Communication Type" htmlFor="type"><Select id="type" value={formData.type} onChange={e => handleChange('type', e.target.value)} options={settings.media.types.map(t => ({value: t.label, label: t.label}))} /></FormField>
                            <FormField label="Published URL" htmlFor="publishedUrl" instructions="Link to the final article/post."><Input type="url" id="publishedUrl" value={formData.publishedUrl} onChange={e => handleChange('publishedUrl', e.target.value)} /></FormField>
                            <FormField label="Contact Person" htmlFor="contactMemberId"><Select id="contactMemberId" value={formData.contactMemberId} onChange={e => handleChange('contactMemberId', e.target.value)} options={[{value: '', label: 'Use Default Contact'}, ...projectCollaborators.map(c => ({value: c.id, label: `${c.firstName} ${c.lastName}`}))]}/></FormField>
                            <FormField label="Publish Date" htmlFor="publishDate"><Input type="date" id="publishDate" value={formData.publishDate} onChange={e => handleChange('publishDate', e.target.value)} /></FormField>
                            <FormField label="Location" htmlFor="location" instructions="e.g., Brandon, MB"><Input id="location" value={formData.location} onChange={e => handleChange('location', e.target.value)}/></FormField>
                            <div>
                                <label className="block text-sm font-semibold text-slate-800">Dateline Preview</label>
                                <div className="mt-2 text-sm text-slate-500 bg-slate-200 p-2 rounded-md font-mono">{datelinePreview}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end items-center mt-8 pt-6 border-t border-slate-200">
                    <button type="button" onClick={onCancel} className="px-6 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 mr-4">Cancel</button>
                    <button type="submit" className="px-6 py-2 text-sm font-medium text-white bg-teal-600 rounded-md shadow-sm hover:bg-teal-700">Save Release</button>
                </div>
            </div>
        </form>
    );
};

export default NewsReleaseEditor;