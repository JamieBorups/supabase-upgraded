

import React, { useState, useEffect } from 'react';
import { produce } from 'immer';
import { useAppContext } from '../../context/AppContext';
import { AppSettings, InventoryCategory } from '../../types';
import FormField from '../ui/FormField';
import { Input } from '../ui/Input';
import * as api from '../../services/api';

const SalesSettingsPage: React.FC = () => {
    const { state, dispatch, notify } = useAppContext();
    const [taxSettings, setTaxSettings] = useState<AppSettings['sales']>(state.settings.sales);
    const [isTaxDirty, setIsTaxDirty] = useState(false);

    const [categories, setCategories] = useState<InventoryCategory[]>(state.inventoryCategories);
    const [newCategoryName, setNewCategoryName] = useState('');

    useEffect(() => {
        setCategories(state.inventoryCategories);
    }, [state.inventoryCategories]);
    
    const handleTaxChange = (field: keyof AppSettings['sales'], value: number) => {
        setTaxSettings(prev => ({ ...prev, [field]: value }));
        setIsTaxDirty(true);
    };

    const handleSaveTaxes = async () => {
        const newSettings = produce(state.settings, draft => {
            draft.sales = taxSettings;
        });
        try {
            await api.updateSettings(newSettings);
            dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
            setIsTaxDirty(false);
            notify('Sales tax settings saved!', 'success');
        } catch (error: any) {
            notify(`Error saving settings: ${error.message}`, 'error');
        }
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;
        try {
            const newCategory = await api.addInventoryCategory({ name: newCategoryName.trim() } as InventoryCategory);
            dispatch({ type: 'ADD_INVENTORY_CATEGORY', payload: newCategory });
            // The useEffect will update the local 'categories' state from global state.
            setNewCategoryName('');
            notify('Category added!', 'success');
        } catch (error: any) {
            notify(`Error adding category: ${error.message}`, 'error');
        }
    };
    
    const handleDeleteCategory = async (id: string) => {
        if(window.confirm('Are you sure? Deleting a category will unlink it from all inventory items, but will not delete the items themselves.')) {
            try {
                await api.deleteInventoryCategory(id);
                dispatch({ type: 'DELETE_INVENTORY_CATEGORY', payload: id });
                // The useEffect will update local state.
                notify('Category deleted.', 'success');
            } catch (error: any) {
                 notify(`Error deleting category: ${error.message}`, 'error');
            }
        }
    };

    const handleCategoryNameChange = (id: string, newName: string) => {
        setCategories(produce(draft => {
            const category = draft.find(c => c.id === id);
            if (category) {
                category.name = newName;
            }
        }));
    };

    const handleCategoryNameBlur = async (id: string) => {
        const localCategory = categories.find(c => c.id === id);
        const globalCategory = state.inventoryCategories.find(c => c.id === id);

        if (!localCategory || !globalCategory || localCategory.name.trim() === globalCategory.name.trim()) {
            if (localCategory && globalCategory && localCategory.name.trim() !== globalCategory.name.trim()) {
                setCategories(state.inventoryCategories); // Revert if only whitespace changed
            }
            return; // No change, do nothing
        }

        try {
            const updatedCategory = await api.updateInventoryCategory(id, { name: localCategory.name.trim() });
            dispatch({ type: 'UPDATE_INVENTORY_CATEGORY', payload: updatedCategory });
            notify('Category updated!', 'success');
        } catch (error: any) {
            notify(`Error updating category: ${error.message}`, 'error');
            setCategories(state.inventoryCategories); // Revert local state on error
        }
    };

    return (
        <div className="space-y-12">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Tax Settings</h2>
                <p className="mt-1 text-sm text-slate-500">Configure sales tax rates for your region. Rates should be decimals (e.g., 0.07 for 7%).</p>
                
                <div className="mt-6 space-y-4 max-w-sm">
                    <FormField label="Provincial Sales Tax (PST) Rate" htmlFor="pstRate">
                        <Input type="number" step="0.001" id="pstRate" value={taxSettings.pstRate} onChange={e => handleTaxChange('pstRate', parseFloat(e.target.value) || 0)} />
                    </FormField>
                    <FormField label="Goods and Services Tax (GST) Rate" htmlFor="gstRate">
                        <Input type="number" step="0.001" id="gstRate" value={taxSettings.gstRate} onChange={e => handleTaxChange('gstRate', parseFloat(e.target.value) || 0)} />
                    </FormField>
                </div>
                <div className="mt-6 pt-5 border-t border-slate-200">
                    <button onClick={handleSaveTaxes} disabled={!isTaxDirty} className="px-6 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700 disabled:bg-slate-400">
                        Save Tax Settings
                    </button>
                </div>
            </div>
            
             <div>
                <h2 className="text-2xl font-bold text-slate-900">Inventory Categories</h2>
                <p className="mt-1 text-sm text-slate-500">Manage categories to organize your inventory items.</p>
                <div className="mt-6 max-w-md space-y-3">
                    <div className="space-y-2">
                        {categories.map(cat => (
                            <div key={cat.id} className="flex justify-between items-center gap-2">
                                <Input
                                    value={cat.name}
                                    onChange={(e) => handleCategoryNameChange(cat.id, e.target.value)}
                                    onBlur={() => handleCategoryNameBlur(cat.id)}
                                    className="flex-grow"
                                    aria-label={`Category name for ${cat.name}`}
                                />
                                <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-500 hover:text-red-700 text-sm p-2 flex-shrink-0" aria-label={`Delete category ${cat.name}`}>
                                    <i className="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        ))}
                    </div>
                    <form onSubmit={handleAddCategory} className="flex gap-2 pt-2 border-t border-slate-200">
                        <Input value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="New category name..." />
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700">Add</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SalesSettingsPage;