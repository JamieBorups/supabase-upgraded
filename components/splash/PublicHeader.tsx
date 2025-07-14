
import React from 'react';

type PublicView = 'login' | 'guide' | 'about';

interface PublicHeaderProps {
  activeView: PublicView;
  onNavigate: (view: PublicView) => void;
}

const NavLink: React.FC<{
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, isActive, onClick }) => {
    const baseClasses = "px-4 py-2 text-sm font-semibold transition-colors duration-200 rounded-md";
    const activeClasses = "bg-slate-700 text-white";
    const inactiveClasses = "text-slate-300 hover:bg-slate-700/50 hover:text-white";
    
    return (
        <button
            onClick={onClick}
            className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
            aria-current={isActive ? 'page' : undefined}
        >
            {label}
        </button>
    );
};

const ExternalLink: React.FC<{
    label: string;
    href: string;
}> = ({ label, href }) => {
    const baseClasses = "px-4 py-2 text-sm font-semibold transition-colors duration-200 rounded-md";
    const inactiveClasses = "text-slate-300 hover:bg-slate-700/50 hover:text-white";
    
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`${baseClasses} ${inactiveClasses} inline-flex items-center`}
        >
            {label} <i className="fa-solid fa-arrow-up-right-from-square fa-xs ml-1.5"></i>
        </a>
    );
};

const PublicHeader: React.FC<PublicHeaderProps> = ({ activeView, onNavigate }) => {
    return (
        <header className="fixed top-0 left-0 right-0 bg-slate-900 bg-opacity-70 backdrop-blur-sm z-50">
            <nav className="flex items-center justify-between p-2 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                 {/* Left-aligned links */}
                <div className="flex items-center space-x-2">
                     <NavLink
                        label="About"
                        isActive={activeView === 'about'}
                        onClick={() => onNavigate('about')}
                    />
                    <NavLink
                        label="User Guide"
                        isActive={activeView === 'guide'}
                        onClick={() => onNavigate('guide')}
                    />
                    <ExternalLink
                        label="artsincubator.ca"
                        href="https://artsincubator.ca"
                    />
                </div>
                 {/* Right-aligned link */}
                <div className="flex items-center">
                    <NavLink
                        label="Login"
                        isActive={activeView === 'login'}
                        onClick={() => onNavigate('login')}
                    />
                </div>
            </nav>
        </header>
    );
};

export default PublicHeader;
