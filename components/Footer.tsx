
import React from 'react';
import { useAppContext } from '../context/AppContext.tsx';

const Footer: React.FC = () => {
    const { state } = useAppContext();
    const collectiveName = state.settings.general.collectiveName || 'The Arts Incubator';
    const currentYear = new Date().getFullYear();

    return (
        <footer 
            className="text-center text-sm p-4 mt-auto border-t print:hidden"
            style={{ 
                backgroundColor: 'var(--color-surface-muted)',
                color: 'var(--color-text-muted)',
                borderColor: 'var(--color-border-subtle)'
            }}
        >
            <div className="max-w-7xl mx-auto">
                <p>&copy; {currentYear} {collectiveName}. All Rights Reserved.</p>
                <p className="mt-1">
                    <a 
                        href="https://artsincubator.ca" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="hover:underline"
                        style={{ color: 'var(--color-text-link)' }}
                    >
                        Powered by The Arts Incubator
                    </a>
                </p>
            </div>
        </footer>
    );
};

export default Footer;