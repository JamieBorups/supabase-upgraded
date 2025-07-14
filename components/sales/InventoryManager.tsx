

import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext.tsx';
import { InventoryItem, InventoryCategory } from '../../types.ts';
import { initialInventoryItem } from '../../constants.ts';
import ConfirmationModal from '../ui/ConfirmationModal.tsx';
import { Input } from '../ui/Input.tsx';
import { Select } from '../ui/Select.tsx';
import FormField from '../ui/FormField.tsx';
import ToggleSwitch from '../ui/ToggleSwitch.tsx';
import * as api from '../../services/api.ts';
import { TextareaWithCounter } from '../ui/TextareaWithCounter.tsx';

const formatCurrency = (value: number) => value.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });

const InventoryEditor: React.FC<{ 
    item: InventoryItem | null; 
    onSave: (item: InventoryItem) => void;
    onCancel: () => void;
}> = ({ item, onSave, onCancel }) => {
    const { state } = useAppContext();
    const { inventoryCategories } = state;
    const [formData, setFormData] = useState<InventoryItem>(item || { ...initialInventoryItem, id: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });

    const handleChange = <K extends keyof InventoryItem>(field: K, value: InventoryItem[K]) => {
        setFormData(prev => ({...prev, [field]: value}));
    }
    
    const handleTrackStockChange = (checked: boolean) => {
        setFormData(prev => ({
            ...prev, 
            trackStock: checked,
            currentStock: checked ? prev.currentStock : 0 
        }));
    }

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    }
    
    if (!item) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
            <form onSubmit={handleSave} className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl">
                <h3 className="text-xl font-bold text-slate-800 mb-6">{item.id ? 'Edit' : 'Add New'} Inventory Item</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    
                    {/* Column 1 */}
                    <div className="space-y-4">
                        <FormField label="Item Name" htmlFor="name" required>
                            <Input id="name" value={formData.name} onChange={e => handleChange('name', e.target.value)} />
                        </FormField>
                        <FormField label="Description" htmlFor="description">
                            <TextareaWithCounter id="description" value={formData.description} onChange={e => handleChange('description', e.target.value)} rows={4} wordLimit={150} />
                        </FormField>
                        <FormField label="Category" htmlFor="category">
                            <Select id="category" value={formData.categoryId || ''} onChange={e => handleChange('categoryId', e.target.value || null)} options={[{value: '', label: 'Select category...'}, ...inventoryCategories.map(c => ({value: c.id, label: c.name}))]} />
                        </FormField>
                         <FormField label="SKU (Stock Keeping Unit)" htmlFor="sku">
                            <Input id="sku" value={formData.sku} onChange={e => handleChange('sku', e.target.value)} />
                        </FormField>
                    </div>

                    {/* Column 2 */}
                    <div className="space-y-4">
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                             <h4 className="font-semibold text-slate-700 mb-3">Pricing</h4>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField label="Cost Price" htmlFor="costPrice">
                                    <Input type="number" step="0.01" id="costPrice" value={formData.costPrice} onChange={e => handleChange('costPrice', parseFloat(e.target.value) || 0)} />
                                </FormField>
                                <FormField label="Sale Price" htmlFor="salePrice">
                                    <Input type="number" step="0.01" id="salePrice" value={formData.salePrice} onChange={e => handleChange('salePrice', parseFloat(e.target.value) || 0)} />
                                </FormField>
                            </div>
                        </div>

                         <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                             <h4 className="font-semibold text-slate-700 mb-3">Stock Management</h4>
                             <FormField label="" htmlFor="trackStock" className="mb-0">
                                <ToggleSwitch id="trackStock" checked={formData.trackStock} onChange={handleTrackStockChange} label="Track stock for this item"/>
                            </FormField>
                            {formData.trackStock && (
                                 <FormField label="Current Stock" htmlFor="stock" className="mt-4">
                                    <Input type="number" step="1" id="stock" value={formData.currentStock} onChange={e => handleChange('currentStock', parseInt(e.target.value) || 0)} />
                                </FormField>
                            )}
                        </div>
                    </div>
                </div>
                <div className="mt-8 flex justify-end space-x-3 pt-5 border-t">
                    <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-md hover:bg-slate-200">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md shadow-sm hover:bg-teal-700">Save Item</button>
                </div>
            </form>
        </div>
    );
};

const InventoryManager: React.FC = () => {
    const { state, dispatch, notify } = useAppContext();
    const { inventoryItems, inventoryCategories } = state;
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null);

    const categoryMap = useMemo(() => new Map(inventoryCategories.map(c => [c.id, c.name])), [inventoryCategories]);

    const handleAdd = () => {
        const now = new Date().toISOString();
        setCurrentItem({ ...initialInventoryItem, id: '', createdAt: now, updatedAt: now });
        setIsEditorOpen(true);
    };

    const handleEdit = (item: InventoryItem) => {
        setCurrentItem(item);
        setIsEditorOpen(true);
    };

    const handleDelete = (id: string) => {
        setItemToDelete(id);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await api.deleteInventoryItem(itemToDelete);
            dispatch({ type: 'DELETE_INVENTORY_ITEM', payload: itemToDelete });
            notify('Item deleted.', 'success');
        } catch (e: any) { notify(e.message, 'error'); }
        setItemToDelete(null);
    };

    const handleSave = async (item: InventoryItem) => {
        const isNew = !item.id;
        try {
            let savedItem: InventoryItem;
            if (isNew) {
                savedItem = await api.addInventoryItem(item);
                dispatch({ type: 'ADD_INVENTORY_ITEM', payload: savedItem });
            } else {
                savedItem = await api.updateInventoryItem(item.id, item);
                dispatch({ type: 'UPDATE_INVENTORY_ITEM', payload: savedItem });
            }
            notify(`Item ${isNew ? 'created' : 'updated'}.`, 'success');
        } catch(e: any) { notify(`Error: ${e.message}`, 'error'); }
        setIsEditorOpen(false);
        setCurrentItem(null);
    };
    
    const filteredItems = useMemo(() => {
        return inventoryItems.filter(item => {
            const searchMatch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || (item.description || '').toLowerCase().includes(searchTerm.toLowerCase());
            const categoryMatch = !categoryFilter || item.categoryId === categoryFilter;
            return searchMatch && categoryMatch;
        });
    }, [inventoryItems, searchTerm, categoryFilter]);
    
    const tableHeaders = ['Name', 'Category', 'Cost', 'Sale Price', 'Margin', 'Stock', ''];
    return (
        <div>
            {isEditorOpen && <InventoryEditor item={currentItem} onSave={handleSave} onCancel={() => setIsEditorOpen(false)} />}
            {itemToDelete && <ConfirmationModal isOpen={!!itemToDelete} onClose={() => setItemToDelete(null)} onConfirm={confirmDelete} title="Delete Item" message="Are you sure? This action cannot be undone." />}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <Input placeholder="Search by name or description..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="sm:col-span-2"/>
                <Select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} options={[{value: '', label: 'All Categories'}, ...inventoryCategories.map(c => ({ value: c.id, label: c.name }))]} />
            </div>
            <div className="text-right mb-4">
                <button onClick={handleAdd} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md shadow-sm hover:bg-teal-700">
                    <i className="fa-solid fa-plus mr-2"></i>Add New Item
                </button>
            </div>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-100">
                        <tr>
                            {tableHeaders.map(h => (
                                <th key={h} scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                       {filteredItems.map(item => {
                           const margin = item.salePrice - item.costPrice;
                           const marginPercent = item.salePrice > 0 ? (margin / item.salePrice) * 100 : 0;
                           const marginClass = margin < 0 ? 'text-red-600' : 'text-green-600';
                           return (
                            <tr key={item.id}>
                                <td className="px-6 py-4 whitespace-nowrap"><div className="font-semibold text-slate-800">{item.name}</div><div className="text-xs text-slate-500">{item.description}</div></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{categoryMap.get(item.categoryId || '') || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{formatCurrency(item.costPrice)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{formatCurrency(item.salePrice)}</td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${marginClass}`}>{formatCurrency(margin)} ({marginPercent.toFixed(0)}%)</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {item.trackStock ? item.currentStock : <span className="italic text-slate-500">Untracked</span>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                    <button onClick={() => handleEdit(item)} className="px-3 py-1 text-xs font-semibold text-teal-700 bg-teal-100 hover:bg-teal-200 rounded-md">Edit</button>
                                    <button onClick={() => handleDelete(item.id)} className="px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 hover:bg-red-200 rounded-md">Delete</button>
                                </td>
                            </tr>
                           )
                       })}
                    </tbody>
                </table>
                 {filteredItems.length === 0 && <p className="text-center text-slate-500 py-10">No inventory items found.</p>}
            </div>
        </div>
    );
};

export default InventoryManager;