

import React, { useState } from 'react';
import { SettingsCategory, UserRole } from '../../types';
import GeneralSettings from './GeneralSettings';
import ProjectSettings from './ProjectSettings';
import MemberSettings from './MemberSettings';
import TaskSettings from './TaskSettings';
import AiSettings from './ai/AiSettings';
import BudgetSettings from './BudgetSettings';
import HighlightsSettings from './GallerySettings';
import MediaSettings from './MediaSettings';
import EventSettings from './EventSettings';
import ProposalSettings from './ProposalSettings';
import UsersSettings from './UsersSettings';
import { useAppContext } from '../../context/AppContext';
import SalesSettingsPage from './SalesSettingsPage.tsx';

const SettingsManager: React.FC = () => {
    const { state } = useAppContext();
    const [activeCategory, setActiveCategory] = useState<SettingsCategory>('general');

    const menuItems: { id: SettingsCategory; label: string; icon: string; adminOnly?: boolean }[] = [
        { id: 'general', label: 'General', icon: 'fa-solid fa-sliders' },
        { id: 'users', label: 'Users', icon: 'fa-solid fa-users-cog', adminOnly: true },
        { id: 'ai', label: 'AI Settings', icon: 'fa-solid fa-wand-magic-sparkles' },
        { id: 'projects', label: 'Projects', icon: 'fa-solid fa-briefcase' },
        { id: 'proposals', label: 'Proposals', icon: 'fa-solid fa-camera-retro' },
        { id: 'sales', label: 'Sales & Inventory', icon: 'fa-solid fa-cash-register' },
        { id: 'budget', label: 'Budget', icon: 'fa-solid fa-dollar-sign' },
        { id: 'members', label: 'Members', icon: 'fa-solid fa-users' },
        { id: 'tasks', label: 'Tasks', icon: 'fa-solid fa-list-check' },
        { id: 'events', label: 'Events & Venues', icon: 'fa-solid fa-calendar-days' },
        { id: 'highlights', label: 'Highlights', icon: 'fa-solid fa-images' },
        { id: 'media', label: 'Media & Comms', icon: 'fa-solid fa-bullhorn' },
    ];
    
    const renderContent = () => {
        switch(activeCategory) {
            case 'general': return <GeneralSettings />;
            case 'users': return <UsersSettings />;
            case 'projects': return <ProjectSettings />;
            case 'proposals': return <ProposalSettings />;
            case 'sales': return <SalesSettingsPage />;
            case 'budget': return <BudgetSettings />;
            case 'members': return <MemberSettings />;
            case 'tasks': return <TaskSettings />;
            case 'events': return <EventSettings />;
            case 'highlights': return <HighlightsSettings />;
            case 'media': return <MediaSettings />;
            case 'ai': return <AiSettings />;
            default: return <GeneralSettings />;
        }
    };

    const availableMenuItems = menuItems.filter(item => 
        !item.adminOnly || (item.adminOnly && state.currentUser?.role === 'admin')
    );

    return (
        <div className="bg-white shadow-lg rounded-xl">
            <div className="flex flex-col md:flex-row min-h-[calc(100vh-10rem)]">
                {/* Sidebar */}
                <aside className="w-full md:w-64 bg-slate-50 p-4 border-b md:border-b-0 md:border-r border-slate-200">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 px-2">Settings</h2>
                    <nav className="flex flex-row md:flex-col gap-1">
                        {availableMenuItems.map(item => (
                             <button
                                key={item.id}
                                onClick={() => setActiveCategory(item.id)}
                                className={`flex items-center w-full text-left p-3 rounded-lg text-sm font-semibold transition-colors duration-150 ${
                                    activeCategory === item.id 
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
                <main className="flex-1 p-6 sm:p-8">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default SettingsManager;