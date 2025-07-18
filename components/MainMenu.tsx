
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
    isMobile?: boolean;
    onClick?: () => void;
}> = ({ page, label, activePage, onNavigate, isMobile = false, onClick }) => {
    const isActive = activePage === page;
    
    const desktopActiveStyle = { borderColor: 'var(--color-header-nav-border-active)', color: 'var(--color-header-nav-text-active)' };
    const desktopInactiveStyle = { borderColor: 'transparent', color: 'var(--color-header-nav-text)' };
    const mobileActiveStyle = { backgroundColor: 'var(--color-surface-muted)', color: 'var(--color-primary)' };
    const mobileInactiveStyle = { color: 'var(--color-text-default)' };

    return (
        <a
            href="#"
            onClick={(e) => {
                e.preventDefault();
                onNavigate(page);
                if(onClick) onClick();
            }}
            className={isMobile ? "block px-3 py-2 rounded-md text-base font-medium" : "px-3 py-4 text-sm font-semibold transition-colors duration-150 border-b-2"}
            style={isMobile ? (isActive ? mobileActiveStyle : mobileInactiveStyle) : (isActive ? desktopActiveStyle : desktopInactiveStyle)}
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
    const baseClasses = "group flex items-center w-full px-4 py-2 text-sm text-left transition-colors duration-150";
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

const useOutsideAlerter = (ref: React.RefObject<any>, close: () => void, ignoreRef?: React.RefObject<any>) => {
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            // If the click is on the ignoreRef element (e.g., the toggle button), do nothing.
            if (ignoreRef?.current && ignoreRef.current.contains(event.target as Node)) {
                return;
            }

            // If the click is outside the main ref element, close it.
            if (ref.current && !ref.current.contains(event.target as Node)) {
                close();
            }
        }
        
        // Use 'click' event to avoid race condition on close, and rely on ignoreRef to handle the toggle button.
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [ref, close, ignoreRef]);
}

// --- Type Definitions for a clearer and more robust navigation structure ---
type NavDropdownLink = {
    page: Page;
    icon: string;
    label: string;
};

type NavDivider = {
    type: 'divider';
};

type DropdownItem = NavDropdownLink | NavDivider;

type NavDropdown = {
    name: string;
    label: string;
    pages: Page[];
    items: DropdownItem[];
};

type NavLinkItem = {
    page: Page;
    label: string;
};

type NavStructureItem = NavDropdown | NavLinkItem;
// --- End Type Definitions ---

const MainMenu: React.FC<MainMenuProps> = ({ activePage, onNavigate }) => {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    const menuRef = useRef<HTMLDivElement>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const mobileButtonRef = useRef<HTMLButtonElement>(null);

    const { state, dispatch, notify } = useAppContext();
    const { settings, currentUser, members } = state;
    const collectiveName = settings.general.collectiveName || 'The Arts Incubator';

    const currentUserName = useMemo(() => {
        if (!currentUser) return 'Not Logged In';
        if (currentUser.username === 'admin') return 'Administrator';
        const member = members.find(m => m.id === currentUser.memberId);
        return member ? `${member.firstName} ${member.lastName}` : currentUser.username;
    }, [currentUser, members]);
    
    useOutsideAlerter(menuRef, () => setOpenDropdown(null));
    useOutsideAlerter(mobileMenuRef, () => setIsMobileMenuOpen(false), mobileButtonRef);
    
    const handleLogout = () => {
        dispatch({ type: 'LOGOUT' });
        notify('You have been successfully logged out.', 'info');
    };
    
    const closeAll = () => {
        setOpenDropdown(null);
        setIsMobileMenuOpen(false);
    };

    const NAV_STRUCTURE: NavStructureItem[] = [
        { name: 'home', label: 'Home', pages: ['home', 'userGuide', 'about', 'settings'], items: [
            { page: 'home', icon: 'fa-solid fa-table-columns', label: 'Dashboard' },
            { page: 'about', icon: 'fa-solid fa-info-circle', label: 'About this Platform' },
            { page: 'userGuide', icon: 'fa-solid fa-book-open', label: 'User Guide' },
            { type: 'divider' },
            { page: 'settings', icon: 'fa-solid fa-sliders', label: 'Settings' },
        ]},
        { name: 'projects', label: 'Projects', pages: ['projects', 'tasks', 'reports'], items: [
            { page: 'projects', icon: 'fa-solid fa-briefcase', label: 'Project List' },
            { page: 'tasks', icon: 'fa-solid fa-list-check', label: 'Tasks & Timesheets' },
            { type: 'divider' },
            { page: 'reports', icon: 'fa-solid fa-file-invoice', label: 'Reporting & Archives' },
        ]},
        { page: 'members', label: 'Members' },
        { page: 'events', label: 'Events' },
        { page: 'sales', label: 'Marketplace' },
        { page: 'otf', label: 'OTF' },
        { name: 'media', label: 'Media', pages: ['media', 'contacts', 'highlights'], items: [
            { page: 'media', icon: 'fa-solid fa-newspaper', label: 'News Releases' },
            { page: 'contacts', icon: 'fa-solid fa-address-book', label: 'Contacts' },
            { page: 'highlights', icon: 'fa-solid fa-star', label: 'Highlights' },
        ]},
        { name: 'tools', label: 'Tools', pages: ['researchPlanGenerator', 'aiProjectGenerator', 'ecoStarWorkshop', 'sdgAlignment', 'frameworkForRecreation', 'taskAssessor', 'projectAssessor', 'interestCompatibility', 'importExport', 'schemaReport', 'dbTest'], items: [
            { page: 'researchPlanGenerator', icon: 'fa-solid fa-book', label: 'Research Plan Generator' },
            { page: 'aiProjectGenerator', icon: 'fa-solid fa-robot', label: 'AI Project Generator' },
            { page: 'ecoStarWorkshop', icon: 'fa-solid fa-seedling', label: 'ECO-STAR AI Workshop' },
            { page: 'sdgAlignment', icon: 'fa-solid fa-earth-americas', label: 'SDG Alignment Report' },
            { page: 'frameworkForRecreation', icon: 'fa-solid fa-people-roof', label: 'Framework for Recreation' },
            { type: 'divider' },
            { page: 'taskAssessor', icon: 'fa-solid fa-wand-magic-sparkles', label: 'AI Task Generator' },
            { page: 'projectAssessor', icon: 'fa-solid fa-diagram-project', label: 'Project AI Assistant' },
            { page: 'interestCompatibility', icon: 'fa-solid fa-users-gear', label: 'Interest Compatibility' },
            { type: 'divider' },
            { page: 'importExport', icon: 'fa-solid fa-right-left', label: 'Import / Export Data' },
            { type: 'divider' },
            { page: 'schemaReport', icon: 'fa-solid fa-sitemap', label: 'Data Schema Report' },
            { page: 'dbTest', icon: 'fa-solid fa-database', label: 'Database Replication' },
        ]},
    ];

    return (
        <header className="shadow-lg sticky top-0 z-40" style={{ backgroundColor: 'var(--color-header-bg)', color: 'var(--color-header-text)' }}>
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <h1 className="text-xl font-bold tracking-wider">{collectiveName}</h1>
                        </div>
                        <nav className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-1" ref={menuRef}>
                                {NAV_STRUCTURE.map((nav, index) => {
                                    if ('items' in nav && nav.items) {
                                        const isActive = nav.pages.includes(activePage);
                                        const activeStyle = { borderColor: 'var(--color-header-nav-border-active)', color: 'var(--color-header-nav-text-active)' };
                                        const inactiveStyle = { borderColor: 'transparent', color: 'var(--color-header-nav-text)' };
                                        return (
                                             <div key={nav.name || index} className="relative">
                                                <button onClick={() => setOpenDropdown(openDropdown === nav.name ? null : nav.name)} className="px-3 py-4 text-sm font-semibold transition-colors duration-150 border-b-2" style={isActive ? activeStyle : inactiveStyle}>
                                                    {nav.label} <i className="fa-solid fa-chevron-down fa-xs ml-1"></i>
                                                </button>
                                                {openDropdown === nav.name && (
                                                    <div className={`origin-top-left absolute left-0 mt-2 ${nav.name === 'tools' ? 'w-64 right-0 left-auto' : 'w-56'} rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50`}>
                                                        <div className="py-1">
                                                            {nav.items.map((item, itemIndex) => {
                                                                if ('type' in item) {
                                                                    return <div key={`divider-${itemIndex}`} className="border-t border-slate-100 my-1"></div>;
                                                                } else {
                                                                    return <DropdownLink key={item.page} page={item.page} icon={item.icon} label={item.label} activePage={activePage} onNavigate={onNavigate} onClick={closeAll} />;
                                                                }
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                           </div>
                                        );
                                    } else if ('page' in nav && nav.page) {
                                        return <NavLink key={nav.page} page={nav.page} label={nav.label} activePage={activePage} onNavigate={onNavigate} onClick={closeAll} />;
                                    }
                                    return null;
                                })}
                            </div>
                        </nav>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-4 flex items-center md:ml-6 gap-4">
                            <div className="relative">
                                <button onClick={() => setOpenDropdown(openDropdown === 'user' ? null : 'user')} className="flex items-center gap-2 p-2 rounded-md" style={{ backgroundColor: openDropdown === 'user' ? 'rgba(255,255,255,0.1)' : 'transparent' }}>
                                    <i className="fa-solid fa-user-circle text-2xl text-slate-400"></i>
                                    <span className="text-sm font-medium">{currentUserName}</span>
                                     <i className="fa-solid fa-chevron-down fa-xs ml-1 text-slate-400"></i>
                                </button>
                                {openDropdown === 'user' && (
                                     <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                                         <div className="py-1">
                                             <a href="#" onClick={(e)=>{e.preventDefault(); handleLogout(); closeAll();}} className="group flex items-center w-full px-4 py-2 text-sm text-left text-slate-700 hover:bg-slate-100 hover:text-slate-900">
                                                <i className="fa-solid fa-right-from-bracket mr-3 h-5 w-5 text-slate-400 group-hover:text-red-500"></i>
                                                Logout
                                             </a>
                                         </div>
                                     </div>
                                )}
                            </div>
                        </div>
                    </div>
                     <div className="-mr-2 flex md:hidden">
                        <button ref={mobileButtonRef} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} type="button" className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-white" aria-controls="mobile-menu" aria-expanded="false">
                            <span className="sr-only">Open main menu</span>
                            <i className={`fa-solid ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
                        </button>
                    </div>
                </div>
            </div>

            {isMobileMenuOpen && (
                <div className="md:hidden" id="mobile-menu">
                    <div ref={mobileMenuRef} className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white text-slate-800 border-t-2 border-slate-700">
                         {NAV_STRUCTURE.map((nav, index) => {
                             if('items' in nav && nav.items) {
                                 return (
                                     <div key={nav.name || index}>
                                         <h3 className="px-3 pt-4 pb-2 text-xs font-bold uppercase text-slate-500">{nav.label}</h3>
                                         {nav.items.map((item, itemIndex) => {
                                            if ('type' in item) {
                                                return <div key={`divider-mobile-${itemIndex}`} className="border-t my-1 mx-3"></div>;
                                            } else {
                                                return <NavLink key={item.page} page={item.page} label={item.label} activePage={activePage} onNavigate={onNavigate} isMobile={true} onClick={closeAll} />;
                                            }
                                         })}
                                     </div>
                                 );
                             } else if ('page' in nav && nav.page) {
                                 return <NavLink key={nav.page} page={nav.page} label={nav.label} activePage={activePage} onNavigate={onNavigate} isMobile={true} onClick={closeAll} />;
                             }
                             return null;
                         })}
                          <div className="border-t border-slate-200 pt-4 mt-4">
                                <div className="flex items-center px-3">
                                    <div className="flex-shrink-0"><i className="fa-solid fa-user-circle text-3xl text-slate-500"></i></div>
                                    <div className="ml-3">
                                        <div className="text-base font-medium leading-none text-slate-800">{currentUserName}</div>
                                    </div>
                                </div>
                                <div className="mt-3 px-2 space-y-1">
                                    <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); closeAll(); }} className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:text-white hover:bg-red-500">
                                        Logout
                                    </a>
                                </div>
                            </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default MainMenu;
