import React, { useState } from 'react';
import { SaleSession } from '../../types';
import PointOfSale from './PointOfSale';
import SalesLog from './SalesLog';
import SalesReport from './SalesReport';
import SessionInventory from './SessionInventory';

interface SessionDashboardProps {
    session: SaleSession;
    onBack: () => void;
}

type DashboardTab = 'pos' | 'inventory' | 'log' | 'report';

const SessionDashboard: React.FC<SessionDashboardProps> = ({ session, onBack }) => {
    const [activeTab, setActiveTab] = useState<DashboardTab>('pos');

    const navItems: { id: DashboardTab; label: string; icon: string; }[] = [
        { id: 'pos', label: 'Point of Sale', icon: 'fa-solid fa-cash-register' },
        { id: 'inventory', label: 'Session Inventory', icon: 'fa-solid fa-boxes-stacked' },
        { id: 'log', label: 'Sales Log', icon: 'fa-solid fa-clipboard-list' },
        { id: 'report', label: 'Session Report', icon: 'fa-solid fa-chart-bar' },
    ];
    
    const renderContent = () => {
        switch (activeTab) {
            case 'pos': return <PointOfSale saleSession={session} />;
            case 'inventory': return <SessionInventory saleSession={session} />;
            case 'log': return <SalesLog saleSession={session} />;
            case 'report': return <SalesReport saleSession={session} />;
            default: return null;
        }
    };

    return (
        <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-slate-200 pb-4 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{session.name}</h1>
                    <p className="text-sm text-slate-500">Session Dashboard</p>
                </div>
                <button onClick={onBack} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-md hover:bg-slate-200">
                    <i className="fa-solid fa-arrow-left mr-2"></i>Back to All Sessions
                </button>
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

export default SessionDashboard;
