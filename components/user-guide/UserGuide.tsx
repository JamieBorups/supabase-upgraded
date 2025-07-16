
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
import SetupGuide from './SetupGuide';
import ResearchPlanGeneratorGuide from './ResearchPlanGeneratorGuide.tsx';
import ResearchApproachesGuide from './ResearchApproachesGuide.tsx';


import './guide.css';

type GuideTopic = 
  | 'welcome' | 'setup' | 'acknowledgements' | 'empowering' | 'projects' | 'members' | 'tasks' | 'events' | 'sales' | 'media' 
  | 'reports' | 'communityImpact' | 'supplementalReports' | 'tools' | 'settings'
  | 'ecoStar' | 'sdg' | 'recreation' | 'interest' | 'researchPlanGenerator' | 'researchPlanApproaches';

interface MenuItem {
    id: GuideTopic;
    label: string;
    icon: string;
    children?: MenuItem[];
}

interface MenuSection {
    title: string;
    items: MenuItem[];
}

const menuStructure: MenuSection[] = [
    {
        title: 'Introduction',
        items: [
            { id: 'welcome', label: 'Welcome', icon: 'fa-solid fa-hand-sparkles' },
            { id: 'empowering', label: 'Empowering the Arts', icon: 'fa-solid fa-rocket' },
            { id: 'acknowledgements', label: 'Acknowledgements', icon: 'fa-solid fa-award' },
            { id: 'setup', label: 'Initial Setup', icon: 'fa-solid fa-cogs' },
        ]
    },
    {
        title: 'Core Modules',
        items: [
            { id: 'projects', label: 'Projects & Proposals', icon: 'fa-solid fa-briefcase' },
            { id: 'tasks', label: 'Tasks & Activities', icon: 'fa-solid fa-list-check' },
            { id: 'members', label: 'Members', icon: 'fa-solid fa-users' },
            { id: 'events', label: 'Events & Venues', icon: 'fa-solid fa-calendar-days' },
            { id: 'sales', label: 'Marketplace', icon: 'fa-solid fa-cash-register' },
            { id: 'media', label: 'Media & Contacts', icon: 'fa-solid fa-bullhorn' },
        ]
    },
    {
        title: 'Reporting & Impact',
        items: [
            { id: 'reports', label: 'Final Reporting', icon: 'fa-solid fa-file-invoice' },
            { id: 'communityImpact', label: 'Community Impact', icon: 'fa-solid fa-users-viewfinder' },
            { 
                id: 'researchPlanGenerator',
                label: 'Research Plan Generator', 
                icon: 'fa-solid fa-book-open-reader',
                children: [
                    { id: 'researchPlanApproaches', label: 'Research Approaches', icon: 'fa-solid fa-puzzle-piece' }
                ]
            },
            { 
                id: 'supplementalReports', 
                label: 'Supplemental Reports', 
                icon: 'fa-solid fa-wand-magic-sparkles',
                children: [
                    { id: 'ecoStar', label: 'ECO-STAR', icon: 'fa-solid fa-seedling' },
                    { id: 'sdg', label: 'SDG Alignment', icon: 'fa-solid fa-earth-americas' },
                    { id: 'recreation', label: 'Recreation Framework', icon: 'fa-solid fa-people-roof' },
                    { id: 'interest', label: 'Interest Compatibility', icon: 'fa-solid fa-users-gear' },
                ]
            },
        ]
    },
    {
        title: 'Tools & Settings',
        items: [
            { id: 'tools', label: 'Other Tools', icon: 'fa-solid fa-wrench' },
            { id: 'settings', label: 'Settings', icon: 'fa-solid fa-sliders' },
        ]
    }
];

const UserGuide: React.FC = () => {
    const [activeTopic, setActiveTopic] = useState<GuideTopic>('welcome');

    const renderContent = () => {
        switch(activeTopic) {
            case 'welcome': return <WelcomePage />;
            case 'setup': return <SetupGuide />;
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
            case 'researchPlanGenerator': return <ResearchPlanGeneratorGuide />;
            case 'researchPlanApproaches': return <ResearchApproachesGuide />;
            default: return <WelcomePage />;
        }
    };
    
    const isTopicInChildren = (children: MenuItem[], topic: GuideTopic) => {
        return children.some(child => child.id === topic);
    }

    return (
        <div className="bg-white shadow-lg rounded-xl">
            <div className="flex flex-col md:flex-row min-h-[calc(100vh-10rem)]">
                {/* Sidebar */}
                <aside className="w-full md:w-72 bg-slate-50 p-4 border-b md:border-b-0 md:border-r border-slate-200">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 px-2">User Guide</h2>
                    <nav className="space-y-4">
                        {menuStructure.map((section, sectionIndex) => (
                            <div key={sectionIndex}>
                                <h3 className="px-3 text-xs font-semibold uppercase text-slate-500 tracking-wider">{section.title}</h3>
                                <div className="mt-2 space-y-1">
                                    {section.items.map(item => {
                                        if (item.children && item.children.length > 0) {
                                            return (
                                                <details key={item.id} className="group" open={item.id === activeTopic || isTopicInChildren(item.children, activeTopic)}>
                                                    <summary 
                                                        className={`flex items-center w-full text-left p-3 rounded-lg text-sm font-semibold transition-colors duration-150 cursor-pointer list-none ${
                                                            activeTopic === item.id || isTopicInChildren(item.children, activeTopic) ? 'bg-slate-200 text-slate-800' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-800'
                                                        }`}
                                                        onClick={(e) => { e.preventDefault(); setActiveTopic(item.id); }}
                                                    >
                                                        <i className={`${item.icon} w-6 text-center mr-2`}></i>
                                                        <span className="flex-grow">{item.label}</span>
                                                        <i className="fa-solid fa-chevron-right transition-transform duration-200 group-open:rotate-90"></i>
                                                    </summary>
                                                    <div className="pl-6 pt-1">
                                                        {item.children.map(child => (
                                                            <button key={child.id} onClick={() => setActiveTopic(child.id)}
                                                                className={`flex items-center w-full text-left p-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                                                                activeTopic === child.id ? 'bg-teal-100 text-teal-800 font-semibold' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-700'
                                                            }`}>
                                                                <i className={`${child.icon} w-6 text-center mr-2 text-xs`}></i>
                                                                <span>{child.label}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </details>
                                            );
                                        } else {
                                            return (
                                                <button key={item.id} onClick={() => setActiveTopic(item.id)}
                                                    className={`flex items-center w-full text-left p-3 rounded-lg text-sm font-semibold transition-colors duration-150 ${
                                                    activeTopic === item.id ? 'bg-teal-100 text-teal-800' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-800'
                                                }`}>
                                                    <i className={`${item.icon} w-6 text-center mr-2`}></i>
                                                    <span>{item.label}</span>
                                                </button>
                                            );
                                        }
                                    })}
                                </div>
                            </div>
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
