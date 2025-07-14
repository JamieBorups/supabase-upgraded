
import React from 'react';

interface InfoBoxProps {
    type: 'tip' | 'warning' | 'info';
    children: React.ReactNode;
}

const InfoBox: React.FC<InfoBoxProps> = ({ type, children }) => {
    const iconMap = {
        tip: 'fa-solid fa-lightbulb',
        warning: 'fa-solid fa-triangle-exclamation',
        info: 'fa-solid fa-circle-info',
    };

    return (
        <div className={`info-box ${type}`}>
            <div className="info-box-icon">
                <i className={iconMap[type]}></i>
            </div>
            <div className="info-box-content">
                {children}
            </div>
        </div>
    );
};

export default InfoBox;
