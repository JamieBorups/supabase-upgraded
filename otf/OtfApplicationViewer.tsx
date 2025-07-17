
import React from 'react';
import { marked } from 'marked';
import { OtfApplication } from '../../types';

const formatCurrency = (value: number) => value.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });

const Section: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = '' }) => (
    <section className={`py-4 ${className}`}>
        <h2 className="font-bold text-xl mb-2 border-b-2 border-teal-500 pb-2">{title}</h2>
        <div className="mt-4 space-y-4">{children}</div>
    </section>
);

const Field: React.FC<{ label: string; value?: string | number | boolean | string[]; children?: React.ReactNode; isHtml?: boolean }> = ({ label, value, children, isHtml = false }) => {
    if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0)) {
        return null;
    }

    let displayValue: React.ReactNode;
    if (isHtml && typeof value === 'string') {
        displayValue = <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: marked.parse(value) }} />;
    } else if (typeof value === 'boolean') {
        displayValue = value ? 'Yes' : 'No';
    } else if (Array.isArray(value)) {
        displayValue = <ul className="list-disc list-inside">{value.map((v, i) => <li key={i}>{v}</li>)}</ul>;
    } else {
        displayValue = <p>{String(value)}</p>;
    }

    return (
        <div className="not-prose">
            <h3 className="font-semibold text-slate-800">{label}</h3>
            <div className="mt-1">{children || displayValue}</div>
        </div>
    );
};

interface OtfApplicationViewerProps {
    application: OtfApplication;
    onBack: () => void;
}

const OtfApplicationViewer: React.FC<OtfApplicationViewerProps> = ({ application, onBack }) => {

    const { subtotal, adminFee, total } = React.useMemo(() => {
        const sub = (application.budgetItems || []).filter(item => item.category !== 'Overhead and Administration Costs')
                         .reduce((sum, item) => sum + (item.requestedAmount || 0), 0);
        const fee = sub * 0.15;
        const grandTotal = sub + fee;
        return { subtotal: sub, adminFee: fee, total: grandTotal };
    }, [application.budgetItems]);
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h1 className="text-2xl font-bold text-slate-900">{application.title || 'View OTF Application'}</h1>
                <button onClick={onBack} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100">
                    <i className="fa-solid fa-arrow-left mr-2"></i>Back to Reports
                </button>
            </div>
            <div id="otf-report-content" className="prose max-w-none p-4 bg-white">
                <Section title="Organization Information">
                    <Field label="Mission Statement" value={application.missionStatement} isHtml={true}/>
                    <Field label="Typical Activities" value={application.activitiesDescription} isHtml={true}/>
                    <Field label="Sector" value={application.sector} />
                    <Field label="People Served Annually" value={application.peopleServedAnnually} />
                    <Field label="Leadership Reflects Community" value={application.leadershipReflectsCommunity} />
                    <Field label="Languages of population served" value={application.languagePopulationServed} />
                </Section>

                <Section title="Project Information">
                    <Field label="Project Description" value={application.projDescription} isHtml={true} />
                    <Field label="Why and Who Benefits" value={application.projWhyAndWhoBenefits} isHtml={true}/>
                    <Field label="Funding Priority" value={application.projFundingPriority} />
                    <Field label="Objective" value={application.projObjective} />
                    <Field label="Impact Explanation" value={application.projImpactExplanation} isHtml={true}/>
                </Section>

                <Section title="Project Plan">
                    <Field label="Justification Introduction" value={application.justificationIntro} isHtml={true}/>
                    <table className="w-full mt-4 mb-4">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="p-2 text-left">Deliverable</th>
                                <th className="p-2 text-left">Key Task</th>
                                <th className="p-2 text-left">Timing</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(application.projectPlan || []).map(item => (
                                <tr key={item.id}>
                                    <td className="p-2">{item.deliverable}</td>
                                    <td className="p-2">{item.keyTask}</td>
                                    <td className="p-2">{item.timing}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {(application.projectPlan || []).map(item => item.justification ? (
                        <Field key={item.id} label={`Justification for: ${item.deliverable}`} value={item.justification} isHtml={true} />
                    ) : null)}
                    <Field label="Justification Conclusion" value={application.justificationOutro} isHtml={true}/>
                </Section>

                <Section title="Project Budget">
                    <table className="w-full">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="p-2 text-left">Category</th>
                                <th className="p-2 text-left">Item</th>
                                <th className="p-2 text-left">Cost Breakdown</th>
                                <th className="p-2 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(application.budgetItems || []).filter(item => item.category !== 'Overhead and Administration Costs').map(item => (
                                <tr key={item.id}>
                                    <td className="p-2">{item.category}</td>
                                    <td className="p-2">{item.itemDescription}</td>
                                    <td className="p-2">{item.costBreakdown}</td>
                                    <td className="p-2 text-right">{formatCurrency(item.requestedAmount || 0)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="font-bold">
                            <tr><td colSpan={3} className="p-2 text-right">Subtotal</td><td className="p-2 text-right">{formatCurrency(subtotal)}</td></tr>
                            <tr><td colSpan={3} className="p-2 text-right">Overhead & Administration (15%)</td><td className="p-2 text-right">{formatCurrency(adminFee)}</td></tr>
                            <tr className="text-lg"><td colSpan={3} className="p-2 text-right">Total Request</td><td className="p-2 text-right">{formatCurrency(total)}</td></tr>
                        </tfoot>
                    </table>
                </Section>
            </div>
        </div>
    );
};
