


import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Page } from '../types.ts';
import { useAppContext } from '../context/AppContext.tsx';

interface MainMenuProps {
    activePage: Page;
    onNavigate: (page: Page) => void;
}

const NavLink: React.FC<{
    page: Page;
    label: string;
    activePage: Page;
    onNavigate: (page: Page) => void;
}> = ({ page, label, activePage, onNavigate }) => {
    const isActive = activePage === page;
    const baseClasses = "px-3 py-4 text-sm font-semibold transition-colors duration-150 border-b-2";
    const activeClasses = "border-teal-400 text-white";
    const inactiveClasses = "border-transparent text-slate-300 hover:text-white hover:border-slate-500";

    return (
        <a
            href="#"
            onClick={(e) => {
                e.preventDefault();
                onNavigate(page);
            }}
            className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
            aria-current={isActive ? 'page' : undefined}
        >
            {label}
        </a>
    );
};

const DropdownLink: React.FC<{
    page: Page;
    icon: string;
    label: string;
    activePage: Page;
    onNavigate: (page: Page) => void;
    onClick: () => void;
}> = ({ page, icon, label, activePage, onNavigate, onClick }) => {
    const isActive = activePage === page;
    const baseClasses = "group flex items-center w-full px-4 py-2 text-sm text-left";
    const activeClasses = "bg-slate-100 text-slate-900";
    const inactiveClasses = "text-slate-700 hover:bg-slate-100 hover:text-slate-900";

    return (
        <a
            href="#"
            role="menuitem"
            onClick={(e) => {
                e.preventDefault();
                onNavigate(page);
                onClick();
            }}
            className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
        >
             <i className={`${icon} mr-3 h-5 w-5 text-slate-400 group-hover:text-teal-500`} aria-hidden="true"></i>
            {label}
        </a>
    );
}

const MainMenu: React.FC<MainMenuProps> = ({ activePage, onNavigate }) => {
    const [isHomeDropdownOpen, setIsHomeDropdownOpen] = useState(false);
    const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
    const [isMediaDropdownOpen, setIsMediaDropdownOpen] = useState(false);
    const [isProjectsDropdownOpen, setIsProjectsDropdownOpen] = useState(false);
    const [isMarketDropdownOpen, setIsMarketDropdownOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    
    const homeDropdownRef = useRef<HTMLDivElement>(null);
    const toolsDropdownRef = useRef<HTMLDivElement>(null);
    const mediaDropdownRef = useRef<HTMLDivElement>(null);
    const projectsDropdownRef = useRef<HTMLDivElement>(null);
    const marketDropdownRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);

    const { state, dispatch, notify } = useAppContext();
    const { settings, currentUser, members } = state;
    const collectiveName = settings.general.collectiveName || 'The Arts Incubator';

    const currentUserName = useMemo(() => {
        if (!currentUser) return 'Not Logged In';
        if (currentUser.username === 'admin') return 'Administrator';
        const member = members.find(m => m.id === currentUser.memberId);
        return member ? `${member.firstName} ${member.lastName}` : currentUser.username;
    }, [currentUser, members]);

    const useOutsideAlerter = (ref: React.RefObject<HTMLDivElement>, close: () => void) => {
        useEffect(() => {
            function handleClickOutside(event: MouseEvent) {
                if (ref.current && !ref.current.contains(event.target as Node)) {
                    close();
                }
            }
            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }, [ref, close]);
    }

    useOutsideAlerter(homeDropdownRef, () => setIsHomeDropdownOpen(false));
    useOutsideAlerter(toolsDropdownRef, () => setIsToolsDropdownOpen(false));
    useOutsideAlerter(mediaDropdownRef, () => setIsMediaDropdownOpen(false));
    useOutsideAlerter(projectsDropdownRef, () => setIsProjectsDropdownOpen(false));
    useOutsideAlerter(marketDropdownRef, () => setIsMarketDropdownOpen(false));
    useOutsideAlerter(userMenuRef, () => setIsUserMenuOpen(false));
    
    const handleLogout = () => {
        dispatch({ type: 'LOGOUT' });
        notify('You have been successfully logged out.', 'info');
    };


    return (
        <header className="bg-slate-800 text-white shadow-lg sticky top-0 z-40">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <h1 className="text-xl font-bold tracking-wider">{collectiveName}</h1>
                        </div>
                        <nav className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-1">
                                <div className="relative" ref={homeDropdownRef}>
                                    <button
                                        onClick={() => setIsHomeDropdownOpen(!isHomeDropdownOpen)}
                                        className={`px-3 py-4 text-sm font-semibold transition-colors duration-150 border-b-2 ${(activePage === 'home' || activePage === 'userGuide' || activePage === 'about' || activePage === 'settings') ? 'border-teal-400 text-white' : 'border-transparent text-slate-300 hover:text-white hover:border-slate-500'}`}
                                    >
                                        Home <i className="fa-solid fa-chevron-down fa-xs ml-1"></i>
                                    </button>
                                    {isHomeDropdownOpen && (
                                        <div className="origin-top-left absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                                            <div className="py-1">
                                                <DropdownLink page="home" icon="fa-solid fa-table-columns" label="Dashboard" activePage={activePage} onNavigate={onNavigate} onClick={() => setIsHomeDropdownOpen(false)} />
                                                <DropdownLink page="about" icon="fa-solid fa-info-circle" label="About this Platform" activePage={activePage} onNavigate={onNavigate} onClick={() => setIsHomeDropdownOpen(false)} />
                                                <DropdownLink page="userGuide" icon="fa-solid fa-book-open" label="User Guide" activePage={activePage} onNavigate={onNavigate} onClick={() => setIsHomeDropdownOpen(false)} />
                                                <div className="border-t border-slate-100 my-1"></div>
                                                <DropdownLink page="settings" icon="fa-solid fa-sliders" label="Settings" activePage={activePage} onNavigate={onNavigate} onClick={() => setIsHomeDropdownOpen(false)} />
                                            </div>
                                        </div>
                                    )}
                               </div>

                                <div className="relative" ref={projectsDropdownRef}>
                                    <button
                                        onClick={() => setIsProjectsDropdownOpen(!isProjectsDropdownOpen)}
                                        className={`px-3 py-4 text-sm font-semibold transition-colors duration-150 border-b-2 ${(activePage === 'projects' || activePage === 'tasks' || activePage === 'reports' || activePage === 'communityReach' || activePage === 'impactAssessment') ? 'border-teal-400 text-white' : 'border-transparent text-slate-300 hover:text-white hover:border-slate-500'}`}
                                    >
                                        Projects <i className="fa-solid fa-chevron-down fa-xs ml-1"></i>
                                    </button>
                                    {isProjectsDropdownOpen && (
                                        <div className="origin-top-left absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                                            <div className="py-1">
                                                <DropdownLink page="projects" icon="fa-solid fa-briefcase" label="Project List" activePage={activePage} onNavigate={onNavigate} onClick={() => setIsProjectsDropdownOpen(false)} />
                                                <DropdownLink page="tasks" icon="fa-solid fa-list-check" label="Tasks & Timesheets" activePage={activePage} onNavigate={onNavigate} onClick={() => setIsProjectsDropdownOpen(false)} />
                                                <div className="border-t border-slate-100 my-1"></div>
                                                <DropdownLink page="reports" icon="fa-solid fa-file-invoice" label="Reporting & Archives" activePage={activePage} onNavigate={onNavigate} onClick={() => setIsProjectsDropdownOpen(false)} />
                                                <div className="border-t border-slate-100 my-1"></div>
                                                <DropdownLink page="communityReach" icon="fa-solid fa-users-viewfinder" label="Community Reach" activePage={activePage} onNavigate={onNavigate} onClick={() => setIsProjectsDropdownOpen(false)} />
                                                <DropdownLink page="impactAssessment" icon="fa-solid fa-magnifying-glass-chart" label="Impact Assessment" activePage={activePage} onNavigate={onNavigate} onClick={() => setIsProjectsDropdownOpen(false)} />
                                            </div>
                                        </div>
                                    )}
                               </div>

                               <NavLink page="members" label="Members" activePage={activePage} onNavigate={onNavigate} />
                               <NavLink page="events" label="Events" activePage={activePage} onNavigate={onNavigate} />
                               <NavLink page="sales" label="Marketplace" activePage={activePage} onNavigate={onNavigate} />
                               <NavLink page="otf" label="OTF" activePage={activePage} onNavigate={onNavigate} />
                               
                               <div className="relative" ref={mediaDropdownRef}>
                                    <button
                                        onClick={() => setIsMediaDropdownOpen(!isMediaDropdownOpen)}
                                        className={`px-3 py-4 text-sm font-semibold transition-colors duration-150 border-b-2 ${(activePage === 'media' || activePage === 'contacts' || activePage === 'highlights') ? 'border-teal-400 text-white' : 'border-transparent text-slate-300 hover:text-white hover:border-slate-500'}`}
                                    >
                                        Media <i className="fa-solid fa-chevron-down fa-xs ml-1"></i>
                                    </button>
                                    {isMediaDropdownOpen && (
                                        <div className="origin-top-left absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                                            <div className="py-1">
                                                <DropdownLink page="media" icon="fa-solid fa-newspaper" label="News Releases" activePage={activePage} onNavigate={onNavigate} onClick={() => setIsMediaDropdownOpen(false)} />
                                                <DropdownLink page="contacts" icon="fa-solid fa-address-book" label="Contacts" activePage={activePage} onNavigate={onNavigate} onClick={() => setIsMediaDropdownOpen(false)} />
                                                <DropdownLink page="highlights" icon="fa-solid fa-star" label="Highlights" activePage={activePage} onNavigate={onNavigate} onClick={() => setIsMediaDropdownOpen(false)} />
                                            </div>
                                        </div>
                                    )}
                               </div>

                            </div>
                        </nav>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-4 flex items-center md:ml-6 gap-4">
                             <div className="relative" ref={toolsDropdownRef}>
                                <div>
                                    <button 
                                        type="button" 
                                        className="inline-flex justify-center w-full rounded-md border border-slate-600 shadow-sm px-4 py-2 bg-slate-700/50 text-sm font-medium text-slate-300 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-white" 
                                        id="options-menu" 
                                        aria-haspopup="true" 
                                        aria-expanded="true"
                                        onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
                                    >
                                        Tools
                                        <i className="fa-solid fa-chevron-down -mr-1 ml-2 h-5 w-5" aria-hidden="true"></i>
                                    </button>
                                </div>
                                {isToolsDropdownOpen && (
                                    <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                        <div className="py-1" role="none">
                                            <DropdownLink page="researchPlanGenerator" icon="fa-solid fa-book" label="Research Plan Generator" activePage={activePage} onNavigate={onNavigate} onClick={() => setIsToolsDropdownOpen(false)} />
                                            <DropdownLink page="aiProjectGenerator" icon="fa-solid fa-robot" label="AI Project Generator" activePage={activePage} onNavigate={onNavigate} onClick={() => setIsToolsDropdownOpen(false)} />
                                            <DropdownLink page="ecoStarWorkshop" icon="fa-solid fa-seedling" label="ECO-STAR AI Workshop" activePage={activePage} onNavigate={onNavigate} onClick={() => setIsToolsDropdownOpen(false)} />
                                            <DropdownLink page="sdgAlignment" icon="fa-solid fa-earth-americas" label="SDG Alignment Report" activePage={activePage} onNavigate={onNavigate} onClick={() => setIsToolsDropdownOpen(false)} />
                                            <DropdownLink page="frameworkForRecreation" icon="fa-solid fa-people-roof" label="Framework for Recreation" activePage={activePage} onNavigate={onNavigate} onClick={() => setIsToolsDropdownOpen(false)} />
                                            <div className="border-t border-slate-100 my-1"></div>
                                            <DropdownLink page="taskAssessor" icon="fa-solid fa-wand-magic-sparkles" label="AI Task Generator" activePage={activePage} onNavigate={onNavigate} onClick={() => setIsToolsDropdownOpen(false)} />
                                            <DropdownLink page="projectAssessor" icon="fa-solid fa-diagram-project" label="Project AI Assistant" activePage={activePage} onNavigate={onNavigate} onClick={() => setIsToolsDropdownOpen(false)} />
                                            <DropdownLink page="interestCompatibility" icon="fa-solid fa-users-gear" label="Interest Compatibility" activePage={activePage} onNavigate={onNavigate} onClick={() => setIsToolsDropdownOpen(false)} />
                                            <div className="border-t border-slate-100 my-1"></div>
                                            <DropdownLink page="importExport" icon="fa-solid fa-right-left" label="Import / Export Data" activePage={activePage} onNavigate={onNavigate} onClick={() => setIsToolsDropdownOpen(false)} />
                                            <div className="border-t border-slate-100 my-1"></div>
                                            <DropdownLink page="schemaReport" icon="fa-solid fa-sitemap" label="Data Schema Report" activePage={activePage} onNavigate={onNavigate} onClick={() => setIsToolsDropdownOpen(false)} />
                                            <DropdownLink page="dbTest" icon="fa-solid fa-database" label="Database Replication" activePage={activePage} onNavigate={onNavigate} onClick={() => setIsToolsDropdownOpen(false)} />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="relative" ref={userMenuRef}>
                                <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-700">
                                    <i className="fa-solid fa-user-circle text-2xl text-slate-400"></i>
                                    <span className="text-sm font-medium">{currentUserName}</span>
                                     <i className="fa-solid fa-chevron-down fa-xs ml-1 text-slate-400"></i>
                                </button>
                                {isUserMenuOpen && (
                                     <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical">
                                         <div className="py-1" role="none">
                                             <a href="#" onClick={handleLogout} className="group flex items-center w-full px-4 py-2 text-sm text-left text-slate-700 hover:bg-slate-100 hover:text-slate-900">
                                                <i className="fa-solid fa-right-from-bracket mr-3 h-5 w-5 text-slate-400 group-hover:text-red-500" aria-hidden="true"></i>
                                                Logout
                                             </a>
                                         </div>
                                     </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Mobile menu button could go here */}
                </div>
            </div>
        </header>
    );
};

export default MainMenu;