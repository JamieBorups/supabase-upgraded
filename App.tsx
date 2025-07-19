
import React, { useState, useEffect } from 'react';
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
import ResearchPlanGeneratorPage from './components/tools/ResearchPlanGeneratorPage.tsx';
import OtfPage from './components/otf/OtfPage.tsx';
import ExperienceHubManager from './ExperienceHubManager.tsx';
import AutoGenerateJobsPage from './components/experience/AutoGenerateJobsPage.tsx';

const AppContent: React.FC = () => {
    const { state } = useAppContext();
    const [activePage, setActivePage] = useState<Page>('home');

    useEffect(() => {
        if (state.researchPlanToEdit) {
            setActivePage('researchPlanGenerator');
        } else if (state.otfApplicationToEdit) {
            setActivePage('otf');
        }
    }, [state.researchPlanToEdit, state.otfApplicationToEdit]);

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
            case 'researchPlanGenerator': return <ResearchPlanGeneratorPage />;
            case 'otf': return <OtfPage />;
            case 'dbTest': return <DbTestPage />;
            case 'highlights': return <HighlightsManager />;
            case 'media': return <MediaManager />;
            case 'contacts': return <ContactManager />;
            case 'events': return <EventManager />;
            case 'proposals': return <ProposalManager />;
            case 'sales': return <MarketplaceManager />;
            case 'experienceHub': return <ExperienceHubManager onNavigate={handleNavigate} />;
            case 'autoGenerateJobs': return <AutoGenerateJobsPage onNavigate={handleNavigate} />;
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
