
import React, { useState } from 'react';
import { ProposalSnapshot, ProjectViewTabId, Venue, Event } from '../../types';
import ProjectInfoView from '../view/ProjectInfoView';
import CollaboratorsView from '../view/CollaboratorsView';
import BudgetView from '../view/BudgetView';
import WorkplanTab from '../view/WorkplanTab';
import ActivityInsightsTab from '../view/ActivityInsightsTab';
import { useAppContext } from '../../context/AppContext';

interface ProposalViewerProps {
    snapshot: ProposalSnapshot;
    onBack: () => void;
    isEmbedded?: boolean;
}

const ProposalViewer: React.FC<ProposalViewerProps> = ({ snapshot, onBack, isEmbedded = false }) => {
    const { state } = useAppContext();
    const { events, venues, eventTickets } = state;
    const [activeTab, setActiveTab] = useState<ProjectViewTabId>('info');

    const tabs: {id: ProjectViewTabId, label: string, icon: string}[] = [
        { id: 'info', label: 'Project Info', icon: 'fa-solid fa-circle-info' },
        { id: 'collaborators', label: 'Collaborators', icon: 'fa-solid fa-users' },
        { id: 'budget', label: 'Budget', icon: 'fa-solid fa-chart-pie' },
        { id: 'workplan', label: 'Workplan', icon: 'fa-solid fa-calendar-alt' },
    ];
    
    const renderTabContent = () => {
        switch(activeTab) {
            case 'info':
                return <ProjectInfoView project={snapshot.projectData} />;
            case 'collaborators':
                return <CollaboratorsView project={snapshot.projectData} />;
            case 'budget':
                return <BudgetView 
                    project={snapshot.projectData}
                    tasks={snapshot.tasks} 
                    activities={[]} 
                    directExpenses={[]}
                    onSave={()=>{}} // No-op for read-only view
                    snapshotData={snapshot.calculatedMetrics}
                    isProposalView={true}
                    events={events}
                    venues={venues}
                    eventTickets={eventTickets}
                />;
            case 'workplan':
                const snapshotEvents: Event[] = snapshot.projectData.id ? events.filter(e => e.projectId === snapshot.projectData.id) : [];
                return <WorkplanTab project={snapshot.projectData} isSnapshot={true} tasks={snapshot.tasks} events={snapshotEvents} venues={venues} />;
            default:
                return <ProjectInfoView project={snapshot.projectData} />;
        }
    };
    
    return (
        <div className={isEmbedded ? "p-4" : "bg-white p-6 sm:p-8 rounded-xl shadow-lg"}>
             {!isEmbedded && (
                 <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-5">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">{snapshot.projectData.projectTitle}</h1>
                        <p className="text-sm text-slate-500">Proposal Snapshot from {new Date(snapshot.createdAt).toLocaleString()}</p>
                    </div>
                    <button
                        onClick={onBack}
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 shadow-sm"
                    >
                        <i className="fa fa-arrow-left mr-2"></i>
                        Back to Snapshots
                    </button>
                </div>
             )}
            
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-800">Snapshot Notes</h3>
                <p className="text-sm text-blue-900 italic whitespace-pre-wrap">{snapshot.notes || "No notes were added to this snapshot."}</p>
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
    );
};

export default ProposalViewer;
