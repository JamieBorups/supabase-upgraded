import React, { useState } from 'react';
import SaleSessionList from './SaleSessionList.tsx';
import SessionDashboard from './SessionDashboard.tsx';
import InventoryManager from './InventoryManager.tsx';
import ItemsListPage from './ItemsListPage.tsx';
import { SaleSession } from '../../types.ts';
import { useAppContext } from '../../context/AppContext.tsx';
import FormField from '../ui/FormField.tsx';
import { Select } from '../ui/Select.tsx';

type MarketplaceTab = 'sessions' | 'inventory' | 'items';

const MarketplaceManager: React.FC = () => {
    const { state } = useAppContext();
    const [activeTab, setActiveTab] = useState<MarketplaceTab>('sessions');
    const [activeSession, setActiveSession] = useState<SaleSession | null>(null);

    const handleEnterSession = (session: SaleSession) => {
        setActiveSession(session);
    };

    if (activeSession) {
        return (
            <SessionDashboard 
                session={activeSession}
                onBack={() => setActiveSession(null)}
            />
        );
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'sessions':
                return <SaleSessionList onEnterSession={handleEnterSession} />;
            case 'inventory':
                return <InventoryManager />;
            case 'items':
                return <ItemsListPage />;
            default:
                return null;
        }
    };

    const navItems: { id: MarketplaceTab; label: string; icon: string; }[] = [
        { id: 'sessions', label: 'Sale Sessions', icon: 'fa-solid fa-flag' },
        { id: 'inventory', label: 'Master Inventory', icon: 'fa-solid fa-boxes-stacked' },
        { id: 'items', label: 'Item Lists', icon: 'fa-solid fa-list-ul' },
    ];
    
    return (
        <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-slate-200 pb-4 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Marketplace</h1>
                    <p className="text-sm text-slate-500">Manage your inventory, sale sessions, and curated item lists.</p>
                </div>
            </div>

            <div className="border-b border-slate-200 mb-6">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    {navItems.map(item => (
                         <button
                            key={item.id}
                            type="button"
                            onClick={() => setActiveTab(item.id)}
                            className={`group whitespace-nowrap py-3 px-3 border-b-2 font-semibold text-sm transition-all duration-200 rounded-t-md flex items-center gap-2 ${
                                activeTab === item.id
                                ? 'border-teal-500 text-teal-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                        >
                            <i className={`${item.icon} ${activeTab === item.id ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-500'}`}></i>
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

export default MarketplaceManager;
