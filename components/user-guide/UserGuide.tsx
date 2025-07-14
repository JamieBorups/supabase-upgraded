import React, { useState } from 'react';
import WelcomePage from './WelcomePage';
import ProjectsGuide from './ProjectsGuide';
import MembersGuide from './MembersGuide';
import TasksGuide from './TasksGuide';
import EventsGuide from './EventsGuide';
import MediaGuide from './MediaGuide';
import ReportsGuide from './ReportsGuide';
import SettingsGuide from './SettingsGuide';
import ToolsGuide from './ToolsGuide';
import SalesGuide from './SalesGuide';
import SupplementalReportsGuide from './SupplementalReportsGuide';
import CommunityImpactGuide from './CommunityImpactGuide';
import EcoStarGuide from './EcoStarGuide';
import SdgGuide from './SdgGuide';
import RecreationFrameworkGuide from './RecreationFrameworkGuide';
import InterestCompatibilityGuide from './InterestCompatibilityGuide';
import AcknowledgementsGuide from './AcknowledgementsGuide';
import EmpoweringTheArtsGuide from './EmpoweringTheArtsGuide';


import './guide.css';

type GuideTopic = 
  | 'welcome' | 'acknowledgements' | 'empowering' | 'projects' | 'members' | 'tasks' | 'events' | 'sales' | 'media' 
  | 'reports' | 'communityImpact' | 'supplementalReports' | 'tools' | 'settings'
  | 'ecoStar' | 'sdg' | 'recreation' | 'interest';

const UserGuide: React.FC = () => {
    const [activeTopic, setActiveTopic] = useState<GuideTopic>('welcome');

    const menuItems: { id: GuideTopic; label: string; icon: string; indent?: boolean }[] = [
        { id: 'welcome', label: 'Welcome', icon: 'fa-solid fa-hand-sparkles' },
        { id: 'acknowledgements', label: 'Acknowledgements', icon: 'fa-solid fa-award' },
        { id: 'empowering', label: 'Empowering the Arts', icon: 'fa-solid fa-rocket' },
        { id: 'projects', label: 'Projects & Proposals', icon: 'fa-solid fa-briefcase' },
        { id: 'tasks', label: 'Tasks & Activities', icon: 'fa-solid fa-list-check' },
        { id: 'members', label: 'Members', icon: 'fa-solid fa-users' },
        { id: 'events', label: 'Events & Venues', icon: 'fa-solid fa-calendar-days' },
        { id: 'sales', label: 'Marketplace', icon: 'fa-solid fa-cash-register' },
        { id: 'media', label: 'Media & Contacts', icon: 'fa-solid fa-bullhorn' },
        { id: 'reports', label: 'Final Reporting', icon: 'fa-solid fa-file-invoice' },
        { id: 'communityImpact', label: 'Community Impact', icon: 'fa-solid fa-users-viewfinder' },
        { id: 'supplementalReports', label: 'Supplemental Reports', icon: 'fa-solid fa-wand-magic-sparkles' },
        { id: 'ecoStar', label: 'ECO-STAR', icon: 'fa-solid fa-seedling', indent: true },
        { id: 'sdg', label: 'SDG Alignment', icon: 'fa-solid fa-earth-americas', indent: true },
        { id: 'recreation', label: 'Recreation Framework (Canada)', icon: 'fa-solid fa-people-roof', indent: true },
        { id: 'interest', label: 'Interest Compatibility', icon: 'fa-solid fa-users-gear', indent: true },
        { id: 'tools', label: 'Other Tools', icon: 'fa-solid fa-wrench' },
        { id: 'settings', label: 'Settings', icon: 'fa-solid fa-sliders' },
    ];
    
    const renderContent = () => {
        switch(activeTopic) {
            case 'welcome': return <WelcomePage />;
            case 'acknowledgements': return <AcknowledgementsGuide />;
            case 'empowering': return <EmpoweringTheArtsGuide />;
            case 'projects': return <ProjectsGuide />;
            case 'members': return <MembersGuide />;
            case 'tasks': return <TasksGuide />;
            case 'events': return <EventsGuide />;
            case 'media': return <MediaGuide />;
            case 'reports': return <ReportsGuide />;
            case 'sales': return <SalesGuide />;
            case 'settings': return <SettingsGuide />;
            case 'tools': return <ToolsGuide />;
            case 'supplementalReports': return <SupplementalReportsGuide />;
            case 'communityImpact': return <CommunityImpactGuide />;
            case 'ecoStar': return <EcoStarGuide />;
            case 'sdg': return <SdgGuide />;
            case 'recreation': return <RecreationFrameworkGuide />;
            case 'interest': return <InterestCompatibilityGuide />;
            default: return <WelcomePage />;
        }
    };

    return (
        <div className="bg-white shadow-lg rounded-xl">
            <div className="flex flex-col md:flex-row min-h-[calc(100vh-10rem)]">
                {/* Sidebar */}
                <aside className="w-full md:w-72 bg-slate-50 p-4 border-b md:border-b-0 md:border-r border-slate-200">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 px-2">User Guide</h2>
                    <nav className="flex flex-row md:flex-col gap-1">
                        {menuItems.map(item => (
                             <button
                                key={item.id}
                                onClick={() => setActiveTopic(item.id)}
                                className={`flex items-center w-full text-left p-3 rounded-lg text-sm font-semibold transition-colors duration-150 ${item.indent ? 'pl-8' : ''} ${
                                    activeTopic === item.id 
                                    ? 'bg-teal-100 text-teal-800'
                                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-800'
                                }`}
                             >
                                <i className={`${item.icon} w-6 text-center mr-2`}></i>
                                <span>{item.label}</span>
                             </button>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
                    <div className="user-guide-content">
                      {renderContent()}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default UserGuide;