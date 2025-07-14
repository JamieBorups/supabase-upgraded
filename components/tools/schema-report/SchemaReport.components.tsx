
import React from 'react';

// --- Helper Functions and Components ---
export const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'undefined';
    if (Array.isArray(value)) return `[] (${value.length} items)`;
    if (typeof value === 'object') return `{...} (${Object.keys(value).length} keys)`;
    if (typeof value === 'string' && value === '') return '"" (empty string)';
    return String(value);
};

export const AccordionItem: React.FC<{
    title: string;
    description: string;
    children: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
}> = ({ title, description, children, isOpen, onToggle }) => (
    <div className="border border-slate-200 rounded-lg">
        <button
            onClick={onToggle}
            className="w-full text-left p-4 flex justify-between items-center bg-slate-50 hover:bg-slate-100 rounded-t-lg"
            aria-expanded={isOpen}
        >
            <div>
                <h3 className="font-bold text-lg text-slate-800">{title}</h3>
                <p className="text-sm text-slate-600">{description}</p>
            </div>
            <i className={`fa-solid fa-chevron-down text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
        </button>
        {isOpen && (
            <div className="p-4 border-t border-slate-200">
                {children}
            </div>
        )}
    </div>
);

export const SchemaTable: React.FC<{ dataObject: any; fieldConfig: { key: string; desc: string; }[] }> = ({ dataObject, fieldConfig }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full text-sm border-collapse">
            <thead className="bg-slate-100">
                <tr>
                    <th className="p-2 border border-slate-300 font-semibold text-slate-600 text-left w-1/4">Field Name</th>
                    <th className="p-2 border border-slate-300 font-semibold text-slate-600 text-left w-1/6">Data Type</th>
                    <th className="p-2 border border-slate-300 font-semibold text-slate-600 text-left w-auto">Description</th>
                    <th className="p-2 border border-slate-300 font-semibold text-slate-600 text-left w-1/4">Default Value</th>
                </tr>
            </thead>
            <tbody>
                {fieldConfig.map(({ key, desc }) => (
                    <tr key={key} className="bg-white hover:bg-slate-50">
                        <td className="p-2 border border-slate-300 font-mono text-slate-800">{key}</td>
                        <td className="p-2 border border-slate-300 font-mono text-slate-500">{typeof dataObject[key]}</td>
                        <td className="p-2 border border-slate-300 text-slate-700">{desc}</td>
                        <td className="p-2 border border-slate-300 text-slate-500 font-mono">{formatValue(dataObject[key])}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export const ConstantsTable: React.FC<{ title: string; constants: { value: string, label: string }[] }> = ({ title, constants }) => (
    <div className="mt-4">
        <h4 className="font-semibold text-md text-slate-700 mb-2">{title}</h4>
        <div className="overflow-x-auto max-h-48 border border-slate-200 rounded-md">
            <table className="min-w-full text-sm">
                <thead className="bg-slate-100 sticky top-0">
                    <tr>
                        <th className="p-2 border-b border-slate-300 font-semibold text-slate-600 text-left w-1/2">Value</th>
                        <th className="p-2 border-b border-slate-300 font-semibold text-slate-600 text-left w-1/2">Label</th>
                    </tr>
                </thead>
                <tbody className="bg-white">
                    {constants.map(c => (
                        <tr key={c.value}>
                            <td className="p-2 border-b border-slate-200 font-mono">{c.value}</td>
                            <td className="p-2 border-b border-slate-200">{c.label}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);
