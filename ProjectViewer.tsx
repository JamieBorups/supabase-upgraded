

import React, { useMemo, useState } from 'react';
import { produce } from 'immer';
import { FormData, ProjectViewTabId, ProposalSnapshot, Event, Venue } from '../types';
import ProjectInfoView from './view/ProjectInfoView';
import CollaboratorsView from './view/CollaboratorsView';
import BudgetView from './view/BudgetView';
import WorkplanTab from './view/WorkplanTab';
import ActivityInsightsTab from './view/ActivityInsightsTab';
import { useAppContext } from '../context/AppContext';
import { useTicketRevenueCalculations } from '../hooks/useBudgetCalculations';
import NotesModal from './ui/NotesModal';
import * as api from '../services/api';

const ExternalContactsView: React.FC<{ projectId: string }> = ({ projectId }) => {
    const { state } = useAppContext();
    const { contacts } = state;

    const associatedContacts = useMemo(() => {
        return contacts.filter(c => c.associatedProjectIds.includes(projectId));
    }, [contacts, projectId]);

    return (
         <section>
            <h2 className="text-2xl font-bold text-slate-800 border-b-2 border-teal-500 pb-2 mb-6">External Contacts</h2>
            {associatedContacts.length > 0 ? (
                <ul className="divide-y divide-slate-200 border border-slate-200 rounded-md">
                    {associatedContacts.map(contact => (
                        <li key={contact.id} className="p-4 hover:bg-slate-50">
                            <div className="flex justify-between items-baseline">
                                <span className="font-semibold text-lg text-slate-800">{contact.firstName} {contact.lastName}</span>
                                <span className="text-slate-500 text-sm">{contact.contactType || 'N/A'}</span>
                            </div>
                             <div className="text-sm text-slate-600">{contact.organization} - {contact.title}</div>
                             <div className="text-sm text-slate-500 mt-1">
                                <a href={`mailto:${contact.email}`} className="text-teal-600 hover:underline">{contact.email}</a>
                                {contact.phone && ` | ${contact.phone}`}
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="text-center py-16 text-slate-500 italic">
                    <p>No external contacts have been associated with this project.</p>
                </div>
            )}
        </section>
    );
};


interface ProjectViewerProps {
    project: FormData;
    onBack: () => void;
    onSave: (project: FormData) => void;
}

const ProjectViewer: React.FC<ProjectViewerProps> = ({ project, onBack, onSave }) => {
    const { state, dispatch, notify } = useAppContext();
    const { tasks, activities, directExpenses, events, eventTickets, venues } = state;
    const [activeTab, setActiveTab] = useState<ProjectViewTabId>('info');
    const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);

    const projectTasks = useMemo(() => tasks.filter(t => t.projectId === project.id), [tasks, project.id]);
    
    const projectActivities = useMemo(() => {
        const projectTaskIds = new Set(projectTasks.map(t => t.id));
        return activities.filter(a => projectTaskIds.has(a.taskId));
    }, [activities, projectTasks]);

    const projectDirectExpenses = useMemo(() => directExpenses.filter(d => d.projectId === project.id), [directExpenses, project.id]);
    
    const ticketCalcs = useTicketRevenueCalculations(project.id, events, venues, eventTickets);

    const handleCreateSnapshot = async (notes: string) => {
        const snapshotData: Omit<ProposalSnapshot, 'id'> = {
            projectId: project.id,
            createdAt: new Date().toISOString(),
            notes,
            projectData: JSON.parse(JSON.stringify(project)), // Deep copy
            tasks: JSON.parse(JSON.stringify(projectTasks)), // Deep copy
            calculatedMetrics: ticketCalcs,
        };
        
        try {
            const newSnapshot = await api.addProposal(snapshotData as ProposalSnapshot);
            dispatch({ type: 'CREATE_PROPOSAL_SNAPSHOT', payload: newSnapshot });
            notify('Proposal snapshot created successfully!', 'success');
        } catch (error: any) {
            notify(`Error creating snapshot: ${error.message}`, 'error');
        } finally {
            setIsNotesModalOpen(false);
        }
    };

    const tabs: {id: ProjectViewTabId, label: string, icon: string}[] = [
        { id: 'info', label: 'Project Info', icon: 'fa-solid fa-circle-info' },
        { id: 'collaborators', label: 'Collaborators', icon: 'fa-solid fa-users' },
        { id: 'budget', label: 'Budget vs. Actuals', icon: 'fa-solid fa-chart-pie' },
        { id: 'workplan', label: 'Workplan', icon: 'fa-solid fa-calendar-alt' },
        { id: 'insights', label: 'Activity & Insights', icon: 'fa-solid fa-chart-line' },
        { id: 'externalContacts', label: 'External Contacts', icon: 'fa-solid fa-address-book' },
    ];

    const renderTabContent = () => {
        switch(activeTab) {
            case 'info':
                return <ProjectInfoView project={project} />;
            case 'collaborators':
                return <CollaboratorsView project={project} />;
            case 'budget':
                return <BudgetView 
                    project={project}
                    onSave={onSave}
                    tasks={projectTasks} 
                    activities={projectActivities} 
                    directExpenses={projectDirectExpenses}
                    events={events}
                    venues={venues}
                    eventTickets={eventTickets}
                />;
            case 'workplan':
                return <WorkplanTab project={project} events={events} venues={venues}/>;
            case 'insights':
                return <ActivityInsightsTab project={project} />;
            case 'externalContacts':
                return <ExternalContactsView projectId={project.id} />;
            default:
                return <ProjectInfoView project={project} />;
        }
    };

    return (
        <>
            {isNotesModalOpen && (
                <NotesModal 
                    isOpen={true}
                    onClose={() => setIsNotesModalOpen(false)}
                    onSave={handleCreateSnapshot}
                    title="Create Proposal Snapshot"
                />
            )}
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
                 <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-5">
                    <h1 className="text-3xl font-bold text-slate-900">{project.projectTitle}</h1>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setIsNotesModalOpen(true)} className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md shadow-sm hover:bg-purple-700">
                           <i className="fa-solid fa-camera-retro mr-2"></i>Create Proposal Snapshot
                        </button>
                        <button
                            onClick={onBack}
                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 shadow-sm"
                        >
                            <i className="fa fa-arrow-left mr-2"></i>
                            Back to List
                        </button>
                    </div>
                </div>
                
                <div className="border-b border-slate-200 mb-8">
                    <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            type="button"
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`group whitespace-nowrap py-3 px-3 border-b-2 font-semibold text-sm transition-all duration-200 rounded-t-md flex items-center gap-2 ${
                            activeTab === tab.id
                                ? 'border-teal-500 text-teal-600 bg-slate-100'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                            aria-current={activeTab === tab.id ? 'page' : undefined}
                        >
                            <i className={`${tab.icon} ${activeTab === tab.id ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-600'}`}></i>
                            {tab.label}
                        </button>
                    ))}
                    </nav>
                </div>
                
                <div>
                    {renderTabContent()}
                </div>
            </div>
        </>
    );
};

export default ProjectViewer;
