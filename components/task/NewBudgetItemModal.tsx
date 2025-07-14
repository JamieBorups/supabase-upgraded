import React, { useState, useMemo } from 'react';
import { produce } from 'immer';
import { useAppContext } from '../../context/AppContext';
import FormField from '../ui/FormField';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { BudgetItem, DetailedBudget } from '../../types';
import { EXPENSE_FIELDS } from '../../constants';

interface NewBudgetItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    onItemCreated: (newBudgetItemId: string) => void;
}

type ExpenseCategory = keyof DetailedBudget['expenses'];

const NewBudgetItemModal: React.FC<NewBudgetItemModalProps> = ({ isOpen, onClose, projectId, onItemCreated }) => {
    const { state, dispatch } = useAppContext();
    const [category, setCategory] = useState<ExpenseCategory | ''>('');
    const [source, setSource] = useState('');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState<number | ''>('');

    const project = useMemo(() => state.projects.find(p => p.id === projectId), [projectId, state.projects]);

    const categoryOptions = useMemo(() => {
        return Object.keys(EXPENSE_FIELDS).map(key => ({
            value: key,
            label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
        }));
    }, []);

    const sourceOptions = useMemo(() => {
        if (!category) return [];
        return EXPENSE_FIELDS[category as ExpenseCategory].map(field => ({
            value: field.key,
            label: field.label
        }));
    }, [category]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!project || !category || !source || amount === '') return;

        const newItem: BudgetItem = {
            id: `item_${Date.now()}_${Math.random()}`,
            source,
            description,
            amount: Number(amount),
        };
        
        const newFormData = produce(project, draft => {
            if (!draft.budget) {
                draft.budget = { expenses: {}, revenues: {} } as any;
            }
            if (!draft.budget.expenses[category]) {
                draft.budget.expenses[category] = [];
            }
            draft.budget.expenses[category].push(newItem);
        });

        dispatch({ type: 'UPDATE_PROJECT_PARTIAL', payload: { projectId, data: { budget: newFormData.budget } } });

        onItemCreated(newItem.id);
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-[60] flex justify-center items-center p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <h3 className="text-xl font-bold text-slate-800 mb-4">Add New Budget Item</h3>
                    <div className="space-y-4">
                        <FormField label="Expense Category" htmlFor="b_cat" required>
                            <Select 
                                options={[{value: '', label: 'Select category...'}, ...categoryOptions]} 
                                value={category} 
                                onChange={e => { setCategory(e.target.value as ExpenseCategory); setSource(''); }}
                            />
                        </FormField>
                        <FormField label="Item Type / Source" htmlFor="b_source" required>
                            <Select 
                                options={[{value: '', label: 'Select type...'}, ...sourceOptions]} 
                                value={source} 
                                onChange={e => setSource(e.target.value)} 
                                disabled={!category}
                            />
                        </FormField>
                        <FormField label="Description" htmlFor="b_desc">
                            <Input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g., Lead artist fee" />
                        </FormField>
                         <FormField label="Amount" htmlFor="b_amount" required>
                            <Input type="number" value={amount} onChange={e => setAmount(parseFloat(e.target.value) || '')} step="0.01" placeholder="0.00" />
                        </FormField>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-md hover:bg-slate-200">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md shadow-sm hover:bg-teal-700">Add Item</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewBudgetItemModal;
