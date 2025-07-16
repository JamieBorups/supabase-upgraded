
import React from 'react';
import { OtfCollaborator } from '../../types';
import { Input } from '../ui/Input';

interface OtfCollaboratorsTableProps {
    items: OtfCollaborator[];
    onChange: (items: OtfCollaborator[]) => void;
}

const OtfCollaboratorsTable: React.FC<OtfCollaboratorsTableProps> = ({ items, onChange }) => {
    
    const handleUpdate = (index: number, value: string) => {
        const newItems = [...items];
        newItems[index].organizationName = value;
        onChange(newItems);
    };

    const handleAdd = () => {
        const newItem: OtfCollaborator = { id: `collab_${Date.now()}`, application_id: '', organizationName: '' };
        onChange([...items, newItem]);
    };

    const handleRemove = (index: number) => {
        onChange(items.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-3">
            {items.map((item, index) => (
                <div key={item.id} className="flex gap-3 items-center">
                    <Input 
                        value={item.organizationName} 
                        onChange={e => handleUpdate(index, e.target.value)}
                        placeholder="Organization Name"
                        className="flex-grow"
                    />
                    <button type="button" onClick={() => handleRemove(index)} className="text-red-500 p-2 flex-shrink-0"><i className="fa fa-trash"></i></button>
                </div>
            ))}
             <button type="button" onClick={handleAdd} className="mt-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                <i className="fa-solid fa-plus mr-2"></i>Add Collaborator
            </button>
        </div>
    );
};

export default OtfCollaboratorsTable;
