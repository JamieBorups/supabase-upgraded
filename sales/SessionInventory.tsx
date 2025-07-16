import React, { useMemo, useState } from 'react';
import { produce } from 'immer';
import { useAppContext } from '../../context/AppContext';
import { SaleSession, InventoryItem, InventoryCategory } from '../../types';
import * as api from '../../services/api';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { initialInventoryItem } from '../../constants';
import FormField from '../ui/FormField';
import ToggleSwitch from '../ui/ToggleSwitch';
import { TextareaWithCounter } from '../ui/TextareaWithCounter';

const InventoryEditorModal: React.FC<{ 
    isOpen: boolean;
    onSave: (item: InventoryItem) => void;
    onCancel: () => void;
}> = ({ isOpen, onSave, onCancel }) => {
    const { state } = useAppContext();
    const { inventoryCategories } = state;
    const [formData, setFormData] = useState<InventoryItem>({ ...initialInventoryItem, id: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });

    const handleChange = <K extends keyof InventoryItem>(field: K, value: InventoryItem[K]) => {
        setFormData(prev => ({...prev, [field]: value}));
    }
    
    const handleTrackStockChange = (checked: boolean) => {
        setFormData(prev => ({ ...prev, trackStock: checked, currentStock: checked ? prev.currentStock : 0 }));
    }

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    }
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-[70] flex justify-center items-center p-4">
            <form onSubmit={handleSave} className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Add New Inventory Item</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <div className="space-y-4">
                        <FormField label="Item Name" htmlFor="name" required><Input id="name" value={formData.name} onChange={e => handleChange('name', e.target.value)} /></FormField>
                        <FormField label="Description" htmlFor="description"><TextareaWithCounter id="description" value={formData.description} onChange={e => handleChange('description', e.target.value)} rows={4} wordLimit={150} /></FormField>
                        <FormField label="Category" htmlFor="category"><Select id="category" value={formData.categoryId || ''} onChange={e => handleChange('categoryId', e.target.value || null)} options={[{value: '', label: 'Select category...'}, ...inventoryCategories.map(c => ({value: c.id, label: c.name}))]} /></FormField>
                        <FormField label="SKU (Stock Keeping Unit)" htmlFor="sku"><Input id="sku" value={formData.sku} onChange={e => handleChange('sku', e.target.value)} /></FormField>
                    </div>
                    <div className="space-y-4">
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg"><h4 className="font-semibold text-slate-700 mb-3">Pricing</h4><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><FormField label="Cost Price" htmlFor="costPrice"><Input type="number" step="0.01" id="costPrice" value={formData.costPrice} onChange={e => handleChange('costPrice', parseFloat(e.target.value) || 0)} /></FormField><FormField label="Sale Price" htmlFor="salePrice"><Input type="number" step="0.01" id="salePrice" value={formData.salePrice} onChange={e => handleChange('salePrice', parseFloat(e.target.value) || 0)} /></FormField></div></div>
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg"><h4 className="font-semibold text-slate-700 mb-3">Stock Management</h4><FormField label="" htmlFor="trackStock" className="mb-0"><ToggleSwitch id="trackStock" checked={formData.trackStock} onChange={handleTrackStockChange} label="Track stock for this item"/></FormField>{formData.trackStock && (<FormField label="Current Stock" htmlFor="stock" className="mt-4"><Input type="number" step="1" id="stock" value={formData.currentStock} onChange={e => handleChange('currentStock', parseInt(e.target.value) || 0)} /></FormField>)}</div>
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

interface SessionInventoryProps {
    saleSession: SaleSession;
}

const SessionInventory: React.FC<SessionInventoryProps> = ({ saleSession }) => {
    const { state, dispatch, notify } = useAppContext();
    const { inventoryItems, saleListings } = state;
    const [isEditorOpen, setIsEditorOpen] = useState(false);

    const { itemsInSession, availableItems } = useMemo(() => {
        const listedItemIds = new Set(
            saleListings
                .filter(l => l.saleSessionId === saleSession.id)
                .map(l => l.inventoryItemId)
        );

        const sessionItems = inventoryItems.filter(item => listedItemIds.has(item.id));
        const otherItems = inventoryItems.filter(item => !listedItemIds.has(item.id));

        return { itemsInSession: sessionItems, availableItems: otherItems };
    }, [saleSession.id, inventoryItems, saleListings]);
    
    const handleToggleListing = async (itemId: string) => {
        const sessionId = saleSession.id;
        const isListed = itemsInSession.some(item => item.id === itemId);

        try {
            if (isListed) {
                await api.removeSaleListing(sessionId, itemId);
                dispatch({ type: 'DELETE_SALE_LISTING', payload: { saleSessionId: sessionId, inventoryItemId: itemId } });
                notify('Item removed from session.', 'success');
            } else {
                const newListing = await api.addSaleListing(sessionId, itemId);
                dispatch({ type: 'ADD_SALE_LISTING', payload: newListing });
                notify('Item added to session.', 'success');
            }
        } catch (e: any) {
            notify(`Error: ${e.message}`, 'error');
        }
    };
    
    const handleAddNewItemAndList = async (item: InventoryItem) => {
        try {
            const savedItem = await api.addInventoryItem(item);
            dispatch({ type: 'ADD_INVENTORY_ITEM', payload: savedItem });
            
            const newListing = await api.addSaleListing(saleSession.id, savedItem.id);
            dispatch({ type: 'ADD_SALE_LISTING', payload: newListing });
            
            notify(`Item "${savedItem.name}" created and added to session.`, 'success');
            setIsEditorOpen(false);
        } catch(e: any) {
            notify(`Error: ${e.message}`, 'error');
        }
    };

    return (
        <div>
            <InventoryEditorModal 
                isOpen={isEditorOpen} 
                onSave={handleAddNewItemAndList} 
                onCancel={() => setIsEditorOpen(false)} 
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-slate-50 border rounded-lg h-[60vh] flex flex-col">
                    <h3 className="font-bold text-lg mb-3 flex-shrink-0">Items in this Session ({itemsInSession.length})</h3>
                    <div className="flex-grow overflow-y-auto space-y-2 pr-2 -mr-2">
                       {itemsInSession.map(item => (
                           <div key={item.id} className="flex justify-between items-center p-2 bg-white rounded-md shadow-sm">
                               <span className="font-medium text-sm">{item.name}</span>
                               <button onClick={() => handleToggleListing(item.id)} className="px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 hover:bg-red-200 rounded-md">Remove</button>
                           </div>
                       ))}
                       {itemsInSession.length === 0 && <p className="text-center text-slate-500 italic py-8">No items in this session.</p>}
                    </div>
                </div>
                <div className="p-4 bg-slate-50 border rounded-lg h-[60vh] flex flex-col">
                    <h3 className="font-bold text-lg mb-3 flex-shrink-0">Available Items to Add ({availableItems.length})</h3>
                    <div className="flex-grow overflow-y-auto space-y-2 pr-2 -mr-2">
                        {availableItems.map(item => (
                           <div key={item.id} className="flex justify-between items-center p-2 bg-white rounded-md shadow-sm">
                               <span className="font-medium text-sm">{item.name}</span>
                               <button onClick={() => handleToggleListing(item.id)} className="px-2 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md">Add</button>
                           </div>
                       ))}
                       {availableItems.length === 0 && <p className="text-center text-slate-500 italic py-8">All inventory items are already in this session.</p>}
                    </div>
                     <div className="pt-4 mt-4 border-t flex-shrink-0">
                        <button onClick={() => setIsEditorOpen(true)} className="w-full px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md shadow-sm hover:bg-teal-700">
                            <i className="fa-solid fa-plus mr-2"></i>Add New Item to Inventory & Session
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SessionInventory;
