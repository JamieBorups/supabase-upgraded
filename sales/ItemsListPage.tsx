

import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext.tsx';
import { InventoryItem, Event, ItemList } from '../../types.ts';
import { Select } from '../ui/Select.tsx';
import { Input } from '../ui/Input.tsx';
import { initialItemListData } from '../../constants.ts';
import ConfirmationModal from '../ui/ConfirmationModal.tsx';
import FormField from '../ui/FormField.tsx';
import * as api from '../../services/api.ts';

const formatCurrency = (value: number) => value.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });

const DraggableMenuItem: React.FC<{
    item: InventoryItem;
    index: number;
    onDragStart: (index: number) => void;
    onDrop: (targetIndex: number) => void;
    onRemove: (itemId: string) => void;
}> = ({ item, index, onDragStart, onDrop, onRemove }) => (
    <li 
        draggable
        onDragStart={() => onDragStart(index)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => onDrop(index)}
        className="p-2 border bg-white rounded-md shadow-sm flex justify-between items-center cursor-move hover:bg-slate-50"
    >
        <span>
            <i className="fa-solid fa-grip-vertical text-slate-400 mr-3"></i>
            {item.name}
        </span>
        <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-700">{formatCurrency(item.salePrice)}</span>
            <button type="button" onClick={() => onRemove(item.id)} className="text-red-500 hover:text-red-700 text-xs">
                <i className="fa-solid fa-trash"></i>
            </button>
        </div>
    </li>
);

interface ItemsListPageProps {
    selectedProjectId?: string;
    selectedEventId?: string;
}


const ItemsListPage: React.FC<ItemsListPageProps> = ({ selectedProjectId, selectedEventId }) => {
    const { state, dispatch, notify } = useAppContext();
    const { inventoryItems, inventoryCategories, events, itemLists } = state;

    const [selectedListId, setSelectedListId] = useState<string | null>(null);
    const [currentList, setCurrentList] = useState<ItemList | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [listToDelete, setListToDelete] = useState<ItemList | null>(null);
    const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

    useEffect(() => {
        const currentListEventId = currentList?.eventId;
        
        if (selectedEventId && currentListEventId && currentListEventId !== selectedEventId) {
             setSelectedListId(null);
             setCurrentList(null);
        } else if (selectedProjectId && currentListEventId) {
            const eventForList = events.find(e => e.id === currentListEventId);
            if(eventForList && eventForList.projectId !== selectedProjectId) {
                setSelectedListId(null);
                setCurrentList(null);
            }
        }
    }, [selectedProjectId, selectedEventId, currentList, events]);
    
    const listOptions = useMemo(() => {
        let filtered = itemLists;
        if (selectedEventId) {
            filtered = itemLists.filter(m => m.eventId === null || m.eventId === selectedEventId);
        } else if (selectedProjectId) {
            const projectEventIds = new Set(events.filter(e => e.projectId === selectedProjectId).map(e => e.id));
            filtered = itemLists.filter(m => m.eventId === null || (m.eventId && projectEventIds.has(m.eventId)));
        }
        return [{ value: '', label: 'Select a List...' }, ...filtered.map(m => ({ value: m.id, label: m.name }))]
    }, [itemLists, selectedProjectId, selectedEventId, events]);

    const availableItems = useMemo(() => {
        if (!currentList) return [];
        const currentItemIds = new Set(currentList.itemOrder || []);
        return inventoryItems.filter(item => !currentItemIds.has(item.id));
    }, [inventoryItems, currentList]);
    
    const listItemsInOrder = useMemo(() => {
        if (!currentList) return [];
        const itemMap = new Map(inventoryItems.map(i => [i.id, i]));
        return currentList.itemOrder.map(id => itemMap.get(id)).filter((i): i is InventoryItem => !!i);
    }, [currentList, inventoryItems]);

    const handleSelectList = (id: string) => {
        const list = itemLists.find(m => m.id === id);
        if (list) {
            setSelectedListId(id);
            setCurrentList(list);
            setIsEditing(false);
        } else {
             setSelectedListId(null);
             setCurrentList(null);
        }
    };

    const handleAddNew = () => {
        const newList: ItemList = {
            ...initialItemListData,
            id: `new_${Date.now()}`,
            name: 'New Item List',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        setCurrentList(newList);
        setSelectedListId(newList.id);
        setIsEditing(true);
    };
    
    const handleSave = async () => {
        if (!currentList) return;
        
        try {
            if (currentList.id.startsWith('new_')) {
                const addedList = await api.addItemList(currentList);
                dispatch({ type: 'ADD_ITEM_LIST', payload: addedList });
                setSelectedListId(addedList.id);
                setCurrentList(addedList);
                notify('List created!', 'success');
            } else {
                const updatedList = await api.updateItemList(currentList.id, currentList);
                dispatch({ type: 'UPDATE_ITEM_LIST', payload: updatedList });
                setCurrentList(updatedList);
                notify('List saved!', 'success');
            }
            setIsEditing(false);
        } catch (error: any) {
            notify(`Error: ${error.message}`, 'error');
        }
    };
    
    const handleDelete = async () => {
        if(!listToDelete) return;
        try {
            await api.deleteItemList(listToDelete.id);
            dispatch({ type: 'DELETE_ITEM_LIST', payload: listToDelete.id});
            setCurrentList(null);
            setSelectedListId(null);
            setListToDelete(null);
            notify('List deleted.', 'success');
        } catch(e: any) {
             notify(`Error: ${e.message}`, 'error');
        }
    }

    const handlePrint = () => {
        if (currentList) {
            window.print();
        }
    };

    const handleAddItemToList = (itemId: string) => {
        if (!currentList) return;
        setCurrentList(prev => ({...prev!, itemOrder: [...prev!.itemOrder, itemId]}));
    };
    
    const handleRemoveItemFromList = (itemId: string) => {
        if (!currentList) return;
        setCurrentList(prev => ({...prev!, itemOrder: prev!.itemOrder.filter(id => id !== itemId)}));
    };

    const handleDragStart = (index: number) => {
        setDraggedItemIndex(index);
    };
    
    const handleDrop = (targetIndex: number) => {
        if (draggedItemIndex === null || !currentList) return;
        const newOrder = [...currentList.itemOrder];
        const [draggedId] = newOrder.splice(draggedItemIndex, 1);
        newOrder.splice(targetIndex, 0, draggedId);
        setCurrentList(prev => ({...prev!, itemOrder: newOrder}));
        setDraggedItemIndex(null);
    };

    return (
        <div>
            {listToDelete && (
                <ConfirmationModal 
                    isOpen={true} 
                    onClose={() => setListToDelete(null)}
                    onConfirm={handleDelete}
                    title="Delete Item List"
                    message={`Are you sure you want to delete the list "${listToDelete.name}"? This cannot be undone.`}
                />
            )}
            <div className="print:hidden mb-6 p-4 bg-slate-100 border border-slate-200 rounded-lg flex justify-between items-center">
                <div className="flex-grow max-w-sm">
                    <Select value={selectedListId || ''} onChange={e => handleSelectList(e.target.value)} options={listOptions} />
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleAddNew} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md shadow-sm hover:bg-teal-700"><i className="fa-solid fa-plus mr-2"></i>New List</button>
                    {currentList && (
                        <>
                            <button onClick={() => setIsEditing(true)} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700" disabled={isEditing}><i className="fa-solid fa-pencil mr-2"></i>Edit</button>
                            <button onClick={() => setListToDelete(currentList)} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700"><i className="fa-solid fa-trash mr-2"></i>Delete</button>
                        </>
                    )}
                </div>
            </div>

            {!currentList ? (
                <div className="text-center text-slate-500 py-20 border-2 border-dashed border-slate-300 rounded-lg">
                    <p>Select a list to view or create a new one.</p>
                </div>
            ) : isEditing ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Editor Panel */}
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Editing: {currentList.name}</h3>
                        <div className="space-y-4">
                            <FormField label="List Name" htmlFor="list-name">
                                <Input id="list-name" value={currentList.name} onChange={e => setCurrentList(prev => ({...prev!, name: e.target.value}))} />
                            </FormField>
                             <FormField label="Link to Event (optional)" htmlFor="event-link">
                                <Select id="event-link" value={currentList.eventId || ''} onChange={e => setCurrentList(prev => ({...prev!, eventId: e.target.value || null}))} options={[{value: '', label: 'No specific event'}, ...events.filter(e => !e.isTemplate).map(e => ({value: e.id, label: `${e.title} (${new Date(e.startDate).toLocaleDateString()})`}))]} />
                            </FormField>
                            
                            <div className="p-4 border rounded-md">
                                <h4 className="font-semibold mb-2">Available Items</h4>
                                 {availableItems.length > 0 ? (
                                    <ul className="space-y-1 max-h-48 overflow-y-auto">
                                        {availableItems.map(item => (
                                            <li key={item.id} className="flex justify-between items-center p-1.5 hover:bg-slate-100 rounded">
                                                <span>{item.name}</span>
                                                <button onClick={() => handleAddItemToList(item.id)} className="text-sm text-blue-600 hover:underline">Add</button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-slate-500 italic">No more items available to add.</p>
                                )}
                            </div>
                        </div>
                    </div>
                     {/* List Preview / Sorter */}
                     <div className="bg-slate-50 p-4 rounded-lg">
                         <h3 className="text-xl font-bold text-slate-800 mb-4">List Items</h3>
                         <ul className="space-y-2">
                            {listItemsInOrder.map((item, index) => (
                                <DraggableMenuItem key={item.id} item={item} index={index} onDragStart={handleDragStart} onDrop={handleDrop} onRemove={handleRemoveItemFromList} />
                            ))}
                         </ul>
                         {listItemsInOrder.length === 0 && <p className="text-sm italic text-slate-500 text-center">Drag items here or add them from the available list.</p>}
                     </div>
                 </div>
            ) : (
                // View Panel
                 <div id="printable-menu" className="p-8 border border-slate-300 rounded-lg bg-white">
                    <h1 className="text-4xl font-bold text-center mb-2 text-slate-800">{currentList.name}</h1>
                    {currentList.eventId && (
                        <p className="text-center text-lg text-slate-600 mb-8">For: {events.find(e => e.id === currentList.eventId)?.title}</p>
                    )}
                    <ul className="space-y-4">
                       {listItemsInOrder.map(item => (
                            <li key={item.id} className="p-3 flex justify-between items-baseline">
                                <div>
                                    <p className="text-xl font-semibold text-slate-800">{item.name}</p>
                                    <p className="text-sm text-slate-600">{item.description}</p>
                                </div>
                                <p className="text-xl font-bold text-slate-900">{formatCurrency(item.salePrice)}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            
            {isEditing && currentList && (
                <div className="print:hidden mt-8 pt-4 border-t flex justify-end gap-3">
                    <button onClick={() => { setIsEditing(false); if(selectedListId && !selectedListId.startsWith('new_')) {handleSelectList(selectedListId)} else {setCurrentList(null)}}} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-md hover:bg-slate-300">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md shadow-sm hover:bg-teal-700">Save List</button>
                </div>
            )}
            {!isEditing && currentList && (
                <div className="print:hidden mt-8 pt-4 border-t flex justify-end">
                    <button onClick={handlePrint} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700"><i className="fa-solid fa-print mr-2"></i>Print List</button>
                </div>
            )}
        </div>
    );
};

export default ItemsListPage;
