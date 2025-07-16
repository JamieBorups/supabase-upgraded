
import React from 'react';
import { OtfSeniorStaff } from '../../types';
import { Input } from '../ui/Input';
import { RadioGroup } from '../ui/RadioGroup';

interface OtfSeniorStaffTableProps {
    items: OtfSeniorStaff[];
    onChange: (items: OtfSeniorStaff[]) => void;
}

const OtfSeniorStaffTable: React.FC<OtfSeniorStaffTableProps> = ({ items, onChange }) => {
    
    const handleUpdate = (index: number, field: keyof OtfSeniorStaff, value: any) => {
        const newItems = [...items];
        (newItems[index] as any)[field] = value;
        onChange(newItems);
    };

    const handleAdd = () => {
        const newItem: OtfSeniorStaff = { id: `staff_${Date.now()}`, application_id: '', firstName: '', lastName: '', position: '', isArmsLength: true };
        onChange([...items, newItem]);
    };

    const handleRemove = (index: number) => {
        onChange(items.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-4">
            <div className="hidden md:grid grid-cols-10 gap-3 text-xs font-bold text-slate-600">
                <div className="col-span-3">First Name</div>
                <div className="col-span-3">Last Name</div>
                <div className="col-span-2">Position</div>
                <div className="col-span-1">Arm's Length?</div>
                <div className="col-span-1"></div>
            </div>
            {items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-10 gap-3 items-start border-t pt-3">
                    <div className="col-span-12 md:col-span-3"><Input value={item.firstName} onChange={e => handleUpdate(index, 'firstName', e.target.value)} placeholder="First Name" /></div>
                    <div className="col-span-12 md:col-span-3"><Input value={item.lastName} onChange={e => handleUpdate(index, 'lastName', e.target.value)} placeholder="Last Name" /></div>
                    <div className="col-span-12 md:col-span-2"><Input value={item.position} onChange={e => handleUpdate(index, 'position', e.target.value)} placeholder="Position" /></div>
                    <div className="col-span-12 md:col-span-1"><RadioGroup name={`staffarmslength-${index}`} selectedValue={item.isArmsLength ? 'yes' : 'no'} onChange={val => handleUpdate(index, 'isArmsLength', val === 'yes')} options={[{value: 'yes', label: 'Y'}, {value: 'no', label: 'N'}]} /></div>
                    <div className="col-span-12 md:col-span-1"><button type="button" onClick={() => handleRemove(index)} className="text-red-500 p-2"><i className="fa fa-trash"></i></button></div>
                </div>
            ))}
             <button type="button" onClick={handleAdd} className="mt-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                <i className="fa-solid fa-plus mr-2"></i>Add Senior Staff
            </button>
        </div>
    );
};

export default OtfSeniorStaffTable;
