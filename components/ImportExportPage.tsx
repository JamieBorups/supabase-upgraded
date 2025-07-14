
import React, { useState, useMemo, useRef, useCallback } from 'react';
import { produce } from 'immer';
import { useAppContext } from '../context/AppContext.tsx';
import { AppState, ProjectExportFile, WorkspaceExportFile, ProjectExportData, AiSettingsExportFile, FormData as ProjectData, Member, BudgetItem, Task, Activity, DirectExpense, NewsRelease, Contact, ContactsExportFile, Interaction, EventsAndVenuesExportFile, Venue, Event, TicketType, EventTicket, Report, Highlight, ProposalSnapshot, EcoStarReport, InterestCompatibilityReport, SdgAlignmentReport } from '../types.ts';
import ConfirmationModal from './ui/ConfirmationModal.tsx';
import { Select } from './ui/Select.tsx';
import { Input } from './ui/Input.tsx';
import * as api from '../services/api.ts';

const APP_NAME = "ARTS_INCUBATOR";
const CURRENT_APP_VERSION = "1.1.0";

const newId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

const ImportExportPage: React.FC = () => {
    const { state, dispatch, notify } = useAppContext();
    const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
    const [isProjectSelectModalOpen, setIsProjectSelectModalOpen] = useState(false);
    const [isProjectImportModalOpen, setIsProjectImportModalOpen] = useState(false);
    const [isAiSettingsModalOpen, setIsAiSettingsModalOpen] = useState(false);
    const [isContactsImportModalOpen, setIsContactsImportModalOpen] = useState(false);
    const [isEventsVenuesModalOpen, setIsEventsVenuesModalOpen] = useState(false);


    const [fileToImport, setFileToImport] = useState<WorkspaceExportFile | null>(null);
    const [projectFileToImport, setProjectFileToImport] = useState<ProjectExportFile | null>(null);
    const [aiSettingsFileToImport, setAiSettingsFileToImport] = useState<AiSettingsExportFile | null>(null);
    const [contactsFileToImport, setContactsFileToImport] = useState<ContactsExportFile | null>(null);
    const [eventsVenuesFileToImport, setEventsVenuesFileToImport] = useState<EventsAndVenuesExportFile | null>(null);


    const workspaceImportInputRef = useRef<HTMLInputElement>(null);
    const projectImportInputRef = useRef<HTMLInputElement>(null);
    const aiSettingsImportInputRef = useRef<HTMLInputElement>(null);
    const contactsImportInputRef = useRef<HTMLInputElement>(null);
    const eventsVenuesImportInputRef = useRef<HTMLInputElement>(null);



    // --- UTILITY FUNCTIONS ---
    const downloadFile = (content: string, fileName: string) => {
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // --- WORKSPACE EXPORT/IMPORT ---

    const handleExportWorkspace = () => {
        const { reportProjectIdToOpen, activeWorkshopItem, currentUser, ...dataToExport } = state;
        const exportData: WorkspaceExportFile = {
            type: `${APP_NAME}_WORKSPACE_BACKUP`,
            appVersion: CURRENT_APP_VERSION,
            exportDate: new Date().toISOString(),
            data: dataToExport,
        };
        const fileName = `${APP_NAME.toLowerCase()}-workspace-backup-${new Date().toISOString().split('T')[0]}.json`;
        downloadFile(JSON.stringify(exportData, null, 2), fileName);
        notify('Workspace backup exported successfully!', 'success');
    };

    const handleSelectWorkspaceFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target?.result as string) as WorkspaceExportFile;
                if (parsed.type !== `${APP_NAME}_WORKSPACE_BACKUP`) {
                    throw new Error('Invalid file type. This is not a valid workspace backup file.');
                }
                if (parsed.appVersion !== CURRENT_APP_VERSION) {
                    throw new Error(`Version mismatch. File version: ${parsed.appVersion}, App version: ${CURRENT_APP_VERSION}.`);
                }
                setFileToImport(parsed);
                setIsWorkspaceModalOpen(true);
            } catch (error: any) {
                notify(error.message, 'error');
            }
        };
        reader.readAsText(file);
        e.target.value = ''; // Reset file input
    };
    
    const confirmImportWorkspace = () => {
        if (!fileToImport) return;
        dispatch({ type: 'LOAD_DATA', payload: fileToImport.data });
        notify('Workspace restored successfully!', 'success');
        setIsWorkspaceModalOpen(false);
        setFileToImport(null);
    };

    // --- PROJECT EXPORT/IMPORT ---
    
    const ProjectSelectModal = () => {
        const [selectedId, setSelectedId] = useState('');
        const [isExporting, setIsExporting] = useState(false);

        const handleExportProject = async () => {
            if (!selectedId) {
                notify('Please select a project to export.', 'warning');
                return;
            }
            setIsExporting(true);
            try {
                const projectExportData = await api.getProjectExportData(selectedId);
                
                const exportFile: ProjectExportFile = {
                    type: `${APP_NAME}_PROJECT_EXPORT`,
                    appVersion: CURRENT_APP_VERSION,
                    exportDate: new Date().toISOString(),
                    data: projectExportData,
                };
                const safeTitle = projectExportData.project.projectTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                const fileName = `${APP_NAME.toLowerCase()}-project-${safeTitle}.json`;
                downloadFile(JSON.stringify(exportFile, null, 2), fileName);
                notify(`Project '${projectExportData.project.projectTitle}' exported successfully!`, 'success');
                setIsProjectSelectModalOpen(false);
            } catch (error: any) {
                console.error("Failed to export project:", error);
                notify(`Error exporting project: ${error.message}`, 'error');
            } finally {
                setIsExporting(false);
            }
        };
        
        return (
            <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
                <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Export a Single Project</h3>
                    <Select value={selectedId} onChange={e => setSelectedId(e.target.value)} options={[{value: '', label: 'Select a project...'}, ...state.projects.map(p => ({value: p.id, label: p.projectTitle}))]}/>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={() => setIsProjectSelectModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-md hover:bg-slate-200">Cancel</button>
                        <button type="button" onClick={handleExportProject} disabled={!selectedId || isExporting} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md shadow-sm hover:bg-teal-700 disabled:bg-slate-400">
                            {isExporting ? 'Exporting...' : 'Export Project'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };
    
    const handleSelectProjectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target?.result as string) as ProjectExportFile;
                if (parsed.type !== `${APP_NAME}_PROJECT_EXPORT`) {
                    throw new Error('Invalid file type. This is not a valid project export file.');
                }
                if (parsed.appVersion !== CURRENT_APP_VERSION) {
                     throw new Error(`Version mismatch. File version: ${parsed.appVersion}, App version: ${CURRENT_APP_VERSION}.`);
                }
                setProjectFileToImport(parsed);
                setIsProjectImportModalOpen(true);
            } catch (error: any) {
                notify(error.message, 'error');
            }
        };
        reader.readAsText(file);
        e.target.value = ''; // Reset file input
    };

    const ProjectImportModal = () => {
        const { data } = projectFileToImport!;
        const existingMemberEmails = new Set(state.members.map(m => m.email.toLowerCase()));

        const analysis = {
            newMembers: data.members.filter(m => !existingMemberEmails.has(m.email.toLowerCase())),
            matchedMembers: data.members.filter(m => existingMemberEmails.has(m.email.toLowerCase())),
        };

        const confirmImportProject = () => {
            const remappedData = regenerateAllIds(data, state.members);
            dispatch({ type: 'ADD_PROJECT_DATA', payload: remappedData });
            notify(`Project '${data.project.projectTitle}' imported successfully!`, 'success');
            setIsProjectImportModalOpen(false);
            setProjectFileToImport(null);
        };
        
        return (
            <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
                <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Import Project</h3>
                    <p className="text-slate-600 mb-4">Ready to import <span className="font-semibold">{data.project.projectTitle}</span>. Here's how collaborators will be handled:</p>
                    
                    <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                        {analysis.matchedMembers.length > 0 && <div>
                            <h4 className="font-semibold text-green-700">Matched Members (Existing)</h4>
                            <ul className="list-disc list-inside text-sm text-slate-600">
                                {analysis.matchedMembers.map(m => <li key={m.id}>{m.firstName} {m.lastName} ({m.email})</li>)}
                            </ul>
                        </div>}
                        {analysis.newMembers.length > 0 && <div>
                            <h4 className="font-semibold text-blue-700">New Members (Will be created)</h4>
                             <ul className="list-disc list-inside text-sm text-slate-600">
                                {analysis.newMembers.map(m => <li key={m.id}>{m.firstName} {m.lastName} ({m.email})</li>)}
                            </ul>
                        </div>}
                    </div>

                    <p className="text-xs text-slate-500 mt-4">This action is non-destructive. The project will be added to your current workspace. Existing data will not be affected.</p>

                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={() => setIsProjectImportModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-md hover:bg-slate-200">Cancel</button>
                        <button type="button" onClick={confirmImportProject} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md shadow-sm hover:bg-teal-700">Confirm and Import</button>
                    </div>
                </div>
            </div>
        )
    };
    
    const regenerateAllIds = (importData: ProjectExportData, existingMembers: Member[]): ProjectExportData => {
        const idMap = new Map<string, string>();
        const existingMemberMap = new Map(existingMembers.map(m => [m.email.toLowerCase(), m.id]));

        const remappedMembers = importData.members.map(member => {
            const existingId = existingMemberMap.get(member.email.toLowerCase());
            if (existingId) {
                idMap.set(member.id, existingId);
                return null;
            } else {
                const newMemberId = newId('mem');
                idMap.set(member.id, newMemberId);
                return { ...member, id: newMemberId };
            }
        }).filter((m): m is Member => m !== null);
        
        const oldProject = importData.project;
        const newProjectId = newId('proj');
        idMap.set(oldProject.id, newProjectId);
        
        const newProject = produce(oldProject, (draft) => {
            draft.id = newProjectId;
            draft.collaboratorDetails = draft.collaboratorDetails.map(c => ({...c, memberId: idMap.get(c.memberId) || c.memberId }));
            Object.keys(draft.budget.revenues).forEach(cat => {
                const category = cat as keyof typeof draft.budget.revenues;
                if(Array.isArray(draft.budget.revenues[category])){
                    (draft.budget.revenues[category] as BudgetItem[]).forEach(item => {
                        const newBudgetItemId = newId('bud');
                        idMap.set(item.id, newBudgetItemId);
                        item.id = newBudgetItemId;
                    });
                }
            });
            Object.keys(draft.budget.expenses).forEach(cat => {
                const category = cat as keyof typeof draft.budget.expenses;
                draft.budget.expenses[category].forEach(item => {
                    const newBudgetItemId = newId('bud');
                    idMap.set(item.id, newBudgetItemId);
                    item.id = newBudgetItemId;
                });
            });
        });

        const newTasks = importData.tasks.map(task => {
            const newTaskId = newId('task');
            idMap.set(task.id, newTaskId);
            return {
                ...task,
                id: newTaskId,
                projectId: idMap.get(task.projectId) || task.projectId,
                assignedMemberId: idMap.get(task.assignedMemberId) || task.assignedMemberId,
                budgetItemId: idMap.get(task.budgetItemId) || '',
            };
        });

        const newActivities = importData.activities.map(activity => ({
            ...activity,
            id: newId('act'),
            taskId: idMap.get(activity.taskId) || activity.taskId,
            memberId: idMap.get(activity.memberId) || activity.memberId,
        }));
        
        const newDirectExpenses = (importData.directExpenses || []).map(expense => ({
            ...expense,
            id: newId('dexp'),
            projectId: idMap.get(expense.projectId) || expense.projectId,
            budgetItemId: idMap.get(expense.budgetItemId) || expense.budgetItemId,
        }));

        const newNewsReleases = (importData.newsReleases || []).map(release => ({
            ...release,
            id: newId('nr'),
            projectId: idMap.get(release.projectId) || release.projectId,
            contactMemberId: idMap.get(release.contactMemberId) || release.contactMemberId
        }));
        
        const newReports = (importData.reports || []).map(report => ({
            ...report,
            id: newId('rep'),
            projectId: idMap.get(report.projectId) || report.projectId,
        }));

        const newHighlights = (importData.highlights || []).map(highlight => ({
            ...highlight,
            id: newId('hl'),
            projectId: idMap.get(highlight.projectId) || highlight.projectId,
        }));

        const newProposals = (importData.proposals || []).map(proposal => {
            return {
                ...proposal,
                id: newId('snap'),
                projectId: idMap.get(proposal.projectId) || proposal.projectId,
            };
        });

        const newEcoStarReports = (importData.ecostarReports || []).map(report => ({
            ...report,
            id: newId('eco'),
            projectId: idMap.get(report.projectId) || report.projectId,
        }));

        const newInterestCompatibilityReports = (importData.interestCompatibilityReports || []).map(report => ({
            ...report,
            id: newId('icr'),
            projectId: idMap.get(report.projectId) || report.projectId,
        }));

        const newSdgAlignmentReports = (importData.sdgAlignmentReports || []).map(report => ({
            ...report,
            id: newId('sdg'),
            projectId: idMap.get(report.projectId) || report.projectId,
        }));

        const newContacts = (importData.contacts || []).map(contact => {
            const newContactId = newId('contact');
            idMap.set(contact.id, newContactId);
            return {
                ...contact,
                id: newContactId,
                associatedProjectIds: contact.associatedProjectIds.map(pid => idMap.get(pid) || pid)
            };
        });

        const newInteractions = (importData.interactions || []).map(interaction => ({
            ...interaction,
            id: newId('int'),
            contactId: idMap.get(interaction.contactId) || interaction.contactId
        }));

        const newVenues = (importData.venues || []).map(venue => {
            const newVenueId = newId('venue');
            idMap.set(venue.id, newVenueId);
            return { ...venue, id: newVenueId };
        });

        const newEvents = (importData.events || []).map(event => {
            const newEventId = newId('evt');
            idMap.set(event.id, newEventId);
            return {
                ...event,
                id: newEventId,
                projectId: idMap.get(event.projectId) || event.projectId,
                venueId: idMap.get(event.venueId) || event.venueId,
                parentEventId: event.parentEventId ? (idMap.get(event.parentEventId) || event.parentEventId) : null,
            };
        });

        const newTicketTypes = (importData.ticketTypes || []).map(tt => {
            const newTicketTypeId = newId('tt');
            idMap.set(tt.id, newTicketTypeId);
            return { ...tt, id: newTicketTypeId };
        });

        const newEventTickets = (importData.eventTickets || []).map(et => ({
            ...et,
            id: newId('et'),
            eventId: idMap.get(et.eventId) || et.eventId,
            ticketTypeId: idMap.get(et.ticketTypeId) || et.ticketTypeId
        }));

        return {
            project: newProject,
            tasks: newTasks,
            activities: newActivities,
            directExpenses: newDirectExpenses,
            members: remappedMembers,
            newsReleases: newNewsReleases,
            reports: newReports,
            highlights: newHighlights,
            proposals: newProposals,
            ecostarReports: newEcoStarReports,
            interestCompatibilityReports: newInterestCompatibilityReports,
            sdgAlignmentReports: newSdgAlignmentReports,
            contacts: newContacts,
            interactions: newInteractions,
            venues: newVenues,
            events: newEvents,
            ticketTypes: newTicketTypes,
            eventTickets: newEventTickets,
        };
    };

    // --- AI SETTINGS EXPORT/IMPORT ---

    const handleExportAiSettings = () => {
        const exportData: AiSettingsExportFile = {
            type: `${APP_NAME}_AI_SETTINGS_EXPORT`,
            appVersion: CURRENT_APP_VERSION,
            exportDate: new Date().toISOString(),
            data: state.settings.ai,
        };
        const fileName = `${APP_NAME.toLowerCase()}-ai-settings-export-${new Date().toISOString().split('T')[0]}.json`;
        downloadFile(JSON.stringify(exportData, null, 2), fileName);
        notify('AI settings exported successfully!', 'success');
    };

    const handleSelectAiSettingsFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target?.result as string) as AiSettingsExportFile;
                if (parsed.type !== `${APP_NAME}_AI_SETTINGS_EXPORT`) throw new Error('Invalid AI settings file.');
                if (parsed.appVersion !== CURRENT_APP_VERSION) throw new Error(`Version mismatch. File: ${parsed.appVersion}, App: ${CURRENT_APP_VERSION}.`);
                setAiSettingsFileToImport(parsed);
                setIsAiSettingsModalOpen(true);
            } catch (error: any) {
                notify(error.message, 'error');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const confirmImportAiSettings = () => {
        if (!aiSettingsFileToImport) return;
        const newSettings = produce(state.settings, draft => { draft.ai = aiSettingsFileToImport.data; });
        dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
        notify('AI settings imported successfully!', 'success');
        setIsAiSettingsModalOpen(false);
        setAiSettingsFileToImport(null);
    };

    // --- CONTACTS EXPORT/IMPORT ---
    const handleExportContacts = () => {
        const exportData: ContactsExportFile = {
            type: `${APP_NAME}_CONTACTS_EXPORT`,
            appVersion: CURRENT_APP_VERSION,
            exportDate: new Date().toISOString(),
            data: {
                contacts: state.contacts,
                interactions: state.interactions
            },
        };
        const fileName = `${APP_NAME.toLowerCase()}-contacts-export-${new Date().toISOString().split('T')[0]}.json`;
        downloadFile(JSON.stringify(exportData, null, 2), fileName);
        notify('Contacts and interactions exported successfully!', 'success');
    };

    const handleSelectContactsFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target?.result as string) as ContactsExportFile;
                if (parsed.type !== `${APP_NAME}_CONTACTS_EXPORT`) throw new Error('Invalid Contacts file.');
                if (parsed.appVersion !== CURRENT_APP_VERSION) throw new Error(`Version mismatch. File: ${parsed.appVersion}, App: ${CURRENT_APP_VERSION}.`);
                setContactsFileToImport(parsed);
                setIsContactsImportModalOpen(true);
            } catch (error: any) {
                notify(error.message, 'error');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const confirmImportContacts = () => {
        if (!contactsFileToImport) return;
        const { contacts, interactions } = contactsFileToImport.data;
        dispatch({ type: 'SET_CONTACTS', payload: contacts });
        dispatch({ type: 'SET_INTERACTIONS', payload: interactions });
        notify(`${contacts.length} contacts and ${interactions.length} interactions imported successfully!`, 'success');
        setIsContactsImportModalOpen(false);
        setContactsFileToImport(null);
    };

    // --- EVENTS & VENUES EXPORT/IMPORT ---
    const handleExportEventsAndVenues = () => {
        const exportData: EventsAndVenuesExportFile = {
            type: `${APP_NAME}_EVENTS_AND_VENUES_EXPORT`,
            appVersion: CURRENT_APP_VERSION,
            exportDate: new Date().toISOString(),
            data: {
                venues: state.venues,
                events: state.events,
                ticketTypes: state.ticketTypes,
                eventTickets: state.eventTickets,
            },
        };
        const fileName = `${APP_NAME.toLowerCase()}-events-venues-export-${new Date().toISOString().split('T')[0]}.json`;
        downloadFile(JSON.stringify(exportData, null, 2), fileName);
        notify('Venues and Events exported successfully!', 'success');
    };

    const handleSelectEventsVenuesFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target?.result as string) as EventsAndVenuesExportFile;
                if (parsed.type !== `${APP_NAME}_EVENTS_AND_VENUES_EXPORT`) throw new Error('Invalid Events & Venues file.');
                if (parsed.appVersion !== CURRENT_APP_VERSION) throw new Error(`Version mismatch. File: ${parsed.appVersion}, App: ${CURRENT_APP_VERSION}.`);
                setEventsVenuesFileToImport(parsed);
                setIsEventsVenuesModalOpen(true);
            } catch (error: any) {
                notify(error.message, 'error');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const confirmImportEventsAndVenues = () => {
        if (!eventsVenuesFileToImport) return;
        const { venues, events, ticketTypes, eventTickets } = eventsVenuesFileToImport.data;
        dispatch({ type: 'LOAD_EVENT_DATA', payload: { venues, events, ticketTypes, eventTickets } });
        notify(`${venues.length} venues, ${events.length} events, ${ticketTypes.length} ticket types, and ${eventTickets.length} event tickets imported successfully!`, 'success');
        setIsEventsVenuesModalOpen(false);
        setEventsVenuesFileToImport(null);
    };


    return (
        <>
            {isWorkspaceModalOpen && fileToImport && <ConfirmationModal isOpen={true} onClose={() => setIsWorkspaceModalOpen(false)} onConfirm={confirmImportWorkspace} title="Restore Workspace" message={<>Are you sure? <strong className="font-bold text-red-700">This will permanently delete all current data and replace it with the data from this file.</strong> This cannot be undone.</>} confirmButtonText="Yes, Restore Workspace" />}
            {isProjectSelectModalOpen && <ProjectSelectModal />}
            {isProjectImportModalOpen && projectFileToImport && <ProjectImportModal />}
            {isAiSettingsModalOpen && aiSettingsFileToImport && <ConfirmationModal isOpen={true} onClose={() => setIsAiSettingsModalOpen(false)} onConfirm={confirmImportAiSettings} title="Import AI Settings" message={<><strong className="font-bold text-red-700">This will overwrite all current AI settings.</strong></>} confirmButtonText="Yes, Import Settings" />}
            {isContactsImportModalOpen && contactsFileToImport && <ConfirmationModal isOpen={true} onClose={() => setIsContactsImportModalOpen(false)} onConfirm={confirmImportContacts} title="Import Contacts & Interactions" message={`You are about to import ${contactsFileToImport.data.contacts.length} contacts and ${contactsFileToImport.data.interactions.length} interactions. This will replace your current contact and interaction lists.`} confirmButtonText="Yes, Import" />}
            {isEventsVenuesModalOpen && eventsVenuesFileToImport && <ConfirmationModal isOpen={true} onClose={() => setIsEventsVenuesModalOpen(false)} onConfirm={confirmImportEventsAndVenues} title="Import Venues & Events" message={`You are about to import ${eventsVenuesFileToImport.data.venues.length} venues, ${eventsVenuesFileToImport.data.events.length} events, ${eventsVenuesFileToImport.data.ticketTypes.length} ticket types, and ${eventsVenuesFileToImport.data.eventTickets.length} event tickets. This will replace all current data for these categories.`} confirmButtonText="Yes, Import" />}

            <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8 space-y-12">
                
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Project Import / Export</h2>
                    <p className="text-sm text-slate-600 mb-6">Move individual projects between workspaces. Importing a project is non-destructive.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <button onClick={() => setIsProjectSelectModalOpen(true)} className="w-full text-center p-6 bg-white border-2 border-dashed border-slate-300 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-colors"><i className="fa-solid fa-file-export text-4xl text-teal-600"></i><h3 className="mt-4 text-lg font-semibold text-slate-700">Export a Project</h3><p className="text-sm text-slate-500">Select a project to save.</p></button>
                        <button onClick={() => projectImportInputRef.current?.click()} className="w-full text-center p-6 bg-white border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"><i className="fa-solid fa-file-import text-4xl text-blue-600"></i><h3 className="mt-4 text-lg font-semibold text-slate-700">Import a Project</h3><p className="text-sm text-slate-500">Load a project from a file.</p><input type="file" accept=".json" ref={projectImportInputRef} onChange={handleSelectProjectFile} className="hidden" /></button>
                    </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Venues, Events & Tickets Import / Export</h2>
                    <p className="text-sm text-slate-600 mb-6">Export your venues, events, and ticket data, or import a list to get started quickly.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <button onClick={handleExportEventsAndVenues} className="w-full text-center p-6 bg-white border-2 border-dashed border-slate-300 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-colors">
                            <i className="fa-solid fa-calendar-days text-4xl text-teal-600"></i>
                            <h3 className="mt-4 text-lg font-semibold text-slate-700">Export Venues & Events</h3>
                            <p className="text-sm text-slate-500">Save your venues & events list to a file.</p>
                        </button>
                        <button onClick={() => eventsVenuesImportInputRef.current?.click()} className="w-full text-center p-6 bg-white border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                            <i className="fa-solid fa-landmark text-4xl text-blue-600"></i>
                            <h3 className="mt-4 text-lg font-semibold text-slate-700">Import Venues & Events</h3>
                            <p className="text-sm text-slate-500">Load venues & events from a file.</p>
                            <input type="file" accept=".json" ref={eventsVenuesImportInputRef} onChange={handleSelectEventsVenuesFile} className="hidden" />
                        </button>
                    </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Contacts Import / Export</h2>
                    <p className="text-sm text-slate-600 mb-6">Export your full contact list or import a list to get started quickly.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <button onClick={handleExportContacts} className="w-full text-center p-6 bg-white border-2 border-dashed border-slate-300 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-colors"><i className="fa-solid fa-address-book text-4xl text-teal-600"></i><h3 className="mt-4 text-lg font-semibold text-slate-700">Export Contacts</h3><p className="text-sm text-slate-500">Save your contact list to a file.</p></button>
                        <button onClick={() => contactsImportInputRef.current?.click()} className="w-full text-center p-6 bg-white border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"><i className="fa-solid fa-user-plus text-4xl text-blue-600"></i><h3 className="mt-4 text-lg font-semibold text-slate-700">Import Contacts</h3><p className="text-sm text-slate-500">Load contacts from a file.</p><input type="file" accept=".json" ref={contactsImportInputRef} onChange={handleSelectContactsFile} className="hidden" /></button>
                    </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-slate-800 mb-2">AI Settings Import / Export</h2>
                    <p className="text-sm text-slate-600 mb-6">Save your custom AI personas and settings.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <button onClick={handleExportAiSettings} className="w-full text-center p-6 bg-white border-2 border-dashed border-slate-300 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-colors"><i className="fa-solid fa-cloud-arrow-down text-4xl text-teal-600"></i><h3 className="mt-4 text-lg font-semibold text-slate-700">Export AI Settings</h3><p className="text-sm text-slate-500">Save AI preferences to a file.</p></button>
                        <button onClick={() => aiSettingsImportInputRef.current?.click()} className="w-full text-center p-6 bg-white border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"><i className="fa-solid fa-cloud-arrow-up text-4xl text-blue-600"></i><h3 className="mt-4 text-lg font-semibold text-slate-700">Import AI Settings</h3><p className="text-sm text-slate-500">Overwrite AI settings with a file.</p><input type="file" accept=".json" ref={aiSettingsImportInputRef} onChange={handleSelectAiSettingsFile} className="hidden" /></button>
                    </div>
                </div>

                 <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-red-800 mb-2 flex items-center gap-2"><i className="fa-solid fa-triangle-exclamation"></i>Workspace Backup & Restore</h2>
                    <p className="text-sm text-red-700 mb-6">Create a full backup of all your data. <strong className="font-bold">Restoring is a destructive action.</strong></p>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <button onClick={handleExportWorkspace} className="w-full text-center p-6 bg-white border-2 border-dashed border-slate-300 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-colors"><i className="fa-solid fa-download text-4xl text-teal-600"></i><h3 className="mt-4 text-lg font-semibold text-slate-700">Backup Workspace</h3><p className="text-sm text-slate-500">Save your entire application state.</p></button>
                        <button onClick={() => workspaceImportInputRef.current?.click()} className="w-full text-center p-6 bg-white border-2 border-dashed border-red-300 rounded-lg hover:border-red-500 hover:bg-red-100 transition-colors"><i className="fa-solid fa-upload text-4xl text-red-600"></i><h3 className="mt-4 text-lg font-semibold text-slate-700">Restore from Backup</h3><p className="text-sm text-slate-500">Overwrite all data with a file.</p><input type="file" accept=".json" ref={workspaceImportInputRef} onChange={handleSelectWorkspaceFile} className="hidden" /></button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ImportExportPage;