
import React, { useState } from 'react';
import VenueManager from './VenueManager';
import SingleEventManager from './SingleEventManager';
import TicketManager from './TicketManager';

const EventManager: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'venues' | 'events' | 'ticketTypes'>('events');
    
    const renderContent = () => {
        switch(activeTab) {
            case 'venues':
                return <VenueManager />;
            case 'events':
                return <SingleEventManager />;
            case 'ticketTypes':
                return <TicketManager />;
            default:
                return null;
        }
    };

    const navItems = [
        { id: 'events' as const, label: 'Events' },
        { id: 'venues' as const, label: 'Venues' },
        { id: 'ticketTypes' as const, label: 'Ticket Types' },
    ];

    return (
        <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-slate-200 pb-4 gap-4">
                <h1 className="text-3xl font-bold text-slate-900">Events & Venues</h1>
            </div>
            
            <div className="border-b border-slate-200 mb-6">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {navItems.map(item => (
                         <button
                            key={item.id}
                            type="button"
                            onClick={() => setActiveTab(item.id)}
                            className={`whitespace-nowrap py-3 px-3 border-b-2 font-semibold text-sm transition-all duration-200 rounded-t-md ${
                            activeTab === item.id
                                ? 'border-teal-500 text-teal-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>
            </div>
            
            <div>
                {renderContent()}
            </div>
        </div>
    );
};

export default EventManager;
