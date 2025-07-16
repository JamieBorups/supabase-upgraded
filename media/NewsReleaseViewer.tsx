import React, { useMemo } from 'react';
import { NewsRelease } from '../../types';
import { useAppContext } from '../../context/AppContext';

interface NewsReleaseViewerProps {
    release: NewsRelease;
    onClose: () => void;
}

const NewsReleaseViewer: React.FC<NewsReleaseViewerProps> = ({ release, onClose }) => {
    const { state } = useAppContext();
    const project = state.projects.find(p => p.id === release.projectId);

    const getContactInfo = (): string => {
        if (release.contactMemberId) {
            const member = state.members.find(m => m.id === release.contactMemberId);
            if (member) {
                return `${member.firstName} ${member.lastName}\n${member.email}`;
            }
        }
        return release.contactInfo;
    };

    const handlePrint = () => {
        window.print();
    };

    const displayDateline = useMemo(() => {
        const city = (release.location || '').split(',')[0]?.trim().toUpperCase();
        const province = (release.location || '').split(',')[1]?.trim().toUpperCase();
        
        let datePart = '';
        if (release.publishDate) {
            try {
                const date = new Date(release.publishDate + 'T12:00:00Z');
                datePart = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            } catch (e) {
                datePart = "Invalid Date";
            }
        }
        
        if (city && province && datePart) return `${city}, ${province} – ${datePart}`;
        if (city && datePart) return `${city} – ${datePart}`;
        if (datePart) return datePart;
        return '';
    }, [release.location, release.publishDate]);


    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-[60] flex justify-center items-center p-4 print:bg-transparent print:block print:p-0">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col print:h-auto print:shadow-none print:p-8 print:w-full print:max-w-none print:border-none">
                {/* Non-printable header */}
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200 flex-shrink-0 print:hidden">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">View Release</h2>
                        <p className="text-sm text-slate-500">Project: <span className="font-semibold">{project?.projectTitle}</span></p>
                    </div>
                    <div className="flex items-center gap-2">
                         <button onClick={handlePrint} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700">
                            <i className="fa-solid fa-print mr-2"></i>Print
                        </button>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 transition-colors">
                            <i className="fa-solid fa-times text-slate-600"></i>
                        </button>
                    </div>
                </div>

                {/* Printable Content Area */}
                <div id="printable-release" className="flex-grow overflow-y-auto pr-4 -mr-4 space-y-5 font-serif print:overflow-visible print:pr-0 print:-mr-0">
                    <h1 className="text-3xl font-bold text-black text-center">{release.headline}</h1>
                    {release.subhead && <h2 className="text-xl italic text-slate-700 text-center mt-2">{release.subhead}</h2>}
                    <p className="text-sm text-center text-slate-700 pt-2 mb-6">{displayDateline}</p>

                    <p className="text-lg italic text-slate-800 leading-relaxed mb-6">{release.introduction}</p>
                    
                    <div className="text-base text-black leading-7 whitespace-pre-wrap">
                        {release.body}
                    </div>

                    {release.quotes && (
                        <div className="my-8 py-4 border-t border-b border-slate-300">
                            <h3 className="text-sm font-bold uppercase text-slate-500 tracking-wider mb-3">Quotes</h3>
                            <div className="text-lg text-slate-700 whitespace-pre-wrap italic pl-4 border-l-4 border-slate-400">
                                {release.quotes}
                            </div>
                        </div>
                    )}

                    <div className="text-sm text-slate-600 leading-6 whitespace-pre-wrap">
                        {release.boilerplate}
                    </div>

                    <div className="mt-8 text-sm text-slate-600 leading-6 whitespace-pre-wrap">
                        <p className="font-bold">Contact:</p>
                        {getContactInfo()}
                    </div>
                </div>
                 {/* Non-printable footer */}
                 <div className="mt-6 pt-4 border-t border-slate-200 flex-shrink-0 flex justify-end print:hidden">
                     <button onClick={onClose} className="px-6 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-md hover:bg-slate-200">
                        Close
                    </button>
                 </div>
            </div>
        </div>
    );
};

export default NewsReleaseViewer;