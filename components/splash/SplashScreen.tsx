

import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext.tsx';
import LoginScreen from '../auth/LoginScreen.tsx';
import UserGuide from '../user-guide/UserGuide.tsx';
import PublicHeader from './PublicHeader.tsx';
import AboutPage from '../pages/AboutPage.tsx';

type PublicView = 'login' | 'guide' | 'about';

const SplashScreen: React.FC = () => {
    const { state } = useAppContext();
    const { settings } = state;
    const [backgroundImage, setBackgroundImage] = useState('');
    const [activeView, setActiveView] = useState<PublicView>('login');

    const imagePool = useMemo(() => {
        const { splashImage1, splashImage2, splashImage3 } = settings.gallery;
        const images = [splashImage1, splashImage2, splashImage3];
        return images.filter(img => img && img.trim() !== '');
    }, [settings.gallery]);

    useEffect(() => {
        if (imagePool.length > 0) {
            const randomIndex = Math.floor(Math.random() * imagePool.length);
            setBackgroundImage(imagePool[randomIndex]);
        }
    }, [imagePool]);

    const backgroundStyle = backgroundImage
        ? { backgroundImage: `url(${backgroundImage})` }
        : { backgroundColor: '#1e293b' };

    const renderContent = () => {
        switch (activeView) {
            case 'login':
                return (
                    <div className="flex items-center justify-center min-h-full">
                         <LoginScreen />
                    </div>
                );
            case 'guide':
                return (
                    <div className="h-full w-full pt-16 pb-4">
                        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-2xl h-full w-full overflow-y-auto">
                            <UserGuide />
                        </div>
                    </div>
                );
            case 'about':
                return (
                     <div className="h-full w-full pt-16 pb-4">
                        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-2xl h-full w-full overflow-y-auto">
                            <AboutPage />
                        </div>
                    </div>
                );
            default:
                return <LoginScreen />;
        }
    };

    return (
        <div
            className="fixed inset-0 bg-slate-900 bg-cover bg-center transition-all duration-1000"
            style={backgroundStyle}
        >
            <div className="absolute inset-0 bg-black bg-opacity-50 p-4">
                <PublicHeader activeView={activeView} onNavigate={setActiveView} />
                {renderContent()}
            </div>
        </div>
    );
};

export default SplashScreen;
