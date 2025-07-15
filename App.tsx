



import React, { useState } from 'react';
import { AppProvider, useAppContext } from './context/AppContext.tsx';
import Layout from './components/Layout.tsx';
import ProjectManager from './ProjectManager.tsx';
import HomePage from './components/HomePage.tsx';
import MemberManager from './MemberManager.tsx';
import TaskManager from './TaskManager.tsx';
import ReportsPage from './components/ReportsPage.tsx';
import SettingsManager from './components/settings/SettingsManager.tsx';
import ImportExportPage from './components/ImportExportPage.tsx';
import { Page } from './types.ts';
import TaskAssessorPage from './components/tools/TaskAssessorPage.tsx';
import ProjectAssessorPage from './components/tools/ProjectAssessorPage.tsx';
import AiWorkshopPage from './components/pages/AiWorkshopPage.tsx';
import SchemaReportPage from './components/tools/SchemaReportPage.tsx';
import EcoStarWorkshopPage from './components/tools/EcoStarWorkshopPage.tsx';
import AiProjectGeneratorPage from './components/tools/AiProjectGeneratorPage.tsx';
import UserGuide from './components/user-guide/UserGuide.tsx';
import InterestCompatibilityPage from './components/tools/InterestCompatibilityPage.tsx';
import DbTestPage from './components/tools/DbTestPage.tsx';
import CommunityReachPage from './components/CommunityReachPage.tsx';
import ImpactAssessmentPage from './components/ImpactAssessmentPage.tsx';
import HighlightsManager from './HighlightsManager.tsx';
import MediaManager from './components/media/MediaManager.tsx';
import ContactManager from './components/contacts/ContactManager.tsx';
import EventManager from './components/events/EventManager.tsx';
import ProposalManager from './components/proposals/ProposalManager.tsx';
import SplashScreen from './components/splash/SplashScreen.tsx';
import SdgAlignmentPage from './components/tools/SdgAlignmentPage.tsx';
import FrameworkForRecreationPage from './components/tools/FrameworkForRecreationPage.tsx';
import AboutPage from './components/pages/AboutPage.tsx';
import MarketplaceManager from './components/sales/SalesManager.tsx';
import SetupWizard from './components/setup/SetupWizard.tsx';
import KpiGeneratorPage from './components/tools/KpiGeneratorPage.tsx';

const AppContent: React.FC = () => {
    const { state } = useAppContext();
    const [activePage, setActivePage] = useState<Page>('home');

    const handleNavigate = (page: Page) => {
        setActivePage(page);
    };

    if (state.setupNeeded) {
        return <SetupWizard />;
    }
    
    if (state.loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-slate-100">
                <div className="text-center">
                    <i className="fa-solid fa-spinner fa-spin text-4xl text-slate-500"></i>
                    <p className="mt-4 text-lg text-slate-600">Loading Workspace...</p>
                </div>
            </div>
        );
    }

    if (!state.currentUser) {
        return <SplashScreen />;
    }

    const renderPage = () => {
        switch (activePage) {
            case 'home': return <HomePage onNavigate={handleNavigate} />;
            case 'projects': return <ProjectManager onNavigate={handleNavigate} />;
            case 'members': return <MemberManager />;
            case 'tasks': return <TaskManager />;
            case 'reports': return <ReportsPage />;
            case 'settings': return <SettingsManager />;
            case 'importExport': return <ImportExportPage />;
            case 'taskAssessor': return <TaskAssessorPage onNavigate={handleNavigate} />;
            case 'projectAssessor': return <ProjectAssessorPage onNavigate={handleNavigate} />;
            case 'aiWorkshop': return <AiWorkshopPage onNavigate={handleNavigate} />;
            case 'schemaReport': return <SchemaReportPage />;
            case 'ecoStarWorkshop': return <EcoStarWorkshopPage onNavigate={handleNavigate} />;
            case 'aiProjectGenerator': return <AiProjectGeneratorPage onNavigate={handleNavigate} />;
            case 'userGuide': return <UserGuide />;
            case 'about': return <AboutPage />;
            case 'interestCompatibility': return <InterestCompatibilityPage />;
            case 'sdgAlignment': return <SdgAlignmentPage />;
            case 'frameworkForRecreation': return <FrameworkForRecreationPage />;
            case 'dbTest': return <DbTestPage />;
            case 'communityReach': return <CommunityReachPage />;
            case 'impactAssessment': return <ImpactAssessmentPage />;
            case 'highlights': return <HighlightsManager />;
            case 'media': return <MediaManager />;
            case 'contacts': return <ContactManager />;
            case 'events': return <EventManager />;
            case 'proposals': return <ProposalManager />;
            case 'sales': return <MarketplaceManager />;
            case 'kpiGenerator': return <KpiGeneratorPage />;
            default: return <HomePage onNavigate={handleNavigate} />;
        }
    };

    return (
        <Layout activePage={activePage} onNavigate={handleNavigate}>
            {renderPage()}
        </Layout>
    );
}

const App: React.FC = () => (
    <AppProvider>
        <AppContent />
    </AppProvider>
);

export default App;
