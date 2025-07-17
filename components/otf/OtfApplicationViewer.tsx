

import React, { useMemo } from 'react';
import { OtfApplication } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { generateOtfPdf } from '../../utils/pdfGenerator';

interface OtfApplicationViewerProps {
    application: OtfApplication;
    onBack: () => void;
}

const formatCurrency = (value: number) => value.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });

const ViewField: React.FC<{ label: string; value?: React.ReactNode; children?: React.ReactNode }> = ({ label, value, children }) => (
    <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{label}</h3>
        {value && <div className="mt-1 text-slate-900">{value}</div>}
        {children && <div className="mt-1 text-slate-900 prose prose-slate max-w-none prose-p:my-1 prose-ul:my-1 whitespace-pre-wrap">{children}</div>}
    </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="pt-6 mt-6 border-t border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">{title}</h2>
        <div className="space-y-4">{children}</div>
    </div>
);

export const OtfApplicationViewer: React.FC<OtfApplicationViewerProps> = ({ application, onBack }) => {
    const { state } = useAppContext();
    const project = useMemo(() => application.projectId ? state.projects.find(p => p.id === application.projectId) : null, [state.projects, application.projectId]);

    const { subtotal, adminFee, total } = React.useMemo(() => {
        const sub = (application.budgetItems || []).filter(item => item.category !== 'Overhead and Administration Costs')
                         .reduce((sum, item) => sum + (item.requestedAmount || 0), 0);
        const fee = sub * 0.15;
        const grandTotal = sub + fee;
        return { subtotal: sub, adminFee: fee, total: grandTotal };
    }, [application.budgetItems]);

    return (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-5">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{application.title || 'OTF Application'}</h1>
                    <p className="text-sm text-slate-500">Context Project: <span className="font-semibold text-teal-600">{project?.projectTitle || 'N/A'}</span></p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => generateOtfPdf(application)} className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-md shadow-sm hover:bg-rose-700">
                        <i className="fa-solid fa-file-pdf mr-2"></i>Download PDF
                    </button>
                    <button onClick={onBack} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100">
                        <i className="fa-solid fa-arrow-left mr-2"></i>Back to Reports
                    </button>
                </div>
            </div>
            
            <Section title="Organization Information">
                <ViewField label="Mission Statement" value={application.missionStatement} />
                <ViewField label="Typical Activities" value={application.activitiesDescription} />
                <ViewField label="Sector" value={application.sector} />
            </Section>
            
            <Section title="Project Information">
                <ViewField label="Project Description" value={application.projDescription} />
                <ViewField label="Funding Priority" value={application.projFundingPriority} />
                <ViewField label="Why This Project & Who Benefits" value={application.projWhyAndWhoBenefits} />
            </Section>

            <Section title="Project Plan">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deliverable</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key Task</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timing</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {application.projectPlan.map(item => (
                            <tr key={item.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{item.deliverable}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{item.keyTask}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{item.timing}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Section>
            
            <Section title="Justification">
                <ViewField label="Introduction" value={application.justificationIntro} />
                {application.projectPlan.map(item => {
                    if (item.justification) {
                        return <ViewField key={item.id} label={`Justification for: ${item.deliverable}`} value={item.justification} />;
                    }
                    return null;
                })}
                <ViewField label="Conclusion" value={application.justificationOutro} />
            </Section>

            <Section title="Board of Directors">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Term Start</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Term End</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {application.boardMembers.map(m => (
                            <tr key={m.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{`${m.firstName} ${m.lastName}`}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{m.position}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{m.termStartDate}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{m.termEndDate}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Section>
            
            <Section title="Project Budget">
                 <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {application.budgetItems.filter(item => item.category !== 'Overhead and Administration Costs').map(item => (
                            <tr key={item.id}>
                                <td className="px-6 py-4">{item.category}</td>
                                <td className="px-6 py-4">{item.itemDescription}</td>
                                <td className="px-6 py-4 text-right">{formatCurrency(item.requestedAmount)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-gray-100 font-bold">
                        <tr>
                            <td colSpan={2} className="px-6 py-3 text-right">Subtotal</td>
                            <td className="px-6 py-3 text-right">{formatCurrency(subtotal)}</td>
                        </tr>
                         <tr>
                            <td colSpan={2} className="px-6 py-3 text-right">Overhead & Administration (15%)</td>
                            <td className="px-6 py-3 text-right">{formatCurrency(adminFee)}</td>
                        </tr>
                         <tr>
                            <td colSpan={2} className="px-6 py-3 text-right text-lg">Total</td>
                            <td className="px-6 py-3 text-right text-lg">{formatCurrency(total)}</td>
                        </tr>
                    </tfoot>
                </table>
            </Section>
        </div>
    );
};
