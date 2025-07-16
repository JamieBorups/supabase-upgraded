
import React from 'react';
import { OtfProjectPlanItem } from '../../types';
import { Input } from '../ui/Input';
import FormField from '../ui/FormField';
import { TextareaWithCounter } from '../ui/TextareaWithCounter';

interface OtfProjectPlanTableProps {
    items: OtfProjectPlanItem[];
    onChange: (items: OtfProjectPlanItem[]) => void;
    onGenerateJustification: (item: OtfProjectPlanItem, index: number) => void;
    isLoading: boolean;
    loadingField: string | null;
}

const OtfProjectPlanTable: React.FC<OtfProjectPlanTableProps> = ({ items, onChange, onGenerateJustification, isLoading, loadingField }) => {
    
    const handleUpdate = (index: number, field: keyof Omit<OtfProjectPlanItem, 'id' | 'application_id' | 'order'>, value: any) => {
        const newItems = [...items];
        (newItems[index] as any)[field] = value;
        onChange(newItems);
    };

    return (
        <div className="space-y-4">
            <div className="hidden md:grid grid-cols-12 gap-3 text-xs font-bold text-slate-600">
                <div className="col-span-4">Project Deliverables</div>
                <div className="col-span-4">Key Tasks</div>
                <div className="col-span-4">Timing</div>
            </div>
            {items.map((item, index) => (
                <div key={item.id} className="border-t pt-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                        <div className="col-span-12 md:col-span-4"><Input value={item.deliverable} onChange={e => handleUpdate(index, 'deliverable', e.target.value)} /></div>
                        <div className="col-span-12 md:col-span-4"><Input value={item.keyTask} onChange={e => handleUpdate(index, 'keyTask', e.target.value)} /></div>
                        <div className="col-span-12 md:col-span-4"><Input value={item.timing} onChange={e => handleUpdate(index, 'timing', e.target.value)} /></div>
                    </div>
                    <div className="col-span-12">
                        <FormField label="Justification" htmlFor={`justification-${index}`} instructions="Explicitly link the deliverable, tasks and timing to be 100% aligned with the Framework for Recreation in Canada (2024 Update) goals, appropriate for the selected Sector. Max 500 words.">
                             <TextareaWithCounter id={`justification-${index}`} value={item.justification || ''} onChange={e => handleUpdate(index, 'justification', e.target.value)} rows={6} wordLimit={500} />
                        </FormField>
                         <div className="text-right mt-1">
                            <button
                                type="button"
                                onClick={() => onGenerateJustification(item, index)}
                                disabled={isLoading}
                                className="px-3 py-1 text-xs font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:bg-slate-400"
                            >
                                <i className={`fa-solid ${isLoading && loadingField === `justification_${index}` ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'} mr-2`}></i>
                                Draft Justification
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default OtfProjectPlanTable;