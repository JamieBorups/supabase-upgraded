
import React, { useEffect } from 'react';
import { useAppContext } from '../../context/AppContext.tsx';
import { ThemeSettings } from '../../types';

const ThemeInjector: React.FC = () => {
    const { state } = useAppContext();
    const { theme } = state.settings;

    // Helper function to convert camelCase to kebab-case
    const toKebabCase = (str: string) => {
        return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
    };

    useEffect(() => {
        const root = document.documentElement;
        if (theme) {
            // Iterate over the theme object and apply each color as a CSS variable
            Object.keys(theme).forEach(key => {
                const cssVarName = `--color-${toKebabCase(key)}`;
                const cssVarValue = (theme as any)[key];
                root.style.setProperty(cssVarName, cssVarValue);
            });
        }
    }, [theme]); // Rerun this effect whenever the theme object changes

    // This component is a side-effect component and does not render anything itself.
    return null; 
};

export default ThemeInjector;
